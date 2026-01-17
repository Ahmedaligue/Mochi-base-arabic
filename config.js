import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuramos la ruta raíz de forma automática
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    // INFORMACIÓN BÁSICA
    botName: 'base bot',
    ownerName: 'ahmed aligue',

    // Usamos un Array por si quieres añadir más de un dueño en el futuro
    owners: [
        ['212625457341', 'ahmeed aligue'], 
        ['212625457341', 'ahmed aligue']
    ],
    
    // CONFIGURACIÓN DE COMANDOS
    // Añadimos el símbolo "\" al prefix que es común en bots
    prefix: /^[.!#/\-\\]/, 
    apiKey: 'AdonixKey9khy2p3778',
    
    // RUTAS DEL SISTEMA
    path: {
        root: __dirname,
        plugins: path.join(__dirname, 'plugins'),
        database: path.join(__dirname, 'database.json')
    },

    // ESTILOS DE CONSOLA PERSONALIZADOS
    styles: {
        info: chalk.black.bgCyan.bold,
        success: chalk.black.bgGreen.bold,
        error: chalk.white.bgRed.bold,
        msg: chalk.magenta.bold,
        bot: chalk.blue.bold
    },

    // TEXTOS PREDETERMINADOS (Para ahorrar tiempo en los plugins)
   messages: {
    wait: '⏳ *جارٍ التحميل... من فضلك انتظر.*',
    error: '❌ *حدث خطأ غير متوقع.*',
    owner: '👑 *هذا الأمر مخصص فقط لمالكي.*',
    group: '👥 *هذا الأمر يعمل فقط داخل المجموعات.*',
    private: '👤 *هذا الأمر يعمل فقط في الدردشة الخاصة.*'
}
};


export default config;
