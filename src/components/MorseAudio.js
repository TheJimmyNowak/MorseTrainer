// MorseAudio.js - Optimized version with integration for FilterNoise and repeats handling
class MorseAudioManager {
  constructor() {
    if (MorseAudioManager.instance) {
      return MorseAudioManager.instance;
    }

    // Core audio components
    this.audioContext = null;
    this.masterGain = null;
    this.oscillatorNode = null;

    // State management
    this.isPlaying = false;
    this.isInitialized = false;
    this.scheduledNotes = new Set();
    this.activeTimeout = null;
    this.abortController = null;

    // Audio parameters
    this.frequency = 700;
    this.qsbAmount = 0;
    this.currentSequence = '';
    this.currentWpm = 20;
    this.farnsworthSpacing = 0;

    // Repeat counter
    this.repeatCount = 0;
    this.maxRepeats = -1; // -1 means infinite repeats
    this.onMaxRepeatsReached = null;

    // ADSR envelope settings
    this.attackTime = 0.005;
    this.decayTime = 0.005;
    this.sustainLevel = 0.8;
    this.releaseTime = 0.005;

    // Performance optimizations
    this.scheduledEvents = new Map();
    
    // Volume setting - used by FilterNoise to sync its volume
    this.volume = 0.8;

    MorseAudioManager.instance = this;
  }

  async ensureAudioContext() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          latencyHint: 'interactive',
          sampleRate: 44100
        });
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize/resume audio context:', error);
      return false;
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // First ensure we have a valid audio context
      if (!await this.ensureAudioContext()) {
        throw new Error('Failed to initialize audio context');
      }

      // Create and connect master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.audioContext.destination);

      // Create persistent oscillator
      this.oscillatorNode = this.audioContext.createOscillator();
      this.oscillatorNode.type = 'sine';
      this.oscillatorNode.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);
      this.oscillatorNode.connect(this.masterGain);
      this.oscillatorNode.start();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio components:', error);
      this.isInitialized = false;
    }
  }

  setMaxRepeats(maxRepeats, callback) {
    this.maxRepeats = maxRepeats;
    this.onMaxRepeatsReached = callback;
  }

  resetRepeatCount() {
    this.repeatCount = 0;
  }

  clearScheduledEvents() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    for (const [time, event] of this.scheduledEvents) {
      if (time <= now) {
        this.scheduledEvents.delete(time);
      }
    }
  }

  stopAll() {
    this.isPlaying = false;

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    // Clear all scheduled events
    this.scheduledEvents.clear();

    // Reset repeat count
    this.repeatCount = 0;

    // Efficiently stop and clean up audio nodes
    if (this.audioContext && this.masterGain) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + this.releaseTime);
    }
  }

  setQsbAmount(amount) {
    this.qsbAmount = Math.max(0, Math.min(100, amount));
  }

  // Helper method to provide current volume for filter noise sync
  getCurrentVolume() {
    return this.volume;
  }

  generateQsbProfile(dotLength, chars) {
    if (this.qsbAmount === 0) return new Float32Array(chars.length).fill(1);

    const charsToFade = Math.max(1, Math.floor(Math.random() * chars.length));
    const fadeStart = Math.floor(Math.random() * (chars.length - charsToFade));
    const fadeProfile = new Float32Array(chars.length).fill(1);
    const maxFade = 1 - (this.qsbAmount / 100);

    for (let i = 0; i < charsToFade; i++) {
      const pos = fadeStart + i;
      fadeProfile[pos] = maxFade + (1 - maxFade) *
        (Math.sin((i / charsToFade) * Math.PI) ** 2);
    }

    return fadeProfile;
  }

  scheduleNote(startTime, duration, amplitude) {
    if (!this.isInitialized) return;

    const gainNode = this.masterGain;

    // Apply QSB (signal fading) to the amplitude
    const qsbAmplitude = amplitude * (1 - (this.qsbAmount / 100) * Math.random());
    
    // Scale by master volume setting
    const scaledAmplitude = qsbAmplitude * this.volume;

    // Schedule the ADSR envelope with QSB and volume scaling
    gainNode.gain.cancelScheduledValues(startTime);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(scaledAmplitude, startTime + this.attackTime);
    gainNode.gain.linearRampToValueAtTime(
      this.sustainLevel * scaledAmplitude,
      startTime + this.attackTime + this.decayTime
    );

    const releaseStart = startTime + duration - this.releaseTime;
    gainNode.gain.setValueAtTime(this.sustainLevel * scaledAmplitude, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, releaseStart + this.releaseTime);

    // Store scheduled event for cleanup
    this.scheduledEvents.set(startTime + duration, {
      type: 'note',
      endTime: startTime + duration
    });
  }

  async playSequence(chars, wpm, farnsworthSpacing = 0, levelSpacing = 2000) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Ensure we're ready to play
    await this.ensureAudioContext();

    this.stopAll();

    this.currentSequence = chars;
    this.currentWpm = wpm;
    this.farnsworthSpacing = farnsworthSpacing;
    this.abortController = new AbortController();
    this.isPlaying = true;
    this.combined = false;
    this.repeatCount = 0; // Reset repeat counter for new sequence

    // Reset master gain node for new sequence
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);

    try {
      // Calculate timings
      const characterWpm = wpm;
      const effectiveWpm = farnsworthSpacing > 0
        ? Math.min(wpm, wpm * (wpm / (wpm + farnsworthSpacing)))
        : wpm;

      const dotLength = 1.2 / characterWpm;
      const standardSpace = dotLength * 3;
      const extraSpace = farnsworthSpacing > 0
        ? (1.2 / effectiveWpm - 1.2 / characterWpm) * 7
        : 0;

      const morseCode = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
        'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
        'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
        'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
        'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
        '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.'
      };

      const qsbProfile = this.generateQsbProfile(dotLength, chars);
      let currentTime = this.audioContext.currentTime + 0.1; // Small scheduling delay

      //Check if chars should be played together
      if (chars.includes('\uFE26')) this.combined = true;

      // Schedule all notes in advance
      for (let i = 0; i < chars.length; i++) {
        if (!this.isPlaying) break;

        const char = chars[i];
        const amplitude = qsbProfile[i];
        const morse = morseCode[char.toUpperCase()] || '';

        for (const symbol of morse) {
          if (!this.isPlaying) break;

          const duration = symbol === '.' ? dotLength : dotLength * 3;
          this.scheduleNote(currentTime, duration, amplitude);
          currentTime += duration + dotLength; // Add inter-symbol space
        }

        //omit space if chars are combined
        if (this.combined) {
          currentTime += extraSpace;
        } else {
          currentTime += standardSpace + extraSpace;
        }
      }

      // Schedule replay if needed
      if (this.isPlaying) {
        this.activeTimeout = setTimeout(() => {
          if (this.isPlaying) {
            // Increment repeat count and check if we've reached the max
            this.repeatCount++;
            
            if (this.maxRepeats !== -1 && this.repeatCount >= this.maxRepeats) {
              if (this.onMaxRepeatsReached) {
                // Call the callback when max repeats reached
                this.isPlaying = false; // Immediately mark as not playing
                this.onMaxRepeatsReached();
                return; // Do not schedule another repeat
              }
            }
            
            // Continue playing the sequence
            this.playSequence(chars, wpm, farnsworthSpacing, levelSpacing);
          }
        }, (currentTime - this.audioContext.currentTime) * 1000 + levelSpacing);
      }

      // Clean up old scheduled events periodically
      setInterval(() => this.clearScheduledEvents(), 1000);

    } catch (e) {
      console.error('Playback error:', e);
      this.stopAll();
    }
  }

  getRepeatCount() {
    return this.repeatCount;
  }

  isActive() {
    return this.isPlaying;
  }

  getCurrentSequence() {
    return this.currentSequence;
  }

  setFrequency(freq) {
    this.frequency = freq;
    if (this.oscillatorNode) {
      this.oscillatorNode.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    // No need to set gain directly as it's applied when scheduling notes
  }

  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.ensureAudioContext();
    this.isPlaying = true;

    // Ensure master gain is ready for audio
    if (this.masterGain) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
    }
  }

  stop() {
    this.stopAll();
    this.isPlaying = false;
  }

  destroy() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
    MorseAudioManager.instance = null;
  }

  cleanup() {
    return this.destroy();
  }
}

export const morseAudio = new MorseAudioManager();
