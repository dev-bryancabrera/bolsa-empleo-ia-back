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
        analisis_brecha,
        datos_interesantes,
        vacantes_reales,
        cursos_youtube,
        insights_personalizados,
        cv_fingerprint,
        fecha_generacion,
        vigente_hasta,
        created_at,
        updated_at
    }) {
        this.id = id;
        this.persona_id = persona_id;
        this.estadisticas = estadisticas;
        this.rutas_aprendizaje = rutas_aprendizaje;
        this.recomendaciones = recomendaciones;
        this.empleos_sugeridos = empleos_sugeridos;
        this.habilidades_demandadas = habilidades_demandadas;
        this.plataformas_recomendadas = plataformas_recomendadas;
        this.tendencias_sector = tendencias_sector;
        this.analisis_brecha = analisis_brecha;
        this.datos_interesantes = datos_interesantes;
        this.vacantes_reales = vacantes_reales;
        this.cursos_youtube = cursos_youtube;
        this.insights_personalizados = insights_personalizados;
        this.cv_fingerprint = cv_fingerprint;
        this.fecha_generacion = fecha_generacion;
        this.vigente_hasta = vigente_hasta;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Tendencia;
