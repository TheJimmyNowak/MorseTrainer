import React, { useState, useEffect } from 'react';
import { MorseRunner } from './MorseRunner';
import { Settings, Radio } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { InteractiveButton } from './InteractiveButton';

// This component serves as the integration point between the Morse Trainer 
// and Morse Runner, allowing them to share settings and audio resources
export const MorseRunnerController = ({ 
  wpm, 
  qsbAmount,
  farnsworthSpacing,
  frequency,
  filterNoiseEnabled,
  onFilterNoiseToggle,
  morseSettings = {} // Optional settings from main application
}) => {
  const [showRunner, setShowRunner] = useState(false);
  const [runnerMode, setRunnerMode] = useState('normal'); // 'normal', 'pileup', 'practice'
  
  return (
    <div className="space-y-6">
      <AnimatedSection title="Morse Runner Mode" icon={Radio} defaultOpen={true}>
        <div className="text-gray-300 text-sm mb-4">
          <p>Morse Runner simulates contest and pile-up conditions to help you build real-world CW operating skills.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <InteractiveButton
            onClick={() => setShowRunner(!showRunner)}
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
              runnerMode={runnerMode}
            />
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};
