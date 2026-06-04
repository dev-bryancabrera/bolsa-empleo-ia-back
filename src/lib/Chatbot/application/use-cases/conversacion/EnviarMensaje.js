const IAServiceFactory = require('../../../../../infrastructure/services/IAServiceFactory');
const EmbeddingService = require('../../../../../infrastructure/services/EmbeddingService');

class EnviarMensaje {
    constructor(conversacionRepository, cvRepository, iaService, configuracionRepository = null, tendenciaRepository = null) {
        this.conversacionRepository = conversacionRepository;
        this.cvRepository = cvRepository;
        this.iaService = iaService;
        this.configuracionRepository = configuracionRepository;
        this.tendenciaRepository = tendenciaRepository;
        try {
            this.embeddingService = new EmbeddingService();
        } catch {
            this.embeddingService = null;
        }
    }

    async execute(personaId, chatId, mensajeUsuario, esNuevaConversacion = false, modo = null) {
        // 1. Guardar mensaje del USUARIO
        await this.conversacionRepository.save({
            persona_id: personaId,
            chat_id: chatId,
            mensaje: mensajeUsuario,
            respuesta: null,
            tipo: 'usuario',
            respuesta_chat: 0,
            json: 0,
            metadata: JSON.stringify({ fecha: new Date() })
        });

        // 2. Obtener CV y análisis de brechas en paralelo
        const [cvCompleto, tendenciaVigente] = await Promise.all([
            this.cvRepository.obtenerPorPersonaId(personaId),
            this.tendenciaRepository ? this.tendenciaRepository.obtenerVigentePorPersona(personaId).catch(() => null) : Promise.resolve(null)
        ]);

        let cvCompletoConHabilidades = null;
        if (cvCompleto) {
            const cvHabilidades = await this.cvRepository.obtenerHabilidades(cvCompleto.id);
            cvCompletoConHabilidades = { ...cvCompleto, habilidades: cvHabilidades };
        }

        // 3. Determinar servicio IA (por config del usuario o por defecto)
        let servicioIA = this.iaService;
        if (this.configuracionRepository) {
            servicioIA = await IAServiceFactory.crearServicioParaPersona(personaId, this.configuracionRepository);
        }

        // 4. Extraer análisis de brechas si existe
        let analisisBrechas = null;
        if (tendenciaVigente?.analisis_brecha) {
            try {
                analisisBrechas = typeof tendenciaVigente.analisis_brecha === 'string'
                    ? JSON.parse(tendenciaVigente.analisis_brecha)
                    : tendenciaVigente.analisis_brecha;
            } catch (_) { /* ignora si no parsea */ }
        }

        // 5. Construir contexto
        const contexto = {
            usuario: {
                id: personaId,
                cv: cvCompleto ? {
                    titulo: cvCompleto.titulo_profesional,
                    resumen: cvCompleto.resumen_profesional,
                    experiencia: cvCompleto.anios_experiencia,
                    sector: cvCompleto.sector_profesional,
                    nivel_educacion: cvCompleto.nivel_educacion,
                    habilidades: cvCompletoConHabilidades?.habilidades?.map(h => ({
                        nombre: h.nombre,
                        categoria: h.categoria,
                        nivel: h.nivel,
                        anios: h.anios_experiencia
                    })) || []
                } : null
            },
            esNuevaConversacion,
            modo: modo || null,
            analisisBrechas
        };

        // 6. Obtener historial
        const historial = await this.conversacionRepository.listarPorChat(chatId);
        const historialFiltrado = historial
            .filter(m => m.mensaje !== '__INIT__')
            .sort((a, b) => new Date(a.metadata.fecha) - new Date(b.metadata.fecha));

        // 7. Recuperar contexto RAG de conversaciones/análisis similares previos
        let contextoRAG = '';
        if (this.embeddingService && cvCompleto) {
            const consultaRAG = `${mensajeUsuario} ${cvCompleto.titulo_profesional || ''} ${cvCompleto.sector_profesional || ''}`;
            const similares = await this.embeddingService.buscarSimilares({
                consulta: consultaRAG,
                tipo: 'chatbot',
                sector: cvCompleto.sector_profesional,
                limite: 2,
            });
            const fragmentoRAG = this.embeddingService.formatearContextoRAG(similares);
            if (fragmentoRAG) contextoRAG = fragmentoRAG;
        }

        // 8. Construir mensajes
        const promptSistema = this._obtenerPromptSistema(contexto, modo, contextoRAG);
        const messages = [{ role: 'system', content: promptSistema }];

        for (const msg of historialFiltrado) {
            if (msg.tipo === 'usuario') messages.push({ role: 'user', content: msg.mensaje });
            if (msg.tipo === 'asistente') messages.push({ role: 'assistant', content: msg.respuesta });
        }
        messages.push({ role: 'user', content: mensajeUsuario });

        // 9. Llamar a la IA
        const respuestaIA = await servicioIA.generarRespuestaConHistorial(messages, { maxTokens: 3000 });

        // 10. Guardar embedding de esta interacción para RAG futuro
        if (this.embeddingService && cvCompleto) {
            const resumenInteraccion = `Pregunta: ${mensajeUsuario.slice(0, 300)}. Respuesta: ${respuestaIA.slice(0, 500)}`;
            this.embeddingService.guardarEmbedding({
                tipo: 'chatbot',
                personaId,
                sector: cvCompleto.sector_profesional,
                tituloProfesional: cvCompleto.titulo_profesional,
                contenido: resumenInteraccion,
                metadata: { modo: modo || 'general', chat_id: chatId },
            }).catch(() => {});
        }

        // 11. Detectar si la respuesta es JSON de ruta de aprendizaje
        let esJSON = 0;
        try {
            const jsonMatch = respuestaIA.match(/\{[\s\S]*"tipo"\s*:\s*"ruta_aprendizaje"[\s\S]*\}/);
            if (jsonMatch) {
                JSON.parse(jsonMatch[0]);
                esJSON = 1;
            }
        } catch (_) { esJSON = 0; }

        // 10. Guardar respuesta
        const modeloUsado = servicioIA.obtenerModeloActual?.() || 'desconocido';
        return await this.conversacionRepository.save({
            persona_id: personaId,
            chat_id: chatId,
            mensaje: mensajeUsuario,
            respuesta: respuestaIA,
            tipo: 'asistente',
            respuesta_chat: 1,
            json: esJSON,
            metadata: JSON.stringify({ modelo: modeloUsado, fecha: new Date() })
        });
    }

    _obtenerPromptSistema(contexto, modo = null, contextoRAG = '') {
        const anio = new Date().getFullYear();

        const siguienteAnio = anio + 1;
        let prompt = `Eres una IA especializada en orientación profesional y cierre de brechas competenciales para el mercado laboral de Ecuador y Latinoamérica. Usas el marco ESCO (European Skills, Competences, Qualifications and Occupations) adaptado a Latam como taxonomía estándar para clasificar y evaluar competencias.

MARCO ESCO-LAT — TAXONOMÍA Y ALGORITMO DE BRECHA:
Clasifica cada competencia en K-S-C:
  K (Knowledge): lo que el profesional SABE conceptualmente
  S (Skill): lo que PUEDE HACER de forma técnica y aplicada
  C (Competence): cómo lo APLICA con autonomía y responsabilidad

Escala de dominio EQF (1-4):
  1-Básico | 2-Funcional | 3-Avanzado | 4-Experto

Algoritmo de gap por competencia:
  gap_score = max(0, nivel_requerido − nivel_actual)
  puntuacion_empleabilidad = 100 − (Σ gap_scores / n_competencias × 25)
  prioridad_cierre = gap_score × factor_impacto (Alto=3, Medio=2, Bajo=1)

Este algoritmo determina QUÉ aprender primero, en qué orden y por qué. Úsalo internamente para ordenar cualquier ruta de aprendizaje y análisis de brecha que generes.

CONTEXTO DE MERCADO ${anio}-${siguienteAnio}:
Ecuador y Latam enfrentan transformación laboral acelerada: IA generativa (modelos LLM, agentes, RAG), automatización de tareas repetitivas, demanda creciente de data literacy, cloud (AWS, Azure, GCP) y ciberseguridad. El trabajo remoto/híbrido expande oportunidades para profesionales latinoamericanos en empresas globales.
Salarios referenciales en USD/mes para Ecuador y opciones remotas.
Recursos priorizados: Platzi, Coursera, Udemy, YouTube, documentación oficial.
Tono: claro, pedagógico, motivador y orientado al crecimiento real.
Todas tus recomendaciones deben basarse EXCLUSIVAMENTE en el CV y datos del usuario proporcionados.`;

        if (contextoRAG) {
            prompt += `\n\n${contextoRAG}`;
        }

        // ── MODO ENTREVISTA ──────────────────────────────────────────────
        if (modo === 'entrevista') {
            const cv = contexto.usuario?.cv;
            const titulo = cv?.titulo || 'profesional';
            const habilidades = cv?.habilidades?.map(h => h.nombre).join(', ') || 'tecnologías del área';

            prompt += `

MODO ACTIVO: SIMULACRO DE ENTREVISTA TÉCNICA Y PROFESIONAL

Eres un entrevistador experto para el puesto de ${titulo}.

REGLAS:
1. Preséntate y explica la estructura de la entrevista.
2. Alterna preguntas técnicas (sobre ${habilidades}) y de comportamiento (método STAR).
3. Tras cada respuesta del candidato: da feedback específico, ejemplo de respuesta ideal y puntuación 1–10.
4. Al finalizar, genera un resumen con: puntos fuertes, áreas de mejora y recomendaciones de preparación.
5. Mantén un tono profesional pero alentador.`;
            return prompt;
        }

        // ── MODO EXPLORAR FASE ───────────────────────────────────────────
        if (modo === 'explorar_fase') {
            prompt += `

MODO ACTIVO: TUTOR INTERACTIVO DE FASE DE APRENDIZAJE

El usuario quiere aprender el contenido de una fase de su ruta. Actúa como un profesor experto que ENSEÑA directamente, NO como un buscador de recursos.

REGLAS ESTRICTAS:
1. ENSEÑA el contenido de forma clara y directa en el chat. Explica conceptos, da ejemplos concretos, muestra código si aplica.
2. Divide el tema en mini-lecciones interactivas. Después de cada una, pregunta si entendió o tiene dudas.
3. Usa analogías simples para conceptos complejos. Incluye ejemplos del mundo real del sector del usuario.
4. Si el usuario pregunta "¿qué es X?", explícalo tú aquí mismo. NO digas "ve a Platzi a aprender X".
5. Puedes mencionar recursos al FINAL como referencia adicional, pero el aprendizaje ocurre EN ESTE CHAT.
6. Adapta el nivel de explicación al perfil del usuario según su CV.
7. Termina cada respuesta con una pregunta o ejercicio práctico para reforzar el aprendizaje.`;
            return prompt;
        }

        // ── MODO RECURSOS ────────────────────────────────────────────────
        if (modo === 'recursos') {
            const cv = contexto.usuario?.cv;
            const sector = cv?.sector || 'tecnología';
            const titulo = cv?.titulo || 'profesional';

            prompt += `

MODO ACTIVO: CURACIÓN DE RECURSOS DE APRENDIZAJE

El usuario busca recursos para crecer como ${titulo} en el sector ${sector} del mercado latinoamericano.

REGLAS:
1. Para cada tecnología o tema: 2-3 cursos (nombre + plataforma + nivel + precio), 1-2 libros o docs oficiales, canales YouTube relevantes, proyectos de práctica.
2. Indica si es gratuito o de pago. Prioriza recursos accesibles en Ecuador/Latam.
3. Organiza por prioridad según el perfil y las tendencias del mercado actual y proyectadas hacia ${siguienteAnio}.
4. Menciona explícitamente las tendencias del mercado latinoamericano más actuales y emergentes: IA generativa, automatización, skills digitales, certificaciones cloud, y cualquier tecnología o práctica que esté ganando tracción.
5. Incluye recursos para certificaciones reconocidas internacionalmente cuando sean relevantes (AWS, Google, Microsoft, Meta).`;
            return prompt;
        }

        // ── INICIO DE NUEVA CONVERSACIÓN ─────────────────────────────────
        if (contexto.esNuevaConversacion) {
            prompt += `

INICIO DE CONVERSACIÓN:
Saluda profesionalmente y ofrece estas opciones al usuario:
- Analizar perfil y brechas profesionales
- Generar ruta de aprendizaje personalizada
- Preparación para entrevistas técnicas
- Explorar recursos de aprendizaje específicos

No generes ruta automáticamente. Espera la intención del usuario.`;
            return prompt;
        }

        // ── FLUJO PRINCIPAL ──────────────────────────────────────────────
        const { usuario, analisisBrechas } = contexto;
        const tieneCV = usuario?.cv && usuario.cv.titulo !== undefined;

        if (!tieneCV) {
            prompt += `

ESTADO: El usuario no tiene CV registrado en el sistema.

MISIÓN:
1. Motiva al usuario a completar su perfil profesional (CV).
2. Explica que sin CV no puedes generar una ruta personalizada.
3. Guíalo: ir a "Mi Currículum" en el menú lateral.

Si pide una ruta, responde: "Para generar tu ruta personalizada necesito que primero completes tu CV en la sección 'Mi Currículum'. ¿Te guío para hacerlo?"`;
            return prompt;
        }

        const cv = usuario.cv;
        const habilidadesTexto = cv.habilidades?.length > 0
            ? cv.habilidades.map(h => `• ${h.nombre} | Categoría: ${h.categoria} | Nivel: ${h.nivel} | ${h.anios} años`).join('\n')
            : 'Sin habilidades técnicas registradas.';

        // Inyectar análisis de brechas previo si existe (contexto RAG desde módulo de tendencias)
        let contextoBrechas = '';
        if (analisisBrechas?.brechas_criticas?.length > 0) {
            const brechasOrdenadas = [...analisisBrechas.brechas_criticas]
                .sort((a, b) => (b.prioridad_cierre ?? 0) - (a.prioridad_cierre ?? 0));

            const brechasCriticas = brechasOrdenadas
                .map(b => {
                    const gap = b.gap_score != null ? ` | gap_score=${b.gap_score}` : '';
                    const tipo = b.tipo_esco ? ` [${b.tipo_esco}]` : '';
                    return `• ${b.competencia}${tipo}: ${b.nivel_actual}→${b.nivel_requerido}${gap} | cierre: ${b.tiempo_cierre_estimado} | impacto: ${b.impacto_empleabilidad}`;
                })
                .join('\n');

            const empleabilidadOficial = analisisBrechas.puntuacion_empleabilidad_actual ?? 0;
            const empleabilidadPotencial = analisisBrechas.puntuacion_empleabilidad_potencial ?? 0;

            contextoBrechas = `

CONTEXTO CANÓNICO — ANÁLISIS DE BRECHAS OFICIAL (módulo de tendencias, calculado por el sistema):
- Marco: ${analisisBrechas.marco_referencia || 'ESCO-LAT'}
- ▶ EMPLEABILIDAD ACTUAL OFICIAL: ${empleabilidadOficial}/100  ← USA ESTE VALOR EXACTO en el JSON
- ▶ EMPLEABILIDAD POTENCIAL OFICIAL: ${empleabilidadPotencial}/100  ← USA ESTE VALOR EXACTO en el JSON
- Gap total: ${analisisBrechas.gap_total ?? 'N/D'}
- Brechas ordenadas por prioridad (gap_score × impacto):
${brechasCriticas || '  Ninguna brecha crítica registrada'}
- Diagnóstico: ${analisisBrechas.resumen_brecha || ''}

INSTRUCCIONES CRÍTICAS PARA LA RUTA:
1. La ruta DEBE cerrar estas brechas en el orden exacto de prioridad_cierre (mayor primero).
2. Cada fase debe referenciar en brechas_que_cierra al menos una brecha de la lista anterior.
3. En el campo "puntuacion_empleabilidad" del JSON escribe EXACTAMENTE ${empleabilidadOficial} — no lo recalcules ni estimes.
4. Las brechas listadas arriba son la ÚNICA fuente de verdad. No identifiques brechas adicionales desde cero.
5. Si el usuario genera múltiples rutas, todas deben abordar las MISMAS brechas en el mismo orden de prioridad.`;
        }

        prompt += `

DETECCIÓN DE ESTADO DEL FLUJO — LEE EL HISTORIAL ANTES DE RESPONDER:
Si en el historial el asistente ya mostró el formulario de preguntas (⏱️ horas, 🗓️ tiempo, 🎯 objetivo, 📚 estilo, 🚀 tecnología) Y el mensaje actual del usuario contiene una respuesta a ese formulario (números separados por comas, con o sin texto adicional, ej: "2, 3, 1, 3, Python" o "3,2,1,3,0" o "horas: 2 / tiempo: 3 / ..."):
→ OMITE el PASO 1 y el PASO 2.
→ Ve DIRECTAMENTE al PASO 3: interpreta las respuestas (en orden: horas/semana, tiempo objetivo, objetivo principal, estilo de aprendizaje, tecnología) y genera el JSON completo de ruta de aprendizaje.
→ NUNCA vuelvas a mostrar el formulario si el usuario ya respondió.
→ NUNCA digas "Por favor, responde a estas preguntas" si el historial muestra que ya las respondieron.

PROCESO OBLIGATORIO AL SOLICITAR UNA RUTA:

PASO 1 — DIAGNÓSTICO ESCO-LAT (antes de responder, no lo muestres al usuario):
${analisisBrechas?.brechas_criticas?.length > 0
    ? `ANÁLISIS YA CALCULADO POR EL SISTEMA — NO lo repitas desde cero:
- Las brechas canónicas están en el CONTEXTO CANÓNICO de arriba. Úsalas directamente.
- La puntuacion_empleabilidad oficial es ${analisisBrechas.puntuacion_empleabilidad_actual}/100. No la recalcules.
- Solo ajusta si el usuario menciona explícitamente que actualizó su CV desde ese análisis.`
    : `1. Lista las competencias actuales del CV con su clasificación K/S/C y nivel EQF (1-4).
2. Determina el rol objetivo más probable en el mercado latinoamericano para este perfil.
3. Lista las competencias que ese rol exige en ${anio} con nivel EQF requerido.
4. Calcula gap_score por competencia: max(0, nivel_requerido − nivel_actual).
5. Ordena las brechas por prioridad_cierre = gap_score × factor_impacto (Alto=3, Medio=2, Bajo=1).
6. Calcula puntuacion_empleabilidad = 100 − (Σ gap_scores / n_competencias × 25).`}

PASO 2 — FORMULARIO (cuando el usuario pida una ruta):
Presenta TODAS las preguntas en UN ÚNICO mensaje:

---
¡Perfecto! Para crear tu ruta 100% personalizada, responde con los números de tus opciones (ej: **2, 3, 1, 3, Python**):

**⏱️ 1. ¿Cuántas horas por semana puedes estudiar?**
\`1\` → 1–3 hrs &nbsp;&nbsp; \`2\` → 4–8 hrs &nbsp;&nbsp; \`3\` → 9–15 hrs &nbsp;&nbsp; \`4\` → +15 hrs

**🗓️ 2. ¿En cuánto tiempo quieres lograr tu objetivo?**
\`1\` → 1–2 meses &nbsp;&nbsp; \`2\` → 3–6 meses &nbsp;&nbsp; \`3\` → 6–12 meses &nbsp;&nbsp; \`4\` → +1 año

**🎯 3. ¿Cuál es tu objetivo principal?**
\`1\` → Conseguir empleo &nbsp;&nbsp; \`2\` → Crecer en mi trabajo &nbsp;&nbsp; \`3\` → Cambiar de área &nbsp;&nbsp; \`4\` → Emprender

**📚 4. ¿Tu estilo de aprendizaje preferido?**
\`1\` → Práctico (proyectos) &nbsp;&nbsp; \`2\` → Teórico (conceptos) &nbsp;&nbsp; \`3\` → Mixto

**🚀 5. ¿Alguna tecnología o área específica a priorizar?**
(Escribe el nombre, o \`0\` para que yo decida según las brechas identificadas)
---

PASO 3 — GENERAR JSON:
Con las respuestas del formulario (detectadas en el historial), genera el JSON completo inmediatamente.
NO muestres el formulario de nuevo. NO pidas más información. NO digas "Por favor responde". Genera el JSON directo.

FORMATO JSON OBLIGATORIO:
{
  "tipo": "ruta_aprendizaje",
  "titulo": "[Título específico y motivador basado en el perfil]",
  "nivel_inicio": "[Descripción del nivel de partida, ej: 'Desarrollador Junior con 1 año en React']",
  "perfil_actual": {
    "nivel_general": "[Junior / Mid / Senior / Expert]",
    "marco_evaluacion": "ESCO-LAT",
    "fortalezas_clave": ["[fortaleza específica del CV con clasificación K/S/C]"],
    "brechas_identificadas": [
      {
        "competencia": "[nombre de la brecha]",
        "tipo_esco": "K|S|C",
        "nivel_actual_num": 0,
        "nivel_requerido_num": 0,
        "gap_score": 0,
        "prioridad_cierre": 0
      }
    ],
    "puntuacion_empleabilidad": 0,
    "gap_total": 0
  },
  "objetivo_profesional": "[Objetivo claro y medible]",
  "duracion_estimada_meses": 0,
  "fases": [
    {
      "fase": 1,
      "nombre": "[Nombre inspirador de la fase]",
      "duracion_meses": 0,
      "nivel_dificultad": "[Básico / Intermedio / Avanzado]",
      "objetivo": "[Qué logrará al terminar esta fase]",
      "brechas_que_cierra": ["[nombre de la brecha del CONTEXTO RAG que esta fase resuelve]"],
      "competencias_a_desarrollar": [
        {
          "nombre": "[competencia técnica]",
          "tipo_esco": "K|S|C",
          "nivel_inicial": 0,
          "nivel_objetivo": 0,
          "gap_score": 0
        }
      ],
      "acciones_recomendadas": ["[acción concreta con recurso/plataforma, gratuita o accesible en Latam]"],
      "recursos_clave": ["[Nombre curso + plataforma + gratis/pago]"],
      "checklist_dominio": ["[Criterio medible para saber que dominó el tema]"],
      "resultado_esperado": "[Entregable o hito concreto al finalizar]"
    }
  ],
  "prioridades": ["[tecnología o brecha prioritaria según el mercado más actual disponible, priorizando IA generativa, automatización, cloud o data según aplique al perfil y a las tendencias emergentes hacia ${siguienteAnio}]"],
  "indicadores_de_progreso": ["[métrica objetiva de avance]"],
  "proximos_pasos_inmediatos": ["[acción concreta para comenzar hoy o esta semana]"]
}

REGLAS DEL JSON:
- Mínimo 4 fases, máximo 7. Las fases deben estar ordenadas por prioridad_cierre descendente del DIAGNÓSTICO ESCO-LAT.
- Cada fase DEBE incluir brechas_que_cierra con al menos una brecha del diagnóstico.
- competencias_a_desarrollar debe incluir gap_score para cada ítem (calculado con la escala EQF).
- En acciones_recomendadas: recursos reales accesibles en Ecuador/Latam (Platzi, Coursera, Udemy, YouTube).
- puntuacion_empleabilidad: calculado con 100 − (Σ gap_scores / n_competencias × 25). No usar número arbitrario.
- No alteres los nombres de los campos. No omitas ningún campo.
- Después del JSON, pregunta si quiere explorar alguna fase específica.
${contextoBrechas}

PERFIL PROFESIONAL:
========================
- Título: ${cv.titulo || 'No especificado'}
- Experiencia: ${cv.experiencia} años
- Sector: ${cv.sector || 'No especificado'}
- Educación: ${cv.nivel_educacion || 'No especificada'}
- Resumen: "${cv.resumen || 'Sin resumen.'}"

HABILIDADES REGISTRADAS:
${habilidadesTexto}`;

        return prompt;
    }
}

module.exports = EnviarMensaje;
