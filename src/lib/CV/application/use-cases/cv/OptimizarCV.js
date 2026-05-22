const IAServiceFactory = require('../../../../../infrastructure/services/IAServiceFactory');

class OptimizarCV {
    constructor(cvRepository, habilidadesRepository, experienciaRepository, educacionRepository, idiomaRepository, certificacionRepository, iaService, configuracionRepository = null) {
        this.cvRepository = cvRepository;
        this.habilidadesRepository = habilidadesRepository;
        this.experienciaRepository = experienciaRepository;
        this.educacionRepository = educacionRepository;
        this.idiomaRepository = idiomaRepository;
        this.certificacionRepository = certificacionRepository;
        this.iaService = iaService;
        this.configuracionRepository = configuracionRepository;
    }

    async execute(cvId, personaId = null) {
        // 1. Obtener CV principal
        const cv = await this.cvRepository.obtenerPorId(cvId);
        if (!cv) throw new Error('CV no encontrado');

        // 2. Obtener todas las secciones del CV en paralelo
        const [habilidades, experiencias, educaciones, idiomas, certificaciones] = await Promise.all([
            this.cvRepository.obtenerHabilidades(cvId).catch(() => []),
            this.experienciaRepository ? this.experienciaRepository.listarPorCV(cvId).catch(() => []) : Promise.resolve([]),
            this.educacionRepository ? this.educacionRepository.listarPorCV(cvId).catch(() => []) : Promise.resolve([]),
            this.idiomaRepository ? this.idiomaRepository.listarPorCV(cvId).catch(() => []) : Promise.resolve([]),
            this.certificacionRepository ? this.certificacionRepository.listarPorCV(cvId).catch(() => []) : Promise.resolve([]),
        ]);

        // 3. Determinar servicio IA
        let servicioIA = this.iaService;
        if (this.configuracionRepository && personaId) {
            servicioIA = await IAServiceFactory.crearServicioParaPersona(personaId, this.configuracionRepository);
        }

        // 4. Construir y enviar prompt
        const prompt = this._construirPrompt(cv, habilidades, experiencias, educaciones, idiomas, certificaciones);
        const anioActual = new Date().getFullYear();
        const promptSistema = `Eres un experto consultor de carrera senior especializado en optimización de CVs para el mercado latinoamericano. Tu expertise cubre tanto las prácticas consolidadas como las tendencias emergentes hacia ${anioActual + 1}: sistemas ATS (Applicant Tracking Systems), estándares de reclutamiento moderno, LinkedIn Recruiter, y análisis de oferta laboral en Ecuador y Latam. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.`;

        const respuestaIA = await servicioIA.generarRespuesta(prompt, promptSistema, { maxTokens: 4000, jsonMode: true });

        // 5. Parsear y retornar
        return this._parsearRespuesta(respuestaIA, cv);
    }

    _construirPrompt(cv, habilidades, experiencias, educaciones, idiomas, certificaciones) {
        const anio = new Date().getFullYear();
        const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

        // ── Construir texto de campos llenos del CV principal ──
        const camposCV = [];
        if (cv.titulo_profesional) camposCV.push(`- titulo_profesional: "${cv.titulo_profesional}"`);
        if (cv.resumen_profesional) camposCV.push(`- resumen_profesional: "${cv.resumen_profesional}"`);
        if (cv.sector_profesional) camposCV.push(`- sector_profesional: "${cv.sector_profesional}"`);
        if (cv.nivel_educacion) camposCV.push(`- nivel_educacion: "${cv.nivel_educacion}"`);
        if (cv.anios_experiencia !== undefined && cv.anios_experiencia !== null) camposCV.push(`- anios_experiencia: ${cv.anios_experiencia}`);
        if (cv.disponibilidad) camposCV.push(`- disponibilidad: "${cv.disponibilidad}"`);
        if (cv.modalidad_trabajo) camposCV.push(`- modalidad_trabajo: "${cv.modalidad_trabajo}"`);

        const habilidadesTexto = habilidades.length > 0
            ? habilidades.map(h => `  • ${h.nombre} | ${h.categoria} | Nivel: ${h.nivel} | ${h.anios_experiencia} años`).join('\n')
            : null;

        const experienciasTexto = experiencias.length > 0
            ? experiencias.map(e => `  • ${e.cargo} en ${e.empresa} (${e.fecha_inicio} – ${e.fecha_fin || 'Actualidad'})\n    Descripción: ${e.descripcion || 'Sin descripción'}`).join('\n')
            : null;

        const educacionesTexto = educaciones.length > 0
            ? educaciones.map(ed => `  • ${ed.titulo} en ${ed.institucion} (${ed.nivel})`).join('\n')
            : null;

        const idiomasTexto = idiomas.length > 0
            ? idiomas.map(i => `  • ${i.nombre}: ${i.nivel}`).join('\n')
            : null;

        const certificacionesTexto = certificaciones.length > 0
            ? certificaciones.map(c => `  • ${c.nombre}${c.emisor ? ` — ${c.emisor}` : ''}`).join('\n')
            : null;

        // ── Determinar qué campos del CV principal se pueden mejorar ──
        const camposOptimizables = [];
        if (cv.titulo_profesional) camposOptimizables.push('titulo_profesional');
        if (cv.resumen_profesional) camposOptimizables.push('resumen_profesional');
        if (cv.sector_profesional) camposOptimizables.push('sector_profesional');
        if (cv.disponibilidad) camposOptimizables.push('disponibilidad');
        if (cv.modalidad_trabajo) camposOptimizables.push('modalidad_trabajo');

        return `Fecha: ${fecha}. Optimiza este CV para el mercado laboral latinoamericano actual (${anio}) y su proyección hacia ${anio + 1}, aplicando las últimas tendencias de reclutamiento y mejores prácticas ATS vigentes y emergentes.

PERFIL ACTUAL:
${camposCV.join('\n')}
${habilidadesTexto ? `\nHABILIDADES:\n${habilidadesTexto}` : ''}
${experienciasTexto ? `\nEXPERIENCIA LABORAL:\n${experienciasTexto}` : ''}
${educacionesTexto ? `\nEDUCACIÓN:\n${educacionesTexto}` : ''}
${idiomasTexto ? `\nIDIOMAS:\n${idiomasTexto}` : ''}
${certificacionesTexto ? `\nCERTIFICACIONES:\n${certificacionesTexto}` : ''}

TENDENCIAS DE RECLUTAMIENTO A APLICAR (${anio}-${anio + 1}):
1. ATS Compliance: palabras clave industria-específicas, verbos de acción, logros cuantificados
2. LinkedIn Optimization: título con keywords de búsqueda, resumen con propuesta de valor clara
3. Skills emergentes y en auge: IA generativa, automatización, data literacy, cloud computing, y cualquier tecnología relevante según el sector
4. Formato moderno: resumen ejecutivo impactante en 3-5 líneas, métricas concretas
5. Economía híbrida/remota: mencionar disponibilidad y modalidad de trabajo preferida
6. Personal branding: diferenciadores únicos, logros con números, impacto empresarial

INSTRUCCIONES CRÍTICAS:
- SOLO mejora campos que YA ESTÁN LLENOS en el perfil actual (no inventes información)
- Los campos optimizables son: ${camposOptimizables.join(', ')}
- En titulo_profesional: usa formato "Cargo Principal | Especialidad | Tecnología clave" si aplica
- En resumen_profesional: máx 5 líneas, incluye propuesta de valor, años de experiencia, logros cuantitativos y objetivo profesional
- Conserva los datos factuales del CV (empresa, fechas, instituciones), solo mejora la redacción
- Adapta el lenguaje al mercado ecuatoriano y latinoamericano

ESTRUCTURA JSON OBLIGATORIA:
{
  "campos_mejorados": {
    ${camposOptimizables.map(c => `"${c}": "string — versión optimizada del campo actual"`).join(',\n    ')}
  },
  "resumen_cambios": [
    {
      "campo": "string — nombre del campo modificado",
      "razon": "string — por qué se mejoró y qué tendencia se aplicó",
      "mejora_clave": "string — el beneficio específico (ej: 'Mejora visibilidad ATS en 40%')"
    }
  ],
  "tendencias_aplicadas": [
    {
      "tendencia": "string — nombre de la tendencia aplicada",
      "descripcion": "string — cómo se aplicó en este CV específico"
    }
  ],
  "score_antes": number (0-100, estimación del score actual del CV),
  "score_despues": number (0-100, estimación del score después de aplicar mejoras),
  "consejo_adicional": "string — un consejo extra que no requiere cambios en el sistema pero mejoraría el perfil"
}

Responde SOLO con el JSON válido, sin texto adicional.`;
    }

    _parsearRespuesta(respuesta, cv) {
        try {
            let limpia = respuesta.trim()
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '');

            const datos = JSON.parse(limpia);

            if (!datos.campos_mejorados || !datos.resumen_cambios) {
                throw new Error('La respuesta de IA no tiene la estructura esperada');
            }

            // Filtrar solo campos que realmente cambiaron y que existen en el CV
            const camposActuales = {
                titulo_profesional: cv.titulo_profesional,
                resumen_profesional: cv.resumen_profesional,
                sector_profesional: cv.sector_profesional,
                disponibilidad: cv.disponibilidad,
                modalidad_trabajo: cv.modalidad_trabajo,
            };

            const camposFiltrados = {};
            for (const [campo, valorNuevo] of Object.entries(datos.campos_mejorados)) {
                if (camposActuales[campo] !== undefined && camposActuales[campo] !== null && valorNuevo && valorNuevo !== camposActuales[campo]) {
                    camposFiltrados[campo] = valorNuevo;
                }
            }

            return {
                campos_mejorados: camposFiltrados,
                resumen_cambios: Array.isArray(datos.resumen_cambios) ? datos.resumen_cambios : [],
                tendencias_aplicadas: Array.isArray(datos.tendencias_aplicadas) ? datos.tendencias_aplicadas : [],
                score_antes: datos.score_antes ?? 0,
                score_despues: datos.score_despues ?? 0,
                consejo_adicional: datos.consejo_adicional || '',
            };
        } catch (error) {
            console.error('Error parseando respuesta de OptimizarCV:', error);
            throw new Error('No se pudo procesar la respuesta de la IA');
        }
    }
}

module.exports = OptimizarCV;
