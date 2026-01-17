import { Sticker, StickerTypes } from 'wa-sticker-formatter';

let handler = async (m, { conn, text, q, mime }) => {
    if (!/webp/.test(mime)) 
        return m.reply('「✦」قم بالرد على ستيكر لتغيير بياناته (Pack/Author).');
    
    let [pack, auth] = text.split('|');
    await m.react('📝');

    try {
        let buffer = await q.download();
        let sticker = new Sticker(buffer, {
            pack: pack || 'حزمة سينكو',
            author: auth || 'تست',
            type: StickerTypes.FULL,
            quality: 60
        });

        await conn.sendMessage(m.chat, { sticker: await sticker.toBuffer() }, { quoted: m });
        await m.react('✅');
    } catch (e) {
        m.reply('「✦」حدث خطأ أثناء تعديل بيانات الستيكر.');
        await m.react('❌');
    }
};

handler.command = ['steal', 'robar', 'wm', 'حقوق', 'تعديل_ستيكر'];
export default handler;
