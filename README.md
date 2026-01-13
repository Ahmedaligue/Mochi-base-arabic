🌀 Mochi Bot - Sub-Bot Management Panel
Mochi Bot es una plataforma avanzada basada en la librería Baileys que permite gestionar múltiples sub-bots de WhatsApp desde un panel web intuitivo. Los usuarios pueden vincular sus cuentas mediante código QR o Código de Emparejamiento (Pairing Code) y controlar ajustes en tiempo real.

🚀 Características Principales
Multi-Dispositivo: Soporta múltiples sesiones simultáneas de sub-bots.

Doble Método de Vinculación: Escaneo de QR o Código de 8 dígitos.

Panel de Gestión Real-time: Controla interruptores (switches) para activar/desactivar funciones sin reiniciar el bot.

Auto-Reconexión: Sistema inteligente que restablece la conexión si el bot se cae.

Persistencia de Sesiones: Las sesiones se guardan localmente para que los sub-bots se inicien automáticamente con el servidor principal.

🛠️ Tecnologías Utilizadas
Backend: Node.js, Express.

WhatsApp: @whiskeysockets/baileys.

Frontend: Tailwind CSS, Lucide Icons, SweetAlert2.

Base de Datos: Sistema de archivos (JSON) para usuarios y estados de sesión.

📂 Estructura del Proyecto
/lib/jadibot-manager.js: El núcleo que maneja la conexión de los sub-bots.

/web-pager/app.js: Servidor Express y API del panel.

/jadibots_sesiones/: Directorio donde se almacenan las credenciales de autenticación.

/handler.js: El procesador de comandos y lógica del bot.
