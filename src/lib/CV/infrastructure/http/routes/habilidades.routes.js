const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (habilidadesController) => {
    // Listar todas las habilidades
    router.get('/', auth, habilidadesController.listar);

    // Obtener habilidades por CV
    router.get('/cv/:cvId', auth, habilidadesController.obtenerPorCV);

    // Crear habilidad
    router.post('/', auth, habilidadesController.crear);

    // Obtener habilidad por ID
    router.get('/:id', auth, habilidadesController.obtener);

    // Actualizar habilidad
    router.put('/:id', auth, habilidadesController.actualizar);

    // Eliminar habilidad
    router.delete('/:id', auth, habilidadesController.eliminar);

    return router;
};