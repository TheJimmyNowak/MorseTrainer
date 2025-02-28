// MorseSettings.js
const STORAGE_KEY = 'morseTrainerSettings';

export class MorseSettings {
  static getDefaults() {
    return {
      currentLevel: 1,
      wpm: 20,
      farnsworthSpacing: 0,
      frequency: 600,
      groupSize: 3,
      advanceThreshold: 3,
      headCopyMode: false,
      hideChars: false,
      qsbAmount: 0,
      levelSpacing: 1000,    // Time between repeated sequences
      transitionDelay: 500,  // Time before starting new sequence after changes
      
      // Filter noise default settings
      radioNoiseEnabled: false,
      radioNoiseVolume: 0.5,
      radioNoiseResonance: 25,
      radioNoiseWarmth: 8,
      radioNoiseDrift: 0.5,
      radioNoiseAtmospheric: 0.5,
      radioNoiseCrackle: 0.05
    };
  }

  static load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return this.getDefaults();

      const settings = JSON.parse(stored);
      return { ...this.getDefaults(), ...settings };
    } catch (e) {
      console.error('Failed to load settings:', e);
      return this.getDefaults();
    }
  }

  static save(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }
}
