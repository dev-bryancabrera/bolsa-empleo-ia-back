const supabase = require('../../../../../infrastructure/services/SupabaseClient');

class SincronizarGoogle {
    constructor(usuarioRepository, personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    async execute(token) {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new Error('Token de Supabase inválido');
        }

        // 1. Buscar por supabase_uid
        let usuario = await this.usuarioRepository.findBySupabaseUid(user.id);
        if (usuario) {
            return { usuario, token };
        }

        // 2. Buscar por email y vincular
        const usuarioPorEmail = await this.usuarioRepository.findByEmail(user.email);
        if (usuarioPorEmail) {
            const id = usuarioPorEmail.id ?? usuarioPorEmail.dataValues?.id;
            await this.usuarioRepository.update(id, {
                supabase_uid: user.id,
                proveedor: 'google',
                google_foto_url: user.user_metadata?.avatar_url ?? null,
                google_nombre: user.user_metadata?.full_name ?? null,
            });
            usuario = await this.usuarioRepository.findBySupabaseUid(user.id);
            return { usuario, token };
        }

        // 3. Crear persona y usuario nuevo
        const fullName = user.user_metadata?.full_name ?? '';
        const partes = fullName.trim().split(/\s+/);
        const nombre = partes[0] || 'Sin nombre';
        const apellido = partes.slice(1).join(' ') || 'Sin apellido';

        const persona = await this.personaRepository.crear({
            nombre,
            apellido,
            identificacion: 'PENDIENTE',
        });

        usuario = await this.usuarioRepository.createFromGoogle({
            email: user.email,
            supabase_uid: user.id,
            proveedor: 'google',
            google_foto_url: user.user_metadata?.avatar_url ?? null,
            google_nombre: fullName || null,
            rol: 'user',
            activo: true,
            id_persona: persona.id,
        });

        return { usuario, token };
    }
}

module.exports = SincronizarGoogle;
