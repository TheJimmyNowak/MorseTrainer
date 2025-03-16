import { Activity, History as HistoryIcon, Radio, Music } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { CharacterDisplay } from './CharacterDisplay';
import { CharacterGrid } from './CharacterGrid';
import { ScoreDisplay } from './ScoreDisplay';
import { History } from './History';
import { PerformanceGraph } from './PerformanceGraph';
import { LevelProgress } from './LevelProgress';
import { FloatingNotification } from './Notification';
import { useState } from 'react';
import { BetaBanner } from './BetaBanner';
import { Zap } from 'lucide-react';

const MorseUI = ({
  isPlaying,
  onTogglePlay,
  currentLevel,
  groupSize,
  minGroupSize,
  maxRepeats,
  frequency,
  wpm,
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
  hideChars,
  showAnswer,
  onShowAnswer,
  currentGroup,
  qsbAmount,
  presets,
  currentPreset,
  advanceThreshold,
  farnsworthSpacing,
  progressiveSpeedMode,
  customSequence,
  levelSpacing,
  transitionDelay,
  radioNoiseEnabled,
  filterBandwidth,
  infiniteDelayEnabled,
  onClearPerformanceData,
  isSettingsPanelVisible
}) => {
  const [mainButtonElement, setMainButtonElement] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BetaBanner />
      <FloatingNotification
        notification={notification}
        buttonElement={mainButtonElement}
      />

      <div className="max-w-7xl mx-auto px-4 pt-2 pb-16">
        {/* Compact Header */}
        <div className="relative mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/50 shadow-lg overflow-hidden">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text flex items-center">
                <Radio size={22} className="text-blue-400 mr-2" />
                Morse Code Trainer
              </h1>
              <p className="text-sm text-gray-400">
                {currentPreset?.name || 'Loading...'}
              </p>
            </div>
            <button
              ref={ref => setMainButtonElement(ref)}
              onClick={onTogglePlay}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-white/5 flex items-center justify-center ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Zap size={24} className={isPlaying ? 'animate-pulse' : ''} />
                <span>{isPlaying ? 'Stop Practice' : 'Start Practice'}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Core Training */}
          <div className="space-y-8">
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

                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <CharacterGrid
                    availableChars={availableChars}
                    onCharacterInput={onCharacterInput}
                    currentPreset={currentPreset}
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-8">
            <AnimatedSection title="History" icon={HistoryIcon} defaultOpen={true}>
              <div className="space-y-6">
                <History history={history} />
              </div>
            </AnimatedSection>

            <AnimatedSection title="Performance" icon={Activity} defaultOpen={false}>
              <div className="space-y-6">
                <ScoreDisplay score={score} />
                <LevelProgress
                  consecutiveCorrect={consecutiveCorrect}
                  advanceThreshold={advanceThreshold}
                />
                {performanceData.length > 0 && (
                  <PerformanceGraph performanceData={performanceData} />
                )}
                
                {/* Debug button to clear performance data */}
                {onClearPerformanceData && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={onClearPerformanceData}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Clear performance data
                    </button>
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorseUI;
