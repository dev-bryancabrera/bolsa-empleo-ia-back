const axios = require('axios');

class VacantesService {
    constructor() {
        this.jsearchKey = process.env.JSEARCH_API_KEY;
        this.adzunaAppId = process.env.ADZUNA_APP_ID;
        this.adzunaAppKey = process.env.ADZUNA_APP_KEY;
    }

    async buscarVacantes({ titulo, ciudad, pais, habilidades = [], limite = 5 }) {
        const vacantes = await this._buscarJSearch({ titulo, ciudad, pais, habilidades, limite })
            .catch(() => []);

        if (vacantes.length > 0) return vacantes;

        return this._buscarAdzuna({ titulo, ciudad, pais, limite }).catch(() => []);
    }

    async _buscarJSearch({ titulo, ciudad, pais, habilidades, limite }) {
        if (!this.jsearchKey) return [];

        const query = `${titulo} ${habilidades.slice(0, 3).join(' ')} ${ciudad} ${pais}`.trim();

        const { data } = await axios.get('https://jsearch.p.rapidapi.com/search', {
            params: { query, page: '1', num_pages: '1', country: 'ec', date_posted: 'month' },
            headers: {
                'x-rapidapi-key': this.jsearchKey,
                'x-rapidapi-host': 'jsearch.p.rapidapi.com',
            },
            timeout: 8000,
        });

        return (data.data || []).slice(0, limite).map(job => ({
            titulo: job.job_title,
            empresa: job.employer_name,
            ubicacion: `${job.job_city || ciudad}, ${job.job_country || pais}`,
            modalidad: job.job_is_remote ? 'Remoto' : (job.job_employment_type === 'HYBRID' ? 'Híbrido' : 'Presencial'),
            salario_estimado: this._formatearSalarioJSearch(job),
            url_aplicacion: job.job_apply_link,
            descripcion_corta: (job.job_description || '').slice(0, 200),
            fecha_publicacion: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString('es-ES') : null,
            fuente: 'JSearch',
        }));
    }

    async _buscarAdzuna({ titulo, ciudad, pais, limite }) {
        if (!this.adzunaAppId || !this.adzunaAppKey) return [];

        const paisCodigo = pais?.toLowerCase().includes('ecuador') ? 'ec' : 'co';
        const query = encodeURIComponent(titulo);
        const ubicacion = encodeURIComponent(ciudad || '');

        const { data } = await axios.get(
            `https://api.adzuna.com/v1/api/jobs/${paisCodigo}/search/1`,
            {
                params: {
                    app_id: this.adzunaAppId,
                    app_key: this.adzunaAppKey,
                    results_per_page: limite,
                    what: query,
                    where: ubicacion,
                    sort_by: 'date',
                },
                timeout: 8000,
            }
        );

        return (data.results || []).slice(0, limite).map(job => ({
            titulo: job.title,
            empresa: job.company?.display_name || 'Empresa confidencial',
            ubicacion: job.location?.display_name || ciudad,
            modalidad: 'Presencial',
            salario_estimado: this._formatearSalarioAdzuna(job),
            url_aplicacion: job.redirect_url,
            descripcion_corta: (job.description || '').slice(0, 200),
            fecha_publicacion: job.created ? new Date(job.created).toLocaleDateString('es-ES') : null,
            fuente: 'Adzuna',
        }));
    }

    _formatearSalarioJSearch(job) {
        if (job.job_min_salary && job.job_max_salary) {
            const moneda = job.job_salary_currency || 'USD';
            return `${moneda} ${Math.round(job.job_min_salary)}–${Math.round(job.job_max_salary)}/mes`;
        }
        return 'No especificado';
    }

    _formatearSalarioAdzuna(job) {
        if (job.salary_min && job.salary_max) {
            return `USD ${Math.round(job.salary_min / 12)}–${Math.round(job.salary_max / 12)}/mes`;
        }
        return 'No especificado';
    }
}

module.exports = VacantesService;
