class EliminarRuta {
    constructor(rutaRepository) {
        this.rutaRepository = rutaRepository;
    }

    async execute(id) {
        return this.rutaRepository.delete(id);
    }
}

module.exports = EliminarRuta;
