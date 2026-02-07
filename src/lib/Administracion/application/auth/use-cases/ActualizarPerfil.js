class ActualizarPerfil {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(usuarioId, datos) {
        const { email, password } = datos;
        const dataToUpdate = {};

        if (email) dataToUpdate.email = email;
        if (password) dataToUpdate.password = password;

        if (datos.foto_perfil) {
            dataToUpdate.foto_perfil = datos.foto_perfil;
        }

        return await this.usuarioRepository.update(usuarioId, dataToUpdate);
    }
}
module.exports = ActualizarPerfil;