import React, { useState, useEffect, useRef } from 'react';
import { MorseRunner } from './MorseRunner';
import { Settings, Radio, AlertTriangle } from 'lucide-react';
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
      <AnimatedSection title="Morse Runner Mode" icon={Radio} defaultOpen={true}>
        <div className="text-gray-300 text-sm mb-4">
          <p>Morse Runner simulates contest and pile-up conditions to help you build real-world CW operating skills.</p>
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-md flex items-center">
            <AlertTriangle size={16} className="text-red-400 mr-2 flex-shrink-0" />
            <span className="text-red-300">This feature is in early development (alpha). Expect bugs and frequent changes.</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <InteractiveButton
            onClick={toggleShowRunner}
            className="py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            {showRunner ? 'Hide Morse Runner' : 'Show Morse Runner'}
          </InteractiveButton>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Runner Mode</div>
            <select
              value={runnerMode}
              onChange={(e) => setRunnerMode(e.target.value)}
              className="w-full p-2 bg-gray-600 rounded border border-gray-500 text-white"
            >
              <option value="normal">Normal Mode</option>
              <option value="pileup">Pileup Training</option>
              <option value="practice">Practice Mode</option>
            </select>
          </div>
        </div>
        
        {showRunner && (
          <div className="mt-4 bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
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
    </div>
  );
};
