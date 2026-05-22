const supabase = require('../../../../../infrastructure/services/SupabaseClient');

class Login {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            throw new Error('Credenciales inválidas');
        }

        let usuario = await this.usuarioRepository.findBySupabaseUid(data.user.id);

        if (!usuario) {
            // Usuario existe en Supabase pero no está vinculado en nuestra DB
            const usuarioPorEmail = await this.usuarioRepository.findByEmail(email);
            if (usuarioPorEmail) {
                const id = usuarioPorEmail.id ?? usuarioPorEmail.dataValues?.id;
                await this.usuarioRepository.update(id, { supabase_uid: data.user.id });
                usuario = await this.usuarioRepository.findBySupabaseUid(data.user.id);
            } else {
                throw new Error('Usuario no encontrado en el sistema');
            }
        }

        const u = usuario.dataValues ?? usuario;
        return {
            token: data.session.access_token,
            usuario: {
                id: u.id,
                email: u.email,
                rol: u.rol,
                id_persona: u.id_persona ?? null,
            },
        };
    }
}

module.exports = Login;
