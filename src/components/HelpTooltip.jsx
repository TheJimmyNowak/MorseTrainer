import { HelpCircle, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const HelpTooltip = ({ description, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isVisible &&
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    // Add click listener to document
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={() => setIsVisible(!isVisible)}
        className={`absolute top-1 right-1 text-gray-400 hover:text-blue-500 transition-colors ${className}`}
      >
        <HelpCircle size={16} />
      </button>
      {isVisible && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 left-1/2 bottom-full -translate-x-1/2 mb-2 
                     bg-gray-800 text-white text-xs p-3 rounded-lg shadow-lg 
                     max-w-xs w-max border border-gray-700"
        >
          <div className="flex items-start justify-between">
            <p className="pr-2 flex-grow">{description}</p>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
