import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

let handler = async (m, { conn, q, mime, isMedia }) => {
    if (!isMedia || !/image|video|webp/.test(mime)) 
        return m.reply('「✦」قم بالرد على صورة أو فيديو.');

    await m.react('🕒');
    try {
        let buffer = await downloadMediaMessage(
            q, 
            'buffer', 
            {}, 
            { logger: console, reuploadRequest: conn.updateMediaMessage }
        );
        
        let sticker = new Sticker(buffer, {
            pack: 'سينكو بوت',
            author: m.pushName || 'سينكو بوت',
            type: StickerTypes.FULL,
            quality: 50
        });

        await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m });
        await m.react('✅');
    } catch (e) {
        m.reply('「✦」حدث خطأ أثناء معالجة الملف.');
        await m.react('❌');
    }
};

handler.command = ['s', 'sticker', 'ملصق'];

export default handler;
