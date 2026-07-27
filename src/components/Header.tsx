import type { GameMode, UnitSystem } from '../types';
import SettingsMenu from './SettingsMenu';

interface HeaderProps {
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  units: UnitSystem;
  onChangeUnits: (units: UnitSystem) => void;
}

export default function Header({ mode, onChangeMode, units, onChangeUnits }: HeaderProps) {
  return (
    <header className="wg-header">
      <div className="wg-title">
        <span className="wg-title-icon">🌦️</span>
        <h1>Weather Guesser</h1>
      </div>
      <div className="wg-header-controls">
        <div className="wg-toggle">
          <button
            className={mode === 'daily' ? 'active' : ''}
            onClick={() => onChangeMode('daily')}
          >
            Daily
          </button>
          <button
            className={mode === 'practice' ? 'active' : ''}
            onClick={() => onChangeMode('practice')}
          >
            Practice
          </button>
        </div>
        <SettingsMenu units={units} onChangeUnits={onChangeUnits} />
      </div>
    </header>
  );
}
