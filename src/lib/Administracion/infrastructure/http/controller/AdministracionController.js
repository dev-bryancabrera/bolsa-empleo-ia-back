class AdministracionController {
    constructor({
        crearUsuario,
        listarUsuarios,
        obtenerUsuario,
        obtenerUsuarioPersona,
        actualizarUsuario,
        eliminarUsuario,
    }) {
        this.crearUsuario = crearUsuario;
        this.listarUsuarios = listarUsuarios;
        this.obtenerUsuario = obtenerUsuario;
        this.obtenerUsuarioPersona = obtenerUsuarioPersona;
        this.actualizarUsuario = actualizarUsuario;
        this.eliminarUsuario = eliminarUsuario;
    }

    crear = async (req, res, next) => {
        try {
            const usuario = await this.crearUsuario.execute(req.body);
            // No retornar el password en la respuesta
            const { password, ...usuarioSinPassword } = usuario;
            res.status(201).json(usuarioSinPassword);
        } catch (error) {
            next(error);
        }
    }

    listar = async (req, res, next) => {
        try {
            const usuarios = await this.listarUsuarios.execute();
            // No retornar passwords
            const usuariosSinPassword = usuarios.map(({ password, ...usuario }) => usuario);
            res.json(usuariosSinPassword);
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req, res, next) => {
        try {
            const usuario = await this.obtenerUsuario.execute(req.params.id);
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            const { password, ...usuarioSinPassword } = usuario;
            res.json(usuarioSinPassword);
        } catch (error) {
            next(error);
        }
    }

    obtenerPorPersona = async (req, res, next) => {
        try {
            const usuario = await this.obtenerUsuarioPersona.execute(req.params.personaId);
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            const { password, ...usuarioSinPassword } = usuario;
            res.json(usuarioSinPassword);
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req, res, next) => {
        try {
            const usuario = await this.actualizarUsuario.execute(
                req.params.id,
                req.body
            );
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            const { password, ...usuarioSinPassword } = usuario;
            res.json(usuarioSinPassword);
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req, res, next) => {
        try {
            const ok = await this.eliminarUsuario.execute(req.params.id);
            if (!ok) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdministracionController;