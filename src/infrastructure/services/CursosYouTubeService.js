const axios = require('axios');

class CursosYouTubeService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3/search';
    }

    async buscarCursosPorBrechas(brechas = [], limite = 2) {
        if (!this.apiKey || brechas.length === 0) return [];

        // Buscar en paralelo para las top 4 brechas por prioridad
        const brechasTop = [...brechas]
            .sort((a, b) => (b.prioridad_cierre ?? 0) - (a.prioridad_cierre ?? 0))
            .slice(0, 4);

        const resultados = await Promise.allSettled(
            brechasTop.map(brecha => this._buscarPorSkill(brecha, limite))
        );

        return resultados
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value);
    }

    async _buscarPorSkill(brecha, limite) {
        const query = `${brecha.competencia} tutorial ${new Date().getFullYear()} español`;

        const { data } = await axios.get(this.baseUrl, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                order: 'relevance',
                maxResults: limite,
                relevanceLanguage: 'es',
                key: this.apiKey,
            },
            timeout: 6000,
        });

        return (data.items || []).map(item => ({
            brecha_que_cierra: brecha.competencia,
            tipo_esco: brecha.tipo_esco || 'S',
            gap_score: brecha.gap_score,
            prioridad_cierre: brecha.prioridad_cierre,
            video: {
                titulo: item.snippet.title,
                canal: item.snippet.channelTitle,
                descripcion: item.snippet.description?.slice(0, 150) || '',
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails?.medium?.url || null,
                publicado: item.snippet.publishedAt
                    ? new Date(item.snippet.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
                    : null,
            },
        }));
    }

    async buscarCursoPorQuery(query, limite = 3) {
        if (!this.apiKey) return [];

        const { data } = await axios.get(this.baseUrl, {
            params: {
                part: 'snippet',
                q: `${query} ${new Date().getFullYear()} tutorial español`,
                type: 'video',
                order: 'relevance',
                maxResults: limite,
                relevanceLanguage: 'es',
                key: this.apiKey,
            },
            timeout: 6000,
        });

        return (data.items || []).map(item => ({
            titulo: item.snippet.title,
            canal: item.snippet.channelTitle,
            descripcion: item.snippet.description?.slice(0, 150) || '',
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails?.medium?.url || null,
            publicado: item.snippet.publishedAt
                ? new Date(item.snippet.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })
                : null,
        }));
    }
}

module.exports = CursosYouTubeService;
