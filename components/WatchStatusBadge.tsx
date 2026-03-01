import { WatchStatus } from '@/lib/types';

export default function WatchStatusBadge({ status }: { status: WatchStatus }) {
    const styles: Record<WatchStatus, string> = {
        want_to_watch: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        watching: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        completed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        dropped: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const labels: Record<WatchStatus, string> = {
        want_to_watch: 'Quiero ver',
        watching: 'Viendo',
        completed: 'Visto',
        dropped: 'Abandonado',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
