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
  let displayContent;
  let textColorClass;

  if (headCopyMode) {
    if (showAnswer) {
      displayContent = currentGroup;
      textColorClass = "text-white";
    } else {
      displayContent = '?';
      textColorClass = "text-white";
    }
  } else {
    displayContent = userInput.padEnd(currentGroupSize || 1, '_');
    textColorClass = "text-white";
  }

  return (
    <div className={`font-mono text-4xl tracking-wider text-center p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-inner relative ${textColorClass}`}>
      {displayContent}

      {headCopyMode && !showAnswer && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <InteractiveButton
            onClick={onShowAnswer}
            className="p-2 rounded-lg bg-gray-600/30 hover:bg-gray-500/40 transition-colors group"
          >
            <Eye
              size={24}
              className="text-white group-hover:text-yellow-400 transition-colors"
            />
          </InteractiveButton>
        </div>
      )}
    </div>
  );
};