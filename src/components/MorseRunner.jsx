import React, { useState, useEffect, useCallback, useRef } from 'react';
import { morseAudio } from './MorseAudio';
import { filterNoise } from './FilterNoiseGenerator';
import { LucideHeadphones, Activity, BarChart3, Radio, Flag, Clock, ChevronRight } from 'lucide-react';
import { InteractiveButton } from './InteractiveButton';
import { AnimatedSection } from './AnimatedSection';
import { HelpTooltip } from './HelpTooltip';
import { generateRandomCallsign } from './CallsignGenerator';
import { CONTEST_TYPES, generateExchangeData, formatExchange } from './ContestExchange';
import { AlphaBanner } from './AlphaBanner';

// Format a message by replacing placeholders with actual data
const formatMessage = (format, data) => {
  return formatExchange(format, data);
};

// Generate random data for the exchange formats
const generateRandomData = () => {
  return generateExchangeData();
};

// Helper function for weighted random selection
function weightedRandom(weights) {
  let total = 0;
  const cumulative = weights.map(w => (total += w));
  const r = Math.random() * total;
  return cumulative.findIndex(w => r < w);
}

// Helper function for weighted random value
function weightedRandomValue(values, weights) {
  const index = weightedRandom(weights);
  return values[index];
}

export const MorseRunner = ({ 
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
  filterBandwidth
}) => {
  const [running, setRunning] = useState(false);
  const [contestType, setContestType] = useState(CONTEST_TYPES.SPRINT);
  const [speed, setSpeed] = useState(wpm);
  const [currentCallsign, setCurrentCallsign] = useState('');
  const [currentReport, setCurrentReport] = useState('');
  const [qsos, setQsos] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState('callsign'); // 'callsign' or 'exchange'
  const [callsignReceived, setCallsignReceived] = useState(false);
  const [exchangeReceived, setExchangeReceived] = useState(false);
  const [score, setScore] = useState(0);
  const [runTime, setRunTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [exchangeData, setExchangeData] = useState({});
  
  // State for runner notifications
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);
  
  // Optional configuration settings
  const [qsoRate, setQsoRate] = useState(5); // Time between QSOs in seconds
  const [sendDelay, setSendDelay] = useState(1); // Delay before sending in seconds
  const [showExchangePreview, setShowExchangePreview] = useState(true);
  
  // Show notification
  const showNotification = (message, color = 'blue', duration = 2000) => {
    // Clear any existing notification
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Set new notification
    setNotification({ message, color });
    
    // Set timeout to clear notification
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, duration);
  };
  
  // Clean up notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);
  
  // Initialize with a random callsign and report
  useEffect(() => {
    if (contestType) {
      generateNewQso();
    }
  }, [contestType]);
  
  // Effect to log when current callsign changes
  useEffect(() => {
    if (currentCallsign) {
      console.log("Current callsign updated to:", currentCallsign);
      console.log("Current report will be:", currentReport);
    }
  }, [currentCallsign, currentReport]);
  
  // Timer for the running time
  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setRunTime(prevTime => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [running]);
  
  useEffect(() => {
    if (filterNoiseEnabled && running) {
      // Initialize filter noise if needed
      try {
        filterNoise.initialize();
        
        // Configure filter noise parameters
        filterNoise.setVolume(radioNoiseVolume || 0.5);
        filterNoise.updateParameter('filterResonance', radioNoiseResonance || 25);
        filterNoise.updateParameter('warmth', radioNoiseWarmth || 8);
        filterNoise.updateParameter('driftSpeed', radioNoiseDrift || 0.5);
        filterNoise.updateParameter('atmosphericIntensity', radioNoiseAtmospheric || 0.5);
        filterNoise.updateParameter('crackleIntensity', radioNoiseCrackle || 0.05);
        filterNoise.updateParameter('filterBandwidth', filterBandwidth || 550);
        filterNoise.syncFrequency(frequency);
      } catch (error) {
        console.error("Error initializing filter noise in runner mode:", error);
      }
    }
  }, [filterNoiseEnabled, running, radioNoiseVolume, radioNoiseResonance, 
      radioNoiseWarmth, radioNoiseDrift, radioNoiseAtmospheric, 
      radioNoiseCrackle, filterBandwidth, frequency]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const generateNewQso = () => {
    const newCallsign = generateRandomCallsign();
    
    // Generate exchange data for the contest type
    const newExchangeData = generateRandomData();
    
    if (!contestType || !contestType.formats) {
      console.error("Invalid contest type in generateNewQso:", contestType);
      return; // Exit early if contest type is invalid
    }
    
    // Choose a random format from the contest type
    const formats = contestType.formats;
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    
    // Format the exchange
    const formattedExchange = formatExchange(randomFormat, newExchangeData);
    
    // Reset states for new QSO
    setCallsignReceived(false);
    setExchangeReceived(false);
    setInputMode('callsign');
    setUserInput('');
    
    // Set the state
    setCurrentCallsign(newCallsign);
    setExchangeData(newExchangeData);
    setCurrentReport(formattedExchange);
    
    console.log("Generated new QSO - Callsign:", newCallsign, "Exchange:", formattedExchange);
  };
  
  const startRunner = () => {
    console.log("Starting runner...");
    setRunning(true);
    setQsos([]);
    setScore(0);
    setRunTime(0);
    
    // Generate a new QSO first to ensure we have data
    const newCallsign = generateRandomCallsign();
    const newExchangeData = generateRandomData();
    
    // Make sure we have a valid contest type
    if (!contestType || !contestType.formats) {
      console.error("Invalid contest type:", contestType);
      setContestType(CONTEST_TYPES.SPRINT); // Fallback to sprint
      return; // Exit and let the effect handle it
    }
    
    const formats = contestType.formats;
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    const formattedExchange = formatExchange(randomFormat, newExchangeData);
    
    // Set state directly rather than calling generateNewQso to ensure
    // state is updated before playing audio
    setCurrentCallsign(newCallsign);
    setExchangeData(newExchangeData);
    setCurrentReport(formattedExchange);
    setCallsignReceived(false);
    setExchangeReceived(false);
    setInputMode('callsign');
    setUserInput('');
    
    console.log("Initial callsign:", newCallsign);
    console.log("Initial exchange:", formattedExchange);
    
    // Start the timer
    const interval = setInterval(() => {
      setRunTime(prevTime => prevTime + 1);
    }, 1000);
    setTimerInterval(interval);
    
    // Initialize audio directly and immediately
    const callsignToPlay = newCallsign; // Keep a reference to avoid state sync issues
    
    // Initialize audio IMMEDIATELY without delay
    try {
      // Stop any existing audio
      morseAudio.stop();
      if (filterNoiseEnabled) filterNoise.stop();
      
      // Initialize the audio engine
      morseAudio.initialize();
      morseAudio.setFrequency(frequency);
      morseAudio.setQsbAmount(qsbAmount);
      morseAudio.start();
      
      console.log("Starting audio playback IMMEDIATELY:", callsignToPlay);
      // Play sequence directly
      morseAudio.playSequence(callsignToPlay, speed, farnsworthSpacing);
      
      // Start filter noise if enabled
      if (filterNoiseEnabled) {
        // Initialize filter noise
        filterNoise.initialize();
        filterNoise.syncFrequency(frequency);
        filterNoise.setMorseAudioVolume(morseAudio.getCurrentVolume());
        // Configure filter noise parameters
        filterNoise.setVolume(radioNoiseVolume || 0.5);
        filterNoise.updateParameter('filterResonance', radioNoiseResonance || 25);
        filterNoise.updateParameter('warmth', radioNoiseWarmth || 8);
        filterNoise.updateParameter('driftSpeed', radioNoiseDrift || 0.5);
        filterNoise.updateParameter('atmosphericIntensity', radioNoiseAtmospheric || 0.5);
        filterNoise.updateParameter('crackleIntensity', radioNoiseCrackle || 0.05);
        filterNoise.updateParameter('filterBandwidth', filterBandwidth || 550);
        // Start the filter noise
        filterNoise.start();
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
      
      // FALLBACK - try after a short delay (500ms)
      setTimeout(() => {
        try {
          console.log("Trying delayed audio start as fallback");
          morseAudio.initialize();
          morseAudio.setFrequency(frequency);
          morseAudio.setQsbAmount(qsbAmount);
          morseAudio.start();
          morseAudio.playSequence(callsignToPlay, speed, farnsworthSpacing);
          
          if (filterNoiseEnabled) {
            filterNoise.initialize();
            filterNoise.syncFrequency(frequency);
            filterNoise.setMorseAudioVolume(morseAudio.getCurrentVolume());
            filterNoise.start();
          }
        } catch (fallbackError) {
          console.error("Fallback audio start also failed:", fallbackError);
        }
      }, 500);
    }
  };
  
  const stopRunner = () => {
    setRunning(false);
    morseAudio.stop();
    if (filterNoiseEnabled) filterNoise.stop();
  };
  
  const playSequence = (sequence) => {
    if (!running) return;
    
    try {
      // Stop any existing audio
      morseAudio.stop();
      if (filterNoiseEnabled) filterNoise.stop();
      
      // Store the sequence to play to avoid state issues
      const sequenceToPlay = sequence;
      
      setTimeout(() => {
        try {
          // Initialize audio for runner mode
          morseAudio.initialize();
          morseAudio.setFrequency(frequency);
          morseAudio.setQsbAmount(qsbAmount);
          morseAudio.start();
          
          // Play the sequence with provided settings
          console.log("Playing sequence:", sequenceToPlay, speed, farnsworthSpacing);
          morseAudio.playSequence(sequenceToPlay, speed, farnsworthSpacing);
          
          // Start filter noise if enabled
          if (filterNoiseEnabled) {
            // Make sure filter noise is initialized and configured
            filterNoise.initialize();
            filterNoise.syncFrequency(frequency);
            filterNoise.setMorseAudioVolume(morseAudio.getCurrentVolume());
            filterNoise.setVolume(radioNoiseVolume || 0.5);
            filterNoise.start();
          }
        } catch (error) {
          console.error("Error playing sequence:", error);
        }
      }, sendDelay * 1000);
    } catch (error) {
      console.error("Error preparing to play sequence:", error);
    }
  };
  
  const handleInput = (e) => {
    if (!running) return;
    
    if (e.key === 'Enter') {
      submitInput();
    } else {
      setUserInput(e.target.value.toUpperCase());
    }
  };
  
  const submitInput = () => {
    if (!running || !userInput.trim()) return;
    
    if (inputMode === 'callsign') {
      // Check if callsign is correct (case insensitive)
      const isCorrect = userInput.trim().toUpperCase() === currentCallsign.toUpperCase();
      
      if (isCorrect) {
        // Show success notification
        showNotification(`Correct callsign: ${currentCallsign}! Now copy the exchange.`, 'green');
        
        setCallsignReceived(true);
        setInputMode('exchange');
        setUserInput('');
        
        // Play the exchange after a short delay
        setTimeout(() => {
          playSequence(currentReport);
        }, 500);
      } else {
        // Show error notification
        showNotification(`Wrong callsign! Expected: ${currentCallsign}. Sending again...`, 'red');
        
        // Play the callsign again if wrong
        playSequence(currentCallsign);
      }
    } else {
      // Exchange mode - using a more lenient approach for validation
      const userInputUpper = userInput.trim().toUpperCase();
      
      // Get the critical exchange information based on contest type
      const contestId = contestType?.id || 'sprint';
      
      let isCorrect = false;
      
      console.log("Checking exchange:", userInputUpper);
      console.log("Contest type:", contestId);
      console.log("Exchange data:", exchangeData);
      
      // Specific validation for each contest type
      switch (contestId) {
        case 'sprint':
          // Need: number, name, and state
          const hasNumber = userInputUpper.includes(exchangeData.NUMBER) || 
                            userInputUpper.includes('#') || 
                            userInputUpper.includes('NR');
          const hasName = userInputUpper.includes(exchangeData.NAME);
          const hasState = userInputUpper.includes(exchangeData.STATE);
          isCorrect = hasNumber && hasName && hasState;
          console.log("Sprint validation:", {hasNumber, hasName, hasState, isCorrect});
          break;
          
        case 'dx':
          // Just need the zone
          isCorrect = userInputUpper.includes(exchangeData.ZONE);
          console.log("DX validation:", {hasZone: isCorrect});
          break;
          
        case 'field_day':
          // Need class and section
          const hasClass = userInputUpper.includes(exchangeData.CLASS);
          const hasSection = userInputUpper.includes(exchangeData.SECTION);
          isCorrect = hasClass && hasSection;
          console.log("Field Day validation:", {hasClass, hasSection, isCorrect});
          break;
          
        case 'simple_qso':
          // Need RST, name, and QTH
          const hasRST = userInputUpper.includes(exchangeData.RST) || 
                        userInputUpper.includes('5NN') || 
                        userInputUpper.includes('599');
          const hasQsoName = userInputUpper.includes(exchangeData.NAME);
          const hasQTH = userInputUpper.includes(exchangeData.QTH);
          isCorrect = hasRST && hasQsoName && hasQTH;
          console.log("Simple QSO validation:", {hasRST, hasQsoName, hasQTH, isCorrect});
          break;
          
        default:
          // Generic validation - just check if they typed something
          isCorrect = userInputUpper.length > 0;
          console.log("Default validation - accepting any input");
      }
      
      if (isCorrect) {
        // Show success notification
        showNotification(`Correct exchange! QSO complete with ${currentCallsign}`, 'green');
        
        setExchangeReceived(true);
        
        // Add the completed QSO to the log
        const newQso = {
          callsign: currentCallsign,
          exchange: currentReport,
          time: new Date().toISOString(),
          userInput: userInput
        };
        
        setQsos(prevQsos => [newQso, ...prevQsos]);
        setScore(prevScore => prevScore + 1);
        
        // Generate a new QSO
        const newCallsign = generateRandomCallsign();
        const newExchangeData = generateRandomData();
        
        if (!contestType || !contestType.formats) {
          console.error("Invalid contest type in submitInput:", contestType);
          return; // Exit early if contest type is invalid
        }
        
        const formats = contestType.formats;
        const randomFormat = formats[Math.floor(Math.random() * formats.length)];
        const formattedExchange = formatExchange(randomFormat, newExchangeData);
        
        // Reset states for new QSO
        setCallsignReceived(false);
        setExchangeReceived(false);
        setInputMode('callsign');
        setUserInput('');
        
        // Set the new QSO data
        setCurrentCallsign(newCallsign);
        setExchangeData(newExchangeData);
        setCurrentReport(formattedExchange);
        
        console.log("Next QSO - Callsign:", newCallsign, "Exchange:", formattedExchange);
        
        // Start the next QSO after delay
        setTimeout(() => {
          if (newCallsign) {
            playSequence(newCallsign);
          }
        }, qsoRate * 1000);
      } else {
        // Show error notification
        showNotification(`Wrong exchange! Expected: ${currentReport}. Sending again...`, 'red');
        
        // Play the exchange again if wrong
        playSequence(currentReport);
      }
      
      setUserInput('');
    }
  };
  
  const getEssentialParts = (contestType, data) => {
    console.log("Getting essential parts for contest type:", contestType);
    console.log("Data available:", data);
    
    // Default to empty array if any issue occurs
    if (!contestType || !data) return [];
    
    switch (contestType) {
      case 'sprint':
        return [data.NUMBER, data.NAME, data.STATE].filter(Boolean);
      case 'dx':
        return [data.ZONE].filter(Boolean);
      case 'field_day':
        return [data.CLASS, data.SECTION].filter(Boolean);
      case 'simple_qso':
        return [data.RST, data.NAME, data.QTH].filter(Boolean);
      default:
        console.log("Unknown contest type for essential parts:", contestType);
        return [];
    }
  };
  
  const repeatCurrentAudio = () => {
    if (inputMode === 'callsign') {
      playSequence(currentCallsign);
    } else {
      playSequence(currentReport);
    }
  };
  
  const handleSpeedChange = (delta) => {
    const newSpeed = Math.max(5, Math.min(50, speed + delta));
    setSpeed(newSpeed);
  };
  
  const handleContestTypeChange = (contestId) => {
    console.log("Changing contest type to:", contestId);
    const newContestType = Object.values(CONTEST_TYPES).find(ct => ct.id === contestId);
    
    if (newContestType) {
      console.log("Found contest type:", newContestType.name);
      setContestType(newContestType);
      
      // Reset the runner when changing contest type
      if (running) {
        stopRunner();
      }
    } else {
      console.error("Contest type not found:", contestId);
    }
  };
  
  return (
    <div className="space-y-6">
      <AlphaBanner />
      <AnimatedSection title="Morse Runner" icon={Radio} defaultOpen={true}>
        <div className="space-y-6">
          {/* Contest Type Selection */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-300 mb-3">Contest Type</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CONTEST_TYPES).map((type) => (
                <InteractiveButton
                  key={type.id}
                  onClick={() => handleContestTypeChange(type.id)}
                  className={`px-4 py-2 rounded text-center text-sm ${
                    contestType && contestType.id === type.id 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {type.name}
                </InteractiveButton>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">{contestType?.description || ''}</div>
          </div>

          {/* Runner Controls */}
          <div className="bg-gray-700/50 p-4 rounded-lg relative">
            <HelpTooltip 
              description="Morse Runner simulates a contest environment with callsigns and exchanges. First copy the callsign, then copy the exchange. Press RETURN after each entry."
            />
            <div className="grid grid-cols-2 gap-3">
              <InteractiveButton
                onClick={running ? stopRunner : startRunner}
                className={`py-3 rounded-lg font-medium ${
                  running 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {running ? 'Stop Runner' : 'Start Runner'}
              </InteractiveButton>
              
              <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-lg font-mono">{formatTime(runTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag size={18} className="text-green-400" />
                  <span className="text-lg font-mono">{score}</span>
                </div>
              </div>
              
              {/* Speed Control */}
              <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div className="text-sm text-gray-400">Speed</div>
                <div className="flex items-center gap-2">
                  <InteractiveButton
                    onClick={() => handleSpeedChange(-2)}
                    className="w-8 h-8 rounded bg-gray-600 text-sm"
                    disabled={speed <= 5}
                  >-</InteractiveButton>
                  <span className="text-lg font-mono w-10 text-center">{speed}</span>
                  <InteractiveButton
                    onClick={() => handleSpeedChange(2)}
                    className="w-8 h-8 rounded bg-gray-600 text-sm"
                    disabled={speed >= 50}
                  >+</InteractiveButton>
                </div>
              </div>
              
              <InteractiveButton
                onClick={repeatCurrentAudio}
                className="py-3 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <LucideHeadphones size={18} />
                <span>Repeat</span>
              </InteractiveButton>
            </div>
          </div>

          {/* Current QSO */}
          <div className="bg-gray-700/50 p-4 rounded-lg relative">
            <div className="text-sm text-gray-300 mb-2">
              {inputMode === 'callsign' ? 'Copy Callsign' : 'Copy Exchange'}
            </div>
            <div className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && submitInput()}
                disabled={!running}
                placeholder={
                  inputMode === 'callsign' 
                    ? 'Enter callsign...' 
                    : 'Enter exchange...'
                }
                className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-xl focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
              <button
                onClick={submitInput}
                disabled={!running || !userInput.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            {notification && (
              <div className={`mt-2 p-2 rounded-md text-white text-center ${
                notification.color === 'red' ? 'bg-red-500' : 
                notification.color === 'green' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}>
                {notification.message}
              </div>
            )}
            {showExchangePreview && !running && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700 text-sm text-gray-400">
                <div className="font-medium text-gray-300 mb-1">Preview:</div>
                <div className="font-mono">Callsign: {currentCallsign}</div>
                <div className="font-mono">Exchange: {currentReport}</div>
              </div>
            )}
          </div>

          {/* QSO Log */}
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">QSO Log</div>
            <div className="max-h-64 overflow-y-auto bg-gray-800 rounded border border-gray-700">
              {qsos.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-900/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Time</th>
                      <th className="p-2 text-left">Callsign</th>
                      <th className="p-2 text-left">Exchange</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qsos.map((qso, index) => {
                      const date = new Date(qso.time);
                      const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                      
                      return (
                        <tr key={index} className="border-t border-gray-700">
                          <td className="p-2 font-mono">{time}</td>
                          <td className="p-2 font-mono">{qso.callsign}</td>
                          <td className="p-2 font-mono">{qso.exchange}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No QSOs logged yet. Start the runner to begin.
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>
      
      <AnimatedSection title="Settings" icon={BarChart3} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">QSO Rate (seconds)</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => setQsoRate(Math.max(2, qsoRate - 1))}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={qsoRate <= 2}
              >-</InteractiveButton>
              <div className="flex-1">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (qsoRate / 15) * 100)}%` }}
                  />
                </div>
                <div className="text-center mt-1">{qsoRate} seconds</div>
              </div>
              <InteractiveButton
                onClick={() => setQsoRate(Math.min(15, qsoRate + 1))}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={qsoRate >= 15}
              >+</InteractiveButton>
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Send Delay (seconds)</div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => setSendDelay(Math.max(0.5, sendDelay - 0.5))}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={sendDelay <= 0.5}
              >-</InteractiveButton>
              <div className="flex-1">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (sendDelay / 5) * 100)}%` }}
                  />
                </div>
                <div className="text-center mt-1">{sendDelay} seconds</div>
              </div>
              <InteractiveButton
                onClick={() => setSendDelay(Math.min(5, sendDelay + 0.5))}
                className="w-10 h-10 rounded bg-gray-600"
                disabled={sendDelay >= 5}
              >+</InteractiveButton>
            </div>
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Show Exchange Preview</div>
            <InteractiveButton
              onClick={() => setShowExchangePreview(!showExchangePreview)}
              className={`w-full px-4 py-2 rounded transition-colors ${
                showExchangePreview ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {showExchangePreview ? 'Enabled' : 'Disabled'}
            </InteractiveButton>
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-sm mb-2">Radio Noise</div>
            <InteractiveButton
              onClick={onFilterNoiseToggle}
              className={`w-full px-4 py-2 rounded transition-colors ${
                filterNoiseEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {filterNoiseEnabled ? 'Enabled' : 'Disabled'}
            </InteractiveButton>
          </div>
        </div>
      </AnimatedSection>
      
      <AnimatedSection title="Help" icon={Activity} defaultOpen={false}>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-medium mb-2">How to Use Morse Runner</h3>
            <p>
              Morse Runner simulates a contest or pile-up environment where you need to:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Copy a callsign sent in Morse code</li>
              <li>Enter the callsign and press ENTER or click the button</li>
              <li>Copy the exchange information</li>
              <li>Enter the exchange and press ENTER</li>
              <li>A new callsign will be sent after a short delay</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Contest Types</h3>
            <p className="mb-2">
              Different contest formats have different exchange formats:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Sprint Contest:</strong> Serial number, name, and state</li>
              <li><strong>DX Contest:</strong> Signal report (usually 5NN) and zone number</li>
              <li><strong>Field Day:</strong> Station class and ARRL section</li>
              <li><strong>Simple QSO:</strong> Basic RST, name, and QTH exchange</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Tips for Success</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Start with slower speeds and work your way up</li>
              <li>For exchanges, you only need to copy the essential information</li>
              <li>Use the "Repeat" button if you missed part of the transmission</li>
              <li>Practice regularly to improve your head-copy skills</li>
              <li>Try enabling radio noise to simulate real band conditions</li>
            </ul>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};
