import Link from 'next/link';
import { Game } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import StatusBadge from './StatusBadge';

export default function GameListItem({ game }: { game: Game }) {
    return (
        <Link href={`/game/${game.id}`} className="group block">
            <div className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] flex items-center p-4 gap-6">
                {/* Thumbnail */}
                <div className="relative w-24 h-24 flex-shrink-0 bg-black/50 rounded-lg overflow-hidden">
                    {game.image_url ? (
                        <img
                            src={game.image_url}
                            alt={game.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full text-white/10">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                            {game.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-1">
                            {game.description || 'Sin descripción disponible.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <StatusBadge status={game.status} />
                        {game.score && (
                            <span className="text-sm font-bold text-yellow-500 whitespace-nowrap">
                                ★ {game.score}/10
                            </span>
                        )}
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                            Añadido
                        </span>
                        <span className="text-sm text-gray-400" suppressHydrationWarning>
                            {formatDate(game.created_at)}
                        </span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="text-white/10 group-hover:text-purple-500 transition-colors hidden sm:block">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
