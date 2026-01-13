import express from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toBuffer } from 'qrcode';
import { subBots, iniciarJadibot, stopJadibot } from '../lib/jadibot-manager.js';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const USERS_FILE = './database/usuario.json';

// --- CONFIGURACIÓN DE CARPETAS ---
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'mochi-bot-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

export const jadibotSess = new Map();

const getHTML = (name) => fs.readFileSync(path.join(__dirname, 'views', `${name}.html`), 'utf-8');

const getUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]');
    } catch (e) { return []; }
};

const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// --- RUTAS DE AUTENTICACIÓN ---
app.get('/login', (req, res) => res.send(getHTML('login')));
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send("<script>alert('Credenciales incorrectas'); window.location='/login';</script>");
    }
});

app.get('/register', (req, res) => res.send(getHTML('register')));
app.post('/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    const users = getUsers();
    if (users.find(u => u.email === email)) return res.send("Correo ya existe");
    users.push({ name, email, phone, password });
    saveUsers(users);
    res.redirect('/login');
});

// --- RUTA PRINCIPAL (DASHBOARD CORREGIDA) ---
app.get('/', isAuthenticated, (req, res) => {
    let botsHTML = '';

    // Iteramos sobre las sesiones activas en subBots
    subBots.forEach((client, id) => {
        const num = id.split('@')[0];
        const sessionData = jadibotSess.get(id) || { config: { welcome: true, only_private: false } };
        
        // Verificamos el estado de los switches para que la UI coincida con la realidad
        const welcomeChecked = sessionData.config?.welcome ? 'checked' : '';
        const privateChecked = sessionData.config?.only_private ? 'checked' : '';

        botsHTML += `
        <div class="border border-white/5 rounded-[2rem] bg-white/[0.02] overflow-hidden transition-all hover:border-cyan-500/30 mb-4">
            <div class="p-5 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <div class="w-3 h-3 bg-green-500 rounded-full status-pulse absolute -top-1 -right-1 z-10"></div>
                        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-xs">
                            ${num.substring(0, 2)}
                        </div>
                    </div>
                    <div>
                        <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">En línea</p>
                        <p class="text-sm font-mono font-bold text-cyan-400">${num}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="toggleGestionar('${num}')" class="p-3 bg-white/5 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-white/10 transition-all">
                        <i data-lucide="settings-2" class="w-5 h-5"></i>
                    </button>
                    <button onclick="confirmarEliminacion('${num}')" class="p-3 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-xl border border-white/10 transition-all">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <div id="panel-${num}" class="panel-gestion bg-black/40 border-t border-white/5">
                <div class="p-6 space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">Bienvenida</span>
                            <label class="switch">
                                <input type="checkbox" ${welcomeChecked} onchange="guardarAjuste('${num}', 'welcome', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">Solo Privados</span>
                            <label class="switch">
                                <input type="checkbox" ${privateChecked} onchange="guardarAjuste('${num}', 'only_private', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    });

    if (botsHTML === '') {
        botsHTML = `
        <div class="text-center py-10 opacity-30">
            <i data-lucide="ghost" class="w-12 h-12 mx-auto mb-4"></i>
            <p class="text-xs uppercase font-black tracking-[0.3em]">Sin sesiones activas</p>
        </div>`;
    }

    let html = getHTML('dashboard');
    html = html.replace('{{USER_NAME}}', req.session.user.name);
    html = html.replace('{{BOTS_LIST}}', botsHTML);
    html = html.replace('{{BOTS_COUNT}}', subBots.size);
    res.send(html);
});

// --- API: ACTUALIZAR CONFIGURACIÓN ---
app.post('/api/update-bot', isAuthenticated, (req, res) => {
    const { number, ...config } = req.body;
    const jid = `${number}@s.whatsapp.net`;

    if (jadibotSess.has(jid)) {
        const currentData = jadibotSess.get(jid);
        currentData.config = { ...currentData.config, ...config };
        jadibotSess.set(jid, currentData);
        console.log(chalk.yellow(`[CONFIG] Actualizado ${number}:`), config);
        res.json({ status: true });
    } else {
        res.status(404).json({ status: false });
    }
});

// --- API: ELIMINAR BOT ---
app.get('/delete-bot/:id', isAuthenticated, async (req, res) => {
    try {
        const jid = `${req.params.id}@s.whatsapp.net`;
        await stopJadibot(jid);
        res.json({ status: true });
    } catch (e) {
        res.status(500).json({ status: false });
    }
});

// --- VINCULACIÓN ---
app.post('/vincular', isAuthenticated, (req, res) => {
    const { number, method } = req.body;
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const userJid = `${cleanNumber}@s.whatsapp.net`;
    iniciarJadibot(global.conn, { chat: userJid }, userJid, method === 'code');
    res.redirect(method === 'code' ? `/view-code/${cleanNumber}` : `/view-qr/${cleanNumber}`);
});

app.get('/view-code/:id', isAuthenticated, (req, res) => {
    const jid = `${req.params.id}@s.whatsapp.net`;
    const data = jadibotSess.get(jid);
    let html = getHTML('view-code');
    html = html.replace('{{CODE}}', data?.pairingCode || "GENERANDO...");
    html = html.replace('{{STATUS}}', data?.pairingCode ? "LISTO" : "CONECTANDO...");
    res.send(html);
});

app.get('/view-qr/:id', isAuthenticated, (req, res) => {
    let html = getHTML('view-qr');
    html = html.replace(/{{ID}}/g, req.params.id);
    res.send(html);
});

app.get('/qr-img/:id', async (req, res) => {
    const data = jadibotSess.get(req.params.id + '@s.whatsapp.net');
    if (!data?.qr) return res.status(404).send('No QR');
    res.type('png').send(await toBuffer(data.qr, { scale: 8 }));
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

export function connectServer(conn) {
    global.conn = conn;
    app.listen(port, () => console.log(chalk.cyan.bold(`\n[SERVER] 🚀 Mochi Panel: http://localhost:${port}\n`)));
}