const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (usuarioController) => {
    router.post('/', usuarioController.crear);
    router.get('/', auth, usuarioController.listar);
    router.get('/:id', auth, usuarioController.obtener);
    router.get('/persona/:personaId', auth, usuarioController.obtenerPorPersona);
    router.put('/:id', auth, usuarioController.actualizar);
    router.delete('/:id', auth, usuarioController.eliminar);

    return router;
};