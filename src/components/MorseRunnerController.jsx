import React, { useState, useEffect, useRef } from 'react';
import { MorseRunner } from './MorseRunner';
import { 
  Settings, 
  Radio, 
  AlertTriangle, 
  Info, 
  Award,
  Zap,
  Headphones,
  Volume2
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
  const [runnerMode, setRunnerMode] = useState('normal'); // 'normal', 'pileup', 'practice'
  const [isRunnerActive, setIsRunnerActive] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
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
  
  return (
    <div className="space-y-6">
      {/* Contest Mode Header */}
      <div className="relative bg-gradient-to-r from-gray-900/80 via-blue-900/20 to-gray-900/80 rounded-xl p-4 pb-5 border border-gray-700/50 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text flex items-center">
              <Radio size={22} className="text-blue-400 mr-2" />
              Contest Simulation
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Practice real-world CW contest operation with realistic callsigns and exchanges
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-red-900/20 border border-red-500/30 rounded-full px-3 py-1 flex items-center text-xs font-medium text-red-300">
              <AlertTriangle size={14} className="mr-1" />
              ALPHA
            </div>
            
            <div className="hidden sm:flex relative">
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className={`p-2 rounded-full transition-colors ${
                  showHelp ? 'bg-blue-500 text-white' : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Info size={20} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <div className="relative min-w-[180px] z-10">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Contest Format</label>
            <select
              value={runnerMode}
              onChange={(e) => setRunnerMode(e.target.value)}
              className="w-full py-2 px-3 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg text-white appearance-none shadow-lg"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", 
                       backgroundPosition: "right 0.5rem center",
                       backgroundRepeat: "no-repeat",
                       backgroundSize: "1.5em 1.5em",
                       paddingRight: "2.5rem" }}
            >
              <option value="normal">Standard Contest</option>
              <option value="pileup">Pileup Training</option>
              <option value="practice">Practice Mode</option>
            </select>
          </div>
          
          <div className="flex-1 hidden md:block">
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              {runnerMode === 'normal' ? 
                'Standard contest mode with individual station contacts and realistic exchanges.' : 
               runnerMode === 'pileup' ?
                'Simulates multiple stations calling at once - great for pile-up training. (Coming soon)' :
                'Focused practice mode for learning contest exchanges with guided help. (Coming soon)'}
            </div>
          </div>
          
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`md:hidden p-2 px-3 rounded-lg border flex items-center gap-1 text-sm ${
              showHelp 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <Info size={16} />
            <span>Help</span>
          </button>
        </div>
      </div>
      
      {/* Quick Help Section */}
      {showHelp && (
        <div className="bg-gradient-to-r from-gray-800/40 via-gray-700/20 to-gray-800/40 rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-lg font-medium text-blue-300 mb-3 flex items-center">
            <Info size={18} className="mr-2" />
            Contest Runner Overview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 backdrop-blur-sm flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2 text-blue-300">
                <Award size={18} />
                <h4 className="font-medium">Contest Simulation</h4>
              </div>
              <p className="text-xs text-gray-300 flex-1">
                Practice realistic contest exchanges with randomly generated callsigns. Perfect for building head-copy skills and learning contest workflows.
              </p>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 backdrop-blur-sm flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2 text-green-300">
                <Zap size={18} />
                <h4 className="font-medium">Multiple Contest Types</h4>
              </div>
              <p className="text-xs text-gray-300 flex-1">
                Choose from different contest formats including Sprint, DX, Field Day and more. Each format has unique exchange requirements to master.
              </p>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50 backdrop-blur-sm flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2 text-purple-300">
                <Headphones size={18} />
                <h4 className="font-medium">Realistic Conditions</h4>
              </div>
              <p className="text-xs text-gray-300 flex-1">
                Optional filter noise, QSB, and other effects simulate real band conditions. Adjust the difficulty to match your skill level and gradually increase the challenge.
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => setShowHelp(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Close help
            </button>
          </div>
        </div>
      )}
      
      {/* Main Runner Component */}
      <div className="rounded-xl overflow-hidden border border-gray-700/50 shadow-xl">
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
      
      {/* Custom CSS for background pattern */}
      <style jsx>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};
