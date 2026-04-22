class CrearExperiencia {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(dto) {
        return await this.repository.crear(dto);
    }
}

module.exports = CrearExperiencia;
