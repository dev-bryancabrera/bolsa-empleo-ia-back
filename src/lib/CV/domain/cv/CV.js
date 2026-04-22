class CV {
    constructor({
        id, persona_id, titulo_profesional, resumen_profesional, nivel_educacion, anios_experiencia, sector_profesional,
        telefono, linkedin_url, github_url, portfolio_url, ciudad, pais, disponibilidad, modalidad_trabajo,
        estado, created_at
    }) {
        this.id = id;
        this.persona_id = persona_id;
        this.titulo_profesional = titulo_profesional;
        this.resumen_profesional = resumen_profesional;
        this.nivel_educacion = nivel_educacion;
        this.anios_experiencia = anios_experiencia;
        this.sector_profesional = sector_profesional;
        this.telefono = telefono;
        this.linkedin_url = linkedin_url;
        this.github_url = github_url;
        this.portfolio_url = portfolio_url;
        this.ciudad = ciudad;
        this.pais = pais;
        this.disponibilidad = disponibilidad;
        this.modalidad_trabajo = modalidad_trabajo;
        this.estado = estado;
        this.created_at = created_at;
    }
}

module.exports = CV;
