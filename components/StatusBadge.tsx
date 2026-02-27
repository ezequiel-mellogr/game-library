import { GameStatus } from '@/lib/types';

export default function StatusBadge({ status }: { status: GameStatus }) {
    const styles = {
        playing: 'bg-green-500/20 text-green-400 border-green-500/30',
        completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        pending: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        dropped: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const labels = {
        playing: 'Jugando',
        completed: 'Completado',
        pending: 'Pendiente',
        dropped: 'Abandonado',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
