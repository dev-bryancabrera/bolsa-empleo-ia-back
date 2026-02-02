class Persona {
    constructor({
        id, id_persona, email, password, rol, foto_perfil, activo, created_at
    }) {
        this.id = id;
        this.id_persona = id_persona;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.activo = activo;
        this.foto_perfil = foto_perfil;
        this.created_at = created_at;
    }
}

module.exports = Persona;