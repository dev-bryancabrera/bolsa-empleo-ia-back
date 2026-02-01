class Conversacion {
    constructor({
        id, persona_id, mensaje, respuesta, tipo,
        metadata, created_at, update_at
    }) {
        this.id = id;
        this.persona_id = persona_id;
        this.mensaje = mensaje;
        this.respuesta = respuesta;
        this.tipo = tipo;
        this.metadata = metadata;
        this.created_at = created_at;
        this.update_at = update_at;
    }
}

module.exports = Conversacion;