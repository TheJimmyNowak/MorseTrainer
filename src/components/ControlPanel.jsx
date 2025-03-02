import { InteractiveButton } from './InteractiveButton';
import { HelpTooltip } from './HelpTooltip';

export const ControlPanel = ({ 
  currentLevel, 
  onLevelChange, 
  groupSize, 
  onGroupSizeChange, 
  minGroupSize,
  onMinGroupSizeChange,
  maxLevel, 
  advanceThreshold, 
  onAdvanceThresholdChange 
}) => (
  <div className="space-y-3">
    {/* Level Control */}
    <div className="bg-gray-700/50 p-3 rounded-lg relative">
      <HelpTooltip 
        description="Determines the complexity of Morse characters you're learning. Higher levels introduce more characters."
      />
      <div className="text-xs text-gray-400 mb-2">Level</div>
      <div className="flex items-center gap-2">
        <InteractiveButton
          onClick={() => onLevelChange(-1)}
          className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
          disabled={currentLevel <= 1}
        >-</InteractiveButton>
        <span className="flex-1 text-center text-lg">{currentLevel}/{maxLevel}</span>
        <InteractiveButton
          onClick={() => onLevelChange(1)}
          className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
          disabled={currentLevel >= maxLevel}
        >+</InteractiveButton>
      </div>
    </div>

    {/* Min Group Size Control */}
    <div className="bg-gray-700/50 p-3 rounded-lg relative">
      <HelpTooltip 
        description="Minimum number of characters that will appear in a training group. Helps control the lower bound of group complexity."
      />
      <div className="text-xs text-gray-400 mb-2">Min Group Size</div>
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
          disabled={minGroupSize >= groupSize}
        >+</InteractiveButton>
      </div>
    </div>

    {/* Max Group Size Control */}
    <div className="bg-gray-700/50 p-3 rounded-lg relative">
      <HelpTooltip 
        description="Maximum number of characters that can appear in a single training group. Larger max group sizes increase potential complexity."
      />
      <div className="text-xs text-gray-400 mb-2">Max Group Size</div>
      <div className="flex items-center gap-2">
        <InteractiveButton
          onClick={() => onGroupSizeChange(-1)}
          className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
          disabled={groupSize <= minGroupSize}
        >-</InteractiveButton>
        <span className="flex-1 text-center text-lg">{groupSize}</span>
        <InteractiveButton
          onClick={() => onGroupSizeChange(1)}
          className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
          disabled={groupSize >= 10}
        >+</InteractiveButton>
      </div>
    </div>

    {/* Required successes */}
    <div className="bg-gray-700/50 p-3 rounded-lg relative">
      <HelpTooltip 
        description="Number of consecutive correct groups needed to advance to the next level. Increases learning progression difficulty."
      />
      <div className="text-xs text-gray-400 mb-2">Required Successes</div>
      <div className="flex items-center gap-2">
        <InteractiveButton
          onClick={() => onAdvanceThresholdChange(-1)}
          className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
          disabled={advanceThreshold <= 1}
        >-</InteractiveButton>
        <span className="flex-1 text-center text-lg">{advanceThreshold}</span>
        <InteractiveButton
          onClick={() => onAdvanceThresholdChange(1)}
          className="w-10 h-10 rounded bg-gray-600 disabled:opacity-50"
          disabled={advanceThreshold >= 10}
        >+</InteractiveButton>
      </div>
    </div>
  </div>
);
