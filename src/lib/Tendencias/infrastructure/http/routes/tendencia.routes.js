const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (tendenciaController) => {
    // Obtener tendencias vigentes (o generar si no existen)
    router.get('/:id_persona', auth, tendenciaController.obtenerTendencias);

    // Generar nuevas tendencias (forzar generación)
    router.post('/:id_persona/generar', auth, tendenciaController.generarTendencias);

    // Regenerar tendencias (invalida anteriores y crea nuevas)
    router.post('/:id_persona/regenerar', auth, tendenciaController.regenerarTendencias);

    return router;
};