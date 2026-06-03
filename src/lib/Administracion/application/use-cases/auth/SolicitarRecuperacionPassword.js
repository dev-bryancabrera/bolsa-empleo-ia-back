const supabase = require('../../../../../infrastructure/services/SupabaseClient');

class SolicitarRecuperacionPassword {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(email) {
        const usuario = await this.usuarioRepository.findByEmail(email);

        if (usuario && usuario.proveedor === 'google') {
            throw new Error('Esta cuenta fue creada con Google. Administra tu contraseña directamente desde Google.');
        }

        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
        });

        return { mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
    }
}

module.exports = SolicitarRecuperacionPassword;
