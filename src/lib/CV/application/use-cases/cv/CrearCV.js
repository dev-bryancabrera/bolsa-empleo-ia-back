const CV = require('../../../domain/cv/CV');

class CrearCV {
    constructor(cvRepository, personaRepository) {
        this.cvRepository = cvRepository;
        this.personaRepository = personaRepository;
    }

    async execute(dto) {
        // Verificar que la persona existe
        const personaExiste = await this.personaRepository.obtenerPorId(dto.persona_id);
        if (!personaExiste) {
            throw new Error('La persona no existe');
        }

        // Verificar si ya existe un CV para esta persona
        const cvExistente = await this.cvRepository.obtenerPorPersonaId(dto.persona_id);
        if (cvExistente) {
            throw new Error('Ya existe un CV para esta persona');
        }

        const cv = new CV({
            persona_id: dto.persona_id,
            titulo_profesional: dto.titulo_profesional,
            resumen_profesional: dto.resumen_profesional,
            nivel_educacion: dto.nivel_educacion,
            anios_experiencia: dto.anios_experiencia,
            sector_profesional: dto.sector_profesional,
            estado: dto.estado ?? true,
        });

        return this.cvRepository.crear(cv);
    }
}

module.exports = CrearCV;