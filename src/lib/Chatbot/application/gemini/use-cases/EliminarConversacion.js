class EliminarConversacion {
    constructor(conversacionRepository) {
        this.repository = conversacionRepository;
    }

    async execute(id) {
        const eliminado = await this.repository.delete(id);
        if (!eliminado) throw new Error("No se pudo eliminar: ID no existe");
        return { message: "Conversación eliminada correctamente" };
    }
}

module.exports = EliminarConversacion;