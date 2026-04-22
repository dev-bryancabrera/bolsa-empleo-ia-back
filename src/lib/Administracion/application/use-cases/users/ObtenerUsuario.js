class ObtenerUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(id) {
        return this.usuarioRepository.findById(id);
    }
}

module.exports = ObtenerUsuario;