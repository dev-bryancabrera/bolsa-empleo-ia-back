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
}

module.exports = AuthController;