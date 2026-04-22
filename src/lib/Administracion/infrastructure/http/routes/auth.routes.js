const express = require('express');
const router = express.Router();
const passport = require('passport');

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

module.exports = (authController) => {
    // ─── Login tradicional ─────────────────────────────────────────────────
    router.post('/login', authController.login);

    // ─── Google OAuth ──────────────────────────────────────────────────────
    router.get('/google',
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false
        })
    );

    router.get('/google/callback',
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login?error=google_auth_failed`
        }),
        authController.googleCallback
    );

    // ─── Recuperación de contraseña ────────────────────────────────────────
    router.post('/recuperar-password', authController.solicitarRecuperacion);
    router.post('/restablecer-password', authController.restablecerPassword);

    // ─── Rutas protegidas (requieren JWT) ──────────────────────────────────
    router.get('/verificar-token', auth, authController.verificarToken);
    router.get('/perfil/:idUser', auth, authController.obtenerPerfil);
    router.put('/perfil/:idUser', auth, authController.actualizarPerfil);

    return router;
};