import { Eye } from 'lucide-react';
import { InteractiveButton } from './InteractiveButton';

export const CharacterDisplay = ({
  headCopyMode,
  showAnswer,
  userInput,
  currentGroupSize,
  currentGroup,
  onShowAnswer
}) => {
  // Determine what to display and its color
  let displayContent;
  let textColorClass;

  if (headCopyMode) {
    if (showAnswer) {
      displayContent = currentGroup;
      textColorClass = "text-yellow-400"; // Answer is shown in yellow
    } else {
      displayContent = '?';
      textColorClass = "text-white"; // Question mark in white
    }
  } else {
    displayContent = userInput.padEnd(currentGroupSize || 1, '_');
    textColorClass = "text-white"; // User input in white
  }

  return (
    <div className={`font-mono text-4xl tracking-wider text-center p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-inner relative ${textColorClass}`}>
      {displayContent}

      {headCopyMode && !showAnswer && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <InteractiveButton
            onClick={onShowAnswer}
            className="p-2 rounded-lg bg-yellow-600/30 hover:bg-yellow-500/40 transition-colors"
          >
            <Eye size={24} className="text-yellow-500" />
          </InteractiveButton>
        </div>
      )}
    </div>
  );
};