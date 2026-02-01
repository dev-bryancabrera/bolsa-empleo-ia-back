const express = require('express');
const router = express.Router();

module.exports = (usuarioController) => {
    router.get('/', usuarioController.listar);
    router.get('/:id', usuarioController.obtener);
    router.get('/persona/:personaId', usuarioController.obtenerPorPersona);
    router.post('/', usuarioController.crear);
    router.put('/:id', usuarioController.actualizar);
    router.delete('/:id', usuarioController.eliminar);

    return router;
};