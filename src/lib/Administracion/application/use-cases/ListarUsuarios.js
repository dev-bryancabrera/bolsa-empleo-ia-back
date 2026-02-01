class ListarUsuarios {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute() {
        return this.usuarioRepository.listar();
    }
}

module.exports = ListarUsuarios;