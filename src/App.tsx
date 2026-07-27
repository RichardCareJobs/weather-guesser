import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { City } from './data/cities';
import type { CityRound, DailyWeather, GameMode, UnitSystem } from './types';
import { CITIES } from './data/cities';
import { citiesForDate, randomCities, todayKey } from './lib/dailyPuzzle';
import { fetchPreviousDayWeather } from './lib/openMeteo';
import { buildCityRound, clueDef } from './lib/quiz';
import { CITIES_PER_ROUND, CLUES_PER_CITY, TOTAL_QUESTIONS } from './lib/constants';
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
import QuestionCard from './components/QuestionCard';
import StatusBar from './components/StatusBar';
import ResultModal from './components/ResultModal';

type WeatherEntry = DailyWeather | 'error';

function cityById(id: string): City {
  const city = CITIES.find((c) => c.id === id);
  if (!city) throw new Error(`Unknown city id: ${id}`);
  return city;
}

export default function App() {
  const [mode, setMode] = useState<GameMode>('daily');
  const [units, setUnits] = useState<UnitSystem>(() => loadSettings().units);
  const [stats, setStats] = useState<Stats>(() => loadStats());

  const [cities, setCities] = useState<City[]>([]);
  const [sessionSeed, setSessionSeed] = useState('');
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherEntry>>({});
  const [cityIndex, setCityIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [cityTransition, setCityTransition] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const dateKeyRef = useRef(todayKey());

  const startNewPracticeRound = useCallback(() => {
    setCities(randomCities());
    setSessionSeed(`practice:${Date.now()}:${Math.random()}`);
    setWeatherMap({});
    setCityIndex(0);
    setClueIndex(0);
    setSelected(null);
    setAnswers([]);
    setCityTransition(false);
    setShowResult(false);
  }, []);

  // Initialize (or restore) a round whenever the mode changes.
  useEffect(() => {
    if (mode === 'daily') {
      const dateKey = todayKey();
      dateKeyRef.current = dateKey;
      const saved = loadDailyState();
      let dayCities: City[];
      let restoredAnswers: boolean[] = [];
      if (saved && saved.dateKey === dateKey && saved.cityIds.length === CITIES_PER_ROUND) {
        dayCities = saved.cityIds.map(cityById);
        restoredAnswers = saved.answers;
      } else {
        dayCities = citiesForDate(dateKey);
        saveDailyState({ dateKey, cityIds: dayCities.map((c) => c.id), answers: [] });
      }
      const idx = Math.min(Math.floor(restoredAnswers.length / CLUES_PER_CITY), CITIES_PER_ROUND - 1);
      setCities(dayCities);
      setSessionSeed(dateKey);
      setWeatherMap({});
      setCityIndex(idx);
      setClueIndex(restoredAnswers.length - idx * CLUES_PER_CITY);
      setSelected(null);
      setAnswers(restoredAnswers);
      setCityTransition(false);
      setShowResult(restoredAnswers.length >= TOTAL_QUESTIONS);
    } else {
      startNewPracticeRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Fetch weather for every city in the current round, in parallel.
  useEffect(() => {
    if (cities.length === 0) return;
    let cancelled = false;
    cities.forEach((city) => {
      fetchPreviousDayWeather(city)
        .then((data) => {
          if (!cancelled) setWeatherMap((m) => ({ ...m, [city.id]: data }));
        })
        .catch(() => {
          if (!cancelled) setWeatherMap((m) => ({ ...m, [city.id]: 'error' }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, [cities]);

  const rounds = useMemo(() => {
    const map: Record<string, CityRound> = {};
    cities.forEach((city) => {
      const weather = weatherMap[city.id];
      if (weather && weather !== 'error') {
        map[city.id] = buildCityRound(city, weather, `${sessionSeed}:${city.id}`);
      }
    });
    return map;
  }, [cities, weatherMap, sessionSeed]);

  const handleChangeUnits = (next: UnitSystem) => {
    setUnits(next);
    saveSettings({ units: next });
  };

  const handleChangeMode = (next: GameMode) => {
    setShowResult(false);
    setMode(next);
  };

  const currentCity = cities[cityIndex];
  const currentWeather = currentCity ? weatherMap[currentCity.id] : undefined;
  const currentRound = currentCity ? rounds[currentCity.id] : undefined;
  const currentQuestion = currentRound?.questions[clueIndex];

  const phase: 'loading' | 'error' | 'playing' =
    currentWeather === 'error' ? 'error' : currentQuestion ? 'playing' : 'loading';

  const score = answers.filter(Boolean).length;

  const retryWeather = () => {
    if (!currentCity) return;
    const city = currentCity;
    setWeatherMap((m) => {
      const next = { ...m };
      delete next[city.id];
      return next;
    });
    fetchPreviousDayWeather(city)
      .then((data) => setWeatherMap((m) => ({ ...m, [city.id]: data })))
      .catch(() => setWeatherMap((m) => ({ ...m, [city.id]: 'error' })));
  };

  const handleSelectOption = (index: number) => {
    if (!currentQuestion || selected !== null) return;
    const correct = index === currentQuestion.correctIndex;
    setSelected(index);
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);
    if (mode === 'daily') {
      saveDailyState({
        dateKey: dateKeyRef.current,
        cityIds: cities.map((c) => c.id),
        answers: nextAnswers,
      });
    }
  };

  const handleContinue = () => {
    if (selected === null) return;
    setSelected(null);

    const isLastClueOfCity = clueIndex + 1 >= CLUES_PER_CITY;
    if (!isLastClueOfCity) {
      setClueIndex((i) => i + 1);
      return;
    }

    const isLastCity = cityIndex + 1 >= CITIES_PER_ROUND;
    if (isLastCity) {
      if (mode === 'daily') {
        const updated = recordResult(answers.filter(Boolean).length);
        setStats(updated);
      }
      setShowResult(true);
      return;
    }

    setCityTransition(true);
    window.setTimeout(() => {
      setCityIndex((i) => i + 1);
      setClueIndex(0);
      setCityTransition(false);
    }, 1300);
  };

  const handlePlayPractice = () => {
    setMode('practice');
    startNewPracticeRound();
  };

  const isLastClueOfCity = clueIndex + 1 >= CLUES_PER_CITY;
  const isLastCity = cityIndex + 1 >= CITIES_PER_ROUND;
  const continueLabel = !isLastClueOfCity ? 'Next question' : isLastCity ? 'See results' : 'Next city';

  const justFinishedCityCorrect = answers.slice(cityIndex * CLUES_PER_CITY, cityIndex * CLUES_PER_CITY + CLUES_PER_CITY).filter(Boolean).length;
  const nextCity = cities[cityIndex + 1];

  return (
    <div className="wg-app">
      <Header mode={mode} onChangeMode={handleChangeMode} units={units} onChangeUnits={handleChangeUnits} />

      <main className="wg-main">
        <div className="wg-map-panel">
          <MapView city={currentCity ?? null} />
        </div>

        <div className="wg-quiz-panel">
          <StatusBar cityIndex={cityIndex} clueIndex={clueIndex} score={score} />

          {cityTransition && currentCity ? (
            <div className="wg-city-transition">
              <p className="wg-city-transition-score">
                {justFinishedCityCorrect}/{CLUES_PER_CITY} correct in {currentCity.name}!
              </p>
              {nextCity && (
                <p className="wg-city-transition-next">
                  Next up: {nextCity.name}, {nextCity.country}
                </p>
              )}
            </div>
          ) : showResult ? (
            <p className="wg-loading">Day complete!</p>
          ) : phase === 'error' ? (
            <div className="wg-error-panel">
              <p className="wg-error">Couldn't load weather data. Please try again.</p>
              <button className="wg-button" onClick={retryWeather}>
                Retry
              </button>
            </div>
          ) : phase === 'loading' || !currentCity ? (
            <p className="wg-loading">Loading weather for {currentCity ? currentCity.name : 'your city'}…</p>
          ) : (
            currentQuestion && (
              <QuestionCard
                cityLabel={`${currentCity.name}, ${currentCity.country}`}
                clueDef={clueDef(currentQuestion.clueKey)}
                question={currentQuestion}
                units={units}
                selected={selected}
                onSelect={handleSelectOption}
                onContinue={handleContinue}
                continueLabel={continueLabel}
              />
            )
          )}
        </div>
      </main>

      {showResult && (
        <ResultModal
          score={score}
          cities={cities}
          answers={answers}
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
