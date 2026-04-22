class Tendencia {
    constructor({
        id,
        persona_id,
        estadisticas,
        rutas_aprendizaje,
        recomendaciones,
        empleos_sugeridos,
        habilidades_demandadas,
        plataformas_recomendadas,
        tendencias_sector,
        datos_interesantes,
        insights_personalizados,
        fecha_generacion,
        vigente_hasta,
        created_at,
        updated_at
    }) {
        this.id = id;
        this.persona_id = persona_id;
        this.estadisticas = estadisticas; // JSON
        this.rutas_aprendizaje = rutas_aprendizaje; // JSON
        this.recomendaciones = recomendaciones; // JSON
        this.empleos_sugeridos = empleos_sugeridos; // JSON
        this.habilidades_demandadas = habilidades_demandadas; // JSON
        this.plataformas_recomendadas = plataformas_recomendadas; // JSON
        this.tendencias_sector = tendencias_sector; // JSON
        this.datos_interesantes = datos_interesantes; // JSON
        this.insights_personalizados = insights_personalizados; // JSON
        this.fecha_generacion = fecha_generacion;
        this.vigente_hasta = vigente_hasta;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Tendencia;
