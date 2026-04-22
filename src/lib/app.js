const express = require('express');
const cors = require('cors');
const passport = require('passport');
const configurePassport = require('../infrastructure/services/passport');

// Cargar módulos
const registerPersonaModule = require('./Persona');
const registerAdministracionModule = require('./Administracion');
const registerCVModule = require('./CV');
const registerChatbotModule = require('./Chatbot');
const registerTendenciaModule = require('./Tendencias');
const registerRutaAprendizajeModule = require('./RutaAprendizaje');
const registerConfiguracionIAModule = require('./ConfiguracionIA');

function buildApp() {
    const app = express();

    // Middlewares
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // CORS
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        if (req.method === 'OPTIONS') return res.sendStatus(200);
        next();
    });

    // Passport (sin sesiones, usamos JWT)
    configurePassport();
    app.use(passport.initialize());

    // Health check
    app.get('/health/db', (req, res) => {
        res.status(200).json({
            status: 'OK',
            database: 'MySQL conectado correctamente',
        });
    });

    // Módulos
    registerPersonaModule(app);
    registerAdministracionModule(app);
    registerCVModule(app);
    registerConfiguracionIAModule(app);
    registerChatbotModule(app);
    registerTendenciaModule(app);
    registerRutaAprendizajeModule(app);

    // 404
    app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

    // Error handler
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.statusCode || 500).json({
            message: err.message || 'Error interno del servidor',
        });
    });

    return app;
}

module.exports = buildApp;