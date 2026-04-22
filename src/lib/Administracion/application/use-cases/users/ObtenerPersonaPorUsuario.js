class ObtenerPersonaPorUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(userId) {
        const usuario = await this.usuarioRepository.findPersonByUserId(userId);
        if (!usuario) {
            throw new Error('No se encontró usuario para esta persona');
        }
        return usuario;
    }
}

module.exports = ObtenerPersonaPorUsuario;