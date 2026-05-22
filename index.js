require('dotenv').config();
const { initMySQL } = require('./src/infrastructure/database/ConnectMySQL');
const { syncModels } = require('./src/infrastructure/models');
const buildApp = require("./src/lib/app");

const startServer = async () => {
    try {
        await initMySQL();
        await syncModels();

        const app = buildApp();

        const PORT = process.env.PORT || process.env.APP_PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor levantado en puerto ${PORT}`);

            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║    🚀 BOLSA DE EMPLEO CON IA - PROYECTO FINAL              ║');
            console.log('║    📡 Arquitectura Hexagonal + MySQL (Sequelize)           ║');
            console.log('║    🤖 IA Contextual de Habilidades y CVs                   ║');
            console.log('║                                                            ║');
            console.log(`║    🌐 Servidor: http://localhost:${PORT}                      ║`);
            console.log('║                                                            ║');
            console.log('║    📚 Endpoints disponibles:                               ║');
            console.log('║                                                            ║');
            console.log('║    👤 PERSONAS:                                            ║');
            console.log('║       POST/GET  /api/persona                               ║');
            console.log('║       GET/PUT/DELETE /api/persona/:id                      ║');
            console.log('║                                                            ║');
            console.log('║    📄 CURRÍCULUMS (CV):                                    ║');
            console.log('║       GET/POST  /api/cv                                    ║');
            console.log('║       GET/PUT/DELETE /api/cv/:id                           ║');
            console.log('║       GET       /api/cv/persona/:personaId                 ║');
            console.log('║                                                            ║');
            console.log('║    🛠️  HABILIDADES:                                        ║');
            console.log('║       GET/POST  /api/habilidades                           ║');
            console.log('║       GET       /api/habilidades/cv/:cvId                  ║');
            console.log('║       PUT/DELETE /api/habilidades/:id                      ║');
            console.log('║                                                            ║');
            console.log('║    🔐 ADMIN / USUARIOS:                                    ║');
            console.log('║       GET/POST  /api/admin                                 ║');
            console.log('║       GET       /api/admin/persona/:personaId              ║');
            console.log('║       PUT/DELETE /api/admin/:id                            ║');
            console.log('║                                                            ║');
            console.log('║    👤  AUTENTICACIÓN:                                      ║');
            console.log('║       POST      /api/auth/login                            ║');
            console.log('║       GET       /api/auth/verificar-token                  ║');
            console.log('║       GET/PUT   /api/auth/perfil                           ║');
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar la aplicación');
        console.error(error);
        process.exit(1);
    }
};

startServer().catch((e) => {
    console.error("Fallo al iniciar la aplicación:", e);
    process.exit(1);
});