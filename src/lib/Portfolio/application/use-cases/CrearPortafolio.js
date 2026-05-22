const CONFIG_DEFAULT = {
    colores: {
        primario: '#6d28d9',
        secundario: '#2563eb',
        fondo: '#ffffff',
        texto: '#111827',
        acento: '#8b5cf6',
    },
    fuente: 'inter',
    secciones: {
        resumen: true,
        experiencia: true,
        educacion: true,
        habilidades: true,
        idiomas: true,
        certificaciones: true,
        proyectos_custom: true,
        contacto: true,
    },
    orden_secciones: ['resumen', 'experiencia', 'habilidades', 'educacion', 'certificaciones', 'idiomas', 'proyectos_custom', 'contacto'],
};

const CONTENIDO_DEFAULT = {
    bio_extendida: '',
    titulo_hero: '',
    proyectos_custom: [],
    links_sociales: { github: '', linkedin: '', twitter: '', website: '' },
    disponible_para_trabajo: true,
    frase_motivacional: '',
};

class CrearPortafolio {
    constructor(portfolioRepository, personaRepository) {
        this.portfolioRepository = portfolioRepository;
        this.personaRepository = personaRepository;
    }

    async execute(personaId) {
        // Si ya tiene portafolio, devuelve el existente
        const existente = await this.portfolioRepository.obtenerPorPersonaId(personaId);
        if (existente) return existente;

        const persona = await this.personaRepository.obtenerPorId(personaId);
        if (!persona) throw new Error('Persona no encontrada');

        const slug = await this._generarSlug(persona.nombre, persona.apellido);

        try {
            return await this.portfolioRepository.crear({
                persona_id: personaId,
                plantilla: 'minimalista',
                publicado: false,
                url_slug: slug,
                configuracion: CONFIG_DEFAULT,
                contenido_extra: CONTENIDO_DEFAULT,
            });
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError' && err.fields?.url_slug) {
                // Slug colisionó con otro usuario — intentar con sufijo timestamp
                const slugFallback = `${slug}-${Date.now()}`;
                return this.portfolioRepository.crear({
                    persona_id: personaId,
                    plantilla: 'minimalista',
                    publicado: false,
                    url_slug: slugFallback,
                    configuracion: CONFIG_DEFAULT,
                    contenido_extra: CONTENIDO_DEFAULT,
                });
            }
            throw err;
        }
    }

    async _generarSlug(nombre, apellido) {
        const base = `${nombre}-${apellido}`
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        let slug = base;
        let intento = 0;
        while (await this.portfolioRepository.existeSlug(slug)) {
            intento++;
            slug = `${base}-${intento}`;
        }
        return slug;
    }
}

module.exports = CrearPortafolio;
