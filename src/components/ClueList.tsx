import { CLUE_ORDER } from '../types';
import type { DailyWeather, UnitSystem } from '../types';
import {
  formatTemp,
  formatWind,
  formatPrecip,
  formatSnow,
  formatHumidity,
} from '../lib/units';

interface ClueListProps {
  weather: DailyWeather | null;
  revealedCount: number; // how many clues are unlocked (1..7)
  units: UnitSystem;
}

function clueValue(key: string, weather: DailyWeather, units: UnitSystem): string {
  switch (key) {
    case 'tempMax':
      return formatTemp(weather.tempMaxC, units);
    case 'tempMin':
      return formatTemp(weather.tempMinC, units);
    case 'rain':
      return formatPrecip(weather.rainMm, units);
    case 'humidity':
      return formatHumidity(weather.humidityPct);
    case 'wind':
      return formatWind(weather.windMaxKmh, units);
    case 'snow':
      return formatSnow(weather.snowCm, units);
    case 'dewPoint':
      return formatTemp(weather.dewPointC, units);
    default:
      return '';
  }
}

export default function ClueList({ weather, revealedCount, units }: ClueListProps) {
  return (
    <ul className="wg-clue-list">
      {CLUE_ORDER.map((clue, i) => {
        const revealed = i < revealedCount;
        return (
          <li key={clue.key} className={`wg-clue ${revealed ? 'revealed' : 'locked'}`}>
            <span className="wg-clue-label">{clue.label}</span>
            <span className="wg-clue-value">
              {revealed && weather ? clueValue(clue.key, weather, units) : '???'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
