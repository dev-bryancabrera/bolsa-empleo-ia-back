const { Router } = require('express');

module.exports = function ConfiguracionIARoutes(controller) {
    const router = Router();

    router.get('/proveedores', (req, res) => controller.obtenerProveedores(req, res));
    router.get('/:persona_id', (req, res) => controller.obtener(req, res));
    router.post('/:persona_id', (req, res) => controller.guardar(req, res));

    return router;
};
