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

export interface Developer {
  id: number;
  name: string;
  slug: string;
}

export interface Screenshot {
  id: number;
  image: string;
}

export interface Movie {
  id: number;
  name: string;
  preview: string;
  youtube_id?: string; // IGDB videos are YouTube IDs
  data: {
    max: string;
    "480": string;
  };
}

export interface Game {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  background_image_additional?: string | null;
  rating: number;
  metacritic: number | null;
  platforms: GamePlatform[] | null;
  genres: Genre[];
  tba: boolean;
  added?: number;
  // Detail fields
  description_raw?: string;
  developers?: Developer[];
  publishers?: Developer[];
  website?: string;
  playtime?: number;
  ratings_count?: number;
  esrb_rating?: { name: string } | null;
  screenshots?: Screenshot[];
  movies?: Movie[];
}

export interface RAWGResponse {
  count: number;
  next: string | null;
  results: Game[];
}
