// plugins/ping.js
let handler = async (m, { conn }) => {
    const start = Date.now();
    await m.react('⚡');
    const end = Date.now();
    const speed = end - start;

    await m.reply(`*¡PONG!* 🚀\n\n> 🛰️ Latencia: *${speed}ms*`);
};

handler.command = ['ping', 'p'];
export default handler;