export interface GamePlatform {
  platform: {
    id?: number;
    name: string;
    slug: string;
  };
}

export interface Genre {
  id?: number;
  name: string;
  slug?: string;
}

export interface Game {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  metacritic: number | null;
  platforms: GamePlatform[] | null;
  genres: Genre[];
  tba: boolean;
}

export interface RAWGResponse {
  count: number;
  next: string | null;
  results: Game[];
}
