const Habilidades = require('../../../domain/habilidades/Habilidades');

class CrearHabilidad {
    constructor(habilidadesRepository, cvRepository) {
        this.habilidadesRepository = habilidadesRepository;
        this.cvRepository = cvRepository;
    }

    async execute(dto) {
        // Verificar que el CV existe
        const cvExiste = await this.cvRepository.obtenerPorId(dto.id_cv);
        if (!cvExiste) {
            throw new Error('El CV no existe');
        }

        const habilidad = new Habilidades({
            id_cv: dto.id_cv,
            nombre: dto.nombre,
            categoria: dto.categoria,
            nivel: dto.nivel,
            anios_experiencia: dto.anios_experiencia,
        });

        return this.habilidadesRepository.crear(habilidad);
    }
}

module.exports = CrearHabilidad;