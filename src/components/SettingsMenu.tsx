import { useState } from 'react';
import type { UnitSystem } from '../types';

interface SettingsMenuProps {
  units: UnitSystem;
  onChangeUnits: (units: UnitSystem) => void;
}

export default function SettingsMenu({ units, onChangeUnits }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="wg-settings">
      <button
        className="wg-icon-button"
        aria-label="Settings"
        onClick={() => setOpen((o) => !o)}
      >
        ⚙
      </button>
      {open && (
        <div className="wg-settings-panel">
          <div className="wg-settings-row">
            <span>Units</span>
            <div className="wg-toggle">
              <button
                className={units === 'metric' ? 'active' : ''}
                onClick={() => onChangeUnits('metric')}
              >
                °C, km
              </button>
              <button
                className={units === 'imperial' ? 'active' : ''}
                onClick={() => onChangeUnits('imperial')}
              >
                °F, mi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
