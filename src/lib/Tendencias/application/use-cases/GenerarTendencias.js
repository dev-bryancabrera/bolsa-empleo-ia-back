const crypto = require('crypto');
const IAServiceFactory = require('../../../../infrastructure/services/IAServiceFactory');
const GeminiService = require('../../../../infrastructure/services/GeminiService');
const EmbeddingService = require('../../../../infrastructure/services/EmbeddingService');
const CursosYouTubeService = require('../../../../infrastructure/services/CursosYouTubeService');

class GenerarTendencias {
  constructor(tendenciaRepository, personaRepository, cvRepository, habilidadesRepository, iaService, configuracionRepository = null) {
    this.tendenciaRepository = tendenciaRepository;
    this.personaRepository = personaRepository;
    this.cvRepository = cvRepository;
    this.habilidadesRepository = habilidadesRepository;
    this.iaService = iaService;
    this.configuracionRepository = configuracionRepository;
    try {
      this.embeddingService = new EmbeddingService();
    } catch {
      this.embeddingService = null;
    }
    this.cursosService = new CursosYouTubeService();
  }

  // ─── Huella digital del perfil ────────────────────────────────────────────
  _calcularHuella(cv, habilidades) {
    const contenido = [
      cv.titulo_profesional || '',
      cv.sector_profesional || '',
      String(cv.anios_experiencia || 0),
      cv.nivel_educacion || '',
      habilidades
        .map(h => `${(h.nombre || '').toLowerCase()}:${h.nivel || ''}:${h.anios_experiencia || 0}`)
        .sort()
        .join('|')
    ].join('##');
    return crypto.createHash('sha256').update(contenido).digest('hex').slice(0, 12);
  }

  // ─── Empleabilidad calculada en código, no por la IA ─────────────────────
  _calcularEmpleabilidad(brechas) {
    if (!brechas || brechas.length === 0) return 0;
    const gapTotal = brechas.reduce((sum, b) => sum + (Number(b.gap_score) || 0), 0);
    const resultado = 100 - (gapTotal / brechas.length) * 25;
    return Math.max(0, Math.min(100, Math.round(resultado)));
  }

  // ─── Verificar si el CV cambió respecto al último análisis ───────────────
  async verificarCambios(personaId) {
    const cv = await this.cvRepository.obtenerPorPersonaId(personaId);
    if (!cv) return { hayCambios: false, tendenciaActual: null };

    const habilidades = await this.habilidadesRepository.obtenerPorCVId(cv.id);
    const huella = this._calcularHuella(cv, habilidades);

    const ultimaTendencia = await this.tendenciaRepository.obtenerUltimaPorPersona(personaId);
    if (!ultimaTendencia) return { hayCambios: true, huella };
    if (!ultimaTendencia.cv_fingerprint) return { hayCambios: true, huella };

    return {
      hayCambios: ultimaTendencia.cv_fingerprint !== huella,
      huella,
      tendenciaActual: ultimaTendencia,
    };
  }

  async execute(personaId) {
    try {
      // 1. Si hay tendencia vigente activa, devolverla sin tocar la IA
      const tendenciaVigente = await this.tendenciaRepository.obtenerVigentePorPersona(personaId);
      if (tendenciaVigente) {
        return { success: true, data: tendenciaVigente, mensaje: 'Tendencia vigente encontrada' };
      }

      // 2. Cargar perfil completo
      const [persona, cv] = await Promise.all([
        this.personaRepository.obtenerPorId(personaId),
        this.cvRepository.obtenerPorPersonaId(personaId)
      ]);

      if (!persona) throw new Error('Persona no encontrada');
      if (!cv) throw new Error('CV_NOT_FOUND');

      const habilidades = await this.habilidadesRepository.obtenerPorCVId(cv.id);

      // 3. Calcular huella del perfil actual
      const huella = this._calcularHuella(cv, habilidades);

      // 4. Si existe un análisis previo con la misma huella, reactivarlo
      //    (el perfil no cambió — reactivar es más honesto que re-analizar)
      const tendenciaPrevia = await this.tendenciaRepository.obtenerPorFingerprint(personaId, huella);
      if (tendenciaPrevia) {
        const reactivada = await this.tendenciaRepository.reactivar(tendenciaPrevia.id);
        return {
          success: true,
          data: reactivada,
          mensaje: 'Análisis recuperado — tu perfil profesional no ha cambiado desde el último análisis',
          sin_cambios: true
        };
      }

      // 5. El perfil cambió (o es la primera vez): seleccionar servicio IA
      let servicioIA;
      let proveedorIA = 'gemini';
      let modeloIA = 'gemini-2.0-flash';
      try {
        servicioIA = new GeminiService(process.env.GEMINI_API_KEY, 'gemini-2.0-flash');
      } catch {
        servicioIA = this.configuracionRepository
          ? await IAServiceFactory.crearServicioParaPersona(personaId, this.configuracionRepository)
          : this.iaService;
        proveedorIA = 'groq';
        modeloIA = 'llama-3.3-70b-versatile';
      }

      // 6. Contexto RAG de análisis similares previos
      let contextoRAG = '';
      if (this.embeddingService) {
        const consultaRAG = `${cv.titulo_profesional} ${cv.sector_profesional} ${habilidades.slice(0, 5).map(h => h.nombre).join(' ')}`;
        const similares = await this.embeddingService.buscarSimilares({
          consulta: consultaRAG,
          tipo: 'tendencia',
          sector: cv.sector_profesional,
          limite: 3,
        });
        const fragmentoRAG = this.embeddingService.formatearContextoRAG(similares);
        if (fragmentoRAG) contextoRAG = `\n\n${fragmentoRAG}`;
      }

      // 7. Construir y ejecutar prompt
      const prompt = this._construirPrompt(persona, cv, habilidades, contextoRAG);
      const anioActual = new Date().getFullYear();
      const promptSistema = this._construirPromptSistema(anioActual);

      let respuestaIA;
      try {
        respuestaIA = await servicioIA.generarRespuesta(prompt, promptSistema, { maxTokens: 12000, jsonMode: true });
      } catch (errGemini) {
        const esLimite = errGemini.message?.includes('429') || errGemini.status === 429
          || errGemini.message?.includes('quota') || errGemini.message?.includes('rate');
        if (esLimite || proveedorIA === 'gemini') {
          console.warn('⚠️ Gemini no disponible — usando Groq como fallback');
          const GroqService = require('../../../../infrastructure/services/GroqService');
          const groq = new GroqService(process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile');
          respuestaIA = await groq.generarRespuesta(prompt, promptSistema, { maxTokens: 8000, jsonMode: true });
          proveedorIA = 'groq';
          modeloIA = 'llama-3.3-70b-versatile';
        } else {
          throw errGemini;
        }
      }

      // 8. Parsear respuesta IA
      const datosGenerados = this._parsearRespuesta(respuestaIA);

      // 9. EMPLEABILIDAD DETERMINISTA: calcularla en código a partir de las brechas
      //    que identificó la IA. Así el número siempre es reproducible para el mismo perfil.
      const brechas = datosGenerados.analisis_brecha?.brechas_criticas || [];
      if (brechas.length > 0 && datosGenerados.analisis_brecha) {
        const empleabilidadCalculada = this._calcularEmpleabilidad(brechas);
        const gapTotal = brechas.reduce((sum, b) => sum + (Number(b.gap_score) || 0), 0);

        datosGenerados.analisis_brecha.puntuacion_empleabilidad_actual = empleabilidadCalculada;
        datosGenerados.analisis_brecha.gap_total = parseFloat((gapTotal / brechas.length * 25).toFixed(1));
        // Potencial: si cerrara todas las brechas de nivel 1 (quedaría un 5% de margen de mejora real)
        const empleabilidadPotencial = Math.min(100, empleabilidadCalculada + Math.round(gapTotal * 4));
        datosGenerados.analisis_brecha.puntuacion_empleabilidad_potencial = Math.min(100, empleabilidadPotencial);
      }

      // 10. Enriquecer con cursos reales
      const brechasCriticas = datosGenerados.analisis_brecha?.brechas_criticas || [];
      const cursosReales = await Promise.allSettled([
        this.cursosService.buscarCursosPorBrechas(brechasCriticas, 2),
      ]);
      if (cursosReales[0].status === 'fulfilled' && cursosReales[0].value.length > 0) {
        datosGenerados.cursos_youtube = cursosReales[0].value;
      }

      // 11. Guardar con huella del perfil
      const fechaGeneracion = new Date();
      const vigenteHasta = new Date(fechaGeneracion.getTime() + 6 * 60 * 60 * 1000);

      const empleabilidadFinal = datosGenerados.analisis_brecha?.puntuacion_empleabilidad_actual || 0;

      const tendencia = {
        persona_id: personaId,
        analisis_brecha: JSON.stringify(datosGenerados.analisis_brecha),
        recomendaciones: JSON.stringify(datosGenerados.recomendaciones),
        empleos_sugeridos: JSON.stringify([]),
        habilidades_demandadas: JSON.stringify(datosGenerados.habilidades_demandadas),
        plataformas_recomendadas: JSON.stringify(datosGenerados.plataformas_recomendadas),
        tendencias_sector: JSON.stringify(datosGenerados.tendencias_sector),
        datos_interesantes: JSON.stringify(datosGenerados.datos_interesantes || []),
        insights_personalizados: JSON.stringify(datosGenerados.insights_personalizados),
        vacantes_reales: JSON.stringify(datosGenerados.vacantes_reales || []),
        cursos_youtube: JSON.stringify(datosGenerados.cursos_youtube || []),
        estadisticas: JSON.stringify({
          habilidades_registradas: habilidades.length,
          match_promedio: empleabilidadFinal,
          match_incremento: 0,
          proveedor_ia: proveedorIA,
          modelo_ia: modeloIA,
          cv_fingerprint: huella,
        }),
        rutas_aprendizaje: JSON.stringify([]),
        cv_fingerprint: huella,
        fecha_generacion: fechaGeneracion,
        vigente_hasta: vigenteHasta,
      };

      const tendenciaCreada = await this.tendenciaRepository.crear(tendencia);

      // 12. Guardar embedding para RAG futuro
      if (this.embeddingService) {
        const resumenParaEmbedding = `Perfil: ${cv.titulo_profesional}, Sector: ${cv.sector_profesional}, Habilidades: ${habilidades.map(h => h.nombre).join(', ')}. Brechas: ${brechasCriticas.map(b => b.competencia).join(', ')}. Empleabilidad: ${empleabilidadFinal}/100.`;
        this.embeddingService.guardarEmbedding({
          tipo: 'tendencia',
          personaId,
          referenciaId: tendenciaCreada.id,
          sector: cv.sector_profesional,
          tituloProfesional: cv.titulo_profesional,
          contenido: resumenParaEmbedding,
          metadata: {
            puntuacion_empleabilidad: empleabilidadFinal,
            gap_total: datosGenerados.analisis_brecha?.gap_total,
            anios_experiencia: cv.anios_experiencia,
            nivel_educacion: cv.nivel_educacion,
            cv_fingerprint: huella,
          },
        }).catch(() => {});
      }

      return { success: true, data: tendenciaCreada, mensaje: 'Tendencias generadas exitosamente' };

    } catch (error) {
      if (error.message !== 'CV_NOT_FOUND') {
        console.error('Error en GenerarTendencias:', error);
      }
      throw error;
    }
  }

  _construirPromptSistema(anioActual) {
    return `Eres un consultor senior especializado en el mercado laboral de ECUADOR, con profundo conocimiento del contexto económico ecuatoriano: sectores productivos del país (tecnología, petróleo, agricultura, manufactura, servicios financieros, turismo), rangos salariales reales en USD para Ecuador ${anioActual}, plataformas de empleo locales (Computrabajo Ecuador, OCC Ecuador, Multitrabajos), y la realidad del mercado TI en ciudades ecuatorianas (Quito, Guayaquil, Cuenca, Ambato). También conoces el mercado remoto hacia empresas latinoamericanas y norteamericanas contratando talento ecuatoriano.

Aplicas la metodología ESCO (European Skills, Competences, Qualifications and Occupations) adaptada al contexto latinoamericano para el análisis de brechas competenciales, y tendencias de empleo ${anioActual}-${anioActual + 1}.

METODOLOGÍA DE BRECHA COMPETENCIAL (ESCO-LAT):
Clasifica cada competencia en la taxonomía K-S-C de ESCO:
  K (Knowledge): conocimiento conceptual declarado por el profesional
  S (Skill): capacidad técnica aplicada en contexto laboral real
  C (Competence): autonomía y responsabilidad al aplicar ese K o S
Escala de dominio alineada con EQF niveles 1-4:
  1-Básico: conciencia superficial, sin experiencia práctica
  2-Funcional: aplica con supervisión o soporte externo
  3-Avanzado: aplicación autónoma en contextos complejos
  4-Experto: referente, enseña a otros, decide estratégicamente
Cálculo de brecha: gap_score = max(0, nivel_requerido_num - nivel_actual_num)
IMPORTANTE: NO calcules puntuacion_empleabilidad_actual — el sistema lo calculará en código.
             Solo proporciona gap_score correcto por cada brecha; el puntaje final se derivará de ellos.
Prioridad de cierre: gap_score × factor_impacto (Alto=3, Medio=2, Bajo=1)

Tu conocimiento abarca: impacto de la IA generativa en el mercado laboral ecuatoriano, trabajo remoto/híbrido en Ecuador y Latam, demanda de skills de automatización y data en empresas ecuatorianas, economía naranja en Ecuador, certificaciones cloud (AWS, Azure, GCP) valoradas por empleadores ecuatorianos, y plataformas ATS usadas en Ecuador. Responde ÚNICAMENTE con un objeto JSON válido.`;
  }

  _construirPrompt(persona, cv, habilidades, contextoRAG = '') {
    const tituloCodificado = encodeURIComponent(cv.titulo_profesional || '');
    const habilidadesPrincipales = habilidades.length > 0
      ? habilidades.slice(0, 5).map(h => encodeURIComponent(h.nombre)).join('+')
      : tituloCodificado;

    const udemyUrl = `https://www.udemy.com/courses/search/?q=${habilidadesPrincipales}&sort=newest`;
    const courseraUrl = `https://www.coursera.org/search?query=${habilidadesPrincipales}&sortBy=NEW`;
    const platziUrl = `https://platzi.com/cursos/?search=${habilidadesPrincipales}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${habilidadesPrincipales}+tutorial+${new Date().getFullYear()}&sp=EgQIBBAB`;

    const habilidadesTexto = habilidades.map(h => `${h.nombre} (${h.nivel}, ${h.anios_experiencia} años)`).join(', ') || 'Sin habilidades registradas';
    const habilidadesNombres = habilidades.map(h => h.nombre);
    const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const anio = new Date().getFullYear();

    return `La fecha actual es ${fechaActual}.${contextoRAG}

Analiza este perfil profesional y genera un informe completo de brechas competenciales para el mercado laboral de ECUADOR en ${anio}. Todo el análisis debe estar contextualizado a la realidad ecuatoriana.

PERFIL DEL USUARIO:
- Nombre: ${persona.nombre} ${persona.apellido}
- Ubicación: ${persona.ciudad}, Ecuador
- Título Profesional: ${cv.titulo_profesional}
- Nivel de Educación: ${cv.nivel_educacion}
- Años de Experiencia: ${cv.anios_experiencia}
- Sector: ${cv.sector_profesional}
- Resumen Profesional: ${cv.resumen_profesional}
- Habilidades actuales: ${habilidadesTexto}

INSTRUCCIONES CRÍTICAS SOBRE URLs:
- Para cursos usa SOLO estas URLs:
  * Udemy: ${udemyUrl}
  * Coursera: ${courseraUrl}
  * Platzi: ${platziUrl}
  * YouTube: ${youtubeUrl}
- Para plataformas usa la URL raíz oficial (https://linkedin.com, etc.)
- NO inventes URLs de vacantes específicas ni estadísticas de postulaciones.
- Responde SOLO con un objeto JSON válido, sin texto adicional ni markdown.

INSTRUCCIÓN CRÍTICA SOBRE EMPLEABILIDAD:
- En puntuacion_empleabilidad_actual pon 0 — el sistema lo calculará en código a partir de los gap_score.
- En puntuacion_empleabilidad_potencial pon 0 — también se calculará en código.
- Lo que SÍ importa es que cada gap_score sea preciso: gap_score = nivel_requerido_num - nivel_actual_num.

ESTRUCTURA JSON EXACTA:
{
  "analisis_brecha": {
    "marco_referencia": "ESCO-LAT",
    "competencias_actuales": [
      {
        "nombre": "string — habilidad que el usuario YA tiene según su CV",
        "tipo_esco": "K|S|C",
        "nivel_actual_num": number (1-4 según escala EQF),
        "nivel_actual": "Básico|Funcional|Avanzado|Experto"
      }
    ],
    "competencias_demandadas": [
      {
        "nombre": "string — habilidad que el mercado ecuatoriano exige para '${cv.titulo_profesional}' en ${anio}",
        "tipo_esco": "K|S|C",
        "nivel_requerido_num": number (1-4),
        "nivel_requerido": "Básico|Funcional|Avanzado|Experto"
      }
    ],
    "brechas_criticas": [
      {
        "competencia": "string",
        "tipo_esco": "K|S|C",
        "nivel_actual": "Ninguno|Básico|Funcional|Avanzado",
        "nivel_requerido": "Funcional|Avanzado|Experto",
        "nivel_actual_num": number (0-4, 0=Ninguno),
        "nivel_requerido_num": number (1-4),
        "gap_score": number (nivel_requerido_num - nivel_actual_num),
        "impacto_empleabilidad": "Alto|Medio|Bajo",
        "prioridad_cierre": number (gap_score × factor_impacto),
        "tiempo_cierre_estimado": "string (ej: 2-3 meses)"
      }
    ],
    "gap_total": 0,
    "puntuacion_empleabilidad_actual": 0,
    "puntuacion_empleabilidad_potencial": 0,
    "resumen_brecha": "string — párrafo explicando la situación actual en el mercado ecuatoriano y el camino a seguir"
  },
  "habilidades_demandadas": [
    {
      "nombre": "string",
      "tipo_esco": "K|S|C",
      "demanda": "Alta|Media|Emergente",
      "porcentaje_ofertas": number,
      "tiempo_aprendizaje": "string",
      "prioridad": number,
      "el_usuario_la_tiene": ${JSON.stringify(habilidadesNombres.length > 0)} (boolean — true si '${habilidadesNombres.join(', ')}' incluye esta habilidad)
    }
  ],
  "recomendaciones": [
    {
      "tipo": "Curso|Certificación|Proyecto|Red_profesional",
      "titulo": "string — nombre del tema o skill a aprender",
      "razon": "string — explica qué brecha específica cierra y por qué es relevante en Ecuador",
      "brecha_que_cierra": "string — nombre de la brecha",
      "icon": "emoji",
      "accion": "string (ej: 'Ver cursos', 'Obtener certificación')",
      "plataforma": "Udemy|Coursera|Platzi|YouTube|LinkedIn_Learning"
    }
  ],
  "tendencias_sector": [
    {
      "tendencia": "string — tendencia real del sector '${cv.sector_profesional}' en Ecuador en ${anio}",
      "impacto": "Alto|Medio|Bajo",
      "descripcion": "string — descripción con contexto ecuatoriano",
      "oportunidad_para_el_perfil": "string — cómo puede aprovecharla este profesional en Ecuador"
    }
  ],
  "plataformas_recomendadas": [
    {
      "nombre": "string",
      "url": "string (URL raíz oficial)",
      "tipo": "Empleo|Aprendizaje|Networking|Freelance",
      "razon": "string — por qué es relevante para este perfil en Ecuador",
      "relevancia": number (1-10)
    }
  ],
  "insights_personalizados": {
    "ventaja_competitiva": "string — qué tiene este profesional que pocos tienen en el mercado ecuatoriano",
    "riesgo_principal": "string — la brecha más urgente de cerrar para ser competitivo en Ecuador",
    "siguiente_paso_urgente": "string — acción concreta para esta semana aplicable en Ecuador",
    "plazo_para_ser_competitivo": "string — tiempo estimado para alcanzar nivel de mercado ecuatoriano"
  }
}

DIRECTRICES:
1. TODO el análisis debe reflejar la realidad del mercado laboral ecuatoriano en ${anio}.
2. Aplica la metodología ESCO-LAT: clasifica CADA brecha con tipo_esco (K/S/C), asigna niveles numéricos (0-4) y calcula gap_score. No omitas campos numéricos.
3. Identifica mínimo 5 brechas críticas realistas ordenadas por prioridad_cierre descendente.
4. Las habilidades_demandadas deben ser específicas al sector '${cv.sector_profesional}' en Ecuador.
5. Los campos puntuacion_empleabilidad_actual, puntuacion_empleabilidad_potencial y gap_total deja en 0 — el sistema los calculará.
6. Genera mínimo 5 tendencias del sector con su oportunidad_para_el_perfil personalizada para Ecuador.
7. En recomendaciones, elige la plataforma óptima según el tipo: Udemy=cursos prácticos, Coursera=certificaciones académicas, Platzi=mercado Latam, YouTube=gratuito, LinkedIn_Learning=habilidades blandas.
8. En plataformas_recomendadas incluye plataformas de empleo ecuatorianas como Computrabajo Ecuador, Multitrabajos.
9. El JSON debe ser 100% válido y parseable.`;
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
