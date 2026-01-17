import os from 'os';
import { sizeFormatter } from 'human-readable';

// مهيئ لعرض حجم الذاكرة RAM بالـ GB/MB بدلاً من البايتات
const formatSize = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepImplicitZero: !0,
    render: (literal, symbol) => `${literal} ${symbol}B`,
});

let handler = async (m, { conn, config }) => {
    await m.react('💻');

    const used = process.memoryUsage();
    const uptime = process.uptime();
    
    // حساب مدة التشغيل
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    let txt = `*「✦」النظام - ${config.botName}*\n\n`;
    txt += `> 👑 *الحالة:* تم تأكيد وصول المالك\n`;
    txt += `> 🕒 *مدة التشغيل:* ${hours}س ${minutes}د ${seconds}ث\n`;
    txt += `> 📟 *استخدام RAM:* ${formatSize(used.rss)}\n`;
    txt += `> 💿 *المنصة:* ${os.platform()} ${os.release()}\n`;
    txt += `> 🌡️ *المعالج:* ${os.cpus()[0].model}\n\n`;
    txt += `_الخادم يعمل بشكل صحيح._`;

    await m.reply(txt);
};

// إعدادات الأمر
handler.command = ['status', 'system', 'resources', 'النظام', 'الحالة', 'الموارد'];

// الأهم: تفعيل حماية الأمر ليكون خاص بالمالك
handler.owner = true; 

export default handler;
