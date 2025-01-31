// MorseAudio.js
class MorseAudioManager {
  constructor() {
    if (MorseAudioManager.instance) {
      return MorseAudioManager.instance;
    }

    this.audioContext = null;
    this.activeOscillator = null;
    this.frequency = 700;
    this.isPlaying = false;
    this.activeTimeout = null;
    this.abortController = null;
    this.qsbAmount = 0;
    this.qrmAmount = 0;
    this.qrmNoiseNode = null;
    this.qrmGainNode = null;
    this.currentSequence = '';
    this.currentWpm = 20;
    this.farnsworthSpacing = 0;

    this.attackTime = 0.005;
    this.decayTime = 0.005;
    this.sustainLevel = 0.8;
    this.releaseTime = 0.005;

    MorseAudioManager.instance = this;
  }

  initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  createNoiseGenerator() {
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;

      const pink = (b0 + b1 + b2 + b3 + b4 + b5) / 6;
      output[i] = (pink * 0.7 + white * 0.3) * 0.5;
    }

    const noiseNode = this.audioContext.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = this.frequency;
    bandpass.Q.value = 1.5;

    const modulator = this.audioContext.createOscillator();
    const modulatorGain = this.audioContext.createGain();
    modulator.frequency.value = 0.5;
    modulatorGain.gain.value = 50;

    modulator.connect(modulatorGain);
    modulatorGain.connect(bandpass.frequency);
    modulator.start();

    noiseNode.connect(bandpass);
    noiseNode.start();
    return { source: noiseNode, filter: bandpass };
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

    if (this.qrmNoiseNode) {
      this.qrmNoiseNode.stop();
      this.qrmNoiseNode.disconnect();
      this.qrmNoiseNode = null;

      if (this.qrmFilter) {
        this.qrmFilter.disconnect();
        this.qrmFilter = null;
      }
    }

    if (this.qrmGainNode) {
      this.qrmGainNode.disconnect();
      this.qrmGainNode = null;
    }

    if (this.activeOscillator) {
      const { gainNode } = this.activeOscillator;
      const now = this.audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + this.releaseTime);

      setTimeout(() => {
        try {
          this.activeOscillator.oscillator.stop();
          this.activeOscillator.oscillator.disconnect();
          this.activeOscillator.gainNode.disconnect();
        } catch (e) {
          // Ignore errors from already stopped oscillators
        }
        this.activeOscillator = null;
      }, this.releaseTime * 1000);
    }
  }

  setQsbAmount(amount) {
    this.qsbAmount = Math.max(0, Math.min(100, amount));
  }

  setQrmAmount(amount) {
    this.qrmAmount = Math.max(0, Math.min(100, amount));
    if (this.qrmGainNode) {
      const scaledGain = (amount / 100) ** 1.5 * 0.15;
      this.qrmGainNode.gain.value = scaledGain;
    }
  }

  generateQsbProfile(length, chars) {
    if (this.qsbAmount === 0) return Array(chars.length).fill(1);

    const charsToFade = Math.max(1, Math.floor(Math.random() * chars.length));
    const fadeStart = Math.floor(Math.random() * (chars.length - charsToFade));
    const fadeProfile = Array(chars.length).fill(1);
    const maxFade = 1 - (this.qsbAmount / 100);

    for (let i = 0; i < charsToFade; i++) {
      const pos = fadeStart + i;
      const fadeAmount = maxFade + (1 - maxFade) *
        (Math.sin((i / charsToFade) * Math.PI) ** 2);
      fadeProfile[pos] = fadeAmount;
    }

    return fadeProfile;
  }

  async playTone(duration, signal, amplitude = 1) {
    if (!this.audioContext || !this.isPlaying) return;
    if (signal?.aborted) return;

    if (this.activeOscillator) {
      const { gainNode } = this.activeOscillator;
      const now = this.audioContext.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + this.releaseTime);

      await new Promise(resolve => setTimeout(resolve, this.releaseTime * 1000));

      try {
        this.activeOscillator.oscillator.stop();
        this.activeOscillator.oscillator.disconnect();
        this.activeOscillator.gainNode.disconnect();
      } catch (e) {
        // Ignore errors from already stopped oscillators
      }
      this.activeOscillator = null;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    if (this.qrmAmount > 0 && !this.qrmNoiseNode) {
      const noise = this.createNoiseGenerator();
      this.qrmNoiseNode = noise.source;
      this.qrmFilter = noise.filter;
      this.qrmGainNode = this.audioContext.createGain();
      const scaledGain = (this.qrmAmount / 100) ** 1.5 * 0.15;
      this.qrmGainNode.gain.value = scaledGain;

      this.qrmFilter.connect(this.qrmGainNode);
      this.qrmGainNode.connect(this.audioContext.destination);
    }

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);

    gainNode.gain.linearRampToValueAtTime(amplitude, now + this.attackTime);
    gainNode.gain.linearRampToValueAtTime(
      this.sustainLevel * amplitude,
      now + this.attackTime + this.decayTime
    );

    const releaseStart = now + duration - this.releaseTime;
    gainNode.gain.setValueAtTime(this.sustainLevel * amplitude, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, releaseStart + this.releaseTime);

    this.activeOscillator = { oscillator, gainNode };

    oscillator.start();
    oscillator.stop(now + duration);

    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('Aborted'));
        return;
      }

      signal?.addEventListener('abort', () => {
        reject(new Error('Aborted'));
      });

      oscillator.onended = () => {
        this.activeOscillator = null;
        resolve();
      };
    });
  }

  async playSequence(chars, wpm, farnsworthSpacing = 0) {
    // Stop any existing playback
    this.stopAll();

    // Set up new playback
    this.currentSequence = chars;
    this.currentWpm = wpm;
    this.farnsworthSpacing = farnsworthSpacing;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    this.isPlaying = true;

    try {
      // Calculate Farnsworth timings
      // Character speed stays at target WPM
      const characterWpm = wpm;

      // Overall speed is reduced by adding extra space
      const effectiveWpm = farnsworthSpacing > 0
        ? Math.min(wpm, wpm * (wpm / (wpm + farnsworthSpacing)))
        : wpm;

      // Base timings at character speed
      const dotLength = 1.2 / characterWpm;
      const standardSpace = dotLength * 3;

      // Calculate extra space needed to achieve effective WPM
      const extraSpace = farnsworthSpacing > 0
        ? (1.2 / effectiveWpm - 1.2 / characterWpm) * 7 // 7 units per character average
        : 0;

      const morseCode = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
        '/': '-..-.'
      };

      const qsbProfile = this.generateQsbProfile(dotLength, chars);

      for (let i = 0; i < chars.length; i++) {
        if (!this.isPlaying || signal.aborted) return;

        const char = chars[i];
        const amplitude = qsbProfile[i];
        const morse = morseCode[char.toUpperCase()] || '';

        // Play the character's dots and dashes
        for (const symbol of morse) {
          if (!this.isPlaying || signal.aborted) return;

          try {
            if (symbol === '.') {
              await this.playTone(dotLength, signal, amplitude);
            } else {
              await this.playTone(dotLength * 3, signal, amplitude);
            }

            // Add inter-symbol space within character
            if (!this.isPlaying || signal.aborted) return;
            await new Promise((resolve, reject) => {
              if (signal.aborted) {
                reject(new Error('Aborted'));
                return;
              }

              this.activeTimeout = setTimeout(() => {
                this.activeTimeout = null;
                resolve();
              }, dotLength * 1000);

              signal.addEventListener('abort', () => {
                if (this.activeTimeout) {
                  clearTimeout(this.activeTimeout);
                  this.activeTimeout = null;
                }
                reject(new Error('Aborted'));
              });
            });
          } catch (e) {
            if (e.message === 'Aborted') return;
            throw e;
          }
        }

        if (!this.isPlaying || signal.aborted) return;

        // Add inter-character space plus Farnsworth spacing
        await new Promise((resolve, reject) => {
          if (signal.aborted) {
            reject(new Error('Aborted'));
            return;
          }

          this.activeTimeout = setTimeout(() => {
            this.activeTimeout = null;
            resolve();
          }, (standardSpace + extraSpace) * 1000);

          signal.addEventListener('abort', () => {
            if (this.activeTimeout) {
              clearTimeout(this.activeTimeout);
              this.activeTimeout = null;
            }
            reject(new Error('Aborted'));
          });
        });
      }

      if (this.isPlaying && !signal.aborted) {
        this.activeTimeout = setTimeout(() => {
          if (this.isPlaying && !signal.aborted) {
            const newQsbProfile = this.generateQsbProfile(dotLength, chars);
            this.playSequence(chars, wpm, farnsworthSpacing);
          }
        }, 2000);
      }
    } catch (e) {
      if (e.message !== 'Aborted') throw e;
    }
  }

  start() {
    this.isPlaying = true;
  }

  stop() {
    this.stopAll();
  }

  setFrequency(freq) {
    this.frequency = freq;
    if (this.qrmFilter) {
      this.qrmFilter.frequency.value = freq;
    }
  }

  cleanup() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    MorseAudioManager.instance = null;
  }
}

export const morseAudio = new MorseAudioManager();