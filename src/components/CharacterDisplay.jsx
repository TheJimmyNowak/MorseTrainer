export const CharacterDisplay = ({
  headCopyMode,
  showAnswer,
  userInput,
  currentGroupSize,
  currentGroup
}) => (
  <div>
    <div className="font-mono text-4xl tracking-wider text-center p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-inner">
      {headCopyMode && !showAnswer
        ? '?'
        : userInput.padEnd(currentGroupSize || 1, '_')}
    </div>
    {headCopyMode && showAnswer && currentGroup && (
      <div className="text-center mt-4 animate-fade-in">
        <div className="text-yellow-400 text-2xl font-semibold mb-1">Answer</div>
        <div className="text-yellow-300 text-3xl font-mono">{currentGroup}</div>
      </div>
    )}
  </div>
);