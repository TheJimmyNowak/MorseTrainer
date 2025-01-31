// HuffmanSequence.js

class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

// English letter frequencies (in %)
const LETTER_FREQUENCIES = {
  'E': 12.7, 'T': 9.1, 'A': 8.2, 'O': 7.5, 'I': 7.0,
  'N': 6.7, 'S': 6.3, 'H': 6.1, 'R': 6.0, 'D': 4.3,
  'L': 4.0, 'C': 2.8, 'U': 2.8, 'M': 2.4, 'W': 2.4,
  'F': 2.2, 'G': 2.0, 'Y': 2.0, 'P': 1.9, 'B': 1.5,
  'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15,
  'Q': 0.095, 'Z': 0.074
};

// Morse code mappings
const MORSE_CODE = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.'
};

function buildHuffmanTree() {
  // Create nodes for each letter
  let nodes = Object.entries(LETTER_FREQUENCIES).map(
    ([char, freq]) => new HuffmanNode(char, freq)
  );

  // Build the tree by combining nodes
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new HuffmanNode(null, left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    nodes.push(parent);
  }

  return nodes[0];
}

function getMorseComplexity(char) {
  const morse = MORSE_CODE[char];
  if (!morse) return 0;
  
  // Calculate complexity based on length and number of different symbols
  const length = morse.length;
  const uniqueSymbols = new Set(morse).size;
  return length * uniqueSymbols;
}

function getOptimalSequence() {
  const tree = buildHuffmanTree();
  const sequence = [];
  
  // Helper function to traverse the Huffman tree
  function traverse(node, path = []) {
    if (!node) return;
    
    if (node.char) {
      sequence.push({
        char: node.char,
        freq: node.freq,
        depth: path.length,
        complexity: getMorseComplexity(node.char)
      });
    }
    
    traverse(node.left, [...path, 0]);
    traverse(node.right, [...path, 1]);
  }
  
  traverse(tree);
  
  // Sort by combination of frequency, tree depth, and Morse complexity
  sequence.sort((a, b) => {
    // Normalize values between 0 and 1
    const freqA = a.freq / LETTER_FREQUENCIES['E'];
    const freqB = b.freq / LETTER_FREQUENCIES['E'];
    const depthA = 1 - (a.depth / Math.max(...sequence.map(s => s.depth)));
    const depthB = 1 - (b.depth / Math.max(...sequence.map(s => s.depth)));
    const complexA = 1 - (a.complexity / Math.max(...sequence.map(s => s.complexity)));
    const complexB = 1 - (b.complexity / Math.max(...sequence.map(s => s.complexity)));
    
    // Weighted combination
    const scoreA = (freqA * 0.5) + (depthA * 0.3) + (complexA * 0.2);
    const scoreB = (freqB * 0.5) + (depthB * 0.3) + (complexB * 0.2);
    
    return scoreB - scoreA;
  });
  
  return sequence.map(s => s.char).join('');
}

// Export the Huffman sequence preset
export const HUFFMAN_PRESET = {
  id: 'huffman',
  name: 'Huffman Method',
  sequence: getOptimalSequence(),
  type: 'character',
  description: 'Optimized learning sequence based on letter frequency and Morse code complexity'
};

// Add to sequence presets
export function addHuffmanPreset(SEQUENCE_PRESETS) {
  return {
    ...SEQUENCE_PRESETS,
    HUFFMAN: HUFFMAN_PRESET
  };
}
