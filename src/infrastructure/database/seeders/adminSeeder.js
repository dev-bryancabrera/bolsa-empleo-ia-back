const bcrypt = require('bcrypt');

async function crearAdminPorDefecto(UsuarioModel) {
    try {
        // Verificar si ya existe un admin
        const adminExistente = await UsuarioModel.findOne({
            where: { email: process.env.ADMIN_EMAIL }
        });

        if (adminExistente) {
            console.log('✓ Usuario admin ya existe');
            return;
        }

        // Crear admin
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        await UsuarioModel.create({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            rol: 'admin',
            activo: true
        });

        console.log('✓ Usuario admin creado exitosamente');
        console.log(`  Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`  Password: ${process.env.ADMIN_PASSWORD}`);
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
}

module.exports = crearAdminPorDefecto;