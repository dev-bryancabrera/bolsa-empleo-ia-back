class RutaAprendizaje {
    constructor({ id, persona_id, chat_id, titulo, objetivo, duracion_meses, json_ruta, progreso_fases, estado, created_at, updated_at }) {
        this.id = id;
        this.persona_id = persona_id;
        this.chat_id = chat_id;
        this.titulo = titulo;
        this.objetivo = objetivo;
        this.duracion_meses = duracion_meses;
        this.json_ruta = json_ruta;
        this.progreso_fases = progreso_fases || '{}';
        this.estado = estado || 'activa';
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = RutaAprendizaje;
