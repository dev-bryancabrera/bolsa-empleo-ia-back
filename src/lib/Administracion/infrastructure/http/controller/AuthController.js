class AuthController {
    constructor({ login, verificarToken, obtenerPerfil, actualizarPerfil }) {
        // Recibimos los casos de uso ya instanciados
        this.loginUseCase = login;
        this.verificarTokenUseCase = verificarToken;
        this.obtenerPerfilUseCase = obtenerPerfil;
        this.actualizarPerfilUseCase = actualizarPerfil;
    }

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

    verificarToken = async (req, res) => {
        try {
            const resultado = await this.verificarTokenUseCase.execute(req.token);
            res.json({ mensaje: 'Token válido', ...resultado });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    obtenerPerfil = async (req, res) => {
        try {
            // Usamos el ID que el middleware 'auth' puso en req.usuario
            const usuario = await this.obtenerPerfilUseCase.execute(req.usuario.id);
            res.json({ usuario });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    actualizarPerfil = async (req, res) => {
        try {
            const resultado = await this.actualizarPerfilUseCase.execute(req.usuario.id, req.body);
            res.json({
                mensaje: 'Perfil actualizado exitosamente',
                usuario: resultado
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;