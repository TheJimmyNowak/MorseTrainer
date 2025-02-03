import { InteractiveButton } from './InteractiveButton';

export const AudioControls = ({
  frequency,
  onFrequencyChange,
  wpm,
  onWpmChange,
  farnsworthSpacing = 0,
  onFarnsworthChange = () => {},
  farnsworthStep = 1,
  progressiveSpeedMode = false
}) => {
  // Calculate effective WPM based on Farnsworth spacing
  const effectiveWpm = farnsworthSpacing > 0
    ? Math.round(wpm * (wpm / (wpm + farnsworthSpacing)))
    : wpm;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Tone (Hz)</div>
          <div className="flex items-center gap-2">
            <InteractiveButton
              onClick={() => onFrequencyChange(-50)}
              className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
              disabled={frequency <= 400}
            >-</InteractiveButton>
            <span className="flex-1 text-center text-lg">{frequency}</span>
            <InteractiveButton
              onClick={() => onFrequencyChange(50)}
              className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
              disabled={frequency >= 1000}
            >+</InteractiveButton>
          </div>
        </div>

        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">
            Character Speed (WPM)
            {progressiveSpeedMode && (
              <span className="text-yellow-400 ml-1">(Auto-adjusting)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <InteractiveButton
              onClick={() => onWpmChange(-1)}
              className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
              disabled={wpm <= 5}
            >-</InteractiveButton>
            <span className="flex-1 text-center text-lg">{wpm}</span>
            <InteractiveButton
              onClick={() => onWpmChange(1)}
              className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
              disabled={wpm >= 80}
            >+</InteractiveButton>
          </div>
        </div>
      </div>

      <div className="bg-gray-700/50 p-3 rounded-lg">
        <div className="text-sm mb-2">Farnsworth Spacing</div>
        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={() => onFarnsworthChange(-farnsworthStep)}
            className="w-10 h-10 rounded bg-gray-600"
            disabled={farnsworthSpacing <= 0}
          >-</InteractiveButton>
          <div className="flex-1">
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${(farnsworthSpacing / 15) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <div className="text-xs text-gray-400">
                Character: {wpm} WPM
              </div>
              <div className="text-sm">
                {farnsworthSpacing > 0
                  ? `+${farnsworthSpacing} WPM spacing`
                  : 'No extra spacing'}
              </div>
              <div className="text-xs text-gray-400">
                Net: {effectiveWpm} WPM
              </div>
            </div>
          </div>
          <InteractiveButton
            onClick={() => onFarnsworthChange(farnsworthStep)}
            className="w-10 h-10 rounded bg-gray-600"
            disabled={farnsworthSpacing >= 15}
          >+</InteractiveButton>
        </div>
      </div>
    </div>
  );
};