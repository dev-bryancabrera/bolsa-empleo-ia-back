class CrearEducacion {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(dto) {
        return await this.repository.crear(dto);
    }
}

module.exports = CrearEducacion;
