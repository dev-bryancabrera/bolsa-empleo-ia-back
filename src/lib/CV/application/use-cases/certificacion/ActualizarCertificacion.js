class ActualizarCertificacion {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(id, dto) {
        return await this.repository.actualizar(id, dto);
    }
}

module.exports = ActualizarCertificacion;
