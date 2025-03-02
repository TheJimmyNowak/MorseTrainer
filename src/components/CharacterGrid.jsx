import { InteractiveButton } from './InteractiveButton';
import { SEQUENCE_PRESETS } from './MorseSequences';

export const CharacterGrid = ({ availableChars, onCharacterInput, currentPreset }) => {
  let numberToLetter = {};

  let chars = Array.isArray(availableChars) ? availableChars : availableChars.split('');
  if (currentPreset?.id === 'cut_numbers') {
    const mappedChars = chars.map(c => SEQUENCE_PRESETS.CUT_NUMBERS.translation[c] || c);
    for (const c of mappedChars) {
      numberToLetter[c] = Object.entries(SEQUENCE_PRESETS.CUT_NUMBERS.translation)
        .filter(([k, v]) => v === c && chars.includes(k))
        .map(([k]) => k)
        .join(',')
    }
    chars = mappedChars;
  } 
  chars = [...new Set(chars.join('').replace(/[\s\uFE26]+/g, '').split(''))].sort();

  return (
      <div className="flex flex-wrap gap-2 justify-center">
        {chars.map((char, index) => (
          <GridButton 
            key={`${char}-${index}`}
            onClick={() => onCharacterInput(char)}
          >
            {char}
            {currentPreset?.id === 'cut_numbers' && numberToLetter[char] && (
              <span className="text-sm text-gray-400 ml-2">({numberToLetter[char]})</span>
            )}
          </GridButton>
        ))}
        <GridButton key="backspace" onClick={() => onCharacterInput('\u232B')}>
          {'\u232B'}
        </GridButton>
      </div>
  );
};

const GridButton = ({ children, onClick }) => {
  return (
    <InteractiveButton
      onClick={onClick}
      className="min-w-16 h-14 px-4 flex items-center justify-center
                bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                rounded-lg text-lg font-mono font-semibold transition-all duration-200
                shadow-lg hover:shadow-xl transform hover:scale-105
                focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      {children}
    </InteractiveButton>
  );
};