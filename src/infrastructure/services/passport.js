const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UsuarioModel = require('../models/UsuarioModel');
const PersonaModel = require('../models/PersonaModel');

async function asegurarPersona(usuario, nombreCompleto) {
    if (usuario.id_persona) return;

    const partes = (nombreCompleto || '').trim().split(/\s+/);
    const nombre = partes[0] || 'Sin nombre';
    const apellido = partes.slice(1).join(' ') || 'Sin apellido';

    const persona = await PersonaModel.create({
        nombre,
        apellido,
        identificacion: 'PENDIENTE',
    });

    await UsuarioModel.update({ id_persona: persona.id }, { where: { id: usuario.id } });
}

module.exports = function configurePassport() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const googleId = profile.id;
                    const email = profile.emails?.[0]?.value;
                    const nombre = profile.displayName || '';
                    const fotoUrl = profile.photos?.[0]?.value || null;

                    if (!email) {
                        return done(new Error('No se pudo obtener el email de Google'), null);
                    }

                    // 1. Buscar por google_id
                    let usuario = await UsuarioModel.findOne({ where: { google_id: googleId } });

                    // 2. Buscar por email (cuenta existente sin google_id)
                    if (!usuario) {
                        usuario = await UsuarioModel.findOne({ where: { email } });
                    }

                    if (usuario) {
                        // Vincular cuenta existente y actualizar datos de Google
                        await usuario.update({
                            google_id: googleId,
                            google_nombre: nombre,
                            google_foto_url: fotoUrl,
                            proveedor: usuario.proveedor === 'local' ? 'local' : 'google',
                        });

                        // Si el usuario no tiene Persona (ej: cuenta Google antigua), crearla
                        await asegurarPersona(usuario, nombre);

                        return done(null, usuario.get({ plain: true }));
                    }

                    // 3. Crear Persona y usuario nuevo desde Google
                    const partes = nombre.trim().split(/\s+/);
                    const primerNombre = partes[0] || 'Sin nombre';
                    const apellido = partes.slice(1).join(' ') || 'Sin apellido';

                    const nuevaPersona = await PersonaModel.create({
                        nombre: primerNombre,
                        apellido,
                        identificacion: 'PENDIENTE',
                    });

                    const nuevoUsuario = await UsuarioModel.create({
                        email,
                        password: null,
                        google_id: googleId,
                        google_nombre: nombre,
                        google_foto_url: fotoUrl,
                        proveedor: 'google',
                        rol: 'user',
                        activo: true,
                        id_persona: nuevaPersona.id,
                    });

                    return done(null, nuevoUsuario.get({ plain: true }));
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    // No usamos sesiones (usamos JWT), pero passport las requiere configuradas
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => done(null, { id }));
};
