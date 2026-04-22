class ListarIdiomasPorCV {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(cvId) {
        return await this.repository.listarPorCV(cvId);
    }
}

module.exports = ListarIdiomasPorCV;
