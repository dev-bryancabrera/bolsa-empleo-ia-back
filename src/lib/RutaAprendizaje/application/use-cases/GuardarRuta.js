class GuardarRuta {
    constructor(rutaRepository) {
        this.rutaRepository = rutaRepository;
    }

    async execute({ persona_id, chat_id, json_ruta }) {
        const ruta = typeof json_ruta === 'string' ? JSON.parse(json_ruta) : json_ruta;

        const payload = {
            persona_id,
            chat_id: chat_id || null,
            titulo: ruta.titulo || 'Ruta de aprendizaje',
            objetivo: ruta.objetivo_profesional || null,
            duracion_meses: ruta.duracion_estimada_meses || null,
            json_ruta: JSON.stringify(ruta),
            progreso_fases: '{}',
            estado: 'activa',
        };

        return this.rutaRepository.save(payload);
    }
}

module.exports = GuardarRuta;
