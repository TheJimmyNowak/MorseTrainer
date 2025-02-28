import { InteractiveButton } from './InteractiveButton';

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
            <div className="text-sm mb-2">Noise Volume</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => onVolumeChange(-0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={volume <= 0}
              >-</InteractiveButton>
              <div className="flex-1">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(volume / 1.5) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{Math.round(volume * 100)}%</div>
              </div>
              <InteractiveButton
                onClick={() => onVolumeChange(0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={volume >= 1.5}
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
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(atmosphericNoise / 3) * 100}%` }}
                  />
                </div>
                <div className="text-center mt-1">{atmosphericNoise.toFixed(1)}</div>
              </div>
              <InteractiveButton
                onClick={() => onAtmosphericNoiseChange(0.1)}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={atmosphericNoise >= 3}
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
