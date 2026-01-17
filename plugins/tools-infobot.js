// plugins/botinfo.js
import os from 'os';

let handler = async (m, { conn }) => {
    const uptime = process.uptime();
    const formatUptime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

    const info = `┏━━━━ *معلةمات البوت* ━━━━┓\n` +
                 `┃ 🤖 *الاسم:* BrailleBot\n` +
                 `┃ 🕒 *مدة التشغيل:* ${formatUptime(uptime)}\n` +
                 `┃ 📊 *الرام:* ${ram}MB / ${totalRam}GB\n` +
                 `┃ ⚙️ *المنصه:* ${os.platform()}\n` +
                 `┗━━━━━━━━━━━━━━━━━━━━┛`;

    await m.reply(info);
};

handler.command = ['info', 'botinfo', 'معلومات'];

export default handler;
