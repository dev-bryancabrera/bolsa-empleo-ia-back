const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (personaController) => {
    router.post('/', personaController.crear);
    router.get('/', auth, personaController.listar);
    router.get('/:id', auth, personaController.obtener);
    router.put('/:id', auth, personaController.actualizar);
    router.delete('/:id', auth, personaController.eliminar);

    return router;
};