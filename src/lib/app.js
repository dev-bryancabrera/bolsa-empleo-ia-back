const express = require("express");
const cors = require("cors");

// Cargar módulos
const registerPersonaModule = require('./Persona');
const registerAdministracionModule = require('./Administracion');
const registerCVModule = require('./CV');
const registerChatbotModule = require('./Chatbot');

function buildApp() {
    const app = express();

    // Middlewares
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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
    registerChatbotModule(app);

    // 404 (opcional, recomendado)
    app.use((req, res) => res.status(404).json({ message: "Ruta no encontrada" }));

    // Error handler (opcional, recomendado)
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.statusCode || 500).json({
            message: err.message || "Error interno del servidor",
        });
    });

    return app;
}

module.exports = buildApp;