const IAServiceFactory = require('../../../../infrastructure/services/IAServiceFactory');

class GenerarTendencias {
  constructor(tendenciaRepository, personaRepository, cvRepository, habilidadesRepository, iaService, configuracionRepository = null) {
    this.tendenciaRepository = tendenciaRepository;
    this.personaRepository = personaRepository;
    this.cvRepository = cvRepository;
    this.habilidadesRepository = habilidadesRepository;
    this.iaService = iaService;
    this.configuracionRepository = configuracionRepository;
  }

  async execute(personaId) {
    try {
      // 1. Verificar tendencia vigente
      const tendenciaVigente = await this.tendenciaRepository.obtenerVigentePorPersona(personaId);
      if (tendenciaVigente) {
        return { success: true, data: tendenciaVigente, mensaje: 'Tendencia vigente encontrada' };
      }

      // 2. Obtener persona y CV
      const [persona, cv] = await Promise.all([
        this.personaRepository.obtenerPorId(personaId),
        this.cvRepository.obtenerPorPersonaId(personaId)
      ]);

      if (!persona) throw new Error('Persona no encontrada');
      if (!cv) throw new Error('CV_NOT_FOUND');

      // 3. Obtener habilidades
      const habilidades = await this.habilidadesRepository.obtenerPorCVId(cv.id);

      // 4. Determinar servicio IA
      let servicioIA = this.iaService;
      if (this.configuracionRepository) {
        servicioIA = await IAServiceFactory.crearServicioParaPersona(personaId, this.configuracionRepository);
      }

      // 5. Construir y enviar prompt
      const prompt = this._construirPrompt(persona, cv, habilidades);
      const promptSistema = `Eres un consultor senior en mercado laboral de Ecuador y Latinoamérica, especializado en análisis de brechas competenciales. Responde ÚNICAMENTE con un objeto JSON válido.`;

      const respuestaIA = await servicioIA.generarRespuesta(prompt, promptSistema, { maxTokens: 8000, jsonMode: true });

      // 6. Parsear y guardar
      const datosGenerados = this._parsearRespuesta(respuestaIA);

      const fechaGeneracion = new Date();
      const vigenteHasta = new Date(fechaGeneracion.getTime() + 6 * 60 * 60 * 1000);

      const tendencia = {
        persona_id: personaId,
        analisis_brecha: JSON.stringify(datosGenerados.analisis_brecha),
        recomendaciones: JSON.stringify(datosGenerados.recomendaciones),
        empleos_sugeridos: JSON.stringify(datosGenerados.empleos_sugeridos),
        habilidades_demandadas: JSON.stringify(datosGenerados.habilidades_demandadas),
        plataformas_recomendadas: JSON.stringify(datosGenerados.plataformas_recomendadas),
        tendencias_sector: JSON.stringify(datosGenerados.tendencias_sector),
        datos_interesantes: JSON.stringify(datosGenerados.datos_interesantes || []),
        insights_personalizados: JSON.stringify(datosGenerados.insights_personalizados),
        // Campos legacy — mantener compatibilidad con la tabla existente
        estadisticas: JSON.stringify({ habilidades_registradas: habilidades.length, match_promedio: datosGenerados.analisis_brecha?.puntuacion_empleabilidad_actual || 0, match_incremento: 0 }),
        rutas_aprendizaje: JSON.stringify([]),
        fecha_generacion: fechaGeneracion,
        vigente_hasta: vigenteHasta
      };

      const tendenciaCreada = await this.tendenciaRepository.crear(tendencia);
      return { success: true, data: tendenciaCreada, mensaje: 'Tendencias generadas exitosamente' };

    } catch (error) {
      console.error('Error en GenerarTendencias:', error);
      throw error;
    }
  }

  _construirPrompt(persona, cv, habilidades) {
    const slugificar = (texto) => (texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const tituloCodificado = encodeURIComponent(cv.titulo_profesional || '');
    const ubicacionCodificado = encodeURIComponent(`${persona.ciudad || ''} ${persona.pais || ''}`.trim());
    const habilidadesPrincipales = habilidades.length > 0
      ? habilidades.slice(0, 5).map(h => encodeURIComponent(h.nombre)).join('+')
      : tituloCodificado;
    const tituloSlug = slugificar(cv.titulo_profesional);

    const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${tituloCodificado}+${habilidadesPrincipales}&location=${ubicacionCodificado}&f_TPR=r604800&sortBy=DD`;
    const indeedUrl = `https://www.indeed.com/jobs?q=${tituloCodificado}+${habilidadesPrincipales}&l=${ubicacionCodificado}&fromage=7&sort=date`;
    const computrabajoUrl = `https://www.computrabajo.com.ec/trabajo-de-${tituloSlug}`;
    const udemyUrl = `https://www.udemy.com/courses/search/?q=${habilidadesPrincipales}&sort=newest`;
    const courseraUrl = `https://www.coursera.org/search?query=${habilidadesPrincipales}&sortBy=NEW`;
    const platziUrl = `https://platzi.com/cursos/?search=${habilidadesPrincipales}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${habilidadesPrincipales}+tutorial+${new Date().getFullYear()}&sp=EgQIBBAB`;

    const habilidadesTexto = habilidades.map(h => `${h.nombre} (${h.nivel}, ${h.anios_experiencia} años)`).join(', ') || 'Sin habilidades registradas';
    const habilidadesNombres = habilidades.map(h => h.nombre);
    const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const anio = new Date().getFullYear();

    return `La fecha actual es ${fechaActual}. Analiza este perfil profesional y genera un informe completo de brechas competenciales para el mercado laboral de Ecuador y Latinoamérica en ${anio}.

PERFIL DEL USUARIO:
- Nombre: ${persona.nombre} ${persona.apellido}
- Ubicación: ${persona.ciudad}, ${persona.pais}
- Título Profesional: ${cv.titulo_profesional}
- Nivel de Educación: ${cv.nivel_educacion}
- Años de Experiencia: ${cv.anios_experiencia}
- Sector: ${cv.sector_profesional}
- Resumen Profesional: ${cv.resumen_profesional}
- Habilidades actuales: ${habilidadesTexto}

INSTRUCCIONES CRÍTICAS SOBRE URLs:
- Para vacantes usa SOLO estas URLs preconfiguradas (tienen filtro de última semana):
  * LinkedIn: ${linkedinUrl}
  * Indeed: ${indeedUrl}
  * Computrabajo Ecuador: ${computrabajoUrl}
- Para cursos usa SOLO estas URLs:
  * Udemy: ${udemyUrl}
  * Coursera: ${courseraUrl}
  * Platzi: ${platziUrl}
  * YouTube: ${youtubeUrl}
- Para plataformas usa la URL raíz oficial (https://linkedin.com, etc.)
- NO inventes URLs de vacantes específicas ni estadísticas de postulaciones.
- Responde SOLO con un objeto JSON válido, sin texto adicional ni markdown.

ESTRUCTURA JSON EXACTA:
{
  "analisis_brecha": {
    "competencias_actuales": ["string — habilidad que el usuario YA tiene según su CV"],
    "competencias_demandadas": ["string — habilidad que el mercado latinoamericano exige para '${cv.titulo_profesional}' en ${anio}"],
    "brechas_criticas": [
      {
        "competencia": "string",
        "nivel_actual": "Ninguno|Básico|Intermedio",
        "nivel_requerido": "Intermedio|Avanzado|Experto",
        "impacto_empleabilidad": "Alto|Medio|Bajo",
        "tiempo_cierre_estimado": "string (ej: 2-3 meses)"
      }
    ],
    "puntuacion_empleabilidad_actual": number (0-100, basado en el perfil real),
    "puntuacion_empleabilidad_potencial": number (0-100, si cierra todas las brechas),
    "resumen_brecha": "string — párrafo explicando la situación actual y el camino a seguir"
  },
  "habilidades_demandadas": [
    {
      "nombre": "string",
      "demanda": "Alta|Media|Emergente",
      "porcentaje_ofertas": number,
      "tiempo_aprendizaje": "string",
      "prioridad": number,
      "el_usuario_la_tiene": ${JSON.stringify(habilidadesNombres.length > 0)} (boolean — true si '${habilidadesNombres.join(', ')}' incluye esta habilidad)
    }
  ],
  "empleos_sugeridos": [
    {
      "titulo": "string — nombre exacto del rol/puesto (ej: 'Backend Developer Node.js')",
      "ubicacion": "${persona.ciudad}, ${persona.pais} o Remoto",
      "match_actual": number (match con el perfil HOY, 0-100),
      "match_potencial": number (match si cierra las brechas, 0-100),
      "salario_estimado": "string (rango en USD/mes para Ecuador/Latam)",
      "modalidad": "Remoto|Híbrido|Presencial",
      "nivel": "Junior|Semi-Senior|Senior",
      "brechas_para_aplicar": ["string — qué le falta para postular con éxito"],
      "razon_match": "string — por qué este rol encaja con el perfil actual"
    }
  ],
  "recomendaciones": [
    {
      "tipo": "Curso|Certificación|Proyecto|Red_profesional",
      "titulo": "string",
      "razon": "string — explica qué brecha específica cierra",
      "brecha_que_cierra": "string — nombre de la brecha",
      "icon": "emoji",
      "accion": "string",
      "url": "string (usa SOLO las URLs de cursos de arriba)"
    }
  ],
  "tendencias_sector": [
    {
      "tendencia": "string — tendencia real del sector '${cv.sector_profesional}' en ${anio}",
      "impacto": "Alto|Medio|Bajo",
      "descripcion": "string",
      "oportunidad_para_el_perfil": "string — cómo puede aprovecharla este profesional específicamente"
    }
  ],
  "plataformas_recomendadas": [
    {
      "nombre": "string",
      "url": "string (URL raíz oficial)",
      "tipo": "Empleo|Aprendizaje|Networking|Freelance",
      "razon": "string — por qué es relevante para este perfil",
      "relevancia": number (1-10)
    }
  ],
  "datos_interesantes": [
    {
      "titulo": "string — dato relevante del mercado laboral ${anio}",
      "valor": "string — estadística o hecho concreto",
      "relevancia": "string — por qué importa para alguien con perfil de '${cv.titulo_profesional}'",
      "fuente": "string (ej: Stack Overflow Survey ${anio}, LinkedIn Workforce Report)"
    }
  ],
  "insights_personalizados": {
    "ventaja_competitiva": "string — qué tiene este profesional que pocos tienen",
    "riesgo_principal": "string — la brecha más urgente de cerrar",
    "siguiente_paso_urgente": "string — acción concreta para esta semana",
    "plazo_para_ser_competitivo": "string — tiempo estimado para alcanzar nivel de mercado"
  }
}

DIRECTRICES:
1. Identifica mínimo 3 brechas críticas realistas para el perfil en el mercado latinoamericano ${anio}.
2. Las habilidades_demandadas deben ser específicas al sector '${cv.sector_profesional}'.
3. Genera mínimo 5 tendencias del sector.
4. Los empleos_sugeridos deben coincidir con ${cv.anios_experiencia} años de experiencia.
5. El JSON debe ser 100% válido y parseable.`;
  }

  _parsearRespuesta(respuesta) {
    try {
      let limpia = respuesta.trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '');

      const datos = JSON.parse(limpia);

      if (!datos.analisis_brecha || !datos.habilidades_demandadas || !datos.recomendaciones) {
        throw new Error('La respuesta de IA no tiene la estructura esperada');
      }

      return datos;
    } catch (error) {
      console.error('Error parseando respuesta de IA:', error);
      throw new Error('No se pudo procesar la respuesta de la IA');
    }
  }
}

module.exports = GenerarTendencias;
