const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// Bearing from point 1 to point 2, in degrees (0 = north, 90 = east).
export function bearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export function compassDirection(deg: number): string {
  const index = Math.round(deg / 22.5) % 16;
  return COMPASS[index];
}

// A sparse global sampling of ocean/sea coastlines (including seas that
// connect to the open ocean, e.g. the Mediterranean, Baltic and Persian
// Gulf, plus the Caspian Sea which is colloquially "coastline" too) used to
// approximate each city's distance to the nearest coast without needing a
// full geographic dataset.
const COASTLINE_POINTS: [number, number][] = [
  // North America - Pacific & Arctic
  [71.3, -156.8], [70.0, -143.6], [61.2, -149.9], [58.3, -134.4], [49.3, -123.1],
  [47.6, -122.3], [46.2, -123.8], [37.8, -122.4], [34.0, -118.5], [32.7, -117.2],
  [23.1, -109.7], [20.6, -105.3], [16.8, -99.9], [15.8, -96.1],
  // North America - Gulf & Atlantic
  [29.3, -94.8], [30.4, -87.2], [25.8, -80.2], [21.2, -86.8], [32.1, -81.1],
  [36.9, -76.0], [40.7, -74.0], [42.3, -71.0], [44.8, -68.8], [47.6, -52.7],
  [63.7, -68.5], [77.5, -69.2],
  // Caribbean & Central America
  [23.1, -82.4], [18.5, -66.1], [17.9, -76.8], [10.0, -83.0], [9.36, -79.9],
  // South America
  [10.5, -66.9], [6.8, -58.2], [5.8, -55.2], [-1.5, -48.5], [-8.1, -34.9],
  [-13.0, -38.5], [-22.9, -43.2], [-23.9, -46.3], [-27.6, -48.5], [-34.6, -58.4],
  [-38.0, -57.5], [-45.9, -67.5], [-51.6, -69.2], [-54.8, -68.3], [-53.2, -70.9],
  [-41.5, -72.9], [-33.0, -71.6], [-23.6, -70.4], [-18.5, -70.3], [-12.0, -77.1],
  [-8.1, -79.0], [-2.2, -80.9], [3.4, -76.5],
  // Europe - Atlantic & North Sea
  [60.4, 5.3], [59.9, 10.7], [55.7, 12.6], [53.5, 10.0], [51.9, 4.5],
  [51.5, -0.1], [50.7, -1.9], [53.4, -3.0], [55.9, -4.3], [53.3, -6.2],
  [48.4, -4.5], [43.3, 5.4], [38.1, 13.4], [36.7, -4.4], [38.7, -9.1],
  [41.1, -8.6], [35.8, -5.8],
  // Baltic & Arctic Europe
  [59.3, 18.1], [60.2, 24.9], [59.4, 24.8], [56.9, 24.1], [54.7, 20.5],
  [69.6, 19.0], [78.2, 15.6],
  // Mediterranean, Adriatic & Black Sea
  [41.9, 12.4], [45.4, 12.3], [37.9, 23.7], [41.0, 29.0], [44.8, 33.5],
  [43.6, 39.7], [42.5, 27.5], [44.1, 15.2], [45.8, 13.6],
  // Africa - Atlantic
  [21.0, -17.0], [14.7, -17.5], [6.3, -10.8], [5.3, -4.0], [6.5, 3.4],
  [4.0, 9.7], [-4.3, 11.5], [-8.8, 13.2], [-22.9, 14.5], [-33.9, 18.4],
  // Africa - Mediterranean, Red Sea & Indian Ocean
  [31.2, 32.3], [27.2, 33.8], [15.6, 39.4], [11.6, 43.1], [2.0, 45.3],
  [-4.0, 39.7], [-6.8, 39.3], [-18.15, 49.4], [-25.9, 32.6], [-29.9, 31.0],
  // Middle East
  [29.4, 48.5], [26.2, 50.6], [25.3, 51.5], [24.5, 54.4], [25.2, 55.3],
  [23.6, 58.6], [21.5, 39.2], [12.8, 45.0], [32.1, 34.8], [33.9, 35.5],
  // Caspian Sea
  [40.0, 50.5], [38.0, 49.0],
  // South Asia
  [24.8, 67.0], [19.1, 72.9], [9.9, 76.2], [13.1, 80.3], [22.6, 88.4],
  [6.9, 79.9], [4.2, 73.5], [22.3, 91.8],
  // Southeast Asia
  [16.8, 96.2], [13.5, 100.6], [20.9, 106.7], [10.8, 106.7], [1.3, 103.8],
  [3.1, 101.4], [-6.1, 106.8], [-8.7, 115.2], [14.6, 121.0], [10.3, 123.9],
  [22.3, 114.2], [25.1, 121.7],
  // East Asia
  [39.0, 117.7], [31.2, 121.5], [23.1, 113.3], [22.5, 114.1], [29.9, 121.6],
  [38.9, 121.6], [35.7, 139.8], [34.7, 135.4], [43.2, 141.3], [33.6, 130.4],
  [37.45, 126.6], [35.1, 129.1], [43.1, 131.9], [59.6, 150.8], [64.7, 177.5],
  [73.5, 80.5],
  // Australia & New Zealand
  [-33.9, 151.2], [-37.8, 144.9], [-27.5, 153.0], [-32.0, 115.7], [-34.9, 138.5],
  [-12.4, 130.8], [-42.9, 147.3], [-16.9, 145.8], [-20.3, 118.6],
  [-36.8, 174.8], [-41.3, 174.8], [-43.6, 172.7], [-45.9, 170.5],
  // Pacific Islands
  [-18.1, 178.4], [-17.5, -149.6], [-9.4, 147.2], [-22.3, 166.5],
  [21.3, -157.9], [13.5, 144.8],
];

// Approximate straight-line distance to the nearest ocean/sea coastline,
// using a sparse global reference set rather than a full coastline dataset.
export function distanceToCoastKm(lat: number, lon: number): number {
  let min = Infinity;
  for (const [clat, clon] of COASTLINE_POINTS) {
    const d = haversineDistanceKm(lat, lon, clat, clon);
    if (d < min) min = d;
  }
  return min;
}

const GUESS_COLOR_MAX_DISTANCE_KM = 8000;

// Interpolates a red (far) -> green (close/correct) color for a guess based
// on its distance from the target, used for map pins and guess history.
export function distanceToColor(distanceKm: number, winDistanceKm: number): string {
  if (distanceKm <= winDistanceKm) return 'hsl(122, 55%, 40%)';
  const t = Math.min(
    1,
    (distanceKm - winDistanceKm) / (GUESS_COLOR_MAX_DISTANCE_KM - winDistanceKm),
  );
  const hue = 122 * (1 - t);
  return `hsl(${hue.toFixed(0)}, 70%, 45%)`;
}
