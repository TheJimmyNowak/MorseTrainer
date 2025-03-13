import React, { useState, useEffect, useCallback } from 'react';
import { morseAudio } from './MorseAudio';
import { LucideHeadphones, Activity, BarChart3, Radio, Flag, Clock, ChevronRight } from 'lucide-react';
import { InteractiveButton } from './InteractiveButton';
import { AnimatedSection } from './AnimatedSection';
import { HelpTooltip } from './HelpTooltip';

const CONTEST_TYPES = {
  SPRINT: {
    id: 'sprint',
    name: 'Sprint Contest',
    description: 'Exchange: Serial Nr, Name, QTH',
    formats: [
      '#NR {NAME} {STATE}',
      'NR #{NUMBER} {NAME} {STATE}',
      '{NAME} {STATE} #{NUMBER}'
    ]
  },
  DX: {
    id: 'dx',
    name: 'DX Contest',
    description: 'Exchange: RST + Zone',
    formats: [
      '5NN {ZONE}',
      'TU 5NN {ZONE}',
      'UR 5NN {ZONE}'
    ]
  },
  FIELD_DAY: {
    id: 'field_day',
    name: 'Field Day',
    description: 'Exchange: Class + Section',
    formats: [
      '{CLASS} {SECTION}',
      'R {CLASS} {SECTION}',
      'TU {CLASS} {SECTION}'
    ]
  },
  SIMPLE_QSO: {
    id: 'simple_qso',
    name: 'Simple QSO',
    description: 'Basic RST, Name, QTH exchange',
    formats: [
      'RST {RST} {NAME} {QTH}',
      'UR {RST} {NAME} {QTH}',
      '{NAME} {QTH} {RST}'
    ]
  }
};

// Generate random data for the exchange formats
const generateRandomData = () => {
  // Common names in ham radio and CW (shorter names are more common)
  const NAMES = ['JIM', 'BOB', 'TOM', 'JOHN', 'DAVE', 'MIKE', 'STEVE', 'RICK', 'BILL', 'DAN', 'JOE', 'KEN', 'AL', 'ED', 'ROB'];
  
  // US States abbreviations
  const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 
                  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
                  'VA', 'WA', 'WV', 'WI', 'WY'];

  // CQ zones for DX contests
  const ZONES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 
                '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
                '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
                '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'];
  
  // ARRL Sections for Field Day
  const SECTIONS = ['CT', 'EMA', 'ME', 'NH', 'RI', 'VT', 'WMA', 'ENY', 'NLI', 'NNJ', 'SNJ', 'WNY', 
                   'DE', 'EPA', 'MDC', 'WPA', 'AL', 'GA', 'KY', 'NC', 'SC', 'TN', 'VA', 'PR', 'VI',
                   'AR', 'LA', 'MS', 'NM', 'NTX', 'OK', 'STX', 'WTX', 'EB', 'LAX', 'ORG', 'SB', 
                   'SCV', 'SDG', 'SF', 'SJV', 'SV', 'PAC', 'AZ', 'EWA', 'ID', 'MT', 'NV', 'OR', 
                   'UT', 'WWA', 'WY', 'AK', 'MI', 'OH', 'WCF', 'IL', 'IN', 'WI', 'CO', 'IA', 
                   'KS', 'MN', 'MO', 'NE', 'ND', 'SD', 'MB', 'NWT', 'AB', 'BC', 'ON', 'QC', 'MAR'];
  
  // Field Day Classes
  const CLASSES = ['1A', '1B', '1C', '1D', '1E', '2A', '2B', '2C', '2D', '2E', '3A', '3B', '3C', '3D', '3E',
                  '4A', '4B', '4C', '4D', '4E', '5A', '5B', '5C', '5D', '5E', '6A', '7A', '8A', '9A'];
  
  // RST options - CW usually 5NN, but add some variations
  const RST_OPTIONS = ['5NN', '57N', '58N', '59N', '56N', '55N', '54N', '53N'];
  
  // Generate a random serial number between 1 and 999
  const number = Math.floor(Math.random() * 999) + 1;
  const paddedNumber = number.toString().padStart(3, '0');

  return {
    NAME: NAMES[Math.floor(Math.random() * NAMES.length)],
    STATE: STATES[Math.floor(Math.random() * STATES.length)],
    ZONE: ZONES[Math.floor(Math.random() * ZONES.length)],
    SECTION: SECTIONS[Math.floor(Math.random() * SECTIONS.length)],
    CLASS: CLASSES[Math.floor(Math.random() * CLASSES.length)],
    NUMBER: paddedNumber,
    RST: RST_OPTIONS[Math.floor(Math.random() * RST_OPTIONS.length)],
    QTH: STATES[Math.floor(Math.random() * STATES.length)] // Using states for QTH too
  };
};

// Generate random callsigns with weighted distribution
const generateRandomCallsign = () => {
  // US callsign prefixes (W, K, N, A) with frequencies
  const US_PREFIXES = ['W', 'K', 'N', 'A'];
  const PREFIX_WEIGHTS = [0.4, 0.4, 0.15, 0.05]; // W and K are more common
  
  // DX prefixes for international stations
  const DX_PREFIXES = ['VE', 'G', 'EA', 'DL', 'F', 'I', 'JA', 'PY', 'LU', 'ZL', 'VK'];
  
  // Numbers 0-9
  const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  // Suffix letters (1-3 characters)
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Choose between US (80%) and DX (20%) callsign
  let callsign = '';
  if (Math.random() < 0.8) {
    // Generate US callsign
    
    // Choose prefix based on weights
    const prefixIndex = weightedRandom(PREFIX_WEIGHTS);
    const prefix = US_PREFIXES[prefixIndex];
    
    // Add a region number (1-0)
    const region = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    
    // Add 1-3 letter suffix with higher probability for 2 or 3 letters
    const suffixLength = weightedRandomValue([1, 2, 3], [0.15, 0.5, 0.35]);
    
    let suffix = '';
    for (let i = 0; i < suffixLength; i++) {
      suffix += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
    }
    
    callsign = `${prefix}${region}${suffix}`;
  } else {
    // Generate DX callsign
    const prefix = DX_PREFIXES[Math.floor(Math.random() * DX_PREFIXES.length)];
    
    // Add a region number with 70% probability
    const hasNumber = Math.random() < 0.7;
    const region = hasNumber ? NUMBERS[Math.floor(Math.random() * NUMBERS.length)] : '';
    
    // Add 1-3 letter suffix
    const suffixLength = weightedRandomValue([1, 2, 3], [0.15, 0.5, 0.35]);
    
    let suffix = '';
    for (let i = 0; i < suffixLength; i++) {
      suffix += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
    }
    
    callsign = `${prefix}${region}${suffix}`;
  }
  
  return callsign;
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

// Format a message by replacing placeholders with actual data
const formatMessage = (format, data) => {
  let formatted = format;
  Object.keys(data).forEach(key => {
    formatted = formatted.replace(`{${key}}`, data[key]);
  });
  return formatted;
};

export const MorseRunner = ({ 
  wpm, 
  qsbAmount,
  farnsworthSpacing,
  frequency,
  filterNoiseEnabled,
  onFilterNoiseToggle
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
  
  // Optional configuration settings
  const [qsoRate, setQsoRate] = useState(5); // Time between QSOs in seconds
  const [sendDelay, setSendDelay] = useState(1); // Delay before sending in seconds
  const [showExchangePreview, setShowExchangePreview] = useState(true);
  
  // Initialize with a random callsign and report
  useEffect(() => {
    generateNewQso();
  }, [contestType]);
  
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
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const generateNewQso = () => {
    const newCallsign = generateRandomCallsign();
    setCurrentCallsign(newCallsign);
    
    // Generate exchange data for the contest type
    const newExchangeData = generateRandomData();
    setExchangeData(newExchangeData);
    
    // Choose a random format from the contest type
    const formats = contestType.formats;
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    
    // Format the exchange
    const formattedExchange = formatMessage(randomFormat, newExchangeData);
    setCurrentReport(formattedExchange);
    
    // Reset states for new QSO
    setCallsignReceived(false);
    setExchangeReceived(false);
    setInputMode('callsign');
    setUserInput('');
  };
  
  const startRunner = () => {
    setRunning(true);
    setQsos([]);
    setScore(0);
    setRunTime(0);
    generateNewQso();
    
    // Play the first callsign
    playSequence(currentCallsign);
  };
  
  const stopRunner = () => {
    setRunning(false);
    morseAudio.stop();
  };
  
  const playSequence = (sequence) => {
    if (!running) return;
    
    morseAudio.stop();
    setTimeout(() => {
      morseAudio.start();
      // Pass actual parameters from props
      morseAudio.playSequence(sequence, speed, farnsworthSpacing);
    }, sendDelay * 1000);
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
        setCallsignReceived(true);
        setInputMode('exchange');
        setUserInput('');
        
        // Play the exchange after a short delay
        setTimeout(() => {
          playSequence(currentReport);
        }, 500);
      } else {
        // Play the callsign again if wrong
        playSequence(currentCallsign);
      }
    } else {
      // Exchange mode - more lenient checking as exchanges can vary
      // Just check if they got the essential parts
      const essentialParts = getEssentialParts(contestType.id, exchangeData);
      const inputParts = userInput.trim().toUpperCase().split(/\s+/);
      
      // Check if all essential parts are included in the input
      const allPartsIncluded = essentialParts.every(part => 
        inputParts.some(inputPart => inputPart.includes(part))
      );
      
      if (allPartsIncluded) {
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
        
        // Generate a new QSO after a delay
        setTimeout(() => {
          generateNewQso();
          playSequence(currentCallsign);
        }, qsoRate * 1000);
      } else {
        // Play the exchange again if wrong
        playSequence(currentReport);
      }
      
      setUserInput('');
    }
  };
  
  const getEssentialParts = (contestType, data) => {
    switch (contestType) {
      case 'sprint':
        return [data.NUMBER, data.NAME, data.STATE];
      case 'dx':
        return [data.ZONE];
      case 'field_day':
        return [data.CLASS, data.SECTION];
      case 'simple_qso':
        return [data.RST, data.NAME, data.QTH];
      default:
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
  
  const handleContestTypeChange = (type) => {
    setContestType(CONTEST_TYPES[type]);
    // Reset the runner when changing contest type
    if (running) {
      stopRunner();
    }
  };
  
  return (
    <div className="space-y-6">
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
                    contestType.id === type.id 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {type.name}
                </InteractiveButton>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">{contestType.description}</div>
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
          <div className="bg-gray-700/50 p-4 rounded-lg">
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
