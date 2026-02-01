class ActualizarPersona {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }

    async execute(id, dto) {
        return this.personaRepository.actualizar(id, dto);
    }
}

module.exports = ActualizarPersona;