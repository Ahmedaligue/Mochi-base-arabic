// plugins/toimg.js
let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted || !/sticker/.test(m.quoted.mimetype)) {
        return m.reply(`「✦」Responde a un sticker con el comando *${usedPrefix + command}*`);
    }

    await m.react('📸');
    try {
        let media = await m.quoted.download();
        await conn.sendMessage(m.chat, { 
            image: media, 
            caption: '「✦」Aquí tienes la imagen del sticker.' 
        }, { quoted: m });
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        m.reply('「✦」Error al convertir.');
    }
};

handler.command = ['toimg', 'img', 'foto'];
export default handler;