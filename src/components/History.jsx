export const History = ({ history }) => {
  const ComparisonDisplay = ({ expected, actual }) => {
    // If actual is undefined, log it to help us debug
    if (!actual) {
      console.warn('Received undefined actual input for entry:', { expected, actual });
      return (
        <div className="text-yellow-500">
          Error: Missing user input data
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {/* Expected sequence */}
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-20">Expected:</span>
          <span className="font-mono text-lg text-gray-300">{expected}</span>
        </div>

        {/* Actual typed sequence with character-by-character comparison */}
        <div className="flex items-center text-sm">
          <span className="text-gray-400 w-20">Typed:</span>
          <div className="font-mono text-lg flex">
            {expected.split('').map((expectedChar, i) => {
              const actualChar = actual[i];
              const isCorrect = actualChar === expectedChar;

              return (
                <div
                  key={i}
                  className={`relative group ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                  title={isCorrect ? 'Correct' : `Expected "${expectedChar}"`}
                >
                  {actualChar}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                                bg-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100
                                transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {isCorrect ? 'Correct' : `Expected "${expectedChar}"`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50">
      <div className="text-sm text-gray-300 font-medium p-4 border-b border-gray-700/50">
        History
      </div>
      <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-3">
        {history.slice().reverse().map((entry, i) => {
          // Log any entries with missing userInput to help debug
          if (!entry.userInput) {
            console.warn('History entry missing userInput:', entry);
          }

          return (
            <div
              key={i}
              className={`p-4 rounded-lg transition-all duration-300 ${
                entry.correct
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30'
                  : 'bg-gradient-to-r from-red-500/20 to-pink-500/10 border border-red-500/30'
              }`}
            >
              <ComparisonDisplay
                expected={entry.group}
                actual={entry.userInput}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};