import { Settings2 } from 'lucide-react';

export const PresetDropdown = ({
  presets,
  currentPreset,
  onPresetChange,
  onCustomizeClick
}) => {
  const currentIsCustom = currentPreset?.id === 'custom';

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg">
      <div className="text-xs text-gray-400 mb-2 flex justify-between items-center">
        <span>Sequence Type</span>
        {currentIsCustom && (
          <button
            onClick={onCustomizeClick}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
          >
            <Settings2 size={16} />
            <span>Customize</span>
          </button>
        )}
      </div>
      <select
        value={currentPreset?.id}
        onChange={(e) => onPresetChange(e.target.value)}
        className="w-full p-2 bg-gray-600 rounded-lg border border-gray-500 text-white"
      >
        {presets.map(preset => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  );
};