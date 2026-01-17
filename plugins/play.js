iimport yts from 'yt-search';
import fetch from 'node-fetch';

let limit = 320; // الحد الأقصى للتحميل بالميغابايت
let confirmation = {};

let handler = async (m, { conn, command, text, args, usedPrefix }) => {
    if (!text) throw `✳️ مثال الاستخدام:\n${usedPrefix + command} اسم الأغنية أو الفيديو`;

    let res = await yts(text);
    let vid = res.videos[0];
    if (!vid) throw `✳️ لم يتم العثور على فيديو/صوت مطابق`;

    let { title, description, thumbnail, videoId, timestamp, views, ago, url } = vid;

    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let chat = global.db.data.chats[m.chat];

    m.react('🎧'); 

    let playMessage = `
≡ *FG MUSIC*
┌──────────────
▢ 📌 *العنوان:* ${vid.title}
▢ 📆 *تاريخ الرفع:* ${vid.ago}
▢ ⌚ *المدة:* ${vid.timestamp}
▢ 👀 *المشاهدات:* ${vid.views.toLocaleString()}
└──────────────`;

    if (business) {
        conn.sendFile(m.chat, thumbnail, "error.jpg", `${playMessage}\n\nاكتب:\n1️⃣ للحصول على الملف بصيغة MP3.\n2️⃣ للحصول على الملف بصيغة MP4.`, m);

        confirmation[m.sender] = {
            sender: m.sender,
            to: who,
            url: url,
            chat: chat, 
            timeout: setTimeout(() => {
                delete confirmation[m.sender];
                //conn.reply(m.chat, `⏳ انتهى وقت الاستجابة. حاول مرة أخرى.`, m);
            }, 60000), // دقيقة واحدة للانتظار
        };
    } else {
        conn.sendButton(m.chat, playMessage, mssg.ig, thumbnail, [
            ['🎶 MP3', `${usedPrefix}fgmp3 ${url}`],
            ['🎥 MP4', `${usedPrefix}fgmp4 ${url}`]
        ], m);
    }
};

handler.help = ['play'];
handler.tags = ['dl'];
handler.command = ['play','playvid','تشغيل','تحميل'];
handler.disabled = false;

export default handler;

handler.before = async m => {
    if (m.isBaileys) return; // تجاهل رسائل البوت نفسه
    if (!(m.sender in confirmation)) return; // فقط إذا كان هناك تأكيد معلق

    let { sender, timeout, url, chat } = confirmation[m.sender];
    if (m.text.trim() === '1') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp3', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url } = data.result;
        conn.sendFile(m.chat, dl_url, title + '.mp3', `≡  *FG YTDL*\n\n▢ *📌 العنوان:* ${title}`, m, false, { mimetype: 'audio/mpeg', asDocument: chat.useDocument });
        m.react('✅');
    } else if (m.text.trim() === '2') {
        clearTimeout(timeout);
        delete confirmation[m.sender];

        let res = await fetch(global.API('fgmods', '/api/downloader/ytmp4', { url: url }, 'apikey'));
        let data = await res.json();

        let { title, dl_url, size, sizeB } = data.result;
        let isLimit = limit * 1024 < sizeB;

        await conn.loadingMsg(m.chat, '📥 جارٍ التحميل', ` ${isLimit ? `≡  *FG YTDL*\n\n▢ *⚖️ الحجم:* ${size}\n\n▢ _الحد الأقصى للتحميل_ *+${limit} MB*` : '✅ تم التحميل بنجاح' }`, ["▬▭▭▭▭▭", "▬▬▭▭▭▭", "▬▬▬▭▭▭", "▬▬▬▬▭▭", "▬▬▬▬▬▭", "▬▬▬▬▬▬"], m);

        if (!isLimit) conn.sendFile(m.chat, dl_url, title + '.mp4', `≡  *FG YTDL*\n*📌 العنوان:* ${title}\n*⚖️ الحجم:* ${size}`, m, false, { asDocument: chat.useDocument });
        m.react('✅');
    }
};
