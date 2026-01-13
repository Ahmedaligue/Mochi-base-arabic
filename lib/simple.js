import pkg from '@whiskeysockets/baileys';

// Extraemos las funciones buscando en todas las rutas posibles del paquete
const getContentType = pkg.getContentType || pkg.default?.getContentType;
const proto = pkg.proto || pkg.default?.proto;

/**
 * Formatea el mensaje de Baileys para que sea más fácil de usar
 */
export function smsg(conn, m, store) {
    if (!m) return m;

    // Acceso seguro al proto
    let M = proto?.WebMessageInfo; 

    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = conn.decodeJid(m.fromMe ? conn.user.id : m.participant || m.key.participant || m.chat || '');
    }

    if (m.message) {
        // Detectar tipo de mensaje de forma segura
        m.mtype = getContentType ? getContentType(m.message) : Object.keys(m.message)[0];
        
        // Extraer contenido real
        m.msg = (m.mtype == 'viewOnceMessage' 
            ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] 
            : m.message[m.mtype]);
        
        // Normalizar el cuerpo del mensaje (body)
        m.body = m.message.conversation || 
                 m.msg?.caption || 
                 m.msg?.text || 
                 (m.mtype == 'listResponseMessage' && m.msg?.singleSelectReply?.selectedRowId) || 
                 (m.mtype == 'buttonsResponseMessage' && m.msg?.selectedButtonId) || 
                 (m.mtype == 'viewOnceMessage' && m.msg?.caption) || 
                 (typeof m.msg == 'string' ? m.msg : '');
        
        // --- MÉTODOS INYECTADOS ---

        // Responder con texto
        m.reply = (text, chatId = m.chat, options = {}) => conn.sendMessage(chatId, { text: text, ...options }, { quoted: m });

        // REACCIONAR (Aquí está la solución a tu error)
        m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    }
    return m;
}

/**
 * Limpia y decodifica JIDs de WhatsApp
 */
export function decodeJid(jid) {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jid.split(':');
        return (decode[0] + decode[decode.length - 1].replace(/(\d+)@/gi, '$1@')).trim();
    } else return jid.trim();
}