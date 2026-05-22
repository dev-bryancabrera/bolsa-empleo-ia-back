const express = require('express');
const { auth } = require('../../../../../middleware/auth');

const PortfolioRoutes = (portfolioController) => {
    const router = express.Router();

    // Ruta pública — sin auth
    router.get('/publico/:slug', portfolioController.obtenerPublico);

    // Rutas privadas
    router.post('/', auth, portfolioController.crear);
    router.get('/', auth, portfolioController.obtener);
    router.put('/', auth, portfolioController.actualizar);
    router.post('/optimizar', auth, portfolioController.optimizar);
    router.get('/datos-editor', auth, portfolioController.obtenerDatosEditorAction);

    return router;
};

module.exports = PortfolioRoutes;
