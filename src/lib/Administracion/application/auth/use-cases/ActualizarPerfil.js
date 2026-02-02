class ActualizarPerfil {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(usuarioId, datos) {
        // Filtramos solo lo que permitimos actualizar al usuario
        const { email, password, foto_perfil } = datos;
        const dataToUpdate = {};

        if (email) dataToUpdate.email = email;
        if (password) dataToUpdate.password = password; // Recuerda hashear si el repo no lo hace
        if (foto_perfil) dataToUpdate.foto_perfil = foto_perfil;

        return await this.usuarioRepository.update(usuarioId, dataToUpdate);
    }
}
module.exports = ActualizarPerfil;