class ActualizarEstado {
    constructor(rutaRepository) {
        this.rutaRepository = rutaRepository;
    }

    async execute(rutaId, estado) {
        const estadosValidos = ['activa', 'completada', 'archivada'];
        if (!estadosValidos.includes(estado)) {
            throw new Error(`Estado inválido: ${estado}`);
        }
        return this.rutaRepository.update(rutaId, { estado });
    }
}

module.exports = ActualizarEstado;
