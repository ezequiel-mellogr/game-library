import Link from 'next/link';
import { WatchItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import WatchStatusBadge from './WatchStatusBadge';

export default function WatchCard({ item }: { item: WatchItem }) {
    const typeLabel = item.type === 'movie' ? 'Película' : 'Serie';

    return (
        <Link href={`/watch/${item.id}`} className="group block h-full">
            <div className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col h-full">
                <div className="relative aspect-[2/3] w-full bg-black/50 overflow-hidden">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full text-white/20 gap-2">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            <span className="text-xs">{typeLabel}</span>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white/80">
                            {typeLabel}
                        </span>
                        <WatchStatusBadge status={item.status} />
                    </div>

                    {item.score && (
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-cyan-400 border border-cyan-500/20">
                            ★ {item.score}/10
                        </div>
                    )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {item.title}
                    </h3>
                    {item.year && (
                        <p className="text-xs text-gray-500 mb-2">{item.year}</p>
                    )}
                    <div className="text-gray-400 text-sm line-clamp-2 flex-grow mb-4 whitespace-pre-wrap">
                        {item.description || 'Sin descripción.'}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                        </span>
                        {item.original_url && (
                            <span
                                className="text-cyan-500 hover:text-cyan-400 text-xs flex items-center gap-1 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(item.original_url!, '_blank');
                                }}
                            >
                                Ver enlace
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
