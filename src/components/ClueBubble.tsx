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

interface ClueBubbleProps {
  weather: DailyWeather | null;
  facts: CityFactsClue | null;
  revealedCount: number; // how many clues are unlocked (1..totalClues)
  totalClues: number;
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

export default function ClueBubble({ weather, facts, revealedCount, totalClues, units }: ClueBubbleProps) {
  const clue = CLUE_ORDER[revealedCount - 1];
  if (!clue) return null;

  const value = clueValue(clue.key, weather, facts, units);
  const remaining = totalClues - revealedCount;

  return (
    <div className="wg-clue-bubble" key={clue.key}>
      <span className="wg-clue-bubble-tag">
        Clue {revealedCount} <span className="wg-clue-bubble-sep">|</span> {remaining} remaining
      </span>
      <div className="wg-clue-bubble-body">
        <span className="wg-clue-bubble-label">{clue.label}</span>
        <span className="wg-clue-bubble-value">{value ?? '…'}</span>
      </div>
    </div>
  );
}
