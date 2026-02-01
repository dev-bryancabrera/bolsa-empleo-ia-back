const express = require('express');
const router = express.Router();

module.exports = (conversacionController) => {
    // Enviar un nuevo mensaje y obtener respuesta de la IA
    // POST /api/chat
    router.post('/', (req, res) => conversacionController.enviarMensaje(req, res));

    // Listar todo el historial de conversaciones
    // GET /api/chat
    router.get('/', (req, res) => conversacionController.listar(req, res));

    // Obtener una conversación específica por su ID
    // GET /api/chat/:id
    router.get('/:id', (req, res) => conversacionController.obtener(req, res));

    // Eliminar una conversación (o limpiar historial)
    // DELETE /api/chat/:id
    router.delete('/:id', (req, res) => conversacionController.eliminar(req, res));

    return router;
};