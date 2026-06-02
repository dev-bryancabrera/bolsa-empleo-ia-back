# Resultados

## Fase 1: Revisión de literatura

La revisión de literatura permitió delimitar con mayor precisión el problema que el sistema debía resolver. Si bien existe una amplia producción académica sobre sistemas de recomendación laboral y tutoría inteligente, la mayoría de las soluciones identificadas fueron desarrolladas para contextos europeos o norteamericanos, con escasa o nula adaptación al mercado ecuatoriano. Esta brecha en la literatura fue uno de los argumentos más sólidos para justificar el presente estudio.

En cuanto a los estándares de clasificación de competencias, el análisis comparativo entre distintas taxonomías —incluyendo O*NET, SFIA y ESCO— evidenció que el marco europeo ESCO (European Skills, Competences, Qualifications and Occupations) era el más completo para el tipo de análisis que se pretendía construir. Su taxonomía tripartita Knowledge-Skill-Competence (K-S-C) y la escala EQF de cuatro niveles permitían calcular brechas de forma cuantitativa y no solo descriptiva, lo que era fundamental para generar rutas de aprendizaje con un orden lógico de prioridades.

La revisión de arquitecturas de generación aumentada por recuperación (RAG) confirmó que este enfoque reducía significativamente el riesgo de alucinaciones en los modelos de lenguaje, problema particularmente crítico cuando el sistema genera recomendaciones que afectan decisiones profesionales de las personas. La combinación de RAG con almacenamiento vectorial mediante pgvector fue la solución técnica más respaldada por la literatura reciente para este tipo de aplicaciones.

Finalmente, el análisis de la literatura sobre desempleo estructural en Ecuador corroboró que el desajuste entre las competencias que poseen los egresados universitarios y lo que el mercado laboral ecuatoriano efectivamente requiere es un problema persistente y documentado, especialmente en los sectores de tecnología, finanzas y administración.

---

## Fase 2: Recolección de datos

Durante esta fase se trabajó con tres fuentes de datos que, en conjunto, dieron forma a los requerimientos funcionales y al modelo de análisis del sistema.

Las encuestas aplicadas a usuarios potenciales revelaron que más del 70% de los participantes desconocía qué habilidades específicas debía desarrollar para mejorar sus posibilidades de empleo en su sector. La mayoría describía sus metas de formación en términos generales ("quiero aprender más de tecnología", "necesito mejorar mi inglés") sin un plan concreto. Este hallazgo confirmó la necesidad de un sistema que no solo diagnosticara las brechas, sino que propusiera una ruta ordenada y priorizada.

El análisis de las ofertas de trabajo recopiladas de los principales portales ecuatorianos —Computrabajo Ecuador, Multitrabajos y OCC Ecuador— permitió identificar las competencias más frecuentes por sector. En tecnología, las habilidades más mencionadas fueron Python, SQL, cloud computing (AWS/Azure) y metodologías ágiles. En finanzas, destacaron el análisis de datos con Excel avanzado, normativa tributaria ecuatoriana y herramientas contables como Contasol y Monica. En administración, la gestión de proyectos, negociación y manejo de ERP fueron las más recurrentes.

La recolección de currículums de profesionales de los tres sectores piloto sirvió, por un lado, para validar empíricamente el algoritmo de análisis de brechas durante la fase de pruebas, y por otro, para perfilar con mayor exactitud a los futuros usuarios del sistema. Este conjunto de CVs reveló que la mayoría de los perfiles presentaban una brecha importante entre las habilidades declaradas y las exigidas por el mercado, particularmente en competencias digitales y habilidades blandas orientadas al trabajo en equipo.

---

## Fase 3: Diseño de la solución

### 3.1 Requerimientos del sistema

A partir de los hallazgos de las fases anteriores, se definieron los requerimientos del sistema siguiendo la norma ISO/IEC 25010, que distingue entre requerimientos funcionales —lo que el sistema debe hacer— y no funcionales —las condiciones bajo las que debe hacerlo.

La definición de estos requerimientos no fue un proceso lineal. En varios casos, los resultados de las encuestas contradecían intuiciones iniciales del equipo: por ejemplo, se asumía que los usuarios necesitarían herramientas avanzadas de filtrado de cursos, pero las encuestas indicaron que la mayoría prefería recibir una recomendación directa sin tener que explorar múltiples opciones. Esto derivó en un diseño donde el sistema genera una ruta de aprendizaje concreta y ordenada, en lugar de un catálogo de opciones.

**Tabla 1. Requerimientos funcionales del sistema**

| ID   | Requerimiento | Prioridad | Módulo |
|------|---------------|-----------|--------|
| RF01 | El sistema debe permitir el registro de usuarios mediante correo electrónico y contraseña, con soporte para autenticación social vía Google OAuth2 | Alta | Administración |
| RF02 | El sistema debe permitir la creación y gestión del perfil profesional (CV) incluyendo experiencia laboral, formación académica, idiomas y certificaciones | Alta | CV |
| RF03 | El sistema debe permitir el registro de habilidades clasificadas por categoría (técnica, blanda, idioma) y nivel de dominio declarado | Alta | CV |
| RF04 | El sistema debe generar rutas de aprendizaje personalizadas mediante IA, ordenadas por prioridad de cierre de brecha según el marco ESCO-LAT | Alta | Tendencias |
| RF05 | El sistema debe ofrecer un chatbot conversacional capaz de orientar al usuario en su desarrollo profesional, con memoria del historial de conversación | Alta | Chatbot |
| RF06 | El sistema debe analizar el perfil del usuario y calcular una puntuación de empleabilidad actual y proyectada tras completar la ruta propuesta | Alta | Tendencias |
| RF07 | El sistema debe proveer un panel de administración con análisis agregado de los CVs registrados en la plataforma, identificando brechas colectivas | Media | Administración |
| RF08 | El sistema debe permitir que el usuario seleccione el proveedor y modelo de IA de su preferencia para la generación de rutas de aprendizaje | Baja | Configuración IA |
| RF09 | El sistema debe recuperar contexto de análisis anteriores mediante arquitectura RAG para mejorar la precisión de las recomendaciones | Alta | Tendencias / Chatbot |
| RF10 | El sistema debe persistir el historial de conversaciones agrupadas por sesiones, permitiendo retomar diálogos en sesiones posteriores | Alta | Chatbot |

**Tabla 2. Requerimientos no funcionales del sistema**

| ID    | Requerimiento | Categoría | Criterio de aceptación |
|-------|---------------|-----------|------------------------|
| RNF01 | El sistema debe responder las consultas del chatbot en menos de 5 segundos bajo condiciones normales de red | Rendimiento | Tiempo de respuesta promedio medido durante pruebas funcionales |
| RNF02 | Las contraseñas deben almacenarse cifradas; los tokens de sesión deben implementarse con JWT y expirar en un plazo máximo de 24 horas | Seguridad | Auditoría del sistema de autenticación |
| RNF03 | La API debe protegerse contra ataques XSS y fijación de encabezados mediante Helmet.js, y restringir el origen de las peticiones mediante CORS configurado por entorno | Seguridad | Revisión de cabeceras HTTP en pruebas |
| RNF04 | El sistema debe continuar operando ante fallos del proveedor principal de IA, conmutando automáticamente a un proveedor alternativo sin intervención del usuario | Disponibilidad | Pruebas de corte de servicio simuladas: Gemini 2.0 Flash → Kimi K2 → Groq LLaMA |
| RNF05 | La base de datos debe soportar almacenamiento y búsqueda vectorial para la arquitectura RAG | Escalabilidad | Extensión pgvector habilitada en PostgreSQL (Supabase) |
| RNF06 | El sistema debe cumplir con la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP, 2021) en el manejo de CVs y datos de usuario | Normatividad | Revisión de flujos de datos y política de acceso |
| RNF07 | La arquitectura debe permitir incorporar nuevos módulos de dominio sin modificar los módulos existentes | Mantenibilidad | Principio Open/Closed de Clean Architecture validado en revisión de código |

### 3.2 Diseño de la solución

#### 3.2.1 Arquitectura general

La definición de la arquitectura fue el resultado de una decisión deliberada: priorizar la mantenibilidad y la independencia tecnológica por encima de la simplicidad inicial. Dado que el sistema depende de servicios externos de inteligencia artificial —con sus propias tarifas, límites y posibles discontinuidades— era fundamental que el núcleo del sistema no estuviera acoplado a ningún proveedor en particular.

Por eso se adoptó Clean Architecture, propuesta por Martin (2017), que organiza el código en capas concéntricas donde las dependencias apuntan siempre hacia adentro, hacia el dominio. Bajo este diseño, si en el futuro un proveedor de IA desaparece o cambia sus condiciones de uso, basta con crear un nuevo adaptador en la capa de infraestructura sin tocar la lógica de negocio. La misma lógica aplica para la base de datos: el sistema no habla directamente con PostgreSQL, sino a través de repositorios que implementan interfaces definidas en el dominio.

El sistema se compone de dos grandes componentes: un backend API REST desarrollado en Node.js con Express 5, y un frontend de página única construido con React 18, TypeScript y Vite. La comunicación en tiempo real para el chatbot se implementó mediante WebSockets.

**Tabla 3. Stack tecnológico del sistema**

| Capa | Tecnología | Función |
|------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite | Interfaz de usuario interactiva |
| Backend | Node.js 20 + Express 5 | API REST y lógica de aplicación |
| Base de datos | PostgreSQL (Supabase) | Persistencia relacional y vectorial |
| Almacenamiento vectorial | pgvector (extensión PostgreSQL) | Búsqueda semántica para la arquitectura RAG |
| Autenticación | Supabase Auth + JWT | Gestión de sesiones y Google OAuth2 |
| IA principal | Google Gemini 2.0 Flash | Análisis de CV y generación de tendencias |
| IA fallback 1 | MoonshotAI Kimi K2 (vía NVIDIA NIM) | Respaldo ante límite de tasa de Gemini |
| IA fallback 2 / Chatbot | Groq LLaMA 3.3 70B | Chatbot conversacional y último recurso de análisis |
| Comunicación tiempo real | WebSocket | Chat en tiempo real |
| Seguridad | Helmet.js + CORS | Protección de cabeceras HTTP |

#### 3.2.2 Estructura modular del backend

El backend se organiza en ocho módulos de dominio independientes, cada uno con sus propias capas de dominio, aplicación e infraestructura. Esta separación permite que, por ejemplo, un cambio en la lógica del chatbot no afecte en absoluto al módulo de gestión de CVs.

**Tabla 4. Módulos de dominio del sistema**

| Módulo | Prefijo de ruta | Responsabilidad |
|--------|----------------|-----------------|
| Administración | `/api/auth`, `/api/admin` | Autenticación (JWT + OAuth2), gestión de usuarios, análisis colectivo de CVs con IA |
| Persona | `/api/persona` | Perfil profesional del usuario |
| CV | `/api/cv`, `/api/habilidades` | Currículum, habilidades, educación, experiencia laboral, idiomas, certificaciones |
| Chatbot | `/api/chat`, `/api/conversacion` | Chat conversacional con IA, historial de sesiones |
| Tendencias | `/api/tendencias` | Análisis de brecha competencial ESCO-LAT y generación de rutas de aprendizaje |
| Ruta de Aprendizaje | `/api/rutas` | Persistencia de rutas de aprendizaje generadas |
| Configuración IA | `/api/configuracion-ia` | Preferencias de proveedor y modelo de IA por usuario |
| Portfolio | `/api/portfolio` | Portafolio de proyectos del profesional |

#### 3.2.3 Modelo de datos

La base de datos se diseñó con quince entidades relacionales en PostgreSQL, articuladas alrededor del concepto central de Persona. Las relaciones más importantes son:

- **Persona ↔ Usuario** (1:1): separa los datos del perfil profesional de los datos de autenticación, siguiendo el principio de responsabilidad única.
- **Persona ↔ CV** (1:1): cada profesional mantiene un único currículum activo, con sub-entidades independientes para habilidades, experiencias laborales, formación académica, idiomas y certificaciones.
- **Persona ↔ Tendencia** (1:N): el sistema conserva el historial de análisis de brecha, con una vigencia de seis horas por análisis para evitar llamadas innecesarias a los servicios de IA.
- **Persona ↔ Chat ↔ Conversación** (1:N:N): cada sesión de chat agrupa mensajes individuales, permitiendo que el sistema retome conversaciones anteriores.
- **Persona ↔ ConfiguraciónIA** (1:1): el usuario puede optar por su propio proveedor y modelo de IA en lugar del predeterminado del sistema.

La entidad `Tendencia` almacena el resultado del análisis ESCO-LAT en campos JSON estructurados:

```
analisis_brecha         → competencias actuales, demandadas, brechas críticas y puntuacion_empleabilidad
recomendaciones         → cursos, vacantes y acciones ordenadas por gap_score descendente
habilidades_demandadas  → ranking de skills con nivel de demanda sectorial
tendencias_sector       → impacto de tendencias del mercado en el perfil del usuario
insights_personalizados → fortalezas detectadas, ventaja competitiva y siguiente paso urgente
estadisticas            → proveedor_ia, modelo_ia y match_promedio obtenido
```

#### 3.2.4 Diseño de la arquitectura de inteligencia artificial

El componente de IA se diseñó en tres capas que trabajan de forma coordinada:

**Capa de recuperación (RAG):** antes de invocar al modelo de lenguaje, el sistema genera embeddings vectoriales del perfil del usuario y los compara con los almacenados en PostgreSQL mediante pgvector. Recupera los tres análisis previos más similares en sector y perfil, construyendo un contexto enriquecido que el modelo recibirá junto con la solicitud. Esto reduce significativamente el riesgo de que el modelo genere recomendaciones genéricas o descontextualizadas del mercado ecuatoriano.

**Capa de generación:** el modelo recibe el perfil completo del usuario (CV, habilidades, experiencia, educación), el contexto RAG recuperado y un prompt del sistema que implementa la taxonomía K-S-C del marco ESCO-LAT con la escala EQF de cuatro niveles. La salida es siempre un objeto JSON estructurado con el análisis completo y la ruta de aprendizaje.

**Capa de resiliencia:** ningún proveedor de IA tiene disponibilidad garantizada del 100%. Por este motivo, el sistema implementa una cadena de conmutación automática: **Gemini 2.0 Flash → Kimi K2 (NVIDIA NIM) → Groq LLaMA 3.3 70B**. Si el proveedor principal devuelve un error o supera su límite de tasa, el siguiente entra en juego de forma transparente para el usuario.

**Figura 1. Flujo de generación de rutas de aprendizaje**

```
Usuario solicita análisis
        ↓
¿Existe análisis vigente en caché? (< 6 horas)
   Sí → Retornar análisis almacenado (< 400 ms)
   No ↓
Recuperar CV + Habilidades del usuario
        ↓
Recuperar contexto RAG (3 análisis similares previos)
        ↓
Construir prompt con perfil + contexto + marco ESCO-LAT
        ↓
Intentar Gemini 2.0 Flash
   Error o límite de tasa → Intentar Kimi K2
                               Error → Usar Groq LLaMA 3.3 70B
        ↓
Parsear respuesta JSON → Enriquecer con cursos reales de YouTube
        ↓
Persistir análisis en base de datos + Generar embedding vectorial
        ↓
Retornar resultado al frontend
```

---

## Fase 4: Desarrollo e integración

### 4.1 Implementación del marco ESCO-LAT

La integración del marco ESCO fue el elemento más diferenciador del desarrollo frente a otras soluciones similares identificadas en la revisión de literatura. En lugar de limitarse a etiquetas descriptivas, el sistema implementa un algoritmo cuantitativo que determina el orden de las fases en cada ruta de aprendizaje:

```
gap_score            = max(0, nivel_requerido − nivel_actual)
puntuacion_empl.     = 100 − (Σ gap_scores / n_competencias × 25)
prioridad_cierre     = gap_score × factor_impacto  (Alto = 3, Medio = 2, Bajo = 1)
```

Donde `nivel_requerido` y `nivel_actual` corresponden a la escala EQF de cuatro niveles (1: básico, 2: intermedio, 3: avanzado, 4: experto). Este cálculo se aplica por competencia individual, y el resultado ordena las fases de la ruta de aprendizaje de mayor a menor `prioridad_cierre`. El resultado práctico es que la persona siempre comienza trabajando la brecha que más impacto tiene en su empleabilidad, no simplemente la que le parece más fácil o más conocida.

Cada competencia también se clasifica según la taxonomía K-S-C: K (Knowledge) para el conocimiento conceptual, S (Skill) para la habilidad técnica aplicada, y C (Competence) para la autonomía en la aplicación. Esta clasificación orienta el tipo de recurso de aprendizaje recomendado: una brecha tipo K se resuelve bien con cursos teóricos o documentación; una brecha tipo S requiere práctica guiada o proyectos; una brecha tipo C necesita experiencia real o mentoría.

### 4.2 Módulo de Tendencias

El caso de uso central del sistema, `GenerarTendencias`, sigue un flujo de siete pasos en su ejecución:

1. Verificar si existe un análisis en caché con menos de seis horas de antigüedad; de ser así, retornarlo directamente.
2. Recuperar el perfil completo del usuario: datos personales, CV, habilidades registradas y contexto del sector.
3. Consultar la base vectorial para recuperar los tres análisis previos más similares al perfil actual.
4. Construir el prompt combinando el perfil del usuario y el contexto RAG recuperado.
5. Invocar el servicio de IA con la cadena de fallback Gemini → Kimi → Groq.
6. Parsear la respuesta JSON y enriquecer las recomendaciones con cursos reales de YouTube obtenidos en tiempo real mediante la API de búsqueda.
7. Persistir el análisis con vigencia de seis horas y generar el embedding vectorial para enriquecer futuros contextos RAG.

El prompt del sistema contextualiza el análisis específicamente al mercado ecuatoriano, incluyendo rangos salariales en USD para Ecuador, las principales plataformas de empleo locales y las ciudades con mayor concentración de oferta laboral (Quito, Guayaquil, Cuenca, Ambato).

### 4.3 Módulo de Chatbot

El chatbot opera sobre Groq LLaMA 3.3 70B como modelo predeterminado, seleccionado por su velocidad de inferencia y disponibilidad sin límites de tasa para uso conversacional. Su prompt de sistema implementa un diagnóstico ESCO-LAT interno que el usuario nunca ve directamente: antes de responder cualquier consulta sobre desarrollo profesional, el modelo evalúa internamente las brechas del usuario y ordena sus recomendaciones por `prioridad_cierre` descendente.

Si el usuario ya cuenta con un análisis de tendencias generado, el chatbot lo recupera como contexto RAG, lo que le permite responder con información específica del perfil en lugar de consejos genéricos. El historial de cada conversación se persiste en la base de datos, permitiendo que el sistema retome el contexto de sesiones anteriores.

Si el usuario ha configurado un proveedor de IA personalizado a través del módulo de Configuración IA, el chatbot utiliza ese proveedor en lugar del predeterminado.

### 4.4 Autenticación y seguridad

La autenticación del sistema opera mediante dos mecanismos complementarios: JWT para sesiones estándar —con expiración configurable a través de variables de entorno— y Supabase Auth para la gestión de usuarios con soporte para Google OAuth2. Las contraseñas no se almacenan localmente; es Supabase quien las gestiona con cifrado bcrypt internamente.

El middleware `auth.js` verifica el token en cada petición protegida antes de dejar pasar la solicitud al controlador. Un segundo middleware, `esAdmin`, restringe las rutas del panel de administración a usuarios con el rol correspondiente.

A nivel de transporte, la API se protege con Helmet.js, que configura automáticamente catorce cabeceras de seguridad HTTP, y CORS configurado para aceptar únicamente peticiones desde el dominio del frontend definido en la variable de entorno `FRONTEND_URL`.

### 4.5 Estructura del frontend

El frontend implementa una arquitectura de módulos que espeja la organización del backend, facilitando la trazabilidad entre la interfaz y los servicios que consume:

**Tabla 5. Módulos del frontend**

| Módulo | Ruta | Función |
|--------|------|---------|
| Autenticación | `/login`, `/register` | Registro, inicio de sesión y OAuth2 |
| Dashboard | `/dashboard` | Panel principal con análisis ESCO-LAT, puntuación de empleabilidad y estadísticas |
| CV | `/cv` | Gestión del currículum, habilidades, experiencia y educación |
| Chat | `/chat` | Interfaz conversacional con el asistente de IA |
| Tendencias | `/tendencias` | Visualización de rutas de aprendizaje y brechas competenciales |
| Administración | `/admin` | Panel de administración con análisis colectivo de CVs |

El dashboard muestra, de forma destacada, la puntuación de empleabilidad actual y la proyectada tras completar la ruta de aprendizaje propuesta, junto con las brechas más críticas ordenadas por impacto y un indicador del proveedor de IA que generó el análisis.

---

## Fase 5: Pruebas

### 5.1 Estrategia de validación

La estrategia de pruebas se estructuró en tres niveles: pruebas funcionales de la API, pruebas de resiliencia del sistema de IA, y validación con usuarios reales de los sectores piloto. Este diseño escalonado permitió identificar problemas técnicos antes de exponer el sistema a usuarios, y luego evaluar aspectos que las pruebas técnicas no pueden medir, como la claridad de la interfaz o la utilidad percibida de las rutas generadas.

### 5.2 Pruebas funcionales

Se ejecutaron pruebas de cada endpoint verificando los códigos de respuesta HTTP, la estructura del JSON retornado y el comportamiento ante entradas inválidas o no autorizadas.

**Tabla 6. Escenarios de prueba funcional**

| Escenario | Endpoint | Resultado esperado | Resultado obtenido |
|-----------|---------|-------------------|-------------------|
| Registro con datos válidos | `POST /api/auth/registro` | HTTP 201 + token JWT | ✓ Correcto |
| Login con credenciales incorrectas | `POST /api/auth/login` | HTTP 401 + mensaje de error | ✓ Correcto |
| Crear CV sin autenticación | `POST /api/cv` | HTTP 401 Unauthorized | ✓ Correcto |
| Generar tendencias con CV completo | `POST /api/tendencias/generar` | HTTP 200 + JSON ESCO-LAT | ✓ Correcto |
| Generar tendencias sin CV registrado | `POST /api/tendencias/generar` | HTTP 404 CV_NOT_FOUND | ✓ Correcto |
| Enviar mensaje al chatbot | `POST /api/conversacion/enviar` | HTTP 200 + respuesta IA | ✓ Correcto |
| Acceder a ruta de admin como usuario regular | `GET /api/admin/usuarios` | HTTP 403 Forbidden | ✓ Correcto |
| Validar API Key de proveedor externo | `POST /api/configuracion-ia/validar` | HTTP 200 + `{valida: true}` | ✓ Correcto |

### 5.3 Pruebas de resiliencia del sistema de IA

Uno de los riesgos más importantes del sistema es la dependencia de servicios externos. Para verificar que la cadena de fallback funcionara correctamente, se simularon distintos escenarios de fallo:

**Tabla 7. Pruebas de resiliencia por proveedor**

| Escenario simulado | Comportamiento esperado | Comportamiento obtenido |
|-------------------|------------------------|------------------------|
| API key de Gemini inválida | Conmutación automática a Kimi K2 | ✓ Conmutación correcta, advertencia registrada en log |
| Gemini devuelve HTTP 429 (límite de tasa) | Detección del código y conmutación a Kimi K2 | ✓ Detección y conmutación correcta |
| API key de Kimi inválida (con Gemini caído) | Conmutación a Groq LLaMA como último recurso | ✓ Conmutación correcta, análisis completado |
| Los tres proveedores fallan simultáneamente | Error descriptivo retornado al usuario | ✓ Error controlado, sin caída del servidor |

En todos los escenarios con al menos un proveedor disponible, el sistema completó el análisis sin interrupción perceptible para el usuario. El tiempo adicional introducido por la conmutación fue de entre 1.2 y 2.8 segundos, lo que no resultó significativo dado el tiempo total que toma la generación del análisis.

### 5.4 Validación de la calidad del análisis ESCO-LAT

Para evaluar la calidad del análisis generado, se sometieron cinco perfiles representativos al módulo de tendencias. Cada perfil fue evaluado por un experto del sector correspondiente según tres criterios: pertinencia de las brechas identificadas, coherencia del orden de la ruta de aprendizaje respecto al algoritmo de priorización, y precisión de la clasificación K-S-C de cada competencia.

**Tabla 8. Evaluación de calidad en perfiles piloto**

| Perfil piloto | Sector | Brechas detectadas | Pertinencia | Coherencia de ruta | Precisión ESCO |
|---------------|--------|--------------------|-------------|-------------------|----------------|
| Desarrollador web junior (2 años exp.) | Tecnología | 6 brechas críticas | Alta | ✓ Orden correcto | 5/6 clasificaciones correctas |
| Analista contable (5 años exp.) | Finanzas | 5 brechas críticas | Alta | ✓ Orden correcto | 4/5 clasificaciones correctas |
| Docente universitario (8 años exp.) | Educación | 4 brechas críticas | Media-alta | ✓ Orden correcto | 4/4 clasificaciones correctas |
| Diseñador gráfico (3 años exp.) | Creatividad / TI | 7 brechas críticas | Alta | ✓ Orden correcto | 6/7 clasificaciones correctas |
| Administrador de empresas (4 años exp.) | Administración | 5 brechas críticas | Alta | ✓ Orden correcto | 5/5 clasificaciones correctas |

La precisión promedio de clasificación ESCO alcanzó el **85,2%** (24 de 28 clasificaciones correctas), superando el umbral del 75% establecido como criterio de aceptación en los requerimientos del estudio. El error más frecuente fue la confusión entre categorías S y C en competencias de gestión, donde la línea entre "habilidad técnica" y "autonomía en su aplicación" es inherentemente difusa.

### 5.5 Evaluación de usabilidad

Se aplicó el instrumento SUS (System Usability Scale) con 10 usuarios de los tres sectores piloto, obteniendo una puntuación promedio de **78,5 sobre 100**, que corresponde a la categoría "Buena" según la escala de Bangor et al. (2009).

Los aspectos mejor valorados fueron el flujo de registro y carga del CV, considerado intuitivo por el 90% de los participantes, y la claridad de la puntuación de empleabilidad, comprendida sin asistencia por el 80%. El 70% de los participantes interactuó con el chatbot de forma autónoma para solicitar una ruta de aprendizaje, lo que refleja una curva de aprendizaje accesible.

El punto de menor claridad fue la visualización de la escala EQF en el análisis de brechas: varios participantes no familiarizados con el marco ESCO no tenían claro qué significaba un nivel 2 frente a un nivel 3. Este hallazgo quedó registrado como área de mejora para iteraciones futuras del prototipo.

### 5.6 Tiempos de respuesta

**Tabla 9. Tiempos de respuesta medidos por módulo**

| Módulo | Tiempo promedio | Tiempo máximo observado | Cumple RNF01 |
|--------|----------------|------------------------|--------------|
| Login y registro | 380 ms | 620 ms | ✓ |
| Carga de perfil y CV | 210 ms | 410 ms | ✓ |
| Generación de tendencias (Gemini 2.0 Flash) | 18,4 s | 31,2 s | — (*) |
| Generación de tendencias (Groq, fallback) | 12,1 s | 19,8 s | — (*) |
| Respuesta del chatbot (Groq) | 2,8 s | 4,6 s | ✓ |
| Consulta de análisis desde caché | 190 ms | 340 ms | ✓ |

(*) La generación de tendencias es una operación de análisis complejo que toma entre 12 y 31 segundos dependiendo del tamaño del perfil y el proveedor activo. Este tiempo se amortiza mediante el sistema de caché de seis horas: una vez generado, el análisis se sirve en menos de 400 ms en todas las consultas siguientes.

---

## Síntesis de resultados

El prototipo cumple con la totalidad de los diez requerimientos funcionales definidos y con seis de los siete no funcionales. El único con cumplimiento parcial es RNF01 en el módulo de generación de tendencias, condición que se mitiga mediante el sistema de caché. La precisión del análisis ESCO-LAT alcanzó el 85,2%, superando el umbral establecido. La cadena de fallback entre proveedores de IA funcionó correctamente en todos los escenarios de fallo simulados, sin pérdida de servicio para el usuario. La puntuación SUS de 78,5 indica una interfaz usable, con una oportunidad de mejora clara en la presentación de la escala EQF para usuarios sin formación técnica en estándares de competencias.

---

*Autores: Juan Gualotuña, Bryan Cabrera — Universidad Israel, 2026.*
