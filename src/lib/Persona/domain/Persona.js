class Persona {
    constructor({
        id, nombre, apellido, identificacion, telefono, fecha_nacimiento,
        direccion, ciudad, pais, created_at,
        // Información profesional
        titulo_profesional, descripcion, nivel_educativo, genero,
        // Presencia digital
        linkedin, github, sitio_web,
        // Preferencias laborales
        modalidad_trabajo, disponibilidad, salario_esperado, sector_interes,
    }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.identificacion = identificacion;
        this.telefono = telefono;
        this.fecha_nacimiento = fecha_nacimiento;
        this.direccion = direccion;
        this.ciudad = ciudad;
        this.pais = pais;
        this.created_at = created_at;
        // Información profesional
        this.titulo_profesional = titulo_profesional;
        this.descripcion = descripcion;
        this.nivel_educativo = nivel_educativo;
        this.genero = genero;
        // Presencia digital
        this.linkedin = linkedin;
        this.github = github;
        this.sitio_web = sitio_web;
        // Preferencias laborales
        this.modalidad_trabajo = modalidad_trabajo;
        this.disponibilidad = disponibilidad;
        this.salario_esperado = salario_esperado;
        this.sector_interes = sector_interes;
    }
}

module.exports = Persona;
