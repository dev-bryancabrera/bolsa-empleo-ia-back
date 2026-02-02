const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Login {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(email, password) {
        // Buscar usuario por email
        const usuario = await this.usuarioRepository.findByEmail(email);

        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            throw new Error('Credenciales inválidas');
        }

        // Generar token
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return {
            token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            }
        };
    }
}

module.exports = Login;