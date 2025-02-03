import React, { useState, useEffect } from 'react';
import { Settings2, GripHorizontal } from 'lucide-react';

const CustomAlphabetModal = ({ isOpen, onClose, selectedChars, onSave }) => {
  const [availableChars, setAvailableChars] = useState(ALL_CHARS.split('').filter(char => !selectedChars.includes(char)));
  const [orderedSelected, setOrderedSelected] = useState(selectedChars);
  const [draggedChar, setDraggedChar] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    setAvailableChars(ALL_CHARS.split('').filter(char => !selectedChars.includes(char)));
    setOrderedSelected(selectedChars);
  }, [selectedChars]);

  const handleDragStart = (e, char, index) => {
    setDraggedChar({ char, index });
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay to make the drag icon visible
    setTimeout(() => e.target.classList.add('opacity-50'), 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedChar(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedChar === null) return;

    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedChar === null) return;

    const newOrdered = [...orderedSelected];
    const { index: dragIndex } = draggedChar;

    // Remove from old position and insert at new position
    const [removed] = newOrdered.splice(dragIndex, 1);
    newOrdered.splice(dropIndex, 0, removed);

    setOrderedSelected(newOrdered);
    setDraggedChar(null);
    setDragOverIndex(null);
  };

  const toggleChar = (char) => {
    const newSelected = new Set(orderedSelected);
    if (newSelected.has(char)) {
      newSelected.delete(char);
      setAvailableChars([...availableChars, char].sort());
    } else {
      newSelected.add(char);
      setAvailableChars(availableChars.filter(c => c !== char));
    }
    setOrderedSelected(Array.from(newSelected));
  };

  const handleSave = () => {
    onSave(orderedSelected.join(''));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg
                    bg-gray-800 rounded-xl shadow-2xl z-50 p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Customize Alphabet</h2>

        {/* Selected characters (draggable) */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Selected Characters (drag to reorder)</div>
          <div className="flex flex-wrap gap-2">
            {orderedSelected.map((char, index) => (
              <div
                key={char}
                draggable
                onDragStart={(e) => handleDragStart(e, char, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg
                          bg-blue-500 hover:bg-blue-600 cursor-move
                          transition-colors duration-200
                          ${dragOverIndex === index ? 'border-2 border-white' : ''}`}
              >
                <GripHorizontal size={16} className="text-blue-200" />
                <span className="font-mono text-lg font-semibold">{char}</span>
                <button
                  onClick={() => toggleChar(char)}
                  className="ml-2 text-blue-200 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Available characters */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Available Characters</div>
          <div className="flex flex-wrap gap-2">
            {availableChars.map((char) => (
              <button
                key={char}
                onClick={() => toggleChar(char)}
                className="w-10 h-10 rounded-lg font-mono text-lg font-semibold
                        bg-gray-700 hover:bg-gray-600
                        transition-all duration-200"
              >
                {char}
              </button>
            ))}
          </div>
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
            disabled={orderedSelected.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

const ALL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?/';

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

const STORAGE_KEY = 'morseTrainerCustomAlphabet';