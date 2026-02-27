import { supabase } from '@/lib/supabase';
import { Game } from '@/lib/types';
import GameGrid from '@/components/GameGrid';
import Link from 'next/link';

export const revalidate = 0; // Disable static rendering for this page to always fetch fresh data

export default async function Home() {
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching games:', error);
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600 mb-2">
              Game Library
            </h1>
            <p className="text-gray-400">Tu colección personal de videojuegos</p>
          </div>
          <Link
            href="/add"
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:-translate-y-1 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir Juego
          </Link>
        </header>

        <GameGrid initialGames={(games as Game[]) || []} />
      </div>
    </main>
  );
}
