class Persona {
    constructor({
        id, nombre, apellido, identificacion, telefono, fecha_nacimiento, direccion, ciudad, pais, created_at
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
    }
}

module.exports = Persona;