const express = require('express');
const router = express.Router();

module.exports = (habilidadesController) => {
    // Listar todas las habilidades
    router.get('/', habilidadesController.listar);

    // Obtener habilidades por CV
    router.get('/cv/:cvId', habilidadesController.obtenerPorCV);

    // Crear habilidad
    router.post('/', habilidadesController.crear);

    // Obtener habilidad por ID
    router.get('/:id', habilidadesController.obtener);

    // Actualizar habilidad
    router.put('/:id', habilidadesController.actualizar);

    // Eliminar habilidad
    router.delete('/:id', habilidadesController.eliminar);

    return router;
};