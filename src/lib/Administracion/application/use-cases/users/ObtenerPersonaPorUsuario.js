class ObtenerPersonaPorUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(userId) {
        const usuario = await this.usuarioRepository.findPersonByUserId(userId);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario;
    }
}

module.exports = ObtenerPersonaPorUsuario;