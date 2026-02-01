class ObtenerCVPersona {
    constructor(cvRepository) {
        this.cvRepository = cvRepository;
    }

    async execute(personaId) {
        const cv = await this.cvRepository.obtenerPorPersonaId(personaId);
        if (!cv) {
            throw new Error('No se encontró CV para esta persona');
        }
        return cv;
    }
}

module.exports = ObtenerCVPersona;