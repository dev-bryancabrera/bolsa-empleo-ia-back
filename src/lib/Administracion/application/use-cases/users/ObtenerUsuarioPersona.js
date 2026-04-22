class ObtenerUsuarioPersona {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(personaId) {
        const usuario = await this.usuarioRepository.findByIdWithPersona(personaId);
        if (!usuario) {
            throw new Error('No se encontró usuario para esta persona');
        }
        return usuario;
    }
}

module.exports = ObtenerUsuarioPersona;