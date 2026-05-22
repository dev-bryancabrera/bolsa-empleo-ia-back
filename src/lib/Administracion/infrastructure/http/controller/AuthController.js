class AuthController {
    constructor({ login, verificarToken, obtenerPerfil, actualizarPerfil, sincronizarGoogle, solicitarRecuperacion, restablecerPassword }) {
        this.loginUseCase = login;
        this.verificarTokenUseCase = verificarToken;
        this.obtenerPerfilUseCase = obtenerPerfil;
        this.actualizarPerfilUseCase = actualizarPerfil;
        this.sincronizarGoogleUseCase = sincronizarGoogle;
        this.solicitarRecuperacionUseCase = solicitarRecuperacion;
        this.restablecerPasswordUseCase = restablecerPassword;
    }

    // ─── Login email/password ──────────────────────────────────────────────
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son requeridos' });
            }
            const resultado = await this.loginUseCase.execute(email, password);
            res.json({ mensaje: 'Login exitoso', ...resultado });
        } catch (error) {
            const status = error.message === 'Credenciales inválidas' ? 401 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    // ─── Google OAuth (sincronización post-Supabase) ───────────────────────
    sincronizarGoogle = async (req, res) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Token de Supabase requerido' });
            }
            const resultado = await this.sincronizarGoogleUseCase.execute(token);
            res.json({ mensaje: 'Sincronización exitosa', ...resultado });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    // ─── Verificar token ───────────────────────────────────────────────────
    verificarToken = async (req, res) => {
        try {
            const u = req.usuario.get ? req.usuario.get({ plain: true }) : req.usuario;
            res.json({
                mensaje: 'Token válido',
                usuario: {
                    id: u.id,
                    email: u.email,
                    rol: u.rol,
                    google_nombre: u.google_nombre ?? null,
                    google_foto_url: u.google_foto_url ?? null,
                    proveedor: u.proveedor,
                    id_persona: u.id_persona ?? null,
                },
            });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    // ─── Perfil ────────────────────────────────────────────────────────────
    obtenerPerfil = async (req, res) => {
        try {
            const usuario = await this.obtenerPerfilUseCase.execute(req.params.idUser);
            res.json({ usuario });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    actualizarPerfil = async (req, res) => {
        try {
            const { idUser } = req.params;
            const { email, foto_perfil } = req.body;

            const resultado = await this.actualizarPerfilUseCase.execute(idUser, {
                email,
                foto_perfil: foto_perfil ?? null,
            });

            res.json({ mensaje: 'Perfil actualizado exitosamente', usuario: resultado });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

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
            const resultado = await this.restablecerPasswordUseCase.execute(token, nuevaPassword);
            res.json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = AuthController;
