const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (usuarioController) => {
    router.get('/user/:userId', auth, usuarioController.obtenerPersonaPorUsuarioId);
    router.get('/persona/:personaId', auth, usuarioController.obtenerPorPersona);
    router.post('/', usuarioController.crear);
    router.get('/', auth, usuarioController.listar);
    router.get('/:id', auth, usuarioController.obtener);
    router.put('/:id', auth, usuarioController.actualizar);
    router.delete('/:id', auth, usuarioController.eliminar);

    return router;
};