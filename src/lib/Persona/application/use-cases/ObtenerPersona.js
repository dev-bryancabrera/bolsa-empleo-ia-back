class ObtenerPersona {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }

    async execute(id) {
        return this.personaRepository.obtenerPorId(id);
    }
}

module.exports = ObtenerPersona;