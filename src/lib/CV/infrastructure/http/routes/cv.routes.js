const express = require('express');
const router = express.Router();

module.exports = (cvController) => {
    router.get('/', cvController.listar);
    router.get('/:id', cvController.obtener);
    router.get('/persona/:personaId', cvController.obtenerPorPersona);
    router.post('/', cvController.crear);
    router.put('/:id', cvController.actualizar);
    router.delete('/:id', cvController.eliminar);

    return router;
};