import AddWatchForm from '@/components/AddWatchForm';
import Link from 'next/link';

export default function WatchAddPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-8">
                    <Link href="/watch" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors w-fit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a películas y series
                    </Link>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-4">Añadir película o serie</h1>
                    <p className="text-gray-400">Rellena los datos. Puedes pegar después una URL de la imagen si la tienes.</p>
                </div>

                <AddWatchForm />
            </div>
        </main>
    );
}
