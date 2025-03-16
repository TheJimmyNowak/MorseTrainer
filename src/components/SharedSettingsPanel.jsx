import { X, Settings, Radio, Music, Activity, Headphones, Volume2, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { PresetDropdown } from './PresetDropdown';
import { ControlPanel } from './ControlPanel';
import { ModeToggle } from './ModeToggle';
import { InteractiveButton } from './InteractiveButton';
import { FilterNoiseControls } from './RadioNoiseControls';
import { AudioControls } from './AudioControls';
import { RepeatControls } from './RepeatControls';
import { AvailableChars } from './AvailableChars';
import { HelpTooltip } from './HelpTooltip';

export const SharedSettingsPanel = ({ 
  isVisible, 
  onVisibilityChange,
  // Active mode
  activeModeTab,
  
  // Audio settings (shared between modes)
  frequency,
  onFrequencyChange,
  wpm,
  onWpmChange,
  farnsworthSpacing,
  onFarnsworthChange,
  qsbAmount,
  onQsbChange,
  levelSpacing,
  onLevelSpacingChange,
  transitionDelay,
  onTransitionDelayChange,
  progressiveSpeedMode,
  onProgressiveSpeedToggle,
  
  // Filter noise settings (shared between modes)
  radioNoiseEnabled,
  onRadioNoiseToggle,
  radioNoiseVolume,
  onRadioNoiseVolumeChange,
  radioNoiseResonance,
  onRadioNoiseResonanceChange,
  radioNoiseWarmth,
  onRadioNoiseWarmthChange,
  radioNoiseDrift,
  onRadioNoiseDriftChange,
  radioNoiseAtmospheric,
  onRadioNoiseAtmosphericChange,
  radioNoiseCrackle,
  onRadioNoiseCrackleChange,
  filterBandwidth,
  onFilterBandwidthChange,
  
  // Trainer-specific settings
  currentLevel,
  onLevelChange,
  groupSize,
  onGroupSizeChange,
  minGroupSize,
  onMinGroupSizeChange,
  maxRepeats,
  onMaxRepeatsChange,
  advanceThreshold,
  onAdvanceThresholdChange,
  consecutiveCorrect,
  headCopyMode,
  onHeadCopyMode,
  infiniteDelayEnabled,
  onInfiniteDelayToggle,
  hideChars,
  onHideChars,
  availableChars,
  presets,
  currentPreset,
  onPresetChange,
  onCustomizeClick,
  
  // Runner-specific settings
  runnerSpeed,
  onRunnerSpeedChange,
  qsoRate,
  onQsoRateChange,
  sendDelay,
  onSendDelayChange,
  showExchangePreview,
  onShowExchangePreviewToggle,
  contestType,
  onContestTypeChange,
  contestTypes
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible &&
          panelRef.current &&
          !panelRef.current.contains(event.target)) {
        onVisibilityChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onVisibilityChange]);

  const handlePanelClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Side panel */}
      <div
        ref={panelRef}
        onClick={handlePanelClick}
        className={`fixed inset-0 lg:left-auto lg:w-[400px] z-50 
          bg-gradient-to-l from-gray-800/95 to-gray-900/95 backdrop-blur-lg shadow-2xl
          transition-transform duration-300 ease-in-out overflow-y-auto
          border-l border-gray-700/50
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel header with close button */}
        <div className="sticky top-0 bg-gradient-to-l from-gray-800/95 to-gray-900/95 backdrop-blur-lg z-10 p-4 border-b border-gray-700/50">
          <button
            onClick={() => onVisibilityChange(false)}
            className="absolute right-4 top-4 p-2 rounded-lg
              hover:bg-gray-700/50 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold pl-2">Settings</h2>
        </div>

        <div className="p-4 space-y-8">
          {/* Audio Settings Section - Shared between all modes */}
          <AnimatedSection title="Audio Settings" icon={Music} defaultOpen={true}>
            <div className="space-y-6">
              <AudioControls
                frequency={frequency}
                onFrequencyChange={onFrequencyChange}
                wpm={wpm}
                onWpmChange={onWpmChange}
                farnsworthSpacing={farnsworthSpacing}
                onFarnsworthChange={onFarnsworthChange}
                progressiveSpeedMode={progressiveSpeedMode && activeModeTab === 'trainer'}
                levelSpacing={levelSpacing}
                onLevelSpacingChange={onLevelSpacingChange}
                transitionDelay={transitionDelay}
                onTransitionDelayChange={onTransitionDelayChange}
              />

              {/* QSB Control */}
              <div className="bg-gray-700/50 p-3 rounded-lg relative">
                <HelpTooltip
                  description="Simulates signal fading (QSB) that occurs with long-distance radio communications. Higher values cause the Morse signal to randomly fade in and out, making copy more challenging."
                />
                <div className="text-sm mb-2">Signal Fading (QSB)</div>
                <div className="flex items-center gap-2">
                  <InteractiveButton
                    onClick={() => onQsbChange(-10)}
                    className="w-10 h-10 rounded bg-gray-600"
                    disabled={qsbAmount <= 0}
                  >-</InteractiveButton>
                  <div className="flex-1">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${qsbAmount}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">{qsbAmount}%</div>
                  </div>
                  <InteractiveButton
                    onClick={() => onQsbChange(10)}
                    className="w-10 h-10 rounded bg-gray-600"
                    disabled={qsbAmount >= 100}
                  >+</InteractiveButton>
                </div>
              </div>

              {/* Filter Noise Controls - Shared between modes */}
              <FilterNoiseControls
                isEnabled={radioNoiseEnabled}
                onToggle={onRadioNoiseToggle}
                volume={radioNoiseVolume}
                onVolumeChange={onRadioNoiseVolumeChange}
                resonance={radioNoiseResonance}
                onResonanceChange={onRadioNoiseResonanceChange}
                warmth={radioNoiseWarmth}
                onWarmthChange={onRadioNoiseWarmthChange}
                driftSpeed={radioNoiseDrift}
                onDriftSpeedChange={onRadioNoiseDriftChange}
                atmosphericNoise={radioNoiseAtmospheric}
                onAtmosphericNoiseChange={onRadioNoiseAtmosphericChange}
                crackleIntensity={radioNoiseCrackle}
                onCrackleIntensityChange={onRadioNoiseCrackleChange}
                filterBandwidth={filterBandwidth}
                onFilterBandwidthChange={onFilterBandwidthChange}
              />
            </div>
          </AnimatedSection>

          {/* Trainer-specific settings */}
          {activeModeTab === 'trainer' && (
            <AnimatedSection title="Training Settings" icon={Headphones} defaultOpen={true}>
              <div className="space-y-6">
                <PresetDropdown
                  presets={presets}
                  currentPreset={currentPreset}
                  onPresetChange={onPresetChange}
                  onCustomizeClick={onCustomizeClick}
                />
                <div className="grid grid-cols-1 gap-4">
                  <ModeToggle
                    label="Head Copy Mode"
                    description="Hide the text while practicing"
                    isActive={headCopyMode}
                    onToggle={onHeadCopyMode}
                    tooltipText="Trains your ability to copy Morse in your head without visual aids. In this mode, you need to listen to the entire sequence before typing or revealing the answer."
                  />
                  <ModeToggle
                    label="Progressive Speed"
                    description="Speed increases automatically with level"
                    isActive={progressiveSpeedMode}
                    onToggle={onProgressiveSpeedToggle}
                    tooltipText="Automatically increases the character speed (WPM) as you advance in levels. This helps you naturally progress to faster speeds as you become more proficient."
                  />
                  <ModeToggle
                    label="Infinite Delay After Max Repeats"
                    description="Give unlimited time to answer after max repeats"
                    isActive={infiniteDelayEnabled}
                    onToggle={onInfiniteDelayToggle}
                    tooltipText="When enabled, the sequence will pause indefinitely after reaching maximum repeats, giving you unlimited time to provide an answer. When disabled, incorrect answer is marked automatically after max repeats."
                  />
                </div>
                <ControlPanel
                  currentLevel={currentLevel}
                  onLevelChange={onLevelChange}
                  groupSize={groupSize}
                  onGroupSizeChange={onGroupSizeChange}
                  minGroupSize={minGroupSize}
                  onMinGroupSizeChange={onMinGroupSizeChange}
                  maxLevel={presets?.[0]?.sequence?.length || 40}
                  advanceThreshold={advanceThreshold}
                  onAdvanceThresholdChange={onAdvanceThresholdChange}
                  consecutiveCorrect={consecutiveCorrect}
                />

                <RepeatControls
                  maxRepeats={maxRepeats}
                  onMaxRepeatsChange={onMaxRepeatsChange}
                />

                {availableChars && (
                  <AvailableChars
                    availableChars={availableChars}
                    consecutiveCorrect={consecutiveCorrect}
                    advanceThreshold={advanceThreshold}
                  />
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Runner-specific settings */}
          {activeModeTab === 'runner' && (
            <AnimatedSection title="Contest Settings" icon={Radio} defaultOpen={true}>
              <div className="space-y-6">
                {/* Contest Type Selection - Prominent and always visible */}
                <div className="bg-gradient-to-r from-gray-700/80 to-blue-900/30 p-4 rounded-lg relative mb-4 border border-blue-800/30">
                  <HelpTooltip
                    description="Select the type of contest you want to practice. Each contest type has different exchange formats and requirements."
                  />
                  <div className="text-sm mb-2 text-blue-300 font-medium">Contest Type</div>
                  <select
                    value={contestType?.id || 'sprint'}
                    onChange={(e) => onContestTypeChange(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-lg border border-blue-500/30 text-white"
                  >
                    {Object.values(contestTypes).map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-300 mt-2 bg-gray-800/50 p-2 rounded border border-gray-700/50">
                    <div className="font-medium text-blue-400">Exchange Format:</div>
                    <div className="mt-1">{contestType?.description || 'Select a contest format'}</div>
                  </div>
                </div>

                {/* QSO Rate Control */}
                <div className="bg-gray-700/50 p-3 rounded-lg relative">
                  <HelpTooltip
                    description="Time in seconds between QSOs. Lower values create more rapid-fire contest conditions."
                  />
                  <div className="text-sm mb-2">QSO Rate (seconds)</div>
                  <div className="flex items-center gap-2">
                    <InteractiveButton
                      onClick={() => onQsoRateChange(-1)}
                      className="w-10 h-10 rounded bg-gray-600"
                      disabled={qsoRate <= 1}
                    >-</InteractiveButton>
                    <div className="flex-1">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${Math.min(100, (qsoRate / 10) * 100)}%` }}
                        />
                      </div>
                      <div className="text-center mt-1">{qsoRate} seconds</div>
                    </div>
                    <InteractiveButton
                      onClick={() => onQsoRateChange(1)}
                      className="w-10 h-10 rounded bg-gray-600"
                      disabled={qsoRate >= 10}
                    >+</InteractiveButton>
                  </div>
                </div>

                {/* Send Delay Control */}
                <div className="bg-gray-700/50 p-3 rounded-lg relative">
                  <HelpTooltip
                    description="Delay in seconds before sending Morse responses. Simulates operator reaction time."
                  />
                  <div className="text-sm mb-2">Send Delay (seconds)</div>
                  <div className="flex items-center gap-2">
                    <InteractiveButton
                      onClick={() => onSendDelayChange(-0.1)}
                      className="w-10 h-10 rounded bg-gray-600"
                      disabled={sendDelay <= 0.1}
                    >-</InteractiveButton>
                    <div className="flex-1">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${Math.min(100, (sendDelay / 2) * 100)}%` }}
                        />
                      </div>
                      <div className="text-center mt-1">{sendDelay.toFixed(1)} seconds</div>
                    </div>
                    <InteractiveButton
                      onClick={() => onSendDelayChange(0.1)}
                      className="w-10 h-10 rounded bg-gray-600"
                      disabled={sendDelay >= 2}
                    >+</InteractiveButton>
                  </div>
                </div>

                {/* Show Exchange Preview Toggle */}
                <div className="bg-gray-700/50 p-3 rounded-lg relative">
                  <HelpTooltip
                    description="Shows a preview of both callsign and exchange when not running. Useful for learning but reduces the challenge."
                  />
                  <div className="text-sm mb-2">Show Exchange Preview</div>
                  <InteractiveButton
                    onClick={onShowExchangePreviewToggle}
                    className={`w-full px-4 py-2 rounded transition-colors ${
                      showExchangePreview ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {showExchangePreview ? 'Enabled' : 'Disabled'}
                  </InteractiveButton>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 z-40
          ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onVisibilityChange(false)}
      />
    </>
  );
};

export default SharedSettingsPanel;
