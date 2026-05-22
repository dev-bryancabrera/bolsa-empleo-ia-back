class ObtenerDatosEditor {
    constructor(personaRepository, cvRepository, habilidadesRepository, experienciaRepository, educacionRepository, idiomaRepository, certificacionRepository) {
        this.personaRepository = personaRepository;
        this.cvRepository = cvRepository;
        this.habilidadesRepository = habilidadesRepository;
        this.experienciaRepository = experienciaRepository;
        this.educacionRepository = educacionRepository;
        this.idiomaRepository = idiomaRepository;
        this.certificacionRepository = certificacionRepository;
    }

    async execute(personaId) {
        const [persona, cv] = await Promise.all([
            this.personaRepository.obtenerPorId(personaId),
            this.cvRepository.obtenerPorPersonaId(personaId),
        ]);

        if (!cv) {
            return { persona, cv: null, experiencias: [], educaciones: [], habilidades: [], idiomas: [], certificaciones: [] };
        }

        const [experiencias, educaciones, habilidades, idiomas, certificaciones] = await Promise.all([
            this.experienciaRepository.listarPorCV(cv.id).catch(() => []),
            this.educacionRepository.listarPorCV(cv.id).catch(() => []),
            this.habilidadesRepository.obtenerPorCVId(cv.id).catch(() => []),
            this.idiomaRepository.listarPorCV(cv.id).catch(() => []),
            this.certificacionRepository.listarPorCV(cv.id).catch(() => []),
        ]);

        return { persona, cv, experiencias, educaciones, habilidades, idiomas, certificaciones };
    }
}

module.exports = ObtenerDatosEditor;
