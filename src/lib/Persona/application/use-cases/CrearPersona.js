const Persona = require('../../domain/Persona');

class CrearPersona {
    constructor(personaRepository) {
        this.personaRepository = personaRepository;
    }

    async execute(dto) {
        const persona = new Persona({
            nombre: dto.nombre,
            apellido: dto.apellido,
            telefono: dto.telefono,
            fecha_nacimiento: dto.fecha_nacimiento,
            direccion: dto.direccion,
            ciudad: dto.ciudad,
            pais: dto.pais,
        });

        return this.personaRepository.crear(persona);
    }
}

module.exports = CrearPersona;