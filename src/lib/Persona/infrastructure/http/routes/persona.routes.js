const express = require('express');
const router = express.Router();

module.exports = (personaController) => {
    router.post('/', personaController.crear);
    router.get('/', personaController.listar);
    router.get('/:id', personaController.obtener);
    router.put('/:id', personaController.actualizar);
    router.delete('/:id', personaController.eliminar);

    return router;
};