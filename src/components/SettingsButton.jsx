import { Settings } from 'lucide-react';

export const SettingsButton = ({ onClick, className = '', isActive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed right-4 sm:right-6 top-40 z-40 p-3 rounded-xl
        bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm
        border border-gray-600/50 shadow-lg 
        transition-all duration-200 hover:scale-105 hover:bg-gray-700 active:scale-95
        ${isActive ? 'ring-2 ring-blue-500 border-blue-400/30' : ''}
        ${className}`}
    >
      <Settings size={24} className={isActive ? 'text-blue-400' : 'text-white'} />
    </button>
  );
};

export default SettingsButton;
