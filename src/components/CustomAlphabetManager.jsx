// CustomAlphabetManager.jsx
import React, { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';

const STORAGE_KEY = 'morseTrainerCustomAlphabet';
const ALL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?/';

const CustomAlphabetModal = ({ isOpen, onClose, selectedChars, onSave }) => {
  const [localSelected, setLocalSelected] = useState(new Set(selectedChars));

  useEffect(() => {
    setLocalSelected(new Set(selectedChars));
  }, [selectedChars]);

  const toggleChar = (char) => {
    const newSelected = new Set(localSelected);
    if (newSelected.has(char)) {
      newSelected.delete(char);
    } else {
      newSelected.add(char);
    }
    setLocalSelected(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(localSelected).sort().join(''));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg 
                    bg-gray-800 rounded-xl shadow-2xl z-50 p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Customize Alphabet</h2>
        
        <div className="grid grid-cols-8 gap-2 mb-6">
          {ALL_CHARS.split('').map((char) => (
            <button
              key={char}
              onClick={() => toggleChar(char)}
              className={`w-10 h-10 rounded-lg font-mono text-lg font-semibold
                transition-all duration-200 ${
                localSelected.has(char)
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {char}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            disabled={localSelected.size === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export const CustomAlphabetPreset = {
  id: 'custom',
  name: 'Custom Alphabet',
  type: 'character',
  sequence: '',
  icon: Settings2
};

export const useCustomAlphabet = () => {
  const [customSequence, setCustomSequence] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCustomSequence(stored);
    }
  }, []);

  const saveCustomSequence = (sequence) => {
    setCustomSequence(sequence);
    localStorage.setItem(STORAGE_KEY, sequence);
  };

  return {
    customSequence,
    isModalOpen,
    setIsModalOpen,
    saveCustomSequence,
    CustomAlphabetModal
  };
};

// Updated PresetDropdown.jsx
export const EnhancedPresetDropdown = ({ 
  presets, 
  currentPreset, 
  onPresetChange,
  customSequence,
  onCustomizeClick 
}) => {
  const currentIsCustom = currentPreset?.id === 'custom';
  
  return (
    <div className="bg-gray-700 p-2 rounded-lg">
      <div className="text-xs text-gray-400 mb-2">Sequence Type</div>
      <div className="flex gap-2">
        <select 
          value={currentPreset?.id} 
          onChange={(e) => onPresetChange(e.target.value)}
          className="flex-1 p-2 bg-gray-600 rounded-lg border border-gray-500 text-white"
        >
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        
        {currentIsCustom && (
          <button
            onClick={onCustomizeClick}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Settings2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
