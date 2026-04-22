const bcrypt = require('bcrypt');

class RestablecerPassword {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(token, nuevaPassword) {
        // 1. Buscar usuario por token válido y no expirado
        const usuario = await this.usuarioRepository.findByResetToken(token);

        if (!usuario) {
            throw new Error('El enlace de recuperación es inválido o ha expirado.');
        }

        // 2. Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

        // 3. Actualizar contraseña y limpiar token
        await this.usuarioRepository.updatePassword(usuario.id, hashedPassword);
        await this.usuarioRepository.clearResetToken(usuario.id);

        return { mensaje: 'Contraseña restablecida exitosamente.' };
    }
}

module.exports = RestablecerPassword;
