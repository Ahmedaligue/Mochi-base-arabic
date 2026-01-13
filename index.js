import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import pino from 'pino';
import { smsg, decodeJid } from './lib/simple.js';
import { handler } from './handler.js';
import { connectServer } from './web-pager/app.js';

export const plugins = {};
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

global.conns = []

async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesion_bot');
    const { version } = await fetchLatestBaileysVersion();

    let opcion;
    if (!state.creds.registered) {
        console.clear();
        const titulo = chalk.magenta.bold;
        const textoOpcion = chalk.cyan;
        const qrColor = chalk.green;
        const pairingColor = chalk.yellow;

        console.log(titulo('╭───────────────────────────────────────╮'));
        console.log(titulo('│       CONFIGURACIÓN DE CONEXIÓN       │'));
        console.log(titulo('╰───────────────────────────────────────╯\n'));

        opcion = await question(
            textoOpcion('⌨ Seleccione su método de vinculación:\n\n') +
            qrColor('  [1] Con código QR\n') +
            pairingColor('  [2] Con código de texto (8 dígitos)\n\n') +
            chalk.white('  --> ')
        );
    }

    const usePairingCode = opcion === '2';

    const client = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: opcion === '1',
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    if (usePairingCode && !client.authState.creds.registered) {
        let numero = await question(chalk.cyan('\n[?] Ingresa tu número de WhatsApp (ej: 51900000000):\n--> '));
        numero = numero.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            let code = await client.requestPairingCode(numero);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            console.log(chalk.black.bgGreen.bold(`\n TU CÓDIGO ES: `), chalk.white.bgBlue.bold(` ${code} `));
        }, 3000);
    }

    // --- CARGADOR DE PLUGINS ---
    const pluginsFolder = path.join(process.cwd(), 'plugins');
    const files = fs.readdirSync(pluginsFolder);
    for (let file of files) {
        if (file.endsWith('.js')) {
            try {
                const module = await import(`./plugins/${file}?update=${Date.now()}`);
                plugins[file] = module.default;
            } catch (e) { console.log(chalk.red(`Error en ${file}`)); }
        }
    }

    client.ev.on('creds.update', saveCreds);


    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && opcion === '1') {
            qrcode.generate(qr, { small: true });
            console.log(chalk.blue('Escanea el QR arriba para el Bot Principal.'));
        }

        if (connection === 'close') {
            const error = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (error !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow('Reconectando Bot Principal...'));
                iniciarBot();
            } else {
                console.log(chalk.red('Sesión del Bot Principal cerrada. Elimine la carpeta de sesión para volver a vincular.'));
            }
        }

        else if (connection === 'open') {
            console.log(chalk.green.bold('\n[+] BOT PRINCIPAL ONLINE\n'));

            try {
                // Iniciamos la web pasando el cliente actual
                const { connectServer } = await import('./web-pager/app.js');
                connectServer(client);

                // Cargar subbots antiguos
                const { loadSubBots } = await import('./lib/jadibot-manager.js');
                await loadSubBots(client);

            } catch (err) {
                console.error(chalk.red('[ERROR] No se pudieron cargar los Jadibots:'), err);
            }
        }
    });

    client.decodeJid = (jid) => decodeJid(jid);

    client.ev.on('messages.upsert', async (chat) => {
        let m = chat.messages[0];
        if (!m.message) return;
        m = smsg(client, m);
        await handler(client, m);
    });
}

iniciarBot();
connectServer();