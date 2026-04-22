class ObtenerPerfil {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(usuarioId) {
        const usuario = await this.usuarioRepository.findByIdWithPersona(usuarioId);
        if (!usuario) throw new Error('Usuario no encontrado');
        return usuario;
    }
}
module.exports = ObtenerPerfil;