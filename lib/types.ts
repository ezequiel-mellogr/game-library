export type GameStatus = 'playing' | 'completed' | 'pending' | 'dropped';

export interface Game {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    original_url: string;
    status: GameStatus;
    score: number | null;
    notes: string | null;
    screenshots: string[] | null;
    download_link: string | null;
    created_at: string;
}

export type NewGame = Omit<Game, 'id' | 'created_at'>;

// Películas y series
export type WatchType = 'movie' | 'series';
export type WatchStatus = 'want_to_watch' | 'watching' | 'completed' | 'dropped';

export interface WatchItem {
    id: string;
    title: string;
    type: WatchType;
    description: string | null;
    image_url: string | null;
    original_url: string | null;
    status: WatchStatus;
    score: number | null;
    notes: string | null;
    year: number | null;
    created_at: string;
}

export type NewWatchItem = Omit<WatchItem, 'id' | 'created_at'>;
