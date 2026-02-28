'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewGame, GameStatus } from '@/lib/types';

export default function AddGameForm() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<NewGame | null>(null);

    const fetchMetadata = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/fetch-game?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error fetching metadata');

            setPreview({
                title: data.title,
                description: data.description,
                image_url: data.image_url,
                original_url: data.original_url,
                status: 'pending',
                score: null,
                notes: null,
                screenshots: data.screenshots || [],
                download_link: data.download_link || null
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveGame = async () => {
        if (!preview) return;

        setLoading(true);

        try {
            const res = await fetch('/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preview),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save the game');
            }

            router.push('/');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-[#1a1a2e] border border-white/5 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Añadir Juego</h2>

            <form onSubmit={fetchMetadata} className="mb-8 flex gap-3">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://store.steampowered.com/app/..."
                    required
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || !url}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading && !preview ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Buscar'}
                </button>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {preview && (
                <div className="animate-fade-in border-t border-white/10 pt-6">
                    <h3 className="text-lg font-medium text-gray-300 mb-4">Vista Previa:</h3>

                    <div className="bg-black/30 rounded-xl p-4 flex gap-6 mb-6">
                        {preview.image_url ? (
                            <img
                                src={preview.image_url}
                                alt={preview.title}
                                className="w-32 h-32 object-cover rounded-lg shadow-md"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-white/5 rounded-lg flex items-center justify-center text-white/20">
                                Sin imagen
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-bold text-white mb-2 truncate">{preview.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-3 mb-2">
                                {preview.description || 'Sin descripción.'}
                            </p>
                            <a href={preview.original_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline">
                                Ver URL original
                            </a>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Estado Incial</label>
                        <select
                            value={preview.status}
                            onChange={(e) => setPreview({ ...preview, status: e.target.value as GameStatus })}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 appearance-none"
                        >
                            <option value="pending">Pendiente (Quiero jugarlo)</option>
                            <option value="playing">Jugando actualmente</option>
                            <option value="completed">Completado</option>
                            <option value="dropped">Abandonado</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Enlace de Descarga (Opcional)</label>
                        <input
                            type="url"
                            value={preview.download_link || ''}
                            onChange={(e) => setPreview({ ...preview, download_link: e.target.value })}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="https://www.mediafire.com/file/..."
                        />
                    </div>

                    {preview.screenshots && preview.screenshots.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Capturas extraídas ({preview.screenshots.length})</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {preview.screenshots.map((src, i) => (
                                    <img key={i} src={src} alt={`Screenshot ${i}`} className="h-20 w-32 object-cover rounded shadow-md border border-white/10 shrink-0" />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setPreview(null)}
                            className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={saveGame}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Guardando...' : 'Guardar en mi Biblioteca'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
