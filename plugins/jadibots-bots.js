import chalk from 'chalk'

let handler = async (m, { conn }) => {

    let activeConns = global.conns || []
    
    let users = [...new Set([...activeConns.filter(c => c && c.user && c.state === 'open').map(c => c.user.jid)])]
    
    if (users.length === 0) {
        return m.reply('❌ *لا يوجد بوتات فرعية نشطة في الوقت الحالي.*')
    }

    let message = `✨ *لوحة البوتات الفرعية النشطة* ✨\n`
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `🤖 *الإجمالي:* ${users.length}\n\n`

    users.forEach((user, i) => {
        let name = conn.getName(user) || 'بوت فرعي'
        message += `${i + 1}. 👤 *الاسم:* ${name}\n`
        message += `   📱 *الرقم:* @${user.split('@')[0]}\n`
        message += `   🟢 *الحالة:* متصل\n\n`
    })

    message += `━━━━━━━━━━━━━━━━━━━━\n`
    message += `*نظام Mochi Bot*`

    await conn.sendMessage(m.chat, { 
        text: message, 
        mentions: users 
    }, { quoted: m })
}

handler.help = ['listajadibots', 'subbots', 'قائمة_البوتات']
handler.tags = ['main']
handler.command = ['jadibots', 'subbots', 'listajadibots', 'bots', 'بوتات']

export default handler
