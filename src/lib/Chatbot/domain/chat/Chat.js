class Chat {
    constructor({
        id, persona_id, titulo, estado, configuracion,
        created_at, updated_at
    }) {
        this.id = id;
        this.persona_id = persona_id;
        this.titulo = titulo;
        this.estado = estado;
        this.configuracion = configuracion;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Chat;