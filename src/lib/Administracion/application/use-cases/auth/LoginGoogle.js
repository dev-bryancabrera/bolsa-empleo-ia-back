const jwt = require('jsonwebtoken');

class LoginGoogle {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(usuario) {
        // El usuario ya fue verificado por passport, solo generamos JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return {
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                google_nombre: usuario.google_nombre,
                google_foto_url: usuario.google_foto_url,
                proveedor: usuario.proveedor,
            },
        };
    }
}

module.exports = LoginGoogle;
