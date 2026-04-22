const CV = require('../../../domain/cv/CV');

class ImportarCV {
    constructor(cvRepository, habilidadesRepository, personaRepository) {
        this.cvRepository = cvRepository;
        this.habilidadesRepository = habilidadesRepository;
        this.personaRepository = personaRepository;
    }

    async execute(personaId, datos) {
        // 1. Verificar que la persona existe
        const persona = await this.personaRepository.obtenerPorId(personaId);
        if (!persona) throw new Error('Persona no encontrada');

        // 2. Verificar si ya tiene CV
        let cv = await this.cvRepository.obtenerPorPersonaId(personaId);

        if (cv) {
            // Actualizar CV existente
            cv = await this.cvRepository.actualizar(cv.id, {
                persona_id: personaId,
                titulo_profesional: datos.titulo_profesional,
                resumen_profesional: datos.resumen_profesional,
                anios_experiencia: datos.anios_experiencia,
                nivel_educacion: datos.nivel_educacion,
                sector_profesional: datos.sector_profesional,
                estado: true
            });
        } else {
            // Crear nuevo CV
            const nuevoCv = new CV({
                persona_id: personaId,
                titulo_profesional: datos.titulo_profesional,
                resumen_profesional: datos.resumen_profesional,
                anios_experiencia: datos.anios_experiencia,
                nivel_educacion: datos.nivel_educacion,
                sector_profesional: datos.sector_profesional,
                estado: true
            });
            cv = await this.cvRepository.crear(nuevoCv);
        }

        // 3. Importar habilidades si vienen en los datos
        const habilidadesImportadas = [];
        if (Array.isArray(datos.habilidades) && datos.habilidades.length > 0) {
            for (const h of datos.habilidades) {
                if (!h.nombre) continue;
                try {
                    const habilidad = await this.habilidadesRepository.crear({
                        nombre: h.nombre,
                        categoria: h.categoria || 'Técnica',
                        nivel: h.nivel || 'Intermedio',
                        anios_experiencia: h.anios_experiencia || 0,
                        id_cv: cv.id
                    });
                    habilidadesImportadas.push(habilidad);
                } catch (err) {
                    // Si falla una habilidad individual, continúa con las demás
                    console.warn(`No se pudo importar habilidad "${h.nombre}": ${err.message}`);
                }
            }
        }

        return {
            cv,
            habilidades_importadas: habilidadesImportadas.length,
            mensaje: `CV importado exitosamente con ${habilidadesImportadas.length} habilidades.`
        };
    }
}

module.exports = ImportarCV;
