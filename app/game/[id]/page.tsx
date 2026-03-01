'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Game, GameStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import ImageCarousel from '@/components/ImageCarousel';

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [status, setStatus] = useState<GameStatus>('pending');
    const [score, setScore] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        const fetchGame = async () => {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setGame(data as Game);
                setStatus(data.status);
                setScore(data.score ? data.score.toString() : '');
                setNotes(data.notes || '');
            }
            setLoading(false);
        };

        fetchGame();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);

        const parsedScore = score === '' ? null : parseInt(score);

        const { error } = await supabase
            .from('games')
            .update({
                status,
                score: parsedScore,
                notes
            })
            .eq('id', id);

        setSaving(false);
        if (!error && game) {
            setGame({ ...game, status, score: parsedScore, notes });
            alert('Cambios guardados con éxito');
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar este juego de tu biblioteca?')) {
            await supabase.from('games').delete().eq('id', id);
            router.push('/');
            router.refresh();
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Cargando...</div>;
    }

    if (!game) {
        return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Juego no encontrado</div>;
    }

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <nav className="mb-8">
                    <Link href="/" className="text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors w-fit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a la biblioteca
                    </Link>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5">
                            {game.image_url ? (
                                <img src={game.image_url} alt={game.title} className="w-full aspect-[3/4] object-cover" />
                            ) : (
                                <div className="w-full aspect-[3/4] bg-white/5 flex items-center justify-center text-white/20">
                                    Sin imagen
                                </div>
                            )}
                        </div>

                        <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5 space-y-4">
                            <h3 className="font-bold text-gray-400 mb-2">Detalles</h3>
                            <p className="text-sm" suppressHydrationWarning><span className="text-gray-500">Añadido:</span> {formatDate(game.created_at)}</p>

                            {game.download_link && (
                                <a
                                    href={game.download_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Descargar de MediaFire
                                </a>
                            )}

                            <a
                                href={game.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
                            >
                                Ver página original
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Editing Form & Screenshots */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl font-extrabold">{game.title}</h1>
                                <StatusBadge status={game.status} />
                            </div>
                            <p className="text-gray-400 text-lg whitespace-pre-wrap">{game.description}</p>
                        </div>

                        {game.screenshots && game.screenshots.length > 0 && (
                            <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5">
                                <h2 className="text-xl font-bold mb-4">Capturas</h2>
                                <ImageCarousel images={game.screenshots} />
                            </div>
                        )}

                        <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-white/5 mt-8">
                            <h2 className="text-2xl font-bold mb-6">Tu Experiencia</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as GameStatus)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 appearance-none"
                                            title="Cambiar estado del juego"
                                        >
                                            <option value="playing">Jugando</option>
                                            <option value="completed">Completado</option>
                                            <option value="pending">Pendiente</option>
                                            <option value="dropped">Abandonado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Puntuación (1-10)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={score}
                                            onChange={(e) => setScore(e.target.value)}
                                            placeholder="Ej: 8"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Tus Notas / Reseña</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={6}
                                        placeholder="Escribe aquí tu opinión sobre el juego..."
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <button
                                        onClick={handleDelete}
                                        className="text-red-500 hover:text-red-400 font-medium px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                                    >
                                        Eliminar Juego
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
