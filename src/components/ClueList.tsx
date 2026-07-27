import { CLUE_ORDER } from '../types';
import type { CityFactsClue, DailyWeather, UnitSystem } from '../types';
import {
  formatTemp,
  formatWind,
  formatPrecip,
  formatSnow,
  formatHumidity,
  formatElevation,
  formatDistance,
  formatPopulation,
} from '../lib/units';

interface ClueListProps {
  weather: DailyWeather | null;
  facts: CityFactsClue | null;
  revealedCount: number; // how many clues are unlocked (1..CLUE_ORDER.length)
  units: UnitSystem;
}

function clueValue(
  key: string,
  weather: DailyWeather | null,
  facts: CityFactsClue | null,
  units: UnitSystem,
): string | null {
  switch (key) {
    case 'tempMax':
      return weather ? formatTemp(weather.tempMaxC, units) : null;
    case 'tempMin':
      return weather ? formatTemp(weather.tempMinC, units) : null;
    case 'rain':
      return weather ? formatPrecip(weather.rainMm, units) : null;
    case 'humidity':
      return weather ? formatHumidity(weather.humidityPct) : null;
    case 'wind':
      return weather ? formatWind(weather.windMaxKmh, units) : null;
    case 'snow':
      return weather ? formatSnow(weather.snowCm, units) : null;
    case 'dewPoint':
      return weather ? formatTemp(weather.dewPointC, units) : null;
    case 'elevation':
      return facts ? formatElevation(facts.elevationM, units) : null;
    case 'distanceToCoast':
      return facts ? formatDistance(facts.distanceToCoastKm, units) : null;
    case 'population':
      return facts ? formatPopulation(facts.populationApprox) : null;
    default:
      return null;
  }
}

export default function ClueList({ weather, facts, revealedCount, units }: ClueListProps) {
  return (
    <ul className="wg-clue-list">
      {CLUE_ORDER.map((clue, i) => {
        const revealed = i < revealedCount;
        if (!revealed) {
          return (
            <li key={clue.key} className="wg-clue locked">
              <span className="wg-clue-label wg-clue-locked-label">
                <span className="wg-lock-icon" aria-hidden="true">
                  🔒
                </span>
                Hint {i + 1}
              </span>
              <span className="wg-clue-value">Unlocks after guess {i}</span>
            </li>
          );
        }
        const value = clueValue(clue.key, weather, facts, units);
        return (
          <li key={clue.key} className="wg-clue revealed">
            <span className="wg-clue-label">{clue.label}</span>
            <span className="wg-clue-value">{value ?? '…'}</span>
          </li>
        );
      })}
    </ul>
  );
}
