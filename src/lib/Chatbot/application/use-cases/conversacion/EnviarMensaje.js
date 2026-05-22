const IAServiceFactory = require('../../../../../infrastructure/services/IAServiceFactory');

class EnviarMensaje {
    constructor(conversacionRepository, cvRepository, iaService, configuracionRepository = null, tendenciaRepository = null) {
        this.conversacionRepository = conversacionRepository;
        this.cvRepository = cvRepository;
        this.iaService = iaService;
        this.configuracionRepository = configuracionRepository;
        this.tendenciaRepository = tendenciaRepository;
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

        // 7. Construir mensajes
        const promptSistema = this._obtenerPromptSistema(contexto, modo);
        const messages = [{ role: 'system', content: promptSistema }];

        for (const msg of historialFiltrado) {
            if (msg.tipo === 'usuario') messages.push({ role: 'user', content: msg.mensaje });
            if (msg.tipo === 'asistente') messages.push({ role: 'assistant', content: msg.respuesta });
        }
        messages.push({ role: 'user', content: mensajeUsuario });

        // 8. Llamar a la IA
        const respuestaIA = await servicioIA.generarRespuestaConHistorial(messages, { maxTokens: 3000 });

        // 9. Detectar si la respuesta es JSON de ruta de aprendizaje
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

    _obtenerPromptSistema(contexto, modo = null) {
        const anio = new Date().getFullYear();

        const siguienteAnio = anio + 1;
        let prompt = `Eres una IA especializada en orientación profesional y cierre de brechas competenciales para el mercado laboral de Ecuador y Latinoamérica. Tu conocimiento es siempre el más actualizado disponible, incluyendo tendencias ya establecidas y las que se proyectan hacia el futuro próximo.

Tu enfoque central es: analizar el perfil real del profesional, identificar las brechas frente al mercado actual y emergente (${anio}-${siguienteAnio}), y guiarlo con una ruta personalizada que cierre esas brechas tanto para el presente como para lo que viene.

Contexto de mercado actual: Ecuador y países de Latinoamérica enfrentan una transformación laboral acelerada por la IA generativa (ChatGPT, Copilot, Gemini y modelos emergentes), la automatización de tareas repetitivas, y la demanda creciente de perfiles con skills digitales. Las certificaciones en la nube (AWS, Azure, GCP), el manejo de herramientas de IA y los skills de data son las competencias más demandadas. El trabajo remoto/híbrido sigue expandiendo las oportunidades para profesionales latinoamericanos en empresas globales. Basa tus respuestas en lo que sabes hasta tu fecha de corte, pero proyecta tendencias hacia ${siguienteAnio} cuando sea relevante.
Salarios referenciales: en USD/mes para el mercado local de Ecuador y opciones remotas para mercados globales.
Recursos de aprendizaje priorizados: Platzi, Coursera, Udemy, YouTube (tutoriales más recientes disponibles), documentación oficial actualizada.
Tono: claro, pedagógico, motivador y orientado al crecimiento profesional real.
Todas tus recomendaciones deben basarse EXCLUSIVAMENTE en el CV proporcionado.`;

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

MODO ACTIVO: EXPLORACIÓN PROFUNDA DE FASE DE APRENDIZAJE

El usuario quiere profundizar en una fase específica de su ruta.

REGLAS:
1. Desglosa el tema en sub-temas esenciales con descripción, recursos concretos (Udemy, Coursera, YouTube, Platzi), proyectos prácticos y tiempo estimado.
2. Incluye checklist de criterios para saber que dominó el tema.
3. Prioriza recursos gratuitos pero también menciona opciones de pago de alto valor.
4. Adapta las recomendaciones al nivel y sector del usuario según su CV.`;
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

        // Inyectar análisis de brechas previo si existe
        let contextoBrechas = '';
        if (analisisBrechas?.brechas_criticas?.length > 0) {
            const brechasCriticas = analisisBrechas.brechas_criticas
                .filter(b => b.impacto_empleabilidad === 'Alto')
                .map(b => `• ${b.competencia} (nivel actual: ${b.nivel_actual} → requerido: ${b.nivel_requerido}, cierre: ${b.tiempo_cierre_estimado})`)
                .join('\n');

            contextoBrechas = `

ANÁLISIS DE BRECHAS PREVIO (del módulo de tendencias):
- Puntuación de empleabilidad actual: ${analisisBrechas.puntuacion_empleabilidad_actual}/100
- Puntuación potencial al cerrar brechas: ${analisisBrechas.puntuacion_empleabilidad_potencial}/100
- Brechas críticas identificadas:
${brechasCriticas || '  Ninguna crítica identificada'}
- Resumen: ${analisisBrechas.resumen_brecha || ''}

La ruta de aprendizaje DEBE cerrar estas brechas en orden de prioridad.`;
        }

        prompt += `

PROCESO OBLIGATORIO AL SOLICITAR UNA RUTA:

PASO 1 — DIAGNÓSTICO INTERNO (antes de responder):
1. Identifica competencias actuales del profesional según su CV.
2. Determina el rol objetivo más probable para su perfil en el mercado latinoamericano.
3. Lista las competencias que ese mercado exige para el rol en ${anio}.
4. Calcula las brechas: qué tiene vs. qué necesita.
5. Define el orden de cierre por impacto laboral real.

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
Con las respuestas del usuario, genera el JSON completo inmediatamente. No hagas preguntas adicionales.

FORMATO JSON OBLIGATORIO:
{
  "tipo": "ruta_aprendizaje",
  "titulo": "[Título específico y motivador basado en el perfil]",
  "nivel_inicio": "[Descripción del nivel de partida, ej: 'Desarrollador Junior con 1 año en React']",
  "salario_esperado": "[Rango salarial estimado al completar, en USD/mes para Ecuador/Latam]",
  "perfil_actual": {
    "nivel_general": "[Junior / Mid / Senior / Expert]",
    "fortalezas_clave": ["[fortaleza específica del CV]"],
    "brechas_identificadas": ["[brecha concreta identificada vs mercado actual ${anio}-${siguienteAnio}]"],
    "puntuacion_empleabilidad": 0
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
      "competencias_a_desarrollar": ["[competencia técnica específica que cierra una brecha]"],
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
- Mínimo 4 fases, máximo 7. Cada fase debe cerrar al menos una brecha identificada.
- En acciones_recomendadas: recursos reales accesibles en Ecuador/Latam (Platzi, Coursera, Udemy, YouTube).
- puntuacion_empleabilidad: número 0-100 fundamentado en el CV real.
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
