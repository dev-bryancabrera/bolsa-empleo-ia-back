const supabase = require('../../../../../infrastructure/services/SupabaseClient');

class CrearUsuario {
    constructor(usuarioRepository, personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    async execute(dto) {
        const usuarioExistente = await this.usuarioRepository.findByEmail(dto.email);
        if (usuarioExistente) {
            throw new Error('El email ya está registrado');
        }

        if (dto.id_persona) {
            const personaExiste = await this.personaRepository.obtenerPorId(dto.id_persona);
            if (!personaExiste) {
                throw new Error('La persona no existe');
            }

            const usuarioConPersona = await this.usuarioRepository.findByIdWithPersona(dto.id_persona);
            if (usuarioConPersona && usuarioConPersona.id_persona === dto.id_persona) {
                throw new Error('Esta persona ya tiene un usuario asociado');
            }
        }

        // Crear usuario en Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
            email: dto.email,
            password: dto.password,
            email_confirm: true,
        });

        if (error) {
            throw new Error('Error al crear usuario en Supabase: ' + error.message);
        }

        const supabase_uid = data.user.id;

        return this.usuarioRepository.createWithSupabase({
            id_persona: dto.id_persona,
            email: dto.email,
            supabase_uid,
            rol: dto.rol ?? 'user',
            activo: dto.activo ?? true,
        });
    }
}

module.exports = CrearUsuario;
