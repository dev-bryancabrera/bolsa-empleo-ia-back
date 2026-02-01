const Conversacion = require('../../domain/Conversacion');

class CrearConversacion {
    constructor(conversacionRepository, personaRepository) {
        this.conversacionRepository = conversacionRepository;
        this.personaRepository = personaRepository;
    }

    async execute(dto) {
        // Verificar que la persona existe
        const personaExiste = await this.personaRepository.obtenerPorId(dto.persona_id);
        if (!personaExiste) {
            throw new Error('La persona no existe');
        }

        const conversacion = new Conversacion({
            persona_id: dto.persona_id,
            mensaje: dto.mensaje,
            respuesta: dto.respuesta,
            tipo: dto.tipo ?? 'chatbot',
            metadata: dto.metadata,
        });

        return this.conversacionRepository.crear(conversacion);
    }
}

module.exports = CrearConversacion;