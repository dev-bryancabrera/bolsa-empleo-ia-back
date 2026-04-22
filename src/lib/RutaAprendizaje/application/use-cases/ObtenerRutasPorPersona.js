class ObtenerRutasPorPersona {
    constructor(rutaRepository) {
        this.rutaRepository = rutaRepository;
    }

    async execute(personaId) {
        return this.rutaRepository.findByPersonaId(personaId);
    }
}

module.exports = ObtenerRutasPorPersona;
