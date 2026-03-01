'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewWatchItem, WatchType, WatchStatus } from '@/lib/types';

type SearchResult = {
    id: string;
    title: string;
    type: 'movie' | 'series';
    year: number | null;
    description: string | null;
    image_url: string | null;
    original_url: string;
};

export default function AddWatchForm() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<WatchType>('movie');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [year, setYear] = useState('');
    const [status, setStatus] = useState<WatchStatus>('want_to_watch');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q.length < 2) return;
        setSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(`/api/search-watch?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (res.ok && data.results) setSearchResults(data.results);
            else if (!res.ok && data.error) setError(data.error);
        } catch {
            setError('Error al buscar');
        } finally {
            setSearching(false);
        }
    };

    const selectResult = (r: SearchResult) => {
        setTitle(r.title);
        setType(r.type);
        setDescription(r.description || '');
        setImageUrl(r.image_url || '');
        setOriginalUrl(r.original_url || '');
        setYear(r.year ? String(r.year) : '');
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError('');

        try {
            const yearNum = year.trim() ? parseInt(year, 10) : null;
            const body: NewWatchItem = {
                title: title.trim(),
                type,
                description: description.trim() || null,
                image_url: imageUrl.trim() || null,
                original_url: originalUrl.trim() || null,
                status,
                score: null,
                notes: null,
                year: yearNum !== null && !isNaN(yearNum) ? yearNum : null,
            };

            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            let data: { error?: string } = {};
            try {
                data = await res.json();
            } catch {
                setError('Error de conexión. ¿Creaste la tabla watchlist en Supabase? Ejecuta el archivo supabase-watchlist.sql');
                return;
            }

            if (!res.ok) {
                const msg = data.error || 'Error al guardar';
                setError(msg);
                return;
            }

            router.push('/watch');
            router.refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error al guardar';
            setError(msg);
            console.error('Error añadiendo a la lista:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-[#1a1a2e] border border-white/5 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Añadir película o serie</h2>

            {/* Búsqueda por nombre */}
            <div className="mb-8 p-4 bg-black/20 rounded-xl border border-cyan-500/20">
                <p className="text-sm text-cyan-300/90 mb-3">Busca por nombre y elige un resultado para rellenar los datos automáticamente:</p>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej: Dune, Breaking Bad"
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                        type="submit"
                        disabled={searching || searchQuery.trim().length < 2}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 rounded-xl font-medium disabled:opacity-50 whitespace-nowrap"
                    >
                        {searching ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>
                {searchResults.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {searchResults.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => selectResult(r)}
                                className="text-left rounded-lg overflow-hidden border border-white/10 hover:border-cyan-500/50 bg-black/30 transition-colors"
                            >
                                {r.image_url ? (
                                    <img src={r.image_url} alt="" className="w-full aspect-[2/3] object-cover" />
                                ) : (
                                    <div className="w-full aspect-[2/3] bg-white/5 flex items-center justify-center text-white/30 text-xs">Sin imagen</div>
                                )}
                                <div className="p-2">
                                    <p className="text-white text-sm font-medium truncate">{r.title}</p>
                                    <p className="text-gray-500 text-xs">{r.type === 'movie' ? 'Película' : 'Serie'}{r.year ? ` · ${r.year}` : ''}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Título *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Dune, Breaking Bad"
                        required
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as WatchType)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                        >
                            <option value="movie">Película</option>
                            <option value="series">Serie</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as WatchStatus)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500"
                        >
                            <option value="want_to_watch">Quiero verla</option>
                            <option value="watching">Viendo</option>
                            <option value="completed">Vista</option>
                            <option value="dropped">Abandonada</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Año (opcional)</label>
                    <input
                        type="number"
                        min="1900"
                        max="2030"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Ej: 2024"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Descripción (opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Breve sinopsis..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">URL de la imagen (opcional)</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Enlace (opcional)</label>
                    <input
                        type="text"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        placeholder="IMDb, Filmaffinity, etc."
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/watch')}
                        className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Añadir a mi lista'}
                    </button>
                </div>
            </form>
        </div>
    );
}
