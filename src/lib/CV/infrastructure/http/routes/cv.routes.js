const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (cvController) => {
    router.get('/', auth, cvController.listar);
    router.get('/:id', auth, cvController.obtener);
    router.get('/persona/:personaId', auth, cvController.obtenerPorPersona);
    router.get('/usuario/:usuarioId', auth, cvController.obtenerCVPorUsuario);
    router.post('/', auth, cvController.crear);
    router.put('/:id', auth, cvController.actualizar);
    router.delete('/:id', auth, cvController.eliminar);

    return router;
};