const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

class SolicitarRecuperacionPassword {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute(email) {
        // 1. Buscar usuario por email
        const usuario = await this.usuarioRepository.findByEmail(email);

        // Por seguridad, no revelamos si el email existe o no
        if (!usuario) {
            return { mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
        }

        // 2. Usuarios de Google no pueden resetear contraseña con este flujo
        if (usuario.proveedor === 'google' && !usuario.password) {
            return { mensaje: 'Esta cuenta usa Google para iniciar sesión. No necesita contraseña.' };
        }

        // 3. Generar token y fecha de expiración (1 hora)
        const token = uuidv4();
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // 4. Guardar token en DB
        await this.usuarioRepository.updateResetToken(usuario.id, token, expires);

        // 5. Enviar email
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"BolsaEmpleoIA" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Recuperación de contraseña — BolsaEmpleoIA',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Recuperación de contraseña</h2>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}"
                           style="background-color: #4F46E5; color: white; padding: 14px 28px;
                                  text-decoration: none; border-radius: 8px; font-size: 16px;">
                            Restablecer contraseña
                        </a>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">
                        Este enlace expirará en <strong>1 hora</strong>.
                        Si no solicitaste este cambio, puedes ignorar este correo.
                    </p>
                    <p style="color: #6B7280; font-size: 12px;">
                        O copia este enlace en tu navegador:<br/>
                        <a href="${resetUrl}">${resetUrl}</a>
                    </p>
                </div>
            `,
        });

        return { mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
    }
}

module.exports = SolicitarRecuperacionPassword;
