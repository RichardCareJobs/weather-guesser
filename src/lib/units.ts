import type { UnitSystem } from '../types';

export function formatTemp(celsius: number, units: UnitSystem): string {
  if (units === 'imperial') {
    return `${Math.round(celsius * (9 / 5) + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWind(kmh: number, units: UnitSystem): string {
  if (units === 'imperial') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatPrecip(mm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const inches = mm / 25.4;
    return `${inches < 0.1 && inches > 0 ? inches.toFixed(2) : inches.toFixed(1)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatSnow(cm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const inches = cm / 2.54;
    return `${inches < 0.1 && inches > 0 ? inches.toFixed(2) : inches.toFixed(1)} in`;
  }
  return `${cm.toFixed(1)} cm`;
}

export function formatHumidity(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function formatDistance(km: number, units: UnitSystem): string {
  if (units === 'imperial') {
    return `${Math.round(km * 0.621371).toLocaleString()} mi`;
  }
  return `${Math.round(km).toLocaleString()} km`;
}

export function formatElevation(meters: number, units: UnitSystem): string {
  if (units === 'imperial') {
    return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
  }
  return `${Math.round(meters).toLocaleString()} m`;
}

export function formatPopulation(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1)}M`;
  }
  if (count >= 1000) {
    return `${Math.round(count / 1000).toLocaleString()}K`;
  }
  return count.toLocaleString();
}
