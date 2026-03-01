import { supabase } from '@/lib/supabase';
import { WatchItem } from '@/lib/types';
import WatchGrid from '@/components/WatchGrid';
import Link from 'next/link';

export const revalidate = 0;

export default async function WatchPage() {
    const { data: items, error } = await supabase
        .from('watchlist')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching watchlist:', error);
    }

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600 mb-2">
                            Películas y Series
                        </h1>
                        <p className="text-gray-400">Lo que quieres ver o ya viste</p>
                    </div>
                    <Link
                        href="/watch/add"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:-translate-y-1 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Añadir película o serie
                    </Link>
                </header>

                <WatchGrid initialItems={(items as WatchItem[]) || []} />
            </div>
        </main>
    );
}
