// ContestExchange.js - Utility for generating realistic contest exchanges

// Contest types and their exchange formats
export const CONTEST_TYPES = {
  SPRINT: {
    id: 'sprint',
    name: 'Sprint Contest',
    description: 'Exchange: Serial Nr, Name, QTH',
    formats: [
      '#NR {NAME} {STATE}',
      'NR #{NUMBER} {NAME} {STATE}',
      '{NAME} {STATE} #{NUMBER}'
    ]
  },
  DX: {
    id: 'dx',
    name: 'DX Contest',
    description: 'Exchange: RST + Zone',
    formats: [
      '5NN {ZONE}',
      'TU 5NN {ZONE}',
      'UR 5NN {ZONE}',
      '5NN {ZONE} TU',
      '5NN {ZONE} K'
    ]
  },
  WPX: {
    id: 'wpx',
    name: 'WPX Contest',
    description: 'Exchange: RST + Serial Nr',
    formats: [
      '5NN {NUMBER}',
      'TU 5NN {NUMBER}',
      '5NN {NUMBER} TU',
      '5NN {NUMBER} K'
    ]
  },
  FIELD_DAY: {
    id: 'field_day',
    name: 'Field Day',
    description: 'Exchange: Class + Section',
    formats: [
      '{CLASS} {SECTION}',
      'R {CLASS} {SECTION}',
      'TU {CLASS} {SECTION}',
      '{CLASS} {SECTION} K'
    ]
  },
  SWEEPSTAKES: {
    id: 'sweepstakes',
    name: 'ARRL Sweepstakes',
    description: 'Exchange: Nr + Prec + Call + Check + Section',
    formats: [
      '{NUMBER} {PRECEDENCE} {CALL} {CHECK} {SECTION}',
      'NR {NUMBER} {PRECEDENCE} {CALL} {CHECK} {SECTION}'
    ]
  },
  SIMPLE_QSO: {
    id: 'simple_qso',
    name: 'Simple QSO',
    description: 'Basic RST, Name, QTH exchange',
    formats: [
      'RST {RST} {NAME} {QTH}',
      'UR {RST} {NAME} {QTH}',
      '{NAME} {QTH} {RST}',
      'UR RPT {RST} {NAME} FR {QTH}',
      'NAME {NAME} QTH {QTH} RST {RST}'
    ]
  }
};

// Data collection for exchange generation
const EXCHANGE_DATA = {
  // Common names in ham radio and CW (shorter names are more common)
  NAMES: ['JIM', 'BOB', 'TOM', 'JOHN', 'DAVE', 'MIKE', 'STEVE', 'RICK', 'BILL', 'DAN', 
          'JOE', 'KEN', 'AL', 'ED', 'ROB', 'PAUL', 'CARL', 'RAY', 'JACK', 'MARK',
          'FRED', 'DOUG', 'SAM', 'WALT', 'STAN', 'JEFF', 'GREG', 'PHIL', 'DON', 'RON'],
  
  // US States abbreviations
  STATES: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 
           'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
           'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
           'VA', 'WA', 'WV', 'WI', 'WY'],

  // CQ zones for DX contests
  ZONES: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 
          '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
          '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
          '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'],
  
  // ARRL Sections for Field Day and Sweepstakes
  SECTIONS: ['CT', 'EMA', 'ME', 'NH', 'RI', 'VT', 'WMA', 'ENY', 'NLI', 'NNJ', 'SNJ', 'WNY', 
             'DE', 'EPA', 'MDC', 'WPA', 'AL', 'GA', 'KY', 'NC', 'SC', 'TN', 'VA', 'PR', 'VI',
             'AR', 'LA', 'MS', 'NM', 'NTX', 'OK', 'STX', 'WTX', 'EB', 'LAX', 'ORG', 'SB', 
             'SCV', 'SDG', 'SF', 'SJV', 'SV', 'PAC', 'AZ', 'EWA', 'ID', 'MT', 'NV', 'OR', 
             'UT', 'WWA', 'WY', 'AK', 'MI', 'OH', 'WCF', 'IL', 'IN', 'WI', 'CO', 'IA', 
             'KS', 'MN', 'MO', 'NE', 'ND', 'SD', 'MB', 'NWT', 'AB', 'BC', 'ON', 'QC', 'MAR'],
  
  // Field Day Classes
  CLASSES: ['1A', '1B', '1C', '1D', '1E', '2A', '2B', '2C', '2D', '2E', '3A', '3B', '3C', '3D', '3E',
            '4A', '4B', '4C', '4D', '4E', '5A', '5B', '5C', '5D', '5E', '6A', '7A', '8A', '9A'],
  
  // RST options - CW usually 5NN, but add some variations
  RST_OPTIONS: ['5NN', '57N', '58N', '59N', '56N', '55N', '54N', '53N', '599', '579', '589'],
  
  // Sweepstakes precedence
  PRECEDENCE: ['A', 'B', 'Q', 'M', 'S', 'U'],
  
  // Sweepstakes check (last two digits of first year licensed)
  CHECK: ['65', '70', '75', '80', '85', '90', '95', '00', '05', '10', '15', '20', '21', '22', '23']
};

// Helper function to get a random item from an array
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a random number with padding
const generateSerialNumber = (min = 1, max = 999) => {
  const number = Math.floor(Math.random() * (max - min + 1)) + min;
  return number.toString().padStart(3, '0');
};

// Format a message by replacing placeholders with actual data
export const formatExchange = (format, data) => {
  let formatted = format;
  Object.keys(data).forEach(key => {
    formatted = formatted.replace(`{${key}}`, data[key]);
  });
  return formatted;
};

// Generate random data for all possible exchange fields
export const generateExchangeData = () => {
  return {
    NAME: getRandomItem(EXCHANGE_DATA.NAMES),
    STATE: getRandomItem(EXCHANGE_DATA.STATES),
    ZONE: getRandomItem(EXCHANGE_DATA.ZONES),
    SECTION: getRandomItem(EXCHANGE_DATA.SECTIONS),
    CLASS: getRandomItem(EXCHANGE_DATA.CLASSES),
    NUMBER: generateSerialNumber(),
    RST: getRandomItem(EXCHANGE_DATA.RST_OPTIONS),
    QTH: getRandomItem(EXCHANGE_DATA.STATES), // Using states for QTH too
    PRECEDENCE: getRandomItem(EXCHANGE_DATA.PRECEDENCE),
    CHECK: getRandomItem(EXCHANGE_DATA.CHECK),
    CALL: 'K5XYZ' // Default call, should be overridden with actual station call
  };
};

// Generate a complete exchange for a specific contest type
export const generateContestExchange = (contestType, callsign = null) => {
  if (!CONTEST_TYPES[contestType]) {
    return { error: 'Unknown contest type' };
  }
  
  const data = generateExchangeData();
  
  // Add the callsign to the data if provided
  if (callsign) {
    data.CALL = callsign;
  }
  
  // Choose a random format from the contest type
  const formats = CONTEST_TYPES[contestType].formats;
  const randomFormat = formats[Math.floor(Math.random() * formats.length)];
  
  // Format the exchange
  const formattedExchange = formatExchange(randomFormat, data);
  
  return {
    contestType: CONTEST_TYPES[contestType].name,
    format: randomFormat,
    data: data,
    exchange: formattedExchange
  };
};

// Get the essential parts that need to be copied for a particular contest
export const getEssentialParts = (contestType, data) => {
  switch (contestType) {
    case 'sprint':
      return [data.NUMBER, data.NAME, data.STATE];
    case 'dx':
      return [data.ZONE];
    case 'wpx':
      return [data.NUMBER];
    case 'field_day':
      return [data.CLASS, data.SECTION];
    case 'sweepstakes':
      return [data.NUMBER, data.PRECEDENCE, data.CHECK, data.SECTION];
    case 'simple_qso':
      return [data.RST, data.NAME, data.QTH];
    default:
      return [];
  }
};
