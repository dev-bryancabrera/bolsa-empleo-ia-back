const bcrypt = require('bcrypt');

class ActualizarUsuario {
    constructor(usuarioRepository, personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    async execute(id, dto) {
        const usuarioExistente = await this.usuarioRepository.findById(id);
        if (!usuarioExistente) {
            throw new Error('Usuario no encontrado');
        }

        // Si se está actualizando el email, verificar que no esté en uso
        if (dto.email && dto.email !== usuarioExistente.email) {
            const emailEnUso = await this.usuarioRepository.obtenerPorEmail(dto.email);
            if (emailEnUso) {
                throw new Error('El email ya está en uso');
            }
        }

        // Si se está actualizando id_persona, verificar que existe y no esté en uso
        if (dto.id_persona && dto.id_persona !== usuarioExistente.id_persona) {
            const personaExiste = await this.personaRepository.obtenerPorId(dto.id_persona);
            if (!personaExiste) {
                throw new Error('La persona no existe');
            }

            const usuarioConPersona = await this.usuarioRepository.obtenerPorPersonaId(dto.id_persona);
            if (usuarioConPersona && usuarioConPersona.id !== id) {
                throw new Error('Esta persona ya tiene un usuario asociado');
            }
        }

        return this.usuarioRepository.actualizar(id, dto);
    }
}

module.exports = ActualizarUsuario;