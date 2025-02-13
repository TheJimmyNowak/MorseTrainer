import { HUFFMAN_PRESET } from './HuffmanSequence';
import { CustomAlphabetPreset } from './CustomAlphabetManager';

export const SEQUENCE_PRESETS = {
  KOCH: {
    id: 'koch',
    name: 'Koch Method',
    sequence: 'KMRSUAPTLOWI.NJEF0Y,VG5/Q9ZH38B?427C1D6X',
    type: 'character'
  },
  HUFFMAN: HUFFMAN_PRESET,
  CUSTOM: CustomAlphabetPreset,
  QCODES: {
    id: 'qcodes',
    name: 'Common Q-Codes',
    sequence: [
      'QRL', 'QRN', 'QRN', 'QRO', 'QRP', 'QRQ', 'QRS', 'QRT', 'QRU', 'QRV',
      'QRX', 'QRZ', 'QSB', 'QSL', 'QSO', 'QSY', 'QTH', 'QST'
    ],
    type: 'phrase'
  },
  CUT_NUMBERS: {
    id: 'cut_numbers',
    name: 'Cut Numbers',
    sequence: [
      'T', 'A', 'U', 'V', '4', '5', '6', 'B', 'D', 'N',  // 1,2,3,4,5,6,7,8,9,0
      'O' // Alternative zero
    ],
    type: 'character',
    translation: {
      'T': '1', 'A': '2', 'U': '3', 'V': '4', '4': '4',
      '5': '5', '6': '6', 'B': '8', 'D': '9', 'N': '0',
      'O': '0'
    }
  },
  COMMON_WORDS: {
    id: 'common_words',
    name: 'Common CW Words',
    sequence: [
      'DE', 'ES', 'PSE', 'TNX', 'FB', 'UR', 'RST', 'ANT', 'RIG', 'WX',
      'HR', 'HW', 'CPY', 'CQ', '73', '88', 'OM', 'YL', 'XYL', 'DX',
      'POTA', 'SOTA', 'TU', 'GM', 'GA', 'GE', 'B\uFE26K', '5NN', 'B\uFE26T', 'S\uFE26K', 'A\uFE26R', 'A\uFE26S'
    ],
    type: 'phrase'
  }
};

export class MorseSequences {
  constructor() {
    this.currentPreset = SEQUENCE_PRESETS.KOCH;
    this.currentSequence = this.prepareSequence(this.currentPreset);
    this.letterWeights = new Map();
    this.newLetterBoostDuration = 10;
    this.groupsGenerated = 0;
    this.lastAddedLevel = 1;
    this.previousGroups = new Set(); // Track recently used groups
    this.maxPreviousGroups = 10; // Maximum number of groups to remember
    this.newCharacterPlayed = new Map(); // Track if new characters have been played
  }

  prepareSequence(preset) {
    if (preset.type === 'character') {
      return typeof preset.sequence === 'string' ?
        preset.sequence.split('') : [...preset.sequence];
    }
    return [...preset.sequence];
  }

  resetWeights() {
    this.letterWeights.clear();
    this.groupsGenerated = 0;
    this.lastAddedLevel = 1;
    this.previousGroups.clear();
    this.newCharacterPlayed.clear();
  }

  updateWeightsForLevel(newLevel) {
    if (this.currentPreset.type === 'character' && newLevel > this.lastAddedLevel) {
      for (let i = this.lastAddedLevel; i < newLevel; i++) {
        const newLetter = this.currentSequence[i];
        this.letterWeights.set(newLetter, 2.0);
        this.newCharacterPlayed.set(newLetter, false);
      }
      this.lastAddedLevel = newLevel;
    }
  }

  decayWeights() {
    for (const [letter, weight] of this.letterWeights.entries()) {
      if (weight > 1.0) {
        const newWeight = Math.max(1.0, weight - 0.1);
        this.letterWeights.set(letter, newWeight);
      }
    }
  }

  ensureNewCharacterIncluded(available, size, newChar) {
    // First, select the new character
    const result = [newChar];

    // Then randomly select remaining characters
    const remainingChars = available.filter(c => c !== newChar);
    while (result.length < size) {
      const randomIndex = Math.floor(Math.random() * remainingChars.length);
      result.push(remainingChars[randomIndex]);
    }

    // Shuffle the result to randomize position of the new character
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  weightedSample(chars, size) {
    // Special case for when we have very few characters
    if (chars.length <= 1) {
      return Array(size).fill(chars[0]);
    }

    // Initialize weights for available characters
    const weights = chars.map(char => this.letterWeights.get(char) || 1.0);

    // Calculate cumulative weights
    const cumWeights = [];
    let sum = 0;
    for (const w of weights) {
      sum += w;
      cumWeights.push(sum);
    }

    // Weighted random sampling
    const selected = [];
    const used = new Set();

    while (selected.length < size) {
      const r = Math.random() * sum;
      let idx = cumWeights.findIndex(w => w > r);

      // Handle edge case
      if (idx >= chars.length) {
        idx = chars.length - 1;
      }

      // For small character sets, allow duplicates more freely
      if (chars.length <= 2 || !used.has(idx) || used.size === chars.length) {
        selected.push(chars[idx]);
        used.add(idx);
      }
    }

    return selected;
  }

  shouldAllowRepeat(available, size) {
    // Calculate the maximum possible unique combinations
    const maxCombinations = Math.min(
      Math.pow(available.length, size),  // Total possible combinations with repeats
      this.factorial(available.length) / this.factorial(available.length - size) // Combinations without repeats
    );

    // If we have fewer possible combinations than our history size,
    // or if we have a very small character set, allow repeats
    return maxCombinations <= this.maxPreviousGroups || available.length <= 2;
  }

  factorial(n) {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  generateGroup(level, maxSize) {
    const available = this.currentSequence.slice(0, Math.min(level, this.currentSequence.length));
    
    if (this.currentPreset.type === 'character') {
      this.updateWeightsForLevel(level);
      const actualSize = Math.floor(Math.random() * maxSize) + 1;

      let selectedChars;
      const newChar = this.currentSequence[level - 1];

      // Only ensure new character is included if it hasn't been played yet
      if (this.newCharacterPlayed.has(newChar) && !this.newCharacterPlayed.get(newChar)) {
        selectedChars = this.ensureNewCharacterIncluded(available, actualSize, newChar);
        this.newCharacterPlayed.set(newChar, true); // Mark as played
      } else {
        selectedChars = this.weightedSample(available, actualSize);
      }

      const group = selectedChars.join('');

      // Only check for repeats if we have enough possible combinations
      if (!this.shouldAllowRepeat(available, actualSize) && this.previousGroups.has(group)) {
        // Try generating a new group up to 3 times
        for (let i = 0; i < 3; i++) {
          const newChars = this.weightedSample(available, actualSize);
          const newGroup = newChars.join('');
          if (!this.previousGroups.has(newGroup)) {
            selectedChars = newChars;
            break;
          }
        }
      }

      // Update previous groups
      const finalGroup = selectedChars.join('');
      this.previousGroups.add(finalGroup);
      if (this.previousGroups.size > this.maxPreviousGroups) {
        const firstItem = this.previousGroups.values().next().value;
        this.previousGroups.delete(firstItem);
      }

      // Update state
      this.groupsGenerated++;
      if (this.groupsGenerated % 5 === 0) {
        this.decayWeights();
      }

      return finalGroup;
    } else {
      // For phrase-based sequences, return a single phrase
      return available[Math.floor(Math.random() * available.length)];
    }
  }

  setPreset(presetId) {
    const preset = Object.values(SEQUENCE_PRESETS).find(p => p.id === presetId);
    if (preset) {
      this.currentPreset = preset;
      this.currentSequence = this.prepareSequence(preset);
      this.resetWeights();
    }
  }

  getPresets() {
    return Object.values(SEQUENCE_PRESETS);
  }

  getCurrentPreset() {
    return this.currentPreset;
  }

  getAvailableChars(level) {
    const available = this.currentSequence.slice(0, Math.min(level, this.currentSequence.length));
    if (this.currentPreset.type === 'character') {
      return available.join('');
    }
    return available.join(' ');
  }

  getMaxLevel() {
    return this.currentSequence.length;
  }

  shuffleSequence() {
    if (this.currentPreset.type === 'character') {
      const array = [...this.currentSequence];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      this.currentSequence = array;
      this.resetWeights();
    }
  }

  resetSequence() {
    this.currentSequence = this.prepareSequence(this.currentPreset);
    this.resetWeights();
  }

  updateCustomSequence(sequence) {
    if (this.currentPreset.id === 'custom') {
      this.currentPreset = {
        ...CustomAlphabetPreset,
        sequence
      };
      this.currentSequence = this.prepareSequence(this.currentPreset);
    }
  }
}