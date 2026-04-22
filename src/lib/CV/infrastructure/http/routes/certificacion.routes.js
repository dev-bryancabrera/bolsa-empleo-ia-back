const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');

module.exports = (controller) => {
    router.get('/cv/:cvId', auth, controller.listarPorCV);
    router.post('/', auth, controller.crear);
    router.put('/:id', auth, controller.actualizar);
    router.delete('/:id', auth, controller.eliminar);
    return router;
};
