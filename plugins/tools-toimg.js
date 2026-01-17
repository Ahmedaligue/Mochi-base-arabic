
let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted || !/sticker/.test(m.quoted.mimetype)) {
        return m.reply(`「✦」قم بالرد على ستيكر باستخدام الأمر *${usedPrefix + command}*`);
    }

    await m.react('📸');
    try {
        let media = await m.quoted.download();
        await conn.sendMessage(m.chat, { 
            image: media, 
            caption: '「✦」ها هي الصورة المستخرجة من الستيكر.' 
        }, { quoted: m });
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        m.reply('「✦」حدث خطأ أثناء التحويل.');
    }
};

handler.command = ['toimg', 'img', 'لصوره', 'تحويل_صورة'];
export default handler;
