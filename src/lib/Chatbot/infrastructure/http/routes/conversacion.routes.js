const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (conversacionController) => {
    // Enviar un nuevo mensaje y obtener respuesta de la IA
    router.post('/', auth, conversacionController.enviarMensaje);

    // Listar todo el historial de conversaciones
    router.get('/', auth, conversacionController.listar);

    // Obtener una conversación específica por su ID
    router.get('/:id', auth, conversacionController.obtener);

    // Eliminar una conversación (o limpiar historial)
    router.delete('/:id', auth, conversacionController.eliminar);

    return router;
};