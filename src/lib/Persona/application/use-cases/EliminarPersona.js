class EliminarPersona {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }

    async execute(id) {
        return this.personaRepository.eliminar(id);
    }
}

module.exports = EliminarPersona;