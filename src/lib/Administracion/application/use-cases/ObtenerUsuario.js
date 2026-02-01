class ObtenerUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(id) {
        return this.usuarioRepository.obtenerPorId(id);
    }
}

module.exports = ObtenerUsuario;