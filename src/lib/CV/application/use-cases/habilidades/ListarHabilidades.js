class ListarHabilidades {
    constructor(habilidadesRepository) {
        this.habilidadesRepository = habilidadesRepository;
    }

    async execute() {
        return this.habilidadesRepository.listar();
    }
}

module.exports = ListarHabilidades;