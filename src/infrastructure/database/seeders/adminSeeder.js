const bcrypt = require('bcrypt');

async function crearAdminPorDefecto(UsuarioModel, supabase) {
    try {
        const adminExistente = await UsuarioModel.findOne({
            where: { email: process.env.ADMIN_EMAIL },
        });

        if (adminExistente && adminExistente.supabase_uid) {
            console.log('✓ Usuario admin ya existe y está vinculado a Supabase');
            return;
        }

        // Crear o recuperar usuario en Supabase Auth
        let supabaseUid = null;

        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            email_confirm: true,
        });

        if (createError) {
            // Si ya existe en Supabase, obtener su UID via signIn
            const { data: signInData } = await supabase.auth.signInWithPassword({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
            });
            supabaseUid = signInData?.user?.id ?? null;
        } else {
            supabaseUid = createData?.user?.id ?? null;
        }

        if (adminExistente) {
            // Vincular admin existente con Supabase
            await UsuarioModel.update(
                { supabase_uid: supabaseUid },
                { where: { email: process.env.ADMIN_EMAIL } }
            );
            console.log('✓ Usuario admin vinculado a Supabase Auth');
            return;
        }

        // Crear admin desde cero
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        await UsuarioModel.create({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            supabase_uid: supabaseUid,
            rol: 'admin',
            activo: true,
        });

        console.log('✓ Usuario admin creado exitosamente');
        console.log(`  Email: ${process.env.ADMIN_EMAIL}`);
        console.log(`  Password: ${process.env.ADMIN_PASSWORD}`);
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    }
}

module.exports = crearAdminPorDefecto;
