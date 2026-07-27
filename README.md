# Weather Guesser

A free, no-backend geo-guessing game: you get yesterday's max temperature for
a mystery city, drop a pin on the map to guess where it is, and each wrong
guess reveals another weather clue (low temp, rainfall, humidity, peak wind
speed, snowfall, dew point).

Built entirely on free services with no API keys and no server:

- **Map & tiles:** [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/copyright)
- **Weather data:** [Open-Meteo](https://open-meteo.com/) forecast API (free, no key, CORS-enabled)
- **Hosting:** static files only — works on GitHub Pages, Netlify, Vercel, etc.

## How it works

- Every calendar day has a **Daily** puzzle: the same mystery city for every
  player that day, picked deterministically from the date (like Wordle).
  There's also unlimited **Practice** mode with a random city each round.
- The app fetches yesterday's weather (in the mystery city's own local time)
  straight from Open-Meteo in the browser — no server involved.
- You get 7 guesses total, matching the 7 clues (max temp is shown upfront,
  then one more clue unlocks after each wrong guess).
- A guess counts as correct if your pin lands within 40 km of the real city.
  Wrong guesses show the distance and compass direction to the answer.
- Settings let you switch between Metric (°C, km/h, mm, km) and Imperial
  (°F, mph, in, mi); the choice is remembered in your browser.
- Basic streak/win stats for the daily puzzle are stored in `localStorage`
  (nothing leaves your browser).

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL. No environment variables or API keys are
needed.

## Building

```bash
npm run build   # type-checks and builds to dist/
npm run preview # serve the production build locally
```

## Deploying for free

The build output in `dist/` is a static site, so any static host works. For
GitHub Pages:

1. In the repo's Settings → Pages, set the source to "GitHub Actions".
2. Push to `main` — the included workflow at
   `.github/workflows/deploy.yml` builds the app and publishes `dist/` to
   Pages automatically.

`vite.config.ts` uses `base: './'` (relative asset paths), so the build also
works unmodified on Netlify, Vercel, Cloudflare Pages, or any static bucket —
no path configuration needed.

## Adding cities

Mystery cities live in `src/data/cities.ts` as a simple
`{ id, name, country, lat, lon }` list. Add or remove entries there to change
the pool of possible answers.

## Notes on the weather API

Yesterday's data comes from Open-Meteo's regular `forecast` endpoint (not the
`archive` endpoint) using `past_days=1` with `timezone=auto`, which returns
data for the city's own local "yesterday" rather than a fixed UTC day. The
archive/reanalysis endpoint was deliberately avoided because it lags several
days behind real time and wouldn't reliably have yesterday's data yet.
