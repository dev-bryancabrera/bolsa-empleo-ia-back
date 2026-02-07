const Usuario = require('../../../domain/Usuario');
const bcrypt = require('bcrypt');

class CrearUsuario {
    constructor(usuarioRepository, personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    async execute(dto) {
        // Verificar si el email ya existe
        const usuarioExistente = await this.usuarioRepository.findByEmail(dto.email);
        if (usuarioExistente) {
            throw new Error('El email ya está registrado');
        }

        // Si se proporciona id_persona, verificar que existe y no esté asociada a otro usuario
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
        
        const usuario = new Usuario({
            id_persona: dto.id_persona,
            email: dto.email,
            password: dto.password,
            rol: dto.rol ?? 'user',
            foto_perfil: dto.foto_perfil,
            activo: dto.activo ?? true,
        });

        return this.usuarioRepository.create(usuario);
    }
}

module.exports = CrearUsuario;