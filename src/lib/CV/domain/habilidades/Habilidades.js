class Habilidades {
    constructor({
        id, id_cv, nombre, categoria, nivel, anios_experiencia, created_at
    }) {
        this.id = id;
        this.id_cv = id_cv;
        this.nombre = nombre;
        this.categoria = categoria;
        this.nivel = nivel;
        this.anios_experiencia = anios_experiencia;
        this.created_at = created_at;
    }
}

module.exports = Habilidades;