class ObtenerCVCompletoPorUsuario {
    constructor(cvRepository) {
        this.cvRepository = cvRepository;
    }

    async execute(userId) {
        const usuario = await this.cvRepository.findCVByUserId(userId);
        if (!usuario) {
            throw new Error('No se encontró el CV para esta persona');
        }
        return usuario;
    }
}

module.exports = ObtenerCVCompletoPorUsuario;