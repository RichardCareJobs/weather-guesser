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
  | 'dewPoint'
  | 'elevation'
  | 'distanceToCoast'
  | 'population';

export interface ClueDef {
  key: ClueKey;
  label: string;
}

export const CLUE_ORDER: ClueDef[] = [
  { key: 'tempMax', label: "Yesterday's high" },
  { key: 'tempMin', label: "Yesterday's low" },
  { key: 'rain', label: 'Rainfall' },
  { key: 'humidity', label: 'Average humidity' },
  { key: 'wind', label: 'Peak wind speed' },
  { key: 'snow', label: 'Snowfall' },
  { key: 'dewPoint', label: 'Average dew point' },
  { key: 'elevation', label: 'Elevation' },
  { key: 'distanceToCoast', label: 'Distance to coastline' },
  { key: 'population', label: 'Population' },
];

export interface CityFactsClue {
  elevationM: number;
  distanceToCoastKm: number;
  populationApprox: number;
}

export interface Guess {
  lat: number;
  lon: number;
  distanceKm: number;
  bearingDeg: number;
  correct: boolean;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export type GameMode = 'daily' | 'practice';
