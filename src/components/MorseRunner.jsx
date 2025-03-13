import React, { useState, useEffect, useCallback, useRef } from 'react';
import { morseAudio } from './MorseAudio';
import { filterNoise } from './FilterNoiseGenerator';
import {
  Headphones,
  Activity,
  BarChart3,
  Radio,
  Flag,
  Clock,
  ChevronRight,
  AlertTriangle,
  Info,
  Volume2
} from 'lucide-react';
import { InteractiveButton } from './InteractiveButton';
import { AnimatedSection } from './AnimatedSection';
import { HelpTooltip } from './HelpTooltip';
import { generateRandomCallsign } from './CallsignGenerator';
import { CONTEST_TYPES, generateExchangeData, formatExchange } from './ContestExchange';

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
  filterBandwidth,
  onRunningChange
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

  // Additional refs to keep track of timeouts
  const delayTimeoutRef = useRef(null);
  const qsoTimeoutRef = useRef(null);

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

  // Clean up all resources
  const cleanupResources = useCallback(() => {
    // Stop audio
    morseAudio.stop();
    if (filterNoiseEnabled) filterNoise.stop();

    // Clear all timeouts
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }

    if (qsoTimeoutRef.current) {
      clearTimeout(qsoTimeoutRef.current);
      qsoTimeoutRef.current = null;
    }
  }, [filterNoiseEnabled, timerInterval]);

  // Clean up notification timeout on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

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

      // Notify parent component
      if (onRunningChange) {
        onRunningChange(true);
      }
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // Notify parent component
      if (onRunningChange) {
        onRunningChange(false);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [running, onRunningChange]);

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
      delayTimeoutRef.current = setTimeout(() => {
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
    console.log("Stopping runner...");
    setRunning(false);
    cleanupResources();
  };

  const playSequence = (sequence) => {
    if (!running) return;

    try {
      // Stop any existing audio
      morseAudio.stop();
      if (filterNoiseEnabled) filterNoise.stop();

      // Store the sequence to play to avoid state issues
      const sequenceToPlay = sequence;

      // Clear any existing timeout
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }

      delayTimeoutRef.current = setTimeout(() => {
        if (!running) return; // Check if still running

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
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current);
        }

        delayTimeoutRef.current = setTimeout(() => {
          if (running) {
            playSequence(currentReport);
          }
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

        // Clear existing timeout
        if (qsoTimeoutRef.current) {
          clearTimeout(qsoTimeoutRef.current);
        }

        // Start the next QSO after delay
        qsoTimeoutRef.current = setTimeout(() => {
          if (running && newCallsign) {
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
    if (!running) return;

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
      {/* Main Contest Area */}
      <AnimatedSection title="Contest Operation" icon={Radio} defaultOpen={true}>
        <div className="space-y-5">
          {/* Contest Type Selection - Redesigned */}
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-xl overflow-hidden shadow-lg">
            <div className="border-b border-gray-700/50 px-4 py-3 bg-gray-800/50 flex justify-between items-center">
              <div className="text-sm font-medium text-gray-200 flex items-center">
                <Flag size={16} className="mr-2 text-blue-400" />
                Contest Type
              </div>
              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/30">
                {contestType?.id || 'sprint'}
              </div>
            </div>

            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.values(CONTEST_TYPES).map((type) => (
                <InteractiveButton
                  key={type.id}
                  onClick={() => handleContestTypeChange(type.id)}
                  className={`px-3 py-3 rounded-lg text-center text-sm font-medium shadow transition-all duration-200 ${
                    contestType && contestType.id === type.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white ring-2 ring-blue-500/50 ring-offset-1 ring-offset-gray-800'
                      : 'bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 hover:text-white'
                  }`}
                >
                  {type.name}
                </InteractiveButton>
              ))}
            </div>

            <div className="px-4 py-2 text-xs text-gray-400 bg-gray-800/30 border-t border-gray-700/30">
              {contestType?.description || ''}
            </div>
          </div>

          {/* Runner Controls - Fancy redesign */}
          <div className="bg-gradient-to-b from-gray-800/90 to-gray-700/70 rounded-xl shadow-lg relative overflow-hidden border border-gray-700/50">
            <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>

            <div className="relative p-4">
              <HelpTooltip
                description="Morse Runner simulates a contest environment with callsigns and exchanges. First copy the callsign, then copy the exchange. Press RETURN after each entry."
              />

              {/* Stats Bar - More fancy dashboard style */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center">
                      <Clock size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Time</div>
                      <div className="text-lg font-mono text-white">{formatTime(runTime)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center">
                      <Flag size={18} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">QSOs</div>
                      <div className="text-lg font-mono text-white">{score}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center">
                        <Volume2 size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">WPM</div>
                        <div className="text-lg font-mono text-white">{speed}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <InteractiveButton
                        onClick={() => handleSpeedChange(-2)}
                        className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                        disabled={speed <= 5}
                      >-</InteractiveButton>
                      <InteractiveButton
                        onClick={() => handleSpeedChange(2)}
                        className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-sm ml-1"
                        disabled={speed >= 50}
                      >+</InteractiveButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Buttons - Fancy gradient style */}
              <div className="flex flex-col sm:flex-row gap-3">
                <InteractiveButton
                  onClick={running ? stopRunner : startRunner}
                  className={`flex-1 py-4 px-6 rounded-lg font-medium text-white shadow-lg border transition-all duration-200 ${
                    running
                      ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border-red-500/50'
                      : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 border-green-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {running ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="4" width="4" height="16"></rect>
                          <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                        <span>Stop Contest</span>
                      </>
                    ) : (
                      <>
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>Start Contest</span>
                      </>
                    )}
                  </div>
                </InteractiveButton>

                <InteractiveButton
                  onClick={repeatCurrentAudio}
                  className="flex-1 py-4 px-6 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg border border-blue-500/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:from-gray-700 disabled:to-gray-600 disabled:border-gray-600/50"
                  disabled={!running}
                >
                  <Headphones size={18} />
                  <span>Repeat {inputMode === 'callsign' ? 'Callsign' : 'Exchange'}</span>
                </InteractiveButton>
              </div>
            </div>
          </div>

          <style jsx>{`
            .bg-circuit-pattern {
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23a0aec0' fill-opacity='0.15' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zm-48-50a5 5 0 1 1 0-2h32v-36h-32a5 5 0 1 1 0-2h32V64h-32a5 5 0 1 1 0-2h32v-42z'%3E%3C/path%3E%3C/svg%3E");
            }
          `}</style>

          {/* Current QSO Input - Fancy redesign */}
          <div className="bg-gradient-to-b from-gray-800/90 to-gray-900/70 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
            <div className="border-b border-gray-700/50 px-4 py-2.5 bg-gray-800/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  inputMode === 'callsign'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                    : 'bg-purple-900/30 text-purple-400 border border-purple-500/30'
                }`}>
                  {inputMode === 'callsign' ? 'Copy Callsign' : 'Copy Exchange'}
                </div>
                <span className="text-xs text-gray-400">
                  {inputMode === 'callsign'
                    ? 'Enter the station callsign you hear'
                    : `Enter the ${contestType?.name || ''} exchange information`}
                </span>
              </div>
              {running && (
                <div className="hidden sm:flex items-center">
                  <div className="relative h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                  <span className="ml-2 text-xs text-gray-400">LIVE</span>
                </div>
              )}
            </div>

            <div className="p-4">
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
                  className="w-full py-4 px-4 bg-gray-900/80 border border-gray-700 rounded-lg text-white font-mono text-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-60 transition-all duration-200"
                />
                <button
                  onClick={submitInput}
                  disabled={!running || !userInput.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-700 transition-all duration-200 shadow-md"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {notification && (
                <div className={`mt-3 p-3 rounded-lg text-white ${
                  notification.color === 'red'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 border border-red-500/50' :
                  notification.color === 'green'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 border border-green-500/50' :
                    'bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-500/50'
                }`}>
                  <div className="flex items-center gap-2">
                    {notification.color === 'red' ? (
                      <AlertTriangle size={18} />
                    ) : notification.color === 'green' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    ) : (
                      <Info size={18} />
                    )}
                    <span>{notification.message}</span>
                  </div>
                </div>
              )}

              {showExchangePreview && !running && (
                <div className="mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-sm text-gray-400">
                  <div className="font-medium text-gray-300 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-blue-400">
                      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Preview Mode
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Callsign:</span>
                        <span className="font-mono text-blue-300">{currentCallsign}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Exchange:</span>
                        <span className="font-mono text-purple-300">{currentReport}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QSO Log - Redesigned with fancy styling */}
          <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
            <div className="border-b border-gray-700/50 px-4 py-2.5 bg-gray-800/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="font-medium text-sm text-gray-200">QSO Log</span>
              </div>
              <div className="flex items-center">
                <div className="px-2 py-0.5 rounded-full bg-gray-700/70 text-xs text-gray-300">
                  {qsos.length} QSOs
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {qsos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Callsign</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Exchange</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {qsos.map((qso, index) => {
                        const date = new Date(qso.time);
                        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                        return (
                          <tr
                            key={index}
                            className="hover:bg-gray-800/30 transition-colors duration-150"
                          >
                            <td className="p-3 font-mono text-gray-300">{time}</td>
                            <td className="p-3 font-mono font-medium text-blue-300">{qso.callsign}</td>
                            <td className="p-3 font-mono text-gray-300 hidden sm:table-cell">{qso.exchange}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-gray-500 opacity-50">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12h8"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                  <p className="font-medium text-gray-500">No QSOs logged yet</p>
                  <p className="text-xs text-gray-600 mt-1">Start the contest to begin logging contacts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection title="Settings" icon={BarChart3} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 p-4 rounded-lg border border-gray-700/40 shadow-md">
            <div className="text-sm mb-2 flex items-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-blue-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              QSO Rate (seconds)
            </div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => setQsoRate(Math.max(2, qsoRate - 1))}
                className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-sm"
                disabled={qsoRate <= 2}
              >-</InteractiveButton>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-2 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (qsoRate / 15) * 100)}%` }}
                  />
                </div>
                <div className="text-center mt-1 text-gray-300 font-medium">{qsoRate} seconds</div>
              </div>
              <InteractiveButton
                onClick={() => setQsoRate(Math.min(15, qsoRate + 1))}
                className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-sm"
                disabled={qsoRate >= 15}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 p-4 rounded-lg border border-gray-700/40 shadow-md">
            <div className="text-sm mb-2 flex items-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-green-400">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
              Send Delay (seconds)
            </div>
            <div className="flex items-center gap-2">
              <InteractiveButton
                onClick={() => setSendDelay(Math.max(0.5, sendDelay - 0.5))}
                className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-sm"
                disabled={sendDelay <= 0.5}
              >-</InteractiveButton>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-2 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (sendDelay / 5) * 100)}%` }}
                  />
                </div>
                <div className="text-center mt-1 text-gray-300 font-medium">{sendDelay} seconds</div>
              </div>
              <InteractiveButton
                onClick={() => setSendDelay(Math.min(5, sendDelay + 0.5))}
                className="w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 border border-gray-600 shadow-sm"
                disabled={sendDelay >= 5}
              >+</InteractiveButton>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 p-4 rounded-lg border border-gray-700/40 shadow-md">
            <div className="text-sm mb-2 flex items-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-yellow-400">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Show Exchange Preview
            </div>
            <InteractiveButton
              onClick={() => setShowExchangePreview(!showExchangePreview)}
              className={`w-full px-4 py-3 rounded-lg font-medium border shadow-sm transition-all duration-200 ${
                showExchangePreview
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-blue-500/50'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
              }`}
            >
              {showExchangePreview ? 'Enabled' : 'Disabled'}
            </InteractiveButton>
          </div>

          <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 p-4 rounded-lg border border-gray-700/40 shadow-md">
            <div className="text-sm mb-2 flex items-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-purple-400">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Radio Noise
            </div>
            <InteractiveButton
              onClick={onFilterNoiseToggle}
              className={`w-full px-4 py-3 rounded-lg font-medium border shadow-sm transition-all duration-200 ${
                filterNoiseEnabled
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-purple-500/50'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
              }`}
            >
              {filterNoiseEnabled ? 'Enabled' : 'Disabled'}
            </InteractiveButton>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection title="Help" icon={Info} defaultOpen={false}>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Radio size={18} className="text-blue-400 mr-2" />
              How to Use Morse Runner
            </h3>
            <ol className="list-decimal ml-5 space-y-2 mt-2">
              <li>Begin by pressing the <span className="bg-green-500/20 text-green-300 px-1 rounded">Start Contest</span> button</li>
              <li>Listen carefully to the callsign sent in Morse code</li>
              <li>Type the callsign in the input field and press ENTER</li>
              <li>After correct callsign entry, listen for the exchange information</li>
              <li>Enter the exchange details and press ENTER</li>
              <li>After a short delay, a new callsign will be sent</li>
            </ol>
          </div>

          <div className="border-t border-gray-700/30 pt-3">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Flag size={18} className="text-blue-400 mr-2" />
              Contest Types
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2 mt-1">•</span>
                <div>
                  <strong className="text-blue-300">Sprint Contest:</strong>
                  <p className="text-xs text-gray-400">Serial number, name, and state</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2 mt-1">•</span>
                <div>
                  <strong className="text-blue-300">DX Contest:</strong>
                  <p className="text-xs text-gray-400">Signal report (5NN) and zone number</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2 mt-1">•</span>
                <div>
                  <strong className="text-blue-300">Field Day:</strong>
                  <p className="text-xs text-gray-400">Station class and ARRL section</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2 mt-1">•</span>
                <div>
                  <strong className="text-blue-300">Simple QSO:</strong>
                  <p className="text-xs text-gray-400">RST, name, and QTH exchange</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-700/30 pt-3">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Activity size={18} className="text-blue-400 mr-2" />
              Tips for Success
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <li className="flex items-center text-sm bg-gray-800/40 p-2 rounded border border-gray-700/30">
                <span className="text-blue-400 mr-2">•</span>
                Start with slower speeds (10-15 WPM)
              </li>
              <li className="flex items-center text-sm bg-gray-800/40 p-2 rounded border border-gray-700/30">
                <span className="text-blue-400 mr-2">•</span>
                Use the Repeat button if you missed anything
              </li>
              <li className="flex items-center text-sm bg-gray-800/40 p-2 rounded border border-gray-700/30">
                <span className="text-blue-400 mr-2">•</span>
                For exchanges, focus on the essential information
              </li>
              <li className="flex items-center text-sm bg-gray-800/40 p-2 rounded border border-gray-700/30">
                <span className="text-blue-400 mr-2">•</span>
                Regular practice improves head-copy skills
              </li>
              <li className="flex items-center text-sm bg-gray-800/40 p-2 rounded border border-gray-700/30">
                <span className="text-blue-400 mr-2">•</span>
                Enable radio noise for realistic conditions
              </li>
              <li className="flex items-center text-sm bg-gray-800/40 p-2 rounded border border-gray-700/30">
                <span className="text-blue-400 mr-2">•</span>
                Increase QSO rate as your skills improve
              </li>
            </ul>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};