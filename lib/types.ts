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
  created_at: string;
}

export type NewGame = Omit<Game, 'id' | 'created_at'>;
