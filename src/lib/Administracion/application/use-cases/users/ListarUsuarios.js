class ListarUsuarios {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute() {
        return this.usuarioRepository.findAll();
    }
}

module.exports = ListarUsuarios;