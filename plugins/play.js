// plugins/play.js
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`「✦」Ingresa el nombre o link de la canción.`);

    await m.react('🕒');

    try {
        const res = await fetch(`https://api.darkcore.xyz/api/descargar/mp3?url=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!json.success) {
            await m.react('❌');
            return m.reply("「✦」No se pudo procesar la solicitud.");
        }

        const { titulo, canal, duracion, imagen, url, id } = json.data;

        let txt = `「✦」*DESCARGANDO AUDIO*\n\n`
            txt += `> 🎵 *Título:* ${titulo}\n`
            txt += `> ❀ *Canal:* ${canal}\n`
            txt += `> ⴵ *Duración:* ${duracion}`

        await conn.sendMessage(m.chat, { image: { url: imagen }, caption: txt }, { quoted: m });

        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            }
        });
        
        const audioBuffer = Buffer.from(response.data);

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            fileName: `${titulo}.mp3`,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    title: titulo,
                    body: canal,
                    thumbnailUrl: imagen,
                    sourceUrl: `https://www.youtube.com/watch?v=${id}`,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✔️');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply("「✦」Error al descargar el archivo. El servidor de YouTube rechazó la conexión directa.");
    }
}

handler.command = ['play', 'audio', 'mp3'];
export default handler;