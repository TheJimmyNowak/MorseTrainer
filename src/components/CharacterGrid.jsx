import { InteractiveButton } from './InteractiveButton';

export const CharacterGrid = ({ availableChars, onCharacterInput, currentPreset }) => {
  let chars = [];
  const numberToLetter = {
    '1': 'T', '2': 'A', '3': 'U', '4': 'V', '5': '5',
    '6': '6', '7': 'B', '8': 'D', '9': 'N', '0': 'O'
  };

  if (currentPreset?.id === 'cut_numbers') {
    chars = ['1','2','3','4','5','6','7','8','9','0'];
  } else {
    chars = Array.isArray(availableChars) ? availableChars : availableChars.split('');
    chars = [...new Set(chars.join('').replace(/\s+/g, '').split(''))].sort();
  }

  return (
      <div className="flex flex-wrap gap-2 justify-center">
        {chars.map((char, index) => (
          <InteractiveButton
            key={`${char}-${index}`}
            onClick={() => onCharacterInput(currentPreset?.id === 'cut_numbers' ? numberToLetter[char] : char)}
            className="min-w-16 h-14 px-4 flex items-center justify-center
                     bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600
                     rounded-lg text-lg font-mono font-semibold transition-all duration-200
                     shadow-lg hover:shadow-xl transform hover:scale-105
                     focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {currentPreset?.id === 'cut_numbers' ? `${char} (${numberToLetter[char]})` : char}
          </InteractiveButton>
        ))}
      </div>
  );
};