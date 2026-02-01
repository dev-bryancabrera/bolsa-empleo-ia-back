class ListarCVs {
    constructor(cvRepository) {
        this.cvRepository = cvRepository;
    }

    async execute() {
        return this.cvRepository.listar();
    }
}

module.exports = ListarCVs;