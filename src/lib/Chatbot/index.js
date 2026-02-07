const ConversacionRepositorySequelize = require('./infrastructure/ConversacionRepositorySequelize');
const ChatRepositorySequelize = require('./infrastructure/ChatRepositorySequelize');
const CVRepositorySequelize = require('../CV/infrastructure/CVRepositorySequelize');
const GroqService = require('../../infrastructure/services/GroqService');

// Casos de Uso - Conversacion
const EnviarMensaje = require('./application/use-cases/conversacion/EnviarMensaje');
const ListarConversacion = require('./application/use-cases/conversacion/ListarConversacion');
const ListarConversacionPorChat = require('./application/use-cases/conversacion/ListarConversacionPorChat');
const ObtenerConversacion = require('./application/use-cases/conversacion/ObtenerConversacion');
const EliminarConversacion = require('./application/use-cases/conversacion/EliminarConversacion');
const LimpiarHistorialConversacion = require('./application/use-cases/conversacion/LimpiarHistorialConversacion');
const ActualizarConversacion = require('./application/use-cases/conversacion/ActualizarConversacion');

// Casos de Uso - Chat
const CrearChat = require('./application/use-cases/chat/CrearChat');
const ListarChats = require('./application/use-cases/chat/ListarChats');
const ObtenerChat = require('./application/use-cases/chat/ObtenerChat');
const ObtenerChatsPorPersona = require('./application/use-cases/chat/ObtenerChatsPorPersona');
const ActualizarChat = require('./application/use-cases/chat/ActualizarChat');
const EliminarChat = require('./application/use-cases/chat/EliminarChat');

// Controladores
const ConversacionController = require('./infrastructure/http/controller/ConversacionController');
const ChatController = require('./infrastructure/http/controller/ChatController');

// Rutas
const ConversacionRoutes = require("./infrastructure/http/routes/conversacion.routes");
const ChatRoutes = require("./infrastructure/http/routes/chat.routes");

module.exports = function registerChatbotModule(app) {
    // 1. Infraestructura (Repositorio + Servicio Externo de IA)
    const conversacionRepository = new ConversacionRepositorySequelize();
    const chatRepository = new ChatRepositorySequelize();
    const cvRepository = new CVRepositorySequelize();
    const iaService = new GroqService();

    // 2. Casos de uso - Conversacion
    const enviarMensaje = new EnviarMensaje(conversacionRepository, cvRepository, iaService);
    const listarConversacion = new ListarConversacion(conversacionRepository);
    const listarConversacionPorChat = new ListarConversacionPorChat(conversacionRepository);
    const obtenerConversacion = new ObtenerConversacion(conversacionRepository);
    const eliminarConversacion = new EliminarConversacion(conversacionRepository);
    const limpiarHistorialConversacion = new LimpiarHistorialConversacion(conversacionRepository);
    const actualizarConversacion = new ActualizarConversacion(conversacionRepository);

    // 3. Casos de uso - Chat
    const crearChat = new CrearChat(chatRepository);
    const listarChats = new ListarChats(chatRepository);
    const obtenerChat = new ObtenerChat(chatRepository);
    const obtenerChatsPorPersona = new ObtenerChatsPorPersona(chatRepository);
    const actualizarChat = new ActualizarChat(chatRepository);
    const eliminarChat = new EliminarChat(chatRepository);

    // 4. Controller (Pasamos los casos de uso como un objeto)
    const conversacionController = new ConversacionController({
        enviarMensaje,
        listarConversacion,
        listarConversacionPorChat,
        obtenerConversacion,
        eliminarConversacion,
        limpiarHistorialConversacion,
        actualizarConversacion
    });

    app.use("/api/conversacion", ConversacionRoutes(conversacionController));

    const chatController = new ChatController({
        crearChat,
        listarChats,
        obtenerChat,
        obtenerChatsPorPersona,
        actualizarChat,
        eliminarChat
    });

    // 4. Rutas
    app.use("/api/chat", ChatRoutes(chatController));
};