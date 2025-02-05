// MorseAudio.js - Optimized version with fixes
class MorseAudioManager {
  constructor() {
    if (MorseAudioManager.instance) {
      return MorseAudioManager.instance;
    }

    // Core audio components
    this.audioContext = null;
    this.masterGain = null;
    this.oscillatorNode = null;
    this.qrmNoiseNode = null;
    this.qrmGainNode = null;
    this.qrmFilter = null;

    // State management
    this.isPlaying = false;
    this.isInitialized = false;
    this.scheduledNotes = new Set();
    this.activeTimeout = null;
    this.abortController = null;

    // Audio parameters
    this.frequency = 700;
    this.qsbAmount = 0;
    this.qrmAmount = 0;
    this.currentSequence = '';
    this.currentWpm = 20;
    this.farnsworthSpacing = 0;

    // ADSR envelope settings
    this.attackTime = 0.005;
    this.decayTime = 0.005;
    this.sustainLevel = 0.8;
    this.releaseTime = 0.005;

    // Performance optimizations
    this.scheduledEvents = new Map();
    this.audioWorkletLoaded = false;
    
    MorseAudioManager.instance = this;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      });

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

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.isInitialized = false;
    }
  }

  createNoiseGenerator() {
    if (!this.isInitialized) return null;

    const bufferSize = this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;

    // Use a more efficient buffer generation method
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      // Optimized pink noise generation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      output[i] = ((b0 + b1 + b2 + b3 + b4 + b5) / 6 * 0.7 + white * 0.3) * 0.5;
    }

    const noiseNode = this.audioContext.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = this.frequency;
    bandpass.Q.value = 1.5;

    noiseNode.connect(bandpass);
    return { source: noiseNode, filter: bandpass };
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

    // Efficiently stop and clean up audio nodes
    if (this.audioContext) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + this.releaseTime);

      if (this.qrmNoiseNode) {
        this.qrmNoiseNode.stop(now);
        this.qrmNoiseNode.disconnect();
        this.qrmNoiseNode = null;
      }

      if (this.qrmFilter) {
        this.qrmFilter.disconnect();
        this.qrmFilter = null;
      }

      if (this.qrmGainNode) {
        this.qrmGainNode.disconnect();
        this.qrmGainNode = null;
      }
    }
  }

  setQsbAmount(amount) {
    this.qsbAmount = Math.max(0, Math.min(100, amount));
  }

  setQrmAmount(amount) {
    this.qrmAmount = Math.max(0, Math.min(100, amount));
    
    if (this.isInitialized && this.audioContext) {
      // Create or update QRM noise
      if (amount > 0) {
        if (!this.qrmNoiseNode) {
          const noise = this.createNoiseGenerator();
          this.qrmNoiseNode = noise.source;
          this.qrmFilter = noise.filter;
          this.qrmGainNode = this.audioContext.createGain();
          
          this.qrmFilter.connect(this.qrmGainNode);
          this.qrmGainNode.connect(this.audioContext.destination);
          this.qrmNoiseNode.start();
        }
        
        const scaledGain = (amount / 100) ** 1.5 * 0.15;
        this.qrmGainNode.gain.setValueAtTime(scaledGain, this.audioContext.currentTime);
      } else if (this.qrmNoiseNode) {
        // Clean up QRM if setting to 0
        this.qrmNoiseNode.stop();
        this.qrmNoiseNode.disconnect();
        this.qrmNoiseNode = null;
        
        if (this.qrmFilter) {
          this.qrmFilter.disconnect();
          this.qrmFilter = null;
        }
        
        if (this.qrmGainNode) {
          this.qrmGainNode.disconnect();
          this.qrmGainNode = null;
        }
      }
    }
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
    
    // Schedule the ADSR envelope with QSB
    gainNode.gain.cancelScheduledValues(startTime);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(qsbAmplitude, startTime + this.attackTime);
    gainNode.gain.linearRampToValueAtTime(
      this.sustainLevel * qsbAmplitude,
      startTime + this.attackTime + this.decayTime
    );

    const releaseStart = startTime + duration - this.releaseTime;
    gainNode.gain.setValueAtTime(this.sustainLevel * qsbAmplitude, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, releaseStart + this.releaseTime);

    // Store scheduled event for cleanup
    this.scheduledEvents.set(startTime + duration, {
      type: 'note',
      endTime: startTime + duration
    });
  }

  async playSequence(chars, wpm, farnsworthSpacing = 0) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Ensure we're ready to play
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.stopAll();

    this.currentSequence = chars;
    this.currentWpm = wpm;
    this.farnsworthSpacing = farnsworthSpacing;
    this.abortController = new AbortController();
    this.isPlaying = true;

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

      // Set up QRM if needed
      if (this.qrmAmount > 0) {
        if (!this.qrmNoiseNode) {
          const noise = this.createNoiseGenerator();
          this.qrmNoiseNode = noise.source;
          this.qrmFilter = noise.filter;
          this.qrmGainNode = this.audioContext.createGain();
          const scaledGain = (this.qrmAmount / 100) ** 1.5 * 0.15;
          this.qrmGainNode.gain.value = scaledGain;

          this.qrmFilter.connect(this.qrmGainNode);
          this.qrmGainNode.connect(this.audioContext.destination);
          this.qrmNoiseNode.start();
        }
      }

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

        currentTime += standardSpace + extraSpace;
      }

      // Schedule replay if needed
      if (this.isPlaying) {
        this.activeTimeout = setTimeout(() => {
          if (this.isPlaying) {
            this.playSequence(chars, wpm, farnsworthSpacing);
          }
        }, (currentTime - this.audioContext.currentTime) * 1000 + 2000);
      }

      // Clean up old scheduled events periodically
      setInterval(() => this.clearScheduledEvents(), 1000);

    } catch (e) {
      console.error('Playback error:', e);
      this.stopAll();
    }
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
    if (this.qrmFilter) {
      this.qrmFilter.frequency.value = freq;
    }
  }

  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    this.isPlaying = true;
    
    // Ensure master gain is ready for audio
    if (this.masterGain) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
    }
  }

  // Add stop method for compatibility
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

  // Alias for destroy() to maintain backward compatibility
  cleanup() {
    return this.destroy();
  }
}

export const morseAudio = new MorseAudioManager();
