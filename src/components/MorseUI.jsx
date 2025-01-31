import { Activity, History as HistoryIcon, Radio, Music, Settings } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { PresetDropdown } from './PresetDropdown';
import { ControlPanel } from './ControlPanel';
import { QualityControls } from './QualityControls';
import { CharacterDisplay } from './CharacterDisplay';
import { CharacterGrid } from './CharacterGrid';
import { ScoreDisplay } from './ScoreDisplay';
import { History } from './History';
import { PerformanceGraph } from './PerformanceGraph';
import { AvailableChars } from './AvailableChars';
import { AudioControls } from './AudioControls';
import { LevelProgress } from './LevelProgress';
import { FloatingNotification } from './Notification';
import { MainButton } from './MainButton';
import { ModeToggle } from './ModeToggle';
import { useState } from 'react';

const MorseUI = ({
  isPlaying,
  onTogglePlay,
  currentLevel,
  onLevelChange,
  groupSize,
  onGroupSizeChange,
  frequency,
  onFrequencyChange,
  wpm,
  onWpmChange,
  availableChars,
  consecutiveCorrect,
  userInput,
  currentGroupSize,
  score,
  history,
  maxLevel,
  notification,
  onCharacterInput,
  performanceData,
  headCopyMode,
  onHeadCopyMode,
  hideChars,
  onHideChars,
  showAnswer,
  onShowAnswer,
  currentGroup,
  qsbAmount,
  onQsbChange,
  qrmAmount,
  onQrmChange,
  presets,
  currentPreset,
  onPresetChange,
  advanceThreshold,
  onAdvanceThresholdChange
}) => {
  const [mainButtonElement, setMainButtonElement] = useState(null);
  const showTrainingSettings = !hideChars;
  const showAudioSettings = !hideChars;
  const showPerformance = true;
  const showHistory = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <FloatingNotification
        notification={notification}
        buttonElement={mainButtonElement}
      />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Morse Code Trainer
          </h1>
          <p className="text-xl font-medium text-gray-400">
            {currentPreset?.name || 'Loading...'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Core Training */}
          <div className="space-y-8">
            <MainButton
              isPlaying={isPlaying}
              onClick={onTogglePlay}
              onButtonRef={setMainButtonElement}
            />

            <AnimatedSection title="Practice Area" icon={Radio} defaultOpen={true}>
              <div className="space-y-6">
                <CharacterDisplay
                  headCopyMode={headCopyMode}
                  showAnswer={showAnswer}
                  userInput={userInput}
                  currentGroupSize={currentGroupSize}
                  currentGroup={currentGroup}
                  onShowAnswer={onShowAnswer}
                />

                {/* Character Grid moved into Practice Area */}
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <CharacterGrid
                    availableChars={availableChars}
                    onCharacterInput={onCharacterInput}
                    currentPreset={currentPreset}
                  />
                </div>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-2 gap-6">
              <ModeToggle
                label="Head Copy Mode"
                description="Hide the text while practicing"
                isActive={headCopyMode}
                onToggle={onHeadCopyMode}
              />
              <ModeToggle
                label="Compact Mode"
                description="Simplify the interface"
                isActive={hideChars}
                onToggle={onHideChars}
              />
            </div>
          </div>

          {/* Right Column - Stats and Settings */}
          <div className="space-y-8">
            {showPerformance && (
              <AnimatedSection title="Performance" icon={Activity} defaultOpen={true}>
                <div className="space-y-6">
                  <ScoreDisplay score={score} />
                  <LevelProgress
                    consecutiveCorrect={consecutiveCorrect}
                    advanceThreshold={advanceThreshold}
                  />
                  {performanceData.length > 0 && (
                    <PerformanceGraph performanceData={performanceData} />
                  )}
                </div>
              </AnimatedSection>
            )}

            {showHistory && (
              <AnimatedSection title="History" icon={HistoryIcon} defaultOpen={false}>
                <div className="space-y-6">
                  <History history={history} />
                </div>
              </AnimatedSection>
            )}

            {showAudioSettings && (
              <AnimatedSection title="Audio Settings" icon={Music} defaultOpen={false}>
                <div className="space-y-6">
                  <AudioControls
                    frequency={frequency}
                    onFrequencyChange={onFrequencyChange}
                    wpm={wpm}
                    onWpmChange={onWpmChange}
                  />
                  <QualityControls
                    qsbAmount={qsbAmount}
                    onQsbChange={onQsbChange}
                    qrmAmount={qrmAmount}
                    onQrmChange={onQrmChange}
                  />
                </div>
              </AnimatedSection>
            )}

            {showTrainingSettings && (
              <AnimatedSection title="Training Settings" icon={Settings} defaultOpen={!isPlaying}>
                <div className="space-y-6">
                  <PresetDropdown
                    presets={presets}
                    currentPreset={currentPreset}
                    onPresetChange={onPresetChange}
                  />
                  <ControlPanel
                    currentLevel={currentLevel}
                    onLevelChange={onLevelChange}
                    groupSize={groupSize}
                    onGroupSizeChange={onGroupSizeChange}
                    maxLevel={maxLevel}
                    advanceThreshold={advanceThreshold}
                    onAdvanceThresholdChange={onAdvanceThresholdChange}
                    consecutiveCorrect={consecutiveCorrect}
                  />
                  <AvailableChars
                    availableChars={availableChars}
                    consecutiveCorrect={consecutiveCorrect}
                    advanceThreshold={advanceThreshold}
                  />
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorseUI;