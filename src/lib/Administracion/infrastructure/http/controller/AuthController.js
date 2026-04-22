class AuthController {
    constructor({ login, verificarToken, obtenerPerfil, actualizarPerfil, loginGoogle, solicitarRecuperacion, restablecerPassword }) {
        this.loginUseCase = login;
        this.verificarTokenUseCase = verificarToken;
        this.obtenerPerfilUseCase = obtenerPerfil;
        this.actualizarPerfilUseCase = actualizarPerfil;
        this.loginGoogleUseCase = loginGoogle;
        this.solicitarRecuperacionUseCase = solicitarRecuperacion;
        this.restablecerPasswordUseCase = restablecerPassword;
    }

    // ─── Login tradicional ─────────────────────────────────────────────────
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son requeridos' });
            }
            const resultado = await this.loginUseCase.execute(email, password);
            res.json({ mensaje: 'Login exitoso', ...resultado });
        } catch (error) {
            const status = (error.message === 'Credenciales inválidas') ? 401 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    // ─── Google OAuth ──────────────────────────────────────────────────────
    googleCallback = async (req, res) => {
        try {
            // req.user viene de passport
            const resultado = await this.loginGoogleUseCase.execute(req.user);
            const { token, usuario } = resultado;

            // Redirigir al frontend con token y datos del usuario como query params
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const userEncoded = encodeURIComponent(JSON.stringify(usuario));
            res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${userEncoded}`);
        } catch (error) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
        }
    }

    // ─── Verificar token ───────────────────────────────────────────────────
    verificarToken = async (req, res) => {
        try {
            const resultado = await this.verificarTokenUseCase.execute(req.token);
            res.json({ mensaje: 'Token válido', ...resultado });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    // ─── Perfil ────────────────────────────────────────────────────────────
    obtenerPerfil = async (req, res) => {
        try {
            const idUsuario = req.params.idUser;
            const usuario = await this.obtenerPerfilUseCase.execute(idUsuario);
            res.json({ usuario });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    actualizarPerfil = async (req, res) => {
        const { idUser } = req.params;
        const { email, foto_perfil } = req.body;

        const data = {
            email,
            foto_perfil: foto_perfil
                ? Buffer.from(
                    foto_perfil.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                )
                : null
        };

        const resultado = await this.actualizarPerfilUseCase.execute(idUser, data);
        res.json({
            mensaje: 'Perfil actualizado exitosamente',
            usuario: resultado
        });
    };

    // ─── Recuperación de contraseña ────────────────────────────────────────
    solicitarRecuperacion = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'El email es requerido' });
            }
            const resultado = await this.solicitarRecuperacionUseCase.execute(email);
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    restablecerPassword = async (req, res) => {
        try {
            const { token, nuevaPassword } = req.body;
            if (!token || !nuevaPassword) {
                return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
            }
            if (nuevaPassword.length < 6) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            }
            const resultado = await this.restablecerPasswordUseCase.execute(token, nuevaPassword);
            res.json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = AuthController;