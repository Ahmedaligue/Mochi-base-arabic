import { smsg } from './lib/simple.js';
import config from './config.js';
import { plugins } from './index.js';
import { logger } from './lib/logs.js';
import chalk from 'chalk';

export const handler = async (conn, m) => {
    try {
        if (!m || !m.message) return;
        m = smsg(conn, m);

        const str = m.body.trim();
        let usedPrefix = '';
        let isPrefix = false;
        const prefixMatch = config.prefix.test(str);
        
        if (prefixMatch) {
            usedPrefix = str.match(config.prefix)[0];
            isPrefix = true;
        }

        let fullText = isPrefix ? str.slice(usedPrefix.length).trim() : str;
        let args = fullText.split(/\s+/).filter(v => v);
        let command = (args.shift() || '').toLowerCase();
        let text = args.join(' ');

        let plugin = Object.values(plugins).find(p => 
            p?.command && (Array.isArray(p.command) ? p.command.includes(command) : p.command === command)
        );

        if (plugin) {
            logger.command(m, command, usedPrefix, isPrefix);

            // MEJORA: Detección profunda de multimedia
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || (q.mediaMessage?.imageMessage || q.mediaMessage?.videoMessage)?.mimetype || '';
            let isMedia = /image|video|sticker|audio/.test(mime);

            const extra = {
                conn,
                text,
                command,
                usedPrefix,
                isPrefix,
                apikey: config.apiKey,
                args,
                q,
                mime,
                isMedia
            };

            try {
                await plugin(m, extra);
            } catch (e) {
                logger.error(command, e);
                m.reply(`*「✦」Error en: ${command.toUpperCase()}*\n\n> ${e.message || e}`);
            }
        }
    } catch (e) {
        console.error(chalk.red.bold('[CRITICAL ERROR]'), e);
    }
};