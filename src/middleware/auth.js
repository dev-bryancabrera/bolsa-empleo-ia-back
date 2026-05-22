const supabase = require('../infrastructure/services/SupabaseClient');
const UsuarioModel = require('../infrastructure/models/UsuarioModel');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: 'error',
                code: 'TOKEN_MISSING',
                message: 'No se encontró un token de autenticación. Por favor, inicia sesión.',
            });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                status: 'error',
                code: 'INVALID_TOKEN',
                message: 'Token de autenticación inválido o expirado.',
            });
        }

        const usuario = await UsuarioModel.findOne({
            where: { supabase_uid: user.id, activo: true },
        });

        if (!usuario) {
            return res.status(401).json({
                status: 'error',
                code: 'USER_NOT_FOUND',
                message: 'Sesión no válida o usuario desactivado.',
            });
        }

        req.usuario = usuario;
        req.token = token;
        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error interno en el servidor de autenticación.',
        });
    }
};

const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN',
            message: 'Acceso restringido. Esta acción requiere permisos de administrador.',
        });
    }
    next();
};

module.exports = { auth, esAdmin };
