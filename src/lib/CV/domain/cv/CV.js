class CV {
    constructor({
        id, persona_id, titulo_profesional, resumen_profesional, nivel_educacion, anios_experiencia, sector_profesional, estado, created_at
    }) {
        this.id = id;
        this.persona_id = persona_id;
        this.titulo_profesional = titulo_profesional;
        this.resumen_profesional = resumen_profesional;
        this.nivel_educacion = nivel_educacion;
        this.anios_experiencia = anios_experiencia;
        this.sector_profesional = sector_profesional;
        this.estado = estado;
        this.created_at = created_at;
    }
}

module.exports = CV;