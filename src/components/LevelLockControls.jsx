import { useState } from 'react';
import { InteractiveButton } from './InteractiveButton';
import { HelpTooltip } from './HelpTooltip';
import { Lock, Unlock } from 'lucide-react';

export const LevelLockControls = ({
  minLevelThreshold,
  onMinLevelThresholdChange,
  isLevelLocked,
  onLevelLockToggle,
  currentLevel,
  maxLevel
}) => {
  return (
    <div className="space-y-3">
      {/* Minimum Level Threshold */}
      <div className="bg-gray-700/50 p-3 rounded-lg relative">
        <HelpTooltip 
          description="Sets the minimum level that training can drop to. The current level will never decrease below this threshold when you make mistakes."
        />
        <div className="text-xs text-gray-400 mb-2">Minimum Level Threshold</div>
        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={() => onMinLevelThresholdChange(-1)}
            className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
            disabled={minLevelThreshold <= 1}
          >-</InteractiveButton>
          <span className="flex-1 text-center text-lg">{minLevelThreshold}</span>
          <InteractiveButton
            onClick={() => onMinLevelThresholdChange(1)}
            className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
            disabled={minLevelThreshold >= currentLevel}
          >+</InteractiveButton>
        </div>
      </div>

      {/* Level Lock Toggle */}
      <div className="bg-gray-700/50 p-3 rounded-lg relative">
        <HelpTooltip 
          description="When enabled, the current level will remain fixed regardless of performance. This allows you to practice at a specific level without advancing or decreasing."
        />
        <div className="text-xs text-gray-400 mb-2">Level Lock</div>
        <InteractiveButton
          onClick={onLevelLockToggle}
          className={`w-full py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
            isLevelLocked 
              ? 'bg-yellow-600 hover:bg-yellow-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isLevelLocked ? (
            <>
              <Lock size={16} />
              <span>Level Locked at {currentLevel}</span>
            </>
          ) : (
            <>
              <Unlock size={16} />
              <span>Level Unlocked</span>
            </>
          )}
        </InteractiveButton>
      </div>
    </div>
  );
};

export default LevelLockControls;
