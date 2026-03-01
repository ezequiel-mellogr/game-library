'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { WatchItem, WatchStatus, WatchType } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import WatchStatusBadge from '@/components/WatchStatusBadge';

export default function WatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [item, setItem] = useState<WatchItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [status, setStatus] = useState<WatchStatus>('want_to_watch');
    const [score, setScore] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        const fetchItem = async () => {
            const { data, error } = await supabase
                .from('watchlist')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setItem(data as WatchItem);
                setStatus(data.status);
                setScore(data.score ? data.score.toString() : '');
                setNotes(data.notes || '');
            }
            setLoading(false);
        };

        fetchItem();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        const parsedScore = score === '' ? null : Math.min(10, Math.max(1, parseInt(score, 10)));

        const { error } = await supabase
            .from('watchlist')
            .update({ status, score: parsedScore, notes })
            .eq('id', id);

        setSaving(false);
        if (!error && item) {
            setItem({ ...item, status, score: parsedScore, notes });
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (confirm('¿Eliminar esta película/serie de tu lista?')) {
            await supabase.from('watchlist').delete().eq('id', id);
            router.push('/watch');
            router.refresh();
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Cargando...</div>;
    }

    if (!item) {
        return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">No encontrado</div>;
    }

    const typeLabel = item.type === 'movie' ? 'Película' : 'Serie';

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <nav className="mb-8">
                    <Link href="/watch" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors w-fit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a películas y series
                    </Link>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-white/5 flex items-center justify-center text-white/20">
                                    Sin imagen
                                </div>
                            )}
                        </div>

                        <div className="bg-[#1a1a2e] p-6 rounded-2xl border border-white/5 space-y-4">
                            <h3 className="font-bold text-gray-400 mb-2">Detalles</h3>
                            <p className="text-sm"><span className="text-gray-500">Tipo:</span> {typeLabel}</p>
                            {item.year && <p className="text-sm"><span className="text-gray-500">Año:</span> {item.year}</p>}
                            <p className="text-sm"><span className="text-gray-500">Añadido:</span> {formatDate(item.created_at)}</p>
                            {item.original_url && (
                                <a
                                    href={item.original_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-cyan-400"
                                >
                                    Ver enlace
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-4xl font-extrabold">{item.title}</h1>
                                <WatchStatusBadge status={item.status} />
                                <span className="text-sm text-gray-500">{typeLabel}</span>
                            </div>
                            {item.description && (
                                <p className="text-gray-400 text-lg whitespace-pre-wrap">{item.description}</p>
                            )}
                        </div>

                        <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-white/5">
                            <h2 className="text-2xl font-bold mb-6">Tu experiencia</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Puntuación (1-10)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={score}
                                            onChange={(e) => setScore(e.target.value)}
                                            placeholder="Ej: 8"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Notas</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={5}
                                        placeholder="Tu opinión..."
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <button
                                        onClick={handleDelete}
                                        className="text-red-500 hover:text-red-400 font-medium px-4 py-2 rounded-xl hover:bg-red-500/10"
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar'}
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
