import { useEffect, useMemo, useRef, useState } from 'react';
import type { City } from './data/cities';
import type { DailyWeather, GameMode, GameStatus, Guess, UnitSystem } from './types';
import { CLUE_ORDER } from './types';
import { CITIES } from './data/cities';
import { cityForDate, randomCity, todayKey } from './lib/dailyPuzzle';
import { fetchPreviousDayWeather } from './lib/openMeteo';
import { haversineDistanceKm, bearingDeg } from './lib/geo';
import {
  loadSettings,
  saveSettings,
  loadStats,
  recordResult,
  loadDailyState,
  saveDailyState,
  type Stats,
} from './lib/storage';
import Header from './components/Header';
import MapView from './components/MapView';
import ClueList from './components/ClueList';
import GuessHistory from './components/GuessHistory';
import ResultModal from './components/ResultModal';

const MAX_GUESSES = CLUE_ORDER.length; // 7
const WIN_DISTANCE_KM = 40;

function cityById(id: string): City {
  const city = CITIES.find((c) => c.id === id);
  if (!city) throw new Error(`Unknown city id: ${id}`);
  return city;
}

export default function App() {
  const [mode, setMode] = useState<GameMode>('daily');
  const [units, setUnits] = useState<UnitSystem>(() => loadSettings().units);
  const [stats, setStats] = useState<Stats>(() => loadStats());

  const [city, setCity] = useState<City>(() => cityForDate(todayKey()));
  const [weather, setWeather] = useState<DailyWeather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [pendingPin, setPendingPin] = useState<{ lat: number; lon: number } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const dateKeyRef = useRef(todayKey());

  // Initialize (or restore) a game whenever the mode changes.
  useEffect(() => {
    if (mode === 'daily') {
      const dateKey = todayKey();
      dateKeyRef.current = dateKey;
      const saved = loadDailyState();
      if (saved && saved.dateKey === dateKey) {
        setCity(cityById(saved.cityId));
        setGuesses(saved.guesses);
        setStatus(saved.status);
        setShowResult(saved.status !== 'playing');
      } else {
        const dailyCity = cityForDate(dateKey);
        setCity(dailyCity);
        setGuesses([]);
        setStatus('playing');
        setShowResult(false);
        saveDailyState({ dateKey, cityId: dailyCity.id, guesses: [], status: 'playing' });
      }
    } else {
      setCity((prev) => randomCity(prev.id));
      setGuesses([]);
      setStatus('playing');
      setShowResult(false);
    }
    setPendingPin(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Fetch weather whenever the target city changes.
  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    setWeatherError(null);
    fetchPreviousDayWeather(city)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setWeatherError("Couldn't load weather data. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  const revealedCount = Math.min(guesses.length + 1, MAX_GUESSES);

  const handleChangeUnits = (next: UnitSystem) => {
    setUnits(next);
    saveSettings({ units: next });
  };

  const handlePick = (lat: number, lon: number) => {
    if (status !== 'playing') return;
    setPendingPin({ lat, lon });
  };

  const handleSubmitGuess = () => {
    if (!pendingPin || status !== 'playing') return;
    const distanceKm = haversineDistanceKm(pendingPin.lat, pendingPin.lon, city.lat, city.lon);
    const bearing = bearingDeg(pendingPin.lat, pendingPin.lon, city.lat, city.lon);
    const correct = distanceKm <= WIN_DISTANCE_KM;
    const guess: Guess = { lat: pendingPin.lat, lon: pendingPin.lon, distanceKm, bearingDeg: bearing, correct };
    const nextGuesses = [...guesses, guess];
    const nextStatus: GameStatus = correct
      ? 'won'
      : nextGuesses.length >= MAX_GUESSES
        ? 'lost'
        : 'playing';

    setGuesses(nextGuesses);
    setStatus(nextStatus);
    setPendingPin(null);

    if (mode === 'daily') {
      saveDailyState({ dateKey: dateKeyRef.current, cityId: city.id, guesses: nextGuesses, status: nextStatus });
    }

    if (nextStatus !== 'playing') {
      setShowResult(true);
      if (mode === 'daily') {
        const updated = recordResult(nextStatus === 'won', nextGuesses.length);
        setStats(updated);
      }
    }
  };

  const handlePlayPractice = () => {
    setShowResult(false);
    setMode('practice');
  };

  const targetForMap = status !== 'playing' ? city : null;

  const helperText = useMemo(() => {
    if (status !== 'playing') return null;
    if (pendingPin) return 'Click "Submit guess" to lock it in, or click elsewhere to move your pin.';
    return 'Click anywhere on the map to drop your guess.';
  }, [status, pendingPin]);

  return (
    <div className="wg-app">
      <Header mode={mode} onChangeMode={setMode} units={units} onChangeUnits={handleChangeUnits} />

      <main className="wg-main">
        <div className="wg-map-panel">
          <MapView
            guesses={guesses}
            targetCity={targetForMap}
            pendingPin={pendingPin}
            disabled={status !== 'playing'}
            onPick={handlePick}
          />
          <div className="wg-map-footer">
            <span className="wg-helper-text">{helperText}</span>
            <button
              className="wg-button"
              disabled={!pendingPin || status !== 'playing'}
              onClick={handleSubmitGuess}
            >
              Submit guess
            </button>
          </div>
        </div>

        <aside className="wg-sidebar">
          <section>
            <h2>Clues</h2>
            {weatherError && <p className="wg-error">{weatherError}</p>}
            <ClueList weather={weather} revealedCount={revealedCount} units={units} />
          </section>
          <section>
            <h2>
              Guesses <span className="wg-guess-count">{guesses.length}/{MAX_GUESSES}</span>
            </h2>
            <GuessHistory guesses={guesses} units={units} maxGuesses={MAX_GUESSES} />
          </section>
        </aside>
      </main>

      {showResult && (
        <ResultModal
          won={status === 'won'}
          city={city}
          guesses={guesses}
          maxGuesses={MAX_GUESSES}
          mode={mode}
          dateKey={mode === 'daily' ? dateKeyRef.current : undefined}
          stats={stats}
          onPlayPractice={handlePlayPractice}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
