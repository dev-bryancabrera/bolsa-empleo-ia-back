const { CohereClient } = require('cohere-ai');
const supabase = require('./SupabaseClient');

class EmbeddingService {
    constructor() {
        const apiKey = process.env.COHERE_API_KEY;
        if (!apiKey) throw new Error('COHERE_API_KEY no configurada en .env');
        this.cohere = new CohereClient({ token: apiKey });
        this.modelo = 'embed-multilingual-v3.0';
        this.dims = 1024;
    }

    async generarEmbedding(texto) {
        const textoLimpio = texto.slice(0, 4096);
        const response = await this.cohere.embed({
            texts: [textoLimpio],
            model: this.modelo,
            inputType: 'search_document',
        });
        return response.embeddings[0];
    }

    async generarEmbeddingConsulta(texto) {
        const textoLimpio = texto.slice(0, 4096);
        const response = await this.cohere.embed({
            texts: [textoLimpio],
            model: this.modelo,
            inputType: 'search_query',
        });
        return response.embeddings[0];
    }

    async guardarEmbedding({ tipo, personaId = null, referenciaId = null, sector = null, tituloProfesional = null, contenido, metadata = {} }) {
        try {
            const embedding = await this.generarEmbedding(contenido);
            const { error } = await supabase
                .from('embeddings_analisis')
                .insert({
                    tipo,
                    persona_id: personaId,
                    referencia_id: referenciaId,
                    sector,
                    titulo_profesional: tituloProfesional,
                    contenido: contenido.slice(0, 8000),
                    metadata,
                    embedding: `[${embedding.join(',')}]`,
                });
            if (error) console.error('Error guardando embedding:', error.message);
        } catch (err) {
            console.error('Error en guardarEmbedding:', err.message);
        }
    }

    async buscarSimilares({ consulta, tipo, sector = null, limite = 3 }) {
        try {
            const embedding = await this.generarEmbeddingConsulta(consulta);
            const { data, error } = await supabase.rpc('buscar_similares', {
                query_embedding: `[${embedding.join(',')}]`,
                tipo_filtro: tipo,
                sector_filtro: sector,
                limite,
            });
            if (error) {
                console.error('Error en búsqueda semántica:', error.message);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('Error en buscarSimilares:', err.message);
            return [];
        }
    }

    formatearContextoRAG(similares) {
        if (!similares || similares.length === 0) return null;
        const fragmentos = similares
            .filter(s => s.similitud > 0.65)
            .map((s, i) => {
                const meta = s.metadata || {};
                return `[Análisis ${i + 1} — similitud ${(s.similitud * 100).toFixed(0)}% — sector: ${s.sector || 'N/D'} — perfil: ${s.titulo_profesional || 'N/D'}]
${s.contenido}`;
            });
        if (fragmentos.length === 0) return null;
        return `CONTEXTO RAG — ANÁLISIS SIMILARES PREVIOS (recuperados por similitud semántica, marco ESCO-LAT):
${fragmentos.join('\n\n')}

INSTRUCCIÓN: Usa estos análisis previos como referencia comparativa. Identifica patrones comunes y diferencias con el perfil actual. No copies literalmente — sintetiza el conocimiento acumulado.`;
    }
}

module.exports = EmbeddingService;
