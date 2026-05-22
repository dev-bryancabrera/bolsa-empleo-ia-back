const express = require('express');
const router = express.Router();
const { auth } = require('../../../../../middleware/auth');

module.exports = (authController) => {
    // Login email/password
    router.post('/login', authController.login);

    // Google OAuth — sincronización post-Supabase
    // El frontend autentica con Supabase, luego llama este endpoint con el token
    router.post('/google/sync', authController.sincronizarGoogle);

    // Recuperación de contraseña (delegada a Supabase)
    router.post('/recuperar-password', authController.solicitarRecuperacion);
    router.post('/restablecer-password', authController.restablecerPassword);

    // Rutas protegidas
    router.get('/verificar-token', auth, authController.verificarToken);
    router.get('/perfil/:idUser', auth, authController.obtenerPerfil);
    router.put('/perfil/:idUser', auth, authController.actualizarPerfil);

    return router;
};
