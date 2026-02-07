const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (chatController) => {
    router.post('/', auth, chatController.crear);
    router.get('/', auth, chatController.listar);
    router.get('/:id', auth, chatController.obtener);
    router.get('/persona/:personaId', auth, chatController.obtenerPorPersona);
    router.put('/:id', auth, chatController.actualizar);
    router.delete('/:id', auth, chatController.eliminar);

    return router;
};