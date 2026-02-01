const ConversacionRepositorySequelize = require('./infrastructure/ConversacionRepositorySequelize');
const GeminiService = require('../../infrastructure/services/GroqService');

// Casos de Uso
const EnviarMensaje = require('./application/gemini/use-cases/EnviarMensaje');
const ListarConversacion = require('./application/gemini/use-cases/ListarConversacion');
const ObtenerConversacion = require('./application/gemini/use-cases/ObtenerConversacion');
const EliminarConversacion = require('./application/gemini/use-cases/EliminarConversacion');

const ConversacionController = require('./infrastructure/http/controller/ConversacionController');
const ConversacionRoutes = require("./infrastructure/http/routes/conversacion.routes");

module.exports = function registerChatbotModule(app) {
    // 1. Infraestructura (Repositorio + Servicio Externo de IA)
    const repository = new ConversacionRepositorySequelize();
    const iaService = new GeminiService();

    // 2. Casos de uso
    const enviarMensaje = new EnviarMensaje(repository, iaService);
    const listarConversacion = new ListarConversacion(repository);
    const obtenerConversacion = new ObtenerConversacion(repository);
    const eliminarConversacion = new EliminarConversacion(repository);

    // 3. Controller (Pasamos los casos de uso como un objeto)
    const conversacionController = new ConversacionController({
        enviarMensaje,
        listarConversacion,
        obtenerConversacion,
        eliminarConversacion
    });

    // 4. Rutas
    app.use("/api/chat", ConversacionRoutes(conversacionController));
};