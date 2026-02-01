class ListarPersonas {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }

    async execute() {
        return this.personaRepository.listar();
    }
}

module.exports = ListarPersonas;