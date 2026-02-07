const express = require('express');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (authController) => {
    // Ruta abierta para que cualquiera puede intentar loguearse
    router.post('/login', authController.login);

    // Rutas protegidas Requieren el token válido
    router.get('/verificar-token', auth, authController.verificarToken);
    router.get('/perfil/:idUser', auth, authController.obtenerPerfil);
    router.put('/perfil/:idUser', auth, authController.actualizarPerfil);

    return router;
};