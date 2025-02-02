import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export const SidePanel = ({ children, isVisible, onVisibilityChange }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible &&
          panelRef.current &&
          !panelRef.current.contains(event.target)) {
        onVisibilityChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onVisibilityChange]);

  const handlePanelClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Side panel */}
      <div
        ref={panelRef}
        onClick={handlePanelClick}
        className={`fixed inset-0 lg:left-auto lg:w-[400px] z-50 
          bg-gradient-to-l from-gray-800/95 to-gray-900/95 backdrop-blur-lg shadow-2xl
          transition-transform duration-300 ease-in-out overflow-y-auto
          border-l border-gray-700/50
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel header with close button */}
        <div className="sticky top-0 bg-gradient-to-l from-gray-800/95 to-gray-900/95 backdrop-blur-lg z-10 p-4 border-b border-gray-700/50">
          <button
            onClick={() => onVisibilityChange(false)}
            className="absolute right-4 top-4 p-2 rounded-lg
              hover:bg-gray-700/50 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold pl-2">Settings</h2>
        </div>

        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 z-40
          ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onVisibilityChange(false)}
      />
    </>
  );
};
