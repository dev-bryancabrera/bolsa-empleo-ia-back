const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');

module.exports = (rutaController) => {
    // Guardar nueva ruta
    router.post('/', auth, rutaController.guardar);

    // Listar rutas de una persona
    router.get('/persona/:personaId', auth, rutaController.listarPorPersona);

    // Actualizar progreso de fases
    router.patch('/:id/progreso', auth, rutaController.patchProgreso);

    // Actualizar estado (activa/completada/archivada)
    router.patch('/:id/estado', auth, rutaController.patchEstado);

    // Eliminar ruta
    router.delete('/:id', auth, rutaController.eliminar);

    return router;
};
