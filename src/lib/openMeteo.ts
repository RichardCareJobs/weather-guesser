import type { City } from '../data/cities';
import type { DailyWeather } from '../types';

const DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'rain_sum',
  'snowfall_sum',
  'windspeed_10m_max',
  'relative_humidity_2m_mean',
  'dew_point_2m_mean',
].join(',');

// Uses the standard forecast endpoint (not the archive/reanalysis endpoint)
// because the archive endpoint lags several days behind real time. With
// past_days=1, forecast_days=1 and timezone=auto, Open-Meteo returns exactly
// [yesterday, today] in the city's own local calendar, which is what we want
// for "yesterday's weather" regardless of where in the world the city is.
export async function fetchPreviousDayWeather(city: City): Promise<DailyWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', city.lat.toString());
  url.searchParams.set('longitude', city.lon.toString());
  url.searchParams.set('past_days', '1');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('daily', DAILY_FIELDS);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = await res.json();
  const daily = data.daily;
  if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
    throw new Error('Open-Meteo response missing daily data');
  }

  return {
    date: daily.time[0],
    tempMaxC: daily.temperature_2m_max[0],
    tempMinC: daily.temperature_2m_min[0],
    rainMm: daily.rain_sum[0] ?? 0,
    snowCm: daily.snowfall_sum[0] ?? 0,
    windMaxKmh: daily.windspeed_10m_max[0],
    humidityPct: daily.relative_humidity_2m_mean[0],
    dewPointC: daily.dew_point_2m_mean[0],
  };
}
