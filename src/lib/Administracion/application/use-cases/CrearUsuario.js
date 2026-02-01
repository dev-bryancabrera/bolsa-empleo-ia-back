const Usuario = require('../../domain/Usuario');
const bcrypt = require('bcrypt');

class CrearUsuario {
    constructor(usuarioRepository, personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    async execute(dto) {
        // Verificar si el email ya existe
        const usuarioExistente = await this.usuarioRepository.obtenerPorEmail(dto.email);
        if (usuarioExistente) {
            throw new Error('El email ya está registrado');
        }

        // Si se proporciona id_persona, verificar que existe y no esté asociada a otro usuario
        if (dto.id_persona) {
            const personaExiste = await this.personaRepository.obtenerPorId(dto.id_persona);
            if (!personaExiste) {
                throw new Error('La persona no existe');
            }

            const usuarioConPersona = await this.usuarioRepository.obtenerPorPersonaId(dto.id_persona);
            if (usuarioConPersona) {
                throw new Error('Esta persona ya tiene un usuario asociado');
            }
        }

        // Encriptar la contraseña
        const passwordHash = await bcrypt.hash(dto.password, 10);

        const usuario = new Usuario({
            id_persona: dto.id_persona,
            email: dto.email,
            password: passwordHash,
            rol: dto.rol ?? 'user',
            foto_perfil: dto.foto_perfil,
            estado: dto.estado ?? true,
        });

        return this.usuarioRepository.crear(usuario);
    }
}

module.exports = CrearUsuario;