import chalk from 'chalk';

export const logger = {
    command: (m, command, usedPrefix, isPrefix) => {
        const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
        const sender = m.sender.split('@')[0];
        const chatType = m.isGroup ? 'GRUPO' : 'PRIVADO';
        const method = isPrefix ? `PRE (${usedPrefix})` : 'NO-PRE';
        
        // Colores dinámicos
        const colorCmd = chalk.cyan.bold(command.toUpperCase());
        const colorUser = chalk.white(sender);
        
        console.log(`
${chalk.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.cyan('┃')}  ${chalk.bgCyan.black.bold(' BOT SYSTEM ')} » ${chalk.bold('REGISTRO DE ACTIVIDAD')}       ${chalk.cyan('┃')}
${chalk.cyan('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫')}
${chalk.cyan('┃')}  ${chalk.white('🔍 COMANDO:')}  ${colorCmd}
${chalk.cyan('┃')}  ${chalk.white('👤 USUARIO:')}  ${colorUser} (${chatType})
${chalk.cyan('┃')}  ${chalk.white('📑 MÉTODO :')}  ${method}
${chalk.cyan('┃')}  ${chalk.white('💬 BODY   :')}  ${chalk.gray(m.body)}
${chalk.cyan('┃')}  ${chalk.white('🕒 HORA   :')}  ${time}
${chalk.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}
        `);
    },

    error: (pluginName, error) => {
        const time = new Date().toLocaleTimeString();
        console.log(`
${chalk.red('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.red('┃')}  ${chalk.bgRed.white.bold(' CRITICAL ERROR ')} » ${chalk.bold('SISTEMA DE SEGURIDAD')}     ${chalk.red('┃')}
${chalk.red('┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫')}
${chalk.red('┃')}  ${chalk.white('❌ PLUGIN :')}  ${chalk.yellow(pluginName)}
${chalk.red('┃')}  ${chalk.white('⚠️ DETALLE:')}  ${chalk.red(error.message || error)}
${chalk.red('┃')}  ${chalk.white('🕒 HORA   :')}  ${time}
${chalk.red('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}
        `);
        if (error.stack) {
            console.log(chalk.gray(error.stack.split('\n').slice(0, 3).join('\n')));
        }
    }
};