import AddGameForm from '@/components/AddGameForm';
import Link from 'next/link';

export default function AddPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-8">
                    <Link href="/" className="text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors w-fit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a la biblioteca
                    </Link>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-4">Añadir Nuevo Juego</h1>
                    <p className="text-gray-400">Pega la URL de la página del juego (Steam, Metacritic, GOG, etc.) y extraeremos los datos automáticamente.</p>
                </div>

                <AddGameForm />
            </div>
        </main>
    );
}
