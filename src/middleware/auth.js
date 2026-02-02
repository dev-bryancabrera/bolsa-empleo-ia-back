const jwt = require('jsonwebtoken');
const UsuarioModel = require('../infrastructure/models/UsuarioModel');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        // 1. Verificar si el token existe
        if (!token) {
            return res.status(401).json({
                status: 'error',
                code: 'TOKEN_MISSING',
                message: 'No se encontró un token de autenticación. Por favor, inicia sesión.'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 2. Buscar al usuario y verificar si está activo
            const usuario = await UsuarioModel.findOne({
                where: { id: decoded.id, activo: true }
            });

            if (!usuario) {
                return res.status(401).json({
                    status: 'error',
                    code: 'USER_NOT_FOUND',
                    message: 'Sesión no válida o usuario desactivado.'
                });
            }

            req.usuario = usuario;
            req.token = token;
            next();

        } catch (jwtError) {
            console.log("Error real de JWT:", jwtError.message);

            // 3. Diferenciar errores de JWT (expirado vs inválido)
            const message = jwtError.name === 'TokenExpiredError'
                ? 'Tu sesión ha expirado. Por favor, ingresa de nuevo.'
                : 'Token de autenticación inválido.';

            return res.status(401).json({
                status: 'error',
                code: 'INVALID_TOKEN',
                message
            });
        }

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error interno en el servidor de autenticación.'
        });
    }
};

const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN',
            message: 'Acceso restringido. Esta acción requiere permisos de administrador.'
        });
    }
    next();
};

module.exports = { auth, esAdmin };