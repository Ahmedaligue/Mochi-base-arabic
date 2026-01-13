let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('*[!] Debes escribir el texto a convertir.*');
    
    const brailleAlfabeto = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
        'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
        'k': '⠇', 'l': '⠸', 'm': '⠍', 'n': '⠝', 'o': '⠕',
        'p': '⠌', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
        'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
        'z': '⠵', ' ': '  '
    };

    let t = text.toLowerCase().split('').map(c => brailleAlfabeto[c] || c).join('');
    m.reply(`*TRADUCCIÓN BRAILLE*\n\n${t}`);
};

handler.command = ['braille', 'brayler'];
export default handler;