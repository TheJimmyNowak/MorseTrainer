import { useState } from 'react';
import { InteractiveButton } from './InteractiveButton';

export const RepeatControls = ({
  minGroupSize,
  onMinGroupSizeChange,
  maxRepeats,
  onMaxRepeatsChange
}) => {
  // Options for max repeats - Inf and numbers 1-10
  const repeatOptions = [
    { value: -1, label: 'Inf' },
    ...Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
  ];

  // Convert numerical value to display label
  const getRepeatLabel = (value) => {
    return value === -1 ? 'Inf' : String(value);
  };

  return (
    <div className="space-y-3">
      {/* Minimum Group Size */}
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Minimum Group Size</div>
        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={() => onMinGroupSizeChange(-1)}
            className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
            disabled={minGroupSize <= 1}
          >-</InteractiveButton>
          <span className="flex-1 text-center text-lg">{minGroupSize}</span>
          <InteractiveButton
            onClick={() => onMinGroupSizeChange(1)}
            className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
            disabled={minGroupSize >= 10}
          >+</InteractiveButton>
        </div>
      </div>

      {/* Max Repeats */}
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Max Repeats Before Answer</div>
        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={() => {
              const currentIndex = repeatOptions.findIndex(opt => opt.value === maxRepeats);
              if (currentIndex > 0) {
                onMaxRepeatsChange(repeatOptions[currentIndex - 1].value);
              }
            }}
            className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
            disabled={maxRepeats === repeatOptions[0].value}
          >-</InteractiveButton>
          <span className="flex-1 text-center text-lg">{getRepeatLabel(maxRepeats)}</span>
          <InteractiveButton
            onClick={() => {
              const currentIndex = repeatOptions.findIndex(opt => opt.value === maxRepeats);
              if (currentIndex < repeatOptions.length - 1) {
                onMaxRepeatsChange(repeatOptions[currentIndex + 1].value);
              }
            }}
            className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
            disabled={maxRepeats === repeatOptions[repeatOptions.length - 1].value}
          >+</InteractiveButton>
        </div>
      </div>
    </div>
  );
};
