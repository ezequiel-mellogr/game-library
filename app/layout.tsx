import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Game Library',
  description: 'Tu biblioteca de videojuegos, películas y series.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="border-b border-white/5 bg-[#0f0f0f]/95 backdrop-blur sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-6">
            <Link href="/" className="text-white font-semibold hover:text-purple-400 transition-colors">
              Juegos
            </Link>
            <Link href="/watch" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Películas y series
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
