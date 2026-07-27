export type UnitSystem = 'metric' | 'imperial';

export interface DailyWeather {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  rainMm: number;
  snowCm: number;
  windMaxKmh: number;
  humidityPct: number;
  dewPointC: number;
}

export type ClueKey =
  | 'tempMax'
  | 'tempMin'
  | 'rain'
  | 'humidity'
  | 'wind'
  | 'snow'
  | 'dewPoint';

export interface QuizOption {
  value: number;
}

export interface QuizQuestion {
  clueKey: ClueKey;
  options: QuizOption[]; // always length 3
  correctIndex: number;
}

export interface CityRound {
  cityId: string;
  questions: QuizQuestion[]; // always length CLUES_PER_CITY
}

export type GameMode = 'daily' | 'practice';

export type GamePhase = 'loading' | 'error' | 'playing' | 'cityTransition' | 'finished';
