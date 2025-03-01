import { InteractiveButton } from './InteractiveButton';
import { useState } from 'react';

export const FilterNoiseControls = ({
  isEnabled,
  onToggle,
  volume,
  onVolumeChange,
  resonance,
  onResonanceChange,
  warmth,
  onWarmthChange,
  driftSpeed,
  onDriftSpeedChange,
  atmosphericNoise,
  onAtmosphericNoiseChange,
  crackleIntensity,
  onCrackleIntensityChange
}) => {
  // Local state to track slider values
  const [volumeValue, setVolumeValue] = useState(volume * 100);
  
  // Handler for slider changes
  const handleVolumeSlider = (e) => {
    const newValue = parseFloat(e.target.value);
    setVolumeValue(newValue);
    // Convert percentage back to the 0-5.0 scale
    onVolumeChange((newValue / 100) - volume);
  };

  return (
    <div className="space-y-3 pb-1">
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <div className="text-sm mb-2">Filter Noise</div>
        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={onToggle}
            className={`w-full px-4 py-2 rounded transition-colors ${
              isEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </InteractiveButton>
        </div>
      </div>

      {isEnabled && (
        <>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Noise Volume (relative to CW tone)</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => {
                  const newVolume = Math.max(0, volume - 0.1);
                  setVolumeValue(newVolume * 100);
                  onVolumeChange(-0.1);
                }}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={volume <= 0}
              >-</InteractiveButton>
              
              <div className="flex-1 space-y-2">
                {/* Slider for more intuitive control - increased to 500% */}
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={volumeValue} 
                  onChange={handleVolumeSlider}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  style={{
                    // Custom styling for the slider thumb and track
                    '--track-color': '#3B82F6',
                    '--thumb-color': '#FFFFFF',
                    'accentColor': '#3B82F6'
                  }}
                />
                
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (volume / 5) * 100)}%` }}
                  />
                </div>
                
                <div className="text-center text-sm">
                  {Math.round(volume * 100)}%
                  {volume > 1 && volume <= 2 && ' (louder than CW)'}
                  {volume > 2 && volume <= 3.5 && ' (much louder than CW)'}
                  {volume > 3.5 && ' (extremely loud)'}
                </div>
              </div>
              
              <InteractiveButton
                onClick={() => {
                  const newVolume = Math.min(5.0, volume + 0.1);
                  setVolumeValue(newVolume * 100);
                  onVolumeChange(0.1);
                }}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={volume >= 5.0}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Filter Resonance</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => onResonanceChange(-5)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={resonance <= 5}
              >-</InteractiveButton>
              <div className="flex-1">
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={resonance} 
                  onChange={(e) => onResonanceChange(parseInt(e.target.value) - resonance)}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer mb-2"
                  style={{ 'accentColor': '#10B981' }}
                />
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(resonance / 50) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{resonance}</div>
              </div>
              <InteractiveButton
                onClick={() => onResonanceChange(5)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={resonance >= 50}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Warmth</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => onWarmthChange(-1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={warmth <= 0}
              >-</InteractiveButton>
              <div className="flex-1">
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={warmth} 
                  onChange={(e) => onWarmthChange(parseInt(e.target.value) - warmth)}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer mb-2"
                  style={{ 'accentColor': '#FBBF24' }}
                />
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(warmth / 15) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{warmth}</div>
              </div>
              <InteractiveButton
                onClick={() => onWarmthChange(1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={warmth >= 15}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Frequency Drift</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => onDriftSpeedChange(-0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={driftSpeed <= 0}
              >-</InteractiveButton>
              <div className="flex-1">
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  value={driftSpeed} 
                  onChange={(e) => onDriftSpeedChange(parseFloat(e.target.value) - driftSpeed)}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer mb-2"
                  style={{ 'accentColor': '#A855F7' }}
                />
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(driftSpeed / 2) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{driftSpeed.toFixed(1)}</div>
              </div>
              <InteractiveButton
                onClick={() => onDriftSpeedChange(0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={driftSpeed >= 2}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Atmospheric Effects</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => onAtmosphericNoiseChange(-0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={atmosphericNoise <= 0}
              >-</InteractiveButton>
              <div className="flex-1">
                <input 
                  type="range" 
                  min="0" 
                  max="8"
                  step="0.1" 
                  value={atmosphericNoise} 
                  onChange={(e) => onAtmosphericNoiseChange(parseFloat(e.target.value) - atmosphericNoise)}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer mb-2"
                  style={{ 'accentColor': '#60A5FA' }}
                />
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(atmosphericNoise / 8) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{atmosphericNoise.toFixed(1)}</div>
                {atmosphericNoise > 5 && 
                  <div className="text-center text-xs text-yellow-400 mt-1">
                    Extreme ionospheric conditions
                  </div>
                }
              </div>
              <InteractiveButton
                onClick={() => onAtmosphericNoiseChange(0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={atmosphericNoise >= 8}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Static & Crackle</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => onCrackleIntensityChange(-0.01)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={crackleIntensity <= 0}
              >-</InteractiveButton>
              <div className="flex-1">
                <input 
                  type="range" 
                  min="0" 
                  max="0.3" 
                  step="0.01" 
                  value={crackleIntensity} 
                  onChange={(e) => onCrackleIntensityChange(parseFloat(e.target.value) - crackleIntensity)}
                  className="w-full h-2 bg-gray-600 rounded-full appearance-none cursor-pointer mb-2"
                  style={{ 'accentColor': '#F97316' }}
                />
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(crackleIntensity / 0.3) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{crackleIntensity.toFixed(2)}</div>
              </div>
              <InteractiveButton
                onClick={() => onCrackleIntensityChange(0.01)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={crackleIntensity >= 0.3}
              >+</InteractiveButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
