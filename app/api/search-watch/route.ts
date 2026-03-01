import { NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export interface SearchWatchResult {
    id: string;
    tmdbId: number;
    title: string;
    type: 'movie' | 'series';
    year: number | null;
    description: string | null;
    image_url: string | null;
    original_url: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'TMDB_API_KEY no configurada. Crea una en themoviedb.org/settings/api' },
            { status: 500 }
        );
    }

    try {
        const [moviesRes, tvRes] = await Promise.all([
            fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=es-ES`),
            fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=es-ES`),
        ]);

        const [moviesData, tvData] = await Promise.all([
            moviesRes.json(),
            tvRes.json(),
        ]);

        const results: SearchWatchResult[] = [];

        (moviesData.results || []).slice(0, 5).forEach((m: { id: number; title?: string; overview?: string; poster_path?: string; release_date?: string }) => {
            const year = m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : null;
            results.push({
                id: `movie-${m.id}`,
                tmdbId: m.id,
                title: m.title || '',
                type: 'movie',
                year,
                description: m.overview || null,
                image_url: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
                original_url: `https://www.themoviedb.org/movie/${m.id}`,
            });
        });

        (tvData.results || []).slice(0, 5).forEach((t: { id: number; name?: string; overview?: string; poster_path?: string; first_air_date?: string }) => {
            const year = t.first_air_date ? parseInt(t.first_air_date.slice(0, 4), 10) : null;
            results.push({
                id: `tv-${t.id}`,
                tmdbId: t.id,
                title: t.name || '',
                type: 'series',
                year,
                description: t.overview || null,
                image_url: t.poster_path ? `${TMDB_IMAGE_BASE}${t.poster_path}` : null,
                original_url: `https://www.themoviedb.org/tv/${t.id}`,
            });
        });

        return NextResponse.json({ results });
    } catch (err) {
        console.error('TMDB search error:', err);
        return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
    }
}
