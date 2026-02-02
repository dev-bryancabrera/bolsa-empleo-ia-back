const jwt = require('jsonwebtoken');

class VerificarToken {
    async execute(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }
}

module.exports = VerificarToken;