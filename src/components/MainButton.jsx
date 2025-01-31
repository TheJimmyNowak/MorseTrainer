import { useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';

export const MainButton = ({ isPlaying, onClick, onButtonRef }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      onButtonRef(buttonRef.current);
    }
  }, [onButtonRef]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`w-full py-8 rounded-2xl font-bold text-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-white/5 ${
        isPlaying
          ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
          : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600'
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        <Zap size={28} className={isPlaying ? 'animate-pulse' : ''} />
        <span>{isPlaying ? 'Stop Practice' : 'Start Practice'}</span>
      </div>
    </button>
  );
};
