
// CallsignGenerator.js - Utility for generating realistic amateur radio callsigns

// Weighted distribution functions
const weightedRandom = (weights) => {
  let total = 0;
  const cumulative = weights.map(w => (total += w));
  const r = Math.random() * total;
  return cumulative.findIndex(w => r < w);
};

const weightedRandomValue = (values, weights) => {
  const index = weightedRandom(weights);
  return values[index];
};

// US callsign format generator
const generateUSCallsign = () => {
  // US callsign prefixes with weights
  const US_PREFIXES = ['W', 'K', 'N', 'A', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AJ', 'AK', 'AL', 'KA', 'KB', 'KC', 'KD', 'KE', 'KF', 'KG', 'KI', 'KJ', 'KK', 'KL', 'KM', 'KN', 'WA', 'WB', 'WD', 'WE', 'WF', 'WG', 'WI', 'WJ', 'WK', 'WL', 'WM', 'WN', 'WO', 'WP', 'WQ', 'WR', 'WT', 'WU', 'WV', 'WW', 'WX', 'WY', 'WZ'];
  
  // Organize prefixes and their weights
  const ONE_LETTER_PREFIXES = ['W', 'K', 'N', 'A'];
  const ONE_LETTER_WEIGHTS = [0.4, 0.4, 0.15, 0.05]; // W and K are more common
  
  const TWO_LETTER_PREFIXES = ['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AJ', 'AK', 'AL', 'KA', 'KB', 'KC', 'KD', 'KE', 'KF', 'KG', 'KI', 'KJ', 'KK', 'KL', 'KM', 'KN', 'WA', 'WB', 'WD', 'WE', 'WF', 'WG', 'WI', 'WJ', 'WK', 'WL', 'WM', 'WN', 'WO', 'WP', 'WQ', 'WR', 'WT', 'WU', 'WV', 'WW', 'WX', 'WY', 'WZ'];
  
  // Region numbers 0-9
  const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  // Number distribution (0 is less common in older callsigns)
  const NUMBER_WEIGHTS = [0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.09, 0.05, 0.02];
  
  // Suffix letters
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Decide callsign format (1x1, 1x2, 1x3, 2x1, 2x2, 2x3)
  // 1x2 and 1x3 are most common, 2x1 is rare, 1x1 is very rare (Extra class vanity)
  const formats = ['1x1', '1x2', '1x3', '2x1', '2x2', '2x3'];
  const formatWeights = [0.01, 0.30, 0.35, 0.05, 0.12, 0.17];
  const format = weightedRandomValue(formats, formatWeights);
  
  let callsign = '';
  const [prefixSize, suffixSize] = format.split('x').map(Number);
  
  // Generate prefix
  if (prefixSize === 1) {
    const prefixIndex = weightedRandom(ONE_LETTER_WEIGHTS);
    callsign += ONE_LETTER_PREFIXES[prefixIndex];
  } else {
    callsign += TWO_LETTER_PREFIXES[Math.floor(Math.random() * TWO_LETTER_PREFIXES.length)];
  }
  
  // Add region number
  const region = NUMBERS[weightedRandom(NUMBER_WEIGHTS)];
  callsign += region;
  
  // Add suffix
  for (let i = 0; i < suffixSize; i++) {
    callsign += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }
  
  return callsign;
};

// DX callsign generator
const generateDXCallsign = () => {
  // Common DX prefixes by continent with relative frequency weights
  const DX_PREFIXES = {
    // Europe (highest probability)
    EUROPE: [
      'G', 'GM', 'GW', 'GI', 'GD', 'M', 'MM', 'MW', 'MI', 'MD', '2E', '2I', '2M', '2W',
      'DL', 'DJ', 'DK', 'DA', 'DB', 'DC', 'DD', 'DF', 'DG', 'DH', 'DM', 'DO', 'DP', 'DR', 'DQ',
      'F', 'TK', 'HB', 'HB0', 'I', 'IK', 'IZ', 'IW', 'IN', 'IT', 'IO', 'IR', 'IS', 'IX', 'IY',
      'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH', 'AM', 'AN', 'AO',
      'OZ', 'OU', 'OV', 'OX', 'OY', 'PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH', 'PI',
      'LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LJ', 'LK', 'LL', 'LM', 'LN',
      'SM', 'SA', 'SB', 'SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM',
      'OH', 'OF', 'OG', 'OI', 'OJ', 'OK', 'OL', 'OM', 'ON', 'OO', 'OP', 'OQ', 'OR', 'OS', 'OT'
    ],
    // North America (second highest)
    NORTH_AMERICA: [
      'VE', 'VA', 'VO', 'VY', 'XJ', 'XK', 'XL', 'XM', 'XN', 'XO',
      'XP', 'CY', 'CZ', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CY', 'CZ',
      'KL', 'KP', 'AL', 'NL', 'WL',
      'CO', 'XE', 'XF', '4A', '4B', '4C',
      'KP4', 'NP4', 'WP4'
    ],
    // Asia
    ASIA: [
      'JA', 'JE', 'JF', 'JG', 'JH', 'JI', 'JJ', 'JK', 'JL', 'JM', 'JN', 'JO', 'JP', 'JQ', 'JR', 'JS',
      'BY', 'BA', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ',
      'HL', 'DS', '6K', '6L', '6M', '6N',
      'VR', 'VU', 'BV', 'HS', 'HL', 'JY', 'A4', 'A5', 'A6', 'A7', 'A9', 'AP', 'YK', '9K', '9M', '9V', 'YB', 'YC', 'YD', 'YE', 'YF', 'YG', 'YH'
    ],
    // Oceania
    OCEANIA: [
      'VK', 'AX', 'VH', 'VI', 'VJ', 'VK', 'VL', 'VM', 'VN', 'ZL', 'ZM',
      'FK', 'FO', 'KH6', 'NH6', 'WH6', 'AH6', 'KH7', 'NH7', 'WH7', 'AH7',
      'DU', 'DV', 'DW', 'DX', 'DY', 'DZ', '4D', '4E', '4F', '4G', '4H', '4I'
    ],
    // South America
    SOUTH_AMERICA: [
      'PY', 'PP', 'PQ', 'PR', 'PS', 'PT', 'PU', 'PV', 'PW', 'PX', 'ZP', 'ZW', 'ZV', 'ZZ', 'ZY',
      'LU', 'LO', 'LP', 'LQ', 'LR', 'LS', 'LT', 'LU', 'LV', 'LW',
      'CE', 'CA', 'CB', 'CC', 'CD', 'CE', 'XQ', 'XR', '3G',
      'CX', 'CV', 'HC', 'HD', 'HK', 'HJ', 'YV', '4M', 'OA', 'CP', 'HI', 'HH'
    ],
    // Africa (lowest probability)
    AFRICA: [
      'ZS', 'ZT', 'ZU', 'ZR', 'V5', 'C9', 'EA8', 'EA9', 'CN', '5R', '5H', '5X', '5Z',
      '7Q', '7X', '9J', '9X', 'ET', 'ST', 'SU', 'TR', 'TU', 'TY', 'TZ'
    ]
  };
  
  // Continent probability distribution
  const continents = ['EUROPE', 'NORTH_AMERICA', 'ASIA', 'OCEANIA', 'SOUTH_AMERICA', 'AFRICA'];
  const continentWeights = [0.35, 0.25, 0.15, 0.10, 0.10, 0.05];
  
  // Select continent
  const selectedContinent = weightedRandomValue(continents, continentWeights);
  
  // Select prefix from the continent
  const prefixes = DX_PREFIXES[selectedContinent];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Numbers 0-9 for potential digit in callsign
  const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  // Suffix letters
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // DX callsign format options
  // prefixNsuffix where N is number of letters in suffix (1-3)
  const formats = ['1', '2', '3'];
  const formatWeights = [0.15, 0.65, 0.2]; // 2-letter suffix most common for DX
  
  // Add a digit (with 60% probability)
  let callsign = prefix;
  const addDigit = Math.random() < 0.6;
  if (addDigit) {
    callsign += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  }
  
  // Add suffix
  const suffixLength = weightedRandomValue(formats, formatWeights);
  for (let i = 0; i < suffixLength; i++) {
    callsign += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
  }
  
  return callsign;
};

// Main exported function to generate a random callsign
export const generateRandomCallsign = () => {
  // US (70%) vs DX (30%) probability
  if (Math.random() < 0.7) {
    return generateUSCallsign();
  } else {
    return generateDXCallsign();
  }
};

// Generate a list of callsigns
export const generateCallsignList = (count) => {
  const callsigns = [];
  for (let i = 0; i < count; i++) {
    callsigns.push(generateRandomCallsign());
  }
  return callsigns;
};

// Generate a specifically formatted callsign
export const generateSpecificCallsign = (format) => {
  switch (format) {
    case 'us':
      return generateUSCallsign();
    case 'dx':
      return generateDXCallsign();
    case 'contest': // More likely to be easy-to-copy contest callsigns
      return Math.random() < 0.8 ? generateUSCallsign() : generateDXCallsign();
    default:
      return generateRandomCallsign();
  }
};
