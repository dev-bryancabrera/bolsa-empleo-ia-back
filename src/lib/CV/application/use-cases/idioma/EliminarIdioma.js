class EliminarIdioma {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(id) {
        return await this.repository.eliminar(id);
    }
}

module.exports = EliminarIdioma;
