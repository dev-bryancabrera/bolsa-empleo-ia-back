class EliminarUsuario {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(id) {
        return this.usuarioRepository.eliminar(id);
    }
}

module.exports = EliminarUsuario;