'use client';

import { useState } from 'react';
import { WatchItem, WatchStatus, WatchType } from '@/lib/types';
import WatchCard from './WatchCard';

export default function WatchGrid({ initialItems }: { initialItems: WatchItem[] }) {
    const [items] = useState<WatchItem[]>(initialItems);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<WatchType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'score'>('date');

    const filteredItems = items
        .filter(i => statusFilter === 'all' || i.status === statusFilter)
        .filter(i => typeFilter === 'all' || i.type === typeFilter)
        .filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 mb-8 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Buscar por título..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as WatchType | 'all')}
                    className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 appearance-none min-w-[140px]"
                >
                    <option value="all">Películas y series</option>
                    <option value="movie">Películas</option>
                    <option value="series">Series</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as WatchStatus | 'all')}
                    className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 appearance-none min-w-[160px]"
                >
                    <option value="all">Todos los estados</option>
                    <option value="want_to_watch">Quiero ver</option>
                    <option value="watching">Viendo</option>
                    <option value="completed">Visto</option>
                    <option value="dropped">Abandonado</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'score')}
                    className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 appearance-none min-w-[160px]"
                >
                    <option value="date">Más recientes</option>
                    <option value="title">Alfabético</option>
                    <option value="score">Mejor puntuados</option>
                </select>
            </div>

            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <WatchCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1a1a2e]/50 rounded-2xl border border-white/5">
                    <div className="text-gray-500 mb-2">No se encontraron títulos</div>
                    {items.length === 0 && (
                        <p className="text-sm text-gray-400">Aún no has añadido películas ni series a tu lista.</p>
                    )}
                </div>
            )}
        </div>
    );
}
