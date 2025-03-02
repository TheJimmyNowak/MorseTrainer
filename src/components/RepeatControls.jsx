import { useState } from 'react';
import { InteractiveButton } from './InteractiveButton';
import { HelpTooltip } from './HelpTooltip';

export const RepeatControls = ({
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

  // Modify max repeats change
  const handleMaxRepeatsChange = (newMaxRepeats) => {
    onMaxRepeatsChange(newMaxRepeats);
  };

  return (
    <div className="space-y-3">
      {/* Max Repeats */}
      <div className="bg-gray-700/50 p-3 rounded-lg relative">
        <HelpTooltip 
          description="Maximum number of times a character group will play before being marked incorrect. Set to 'Inf' for unlimited plays."
        />
        <div className="text-xs text-gray-400 mb-2">Total Plays Before Answer</div>
        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={() => {
              const currentIndex = repeatOptions.findIndex(opt => opt.value === maxRepeats);
              if (currentIndex > 0) {
                handleMaxRepeatsChange(repeatOptions[currentIndex - 1].value);
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
                handleMaxRepeatsChange(repeatOptions[currentIndex + 1].value);
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
