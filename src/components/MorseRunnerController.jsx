import React, { useState, useEffect, useRef } from 'react';
import { MorseRunner } from './MorseRunner';
import { 
  Settings, 
  Radio, 
  AlertTriangle, 
  PlayCircle, 
  PauseCircle,
  Info, 
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { InteractiveButton } from './InteractiveButton';
import { morseAudio } from './MorseAudio';
import { filterNoise } from './FilterNoiseGenerator';

// This component serves as the integration point between the Morse Trainer 
// and Morse Runner, allowing them to share settings and audio resources
export const MorseRunnerController = ({ 
  wpm, 
  qsbAmount,
  farnsworthSpacing,
  frequency,
  filterNoiseEnabled,
  onFilterNoiseToggle,
  radioNoiseVolume,
  radioNoiseResonance,
  radioNoiseWarmth,
  radioNoiseDrift,
  radioNoiseAtmospheric,
  radioNoiseCrackle,
  filterBandwidth,
  morseSettings = {} // Optional settings from main application
}) => {
  const [showRunner, setShowRunner] = useState(false);
  const [runnerMode, setRunnerMode] = useState('normal'); // 'normal', 'pileup', 'practice'
  const [isRunnerActive, setIsRunnerActive] = useState(false);
  
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Effect to handle unmounting - ensure all audio is stopped
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Force stop all audio when unmounting
      morseAudio.stop();
      filterNoise.stop();
      console.log("MorseRunnerController unmounted - stopping all audio");
    };
  }, []);
  
  // Effect to handle tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunnerActive) {
        stopAllAudio();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunnerActive]);
  
  // Function to stop all audio
  const stopAllAudio = () => {
    if (isMountedRef.current) {
      console.log("Stopping all audio in runner controller");
      morseAudio.stop();
      if (filterNoiseEnabled) {
        filterNoise.stop();
      }
      setIsRunnerActive(false);
    }
  };
  
  // Handle running state change from MorseRunner component
  const handleRunningChange = (isRunning) => {
    console.log("Runner active state changed:", isRunning);
    setIsRunnerActive(isRunning);
  };
  
  // Handle hide/show runner toggle
  const toggleShowRunner = () => {
    if (showRunner && isRunnerActive) {
      // If we're hiding the runner and it's active, stop all audio
      stopAllAudio();
    }
    setShowRunner(!showRunner);
  };
  
  return (
    <div className="space-y-6">
      <AnimatedSection title="Morse Contest Runner" icon={Radio} defaultOpen={true}>
        <div className="text-gray-300 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white mb-1">Contest Simulation</h3>
              <p className="text-sm">Practice real-world CW contest operation with realistic callsigns and exchanges.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-800/70 px-3 py-2 rounded-lg border border-red-500/30 text-red-300 text-xs">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <span>Alpha Feature</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="flex-1">
              <div className="mb-3">
                <div className="text-sm text-gray-300 mb-1">Runner Mode</div>
                <select
                  value={runnerMode}
                  onChange={(e) => setRunnerMode(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                >
                  <option value="normal">Standard Contest</option>
                  <option value="pileup">Pileup Training</option>
                  <option value="practice">Practice Mode</option>
                </select>
              </div>
              
              <div className="text-xs text-gray-400">
                {runnerMode === 'normal' ? 
                  'Standard contest mode with individual station contacts.' : 
                 runnerMode === 'pileup' ?
                  'Simulates multiple stations calling at once - coming soon!' :
                  'Practice mode for learning contest exchanges - coming soon!'}
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <InteractiveButton
                onClick={toggleShowRunner}
                className={`h-full py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  showRunner 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {showRunner ? 
                  <><PauseCircle size={20} /> Hide Runner</> : 
                  <><PlayCircle size={20} /> Show Runner</>}
              </InteractiveButton>
            </div>
          </div>
        </div>
        
        {/* Feature Highlights */}
        {!showRunner && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-blue-500/20">
                  <Radio size={16} className="text-blue-400" />
                </div>
                <span className="font-medium">Contest Simulation</span>
              </div>
              <p className="text-xs text-gray-400">
                Practice copying real callsigns and contest exchanges to build operating skills.
              </p>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-green-500/20">
                  <ToggleRight size={16} className="text-green-400" />
                </div>
                <span className="font-medium">Multiple Contest Types</span>
              </div>
              <p className="text-xs text-gray-400">
                Practice different contest formats including Sprint, DX, Field Day and more.
              </p>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-purple-500/20">
                  <Info size={16} className="text-purple-400" />
                </div>
                <span className="font-medium">Realistic Conditions</span>
              </div>
              <p className="text-xs text-gray-400">
                Optional filter noise, QSB, and other effects to simulate real band conditions.
              </p>
            </div>
          </div>
        )}
        
        {showRunner && (
          <div className="mt-4">
            <MorseRunner 
              wpm={wpm} 
              qsbAmount={qsbAmount}
              farnsworthSpacing={farnsworthSpacing}
              frequency={frequency}
              filterNoiseEnabled={filterNoiseEnabled}
              onFilterNoiseToggle={onFilterNoiseToggle}
              radioNoiseVolume={radioNoiseVolume}
              radioNoiseResonance={radioNoiseResonance}
              radioNoiseWarmth={radioNoiseWarmth}
              radioNoiseDrift={radioNoiseDrift}
              radioNoiseAtmospheric={radioNoiseAtmospheric}
              radioNoiseCrackle={radioNoiseCrackle}
              filterBandwidth={filterBandwidth}
              runnerMode={runnerMode}
              onRunningChange={handleRunningChange}
            />
          </div>
        )}
      </AnimatedSection>
      
      {!showRunner && (
        <div className="bg-gray-800/20 p-5 rounded-lg border border-gray-700/30">
          <div className="flex flex-col items-center text-center text-gray-400">
            <Radio size={48} className="text-gray-500 opacity-30 mb-3" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Contest Runner</h3>
            <p className="text-sm max-w-md">
              Click "Show Runner" above to start practicing contest operation with realistic callsigns and exchanges.
            </p>
            <InteractiveButton
              onClick={toggleShowRunner}
              className="mt-4 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <PlayCircle size={18} className="mr-2" />
              Launch Runner
            </InteractiveButton>
          </div>
        </div>
      )}
    </div>
  );
};
