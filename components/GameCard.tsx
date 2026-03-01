import Link from 'next/link';
import { Game } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import StatusBadge from './StatusBadge';

export default function GameCard({ game }: { game: Game }) {
    return (
        <Link href={`/game/${game.id}`} className="group block h-full">
            <div className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] flex flex-col h-full">
                {/* Image Container */}
                <div className="relative aspect-[16/9] w-full bg-black/50 overflow-hidden">
                    {game.image_url ? (
                        <img
                            src={game.image_url}
                            alt={game.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full text-white/20">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    <div className="absolute top-3 right-3">
                        <StatusBadge status={game.status} />
                    </div>

                    {game.score && (
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-yellow-500 border border-yellow-500/20">
                            ★ {game.score}/10
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {game.title}
                    </h3>
                    <div className="text-gray-400 text-sm line-clamp-2 flex-grow mb-4 whitespace-pre-wrap">
                        {game.description || 'Sin descripción disponible.'}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                            <span className="text-xs text-gray-500" suppressHydrationWarning>
                                {formatDate(game.created_at)}
                            </span>
                            {game.screenshots && game.screenshots.length > 0 && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase font-bold tracking-wider">
                                    + Galería
                                </span>
                            )}
                        </div>
                        <div
                            className="text-purple-500 hover:text-purple-400 text-xs flex items-center gap-1"
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(game.original_url, '_blank');
                            }}
                        >
                            Ver original
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
