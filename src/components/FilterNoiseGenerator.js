// FilterNoiseGenerator.js - CW Band Pass Filter Simulation for Morse Trainer
class FilterNoiseGenerator {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.noiseSource = null;
    this.filterChain = null;
    this.atmosphericOsc = null;
    this.atmosphericOsc2 = null;
    this.notchFilter = null;
    this.notchLFO = null;
    this.isPlaying = false;
    
    // Default parameters
    this.params = {
      filterResonance: 25,      // Q factor (resonance) of bandpass filter
      filterFrequency: 600,     // Center frequency of the bandpass filter (Hz)
      resonanceJump: 0.8,       // Random Q jumps intensity
      warmth: 8,                // Low-mid frequency boost (dB)
      atmosphericIntensity: 0.5, // Atmospheric noise modulation
      crackleIntensity: 0.05,   // Random pops and crackles intensity
      driftSpeed: 0.5           // Frequency drift speed
    };
    
    // Cleanup handles
    this.jumpInterval = null;
    this.driftInterval = null;
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
      
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.2; // Default to a lower volume
      this.masterGain.connect(this.audioContext.destination);
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  updateParameter(param, value) {
    this.params[param] = value;
    
    if (this.filterChain) {
      switch(param) {
        case 'filterResonance':
          this.filterChain.bandpass1.Q.value = value;
          this.filterChain.bandpass2.Q.value = value * 0.8;
          break;
        case 'filterFrequency':
          this.filterChain.bandpass1.frequency.value = value;
          this.filterChain.bandpass2.frequency.value = value + 30;
          break;
        case 'warmth':
          this.filterChain.peaking1.gain.value = value;
          break;
        case 'atmosphericIntensity':
          if (this.atmosphericGain) {
            // Immediate effect for better feedback
            const now = this.audioContext.currentTime;
            this.atmosphericGain.gain.cancelScheduledValues(now);
            this.atmosphericGain.gain.setValueAtTime(value * 3, now);
          }
          if (this.atmosphericGain2) {
            const now = this.audioContext.currentTime;
            this.atmosphericGain2.gain.cancelScheduledValues(now);
            this.atmosphericGain2.gain.setValueAtTime(value * 2, now);
          }
          
          // Restart drift with new settings for immediate effect
          if (this.driftInterval) {
            clearInterval(this.driftInterval);
            this.setupDrift();
          }
          
          // Also update any noise generation parameters that depend on atmospheric intensity
          if (this.noiseSource) {
            // Can't modify existing noise, but we can restart with new settings
            // This would be invasive, so we just adjust the drift and existing oscillators
          }
          break;
        case 'driftSpeed':
          if (this.driftInterval) {
            clearInterval(this.driftInterval);
            this.setupDrift();
          }
          break;
      }
    }
  }

  createFilterChain() {
    // Primary bandpass filter (main tone shaper)
    const bandpass1 = this.audioContext.createBiquadFilter();
    bandpass1.type = 'bandpass';
    bandpass1.frequency.value = this.params.filterFrequency;
    bandpass1.Q.value = this.params.filterResonance;

    // Secondary bandpass for complexity
    const bandpass2 = this.audioContext.createBiquadFilter();
    bandpass2.type = 'bandpass';
    bandpass2.frequency.value = this.params.filterFrequency + 30;
    bandpass2.Q.value = this.params.filterResonance * 0.8;

    // Warmth control (midrange emphasis)
    const peaking1 = this.audioContext.createBiquadFilter();
    peaking1.type = 'peaking';
    peaking1.frequency.value = 550;
    peaking1.Q.value = 2;
    peaking1.gain.value = this.params.warmth;

    // Highpass to remove rumble
    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 200;
    highpass.Q.value = 0.7;

    // Compressor to tame peaks
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Connect the chain
    bandpass1
      .connect(bandpass2)
      .connect(peaking1)
      .connect(highpass)
      .connect(compressor);

    return { bandpass1, bandpass2, peaking1, highpass, compressor };
  }

  startResonanceJumps() {
    const jumpInterval = 80;
    
    this.jumpInterval = setInterval(() => {
      if (this.isPlaying && this.filterChain) {
        // Randomly apply filter resonance jumps to simulate instability
        if (Math.random() < 0.15) {
          const baseQ = this.params.filterResonance;
          const jumpAmount = (Math.random() * 15 - 7.5) * this.params.resonanceJump;
          
          this.filterChain.bandpass1.Q.setValueAtTime(
            baseQ + jumpAmount,
            this.audioContext.currentTime
          );
          this.filterChain.bandpass2.Q.setValueAtTime(
            (baseQ + jumpAmount) * 0.8,
            this.audioContext.currentTime
          );

          // Return to normal after a short time
          this.filterChain.bandpass1.Q.setTargetAtTime(
            baseQ,
            this.audioContext.currentTime + 0.05,
            0.05
          );
          this.filterChain.bandpass2.Q.setTargetAtTime(
            baseQ * 0.8,
            this.audioContext.currentTime + 0.05,
            0.05
          );
        }
      }
    }, jumpInterval);
  }

  setupDrift() {
    // Frequency drift simulation
    const baseDriftInterval = 2000 / Math.max(0.1, this.params.driftSpeed);
    this.driftInterval = setInterval(() => {
      if (this.isPlaying && this.filterChain) {
        // More complex drift with larger deviations based on atmospheric intensity
        const driftRange = 40 + (this.params.atmosphericIntensity * 30); // Increased influence
        const newFreq = this.params.filterFrequency + (Math.random() * driftRange - driftRange/2);
        
        // Use more noticeable drift for higher atmospheric values
        const driftTime = this.params.atmosphericIntensity > 1.5 ? 0.2 : 0.5;
        
        // Use the current time to ensure accurate scheduling
        const now = this.audioContext.currentTime;
        
        // Cancel any scheduled values to ensure our new values take effect
        this.filterChain.bandpass1.frequency.cancelScheduledValues(now);
        this.filterChain.bandpass2.frequency.cancelScheduledValues(now);
        
        // Set frequency with exponential ramp for more natural sound
        this.filterChain.bandpass1.frequency.setTargetAtTime(
          newFreq, 
          now, 
          driftTime
        );
        this.filterChain.bandpass2.frequency.setTargetAtTime(
          newFreq + 30, 
          now, 
          driftTime
        );
        
        // For high atmospheric intensity, add some randomness to the Q as well
        if (this.params.atmosphericIntensity > 1.0) {
          const qVariation = Math.random() * 10 * (this.params.atmosphericIntensity - 1.0);
          const baseQ = this.params.filterResonance;
          
          this.filterChain.bandpass1.Q.cancelScheduledValues(now);
          this.filterChain.bandpass2.Q.cancelScheduledValues(now);
          
          this.filterChain.bandpass1.Q.setTargetAtTime(
            baseQ + qVariation,
            now,
            driftTime * 2
          );
          this.filterChain.bandpass2.Q.setTargetAtTime(
            (baseQ + qVariation) * 0.8,
            now,
            driftTime * 2
          );
        }
      }
    }, baseDriftInterval);
  }

  createNoise() {
    // Create a noise buffer with various characteristics
    const bufferSize = 4 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Variables for more organic noise generation
    let lastValue = 0;
    let lastValue2 = 0;
    let phase = 0;
    
    // Atmospheric intensity affects noise generation
    const atmosphericFactor = Math.min(2, 0.5 + this.params.atmosphericIntensity);
    
    for (let i = 0; i < bufferSize; i++) {
      // Brownian noise component (smoother than white noise)
      const brown = (Math.random() * 2 - 1) * 0.02 * atmosphericFactor;
      lastValue = (lastValue + brown) / 1.02;
      
      // Slow atmospheric modulation
      phase += 0.0001;
      const slowVar = Math.sin(phase) * 0.05 * this.params.atmosphericIntensity * 2;
      
      // Random pops and crackles
      const popProbability = 0.9995 - (this.params.atmosphericIntensity * 0.0001);
      const pop = Math.random() > popProbability ? 
        (Math.random() * 2 - 1) * this.params.crackleIntensity * atmosphericFactor : 0;
      
      lastValue2 = (lastValue2 + lastValue) / 2 + slowVar + pop;
      output[i] = lastValue2 * 3.0;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Create and connect the filter chain
    const filters = this.createFilterChain();
    this.filterChain = filters;

    // Create atmospheric modulation oscillator
    const atmosphericOsc = this.audioContext.createOscillator();
    this.atmosphericGain = this.audioContext.createGain();
    atmosphericOsc.frequency.value = 0.1;
    this.atmosphericGain.gain.value = this.params.atmosphericIntensity * 3; // Enhanced atmospheric effect
    atmosphericOsc.connect(this.atmosphericGain);
    this.atmosphericGain.connect(filters.bandpass1.frequency);
    atmosphericOsc.start();

    // Add a secondary atmospheric oscillator for more complex variations
    const atmosphericOsc2 = this.audioContext.createOscillator();
    this.atmosphericGain2 = this.audioContext.createGain();
    atmosphericOsc2.frequency.value = 0.17; // Slightly different frequency for modulation
    this.atmosphericGain2.gain.value = this.params.atmosphericIntensity * 2;
    atmosphericOsc2.connect(this.atmosphericGain2);
    this.atmosphericGain2.connect(filters.bandpass2.frequency);
    atmosphericOsc2.start();

    // Add more dynamic filtering for higher atmospheric settings
    if (this.params.atmosphericIntensity > 1.0) {
      // Add a slight notch filter that moves over time for atmospheric shimmer
      const notchFilter = this.audioContext.createBiquadFilter();
      notchFilter.type = 'notch';
      notchFilter.frequency.value = this.params.filterFrequency * 1.5;
      notchFilter.Q.value = 8;
      
      // Connect it after the bandpass filtering
      filters.bandpass2.disconnect();
      filters.bandpass2.connect(notchFilter);
      notchFilter.connect(filters.peaking1);
      
      // Set up an LFO for the notch
      const notchLFO = this.audioContext.createOscillator();
      const notchLFOGain = this.audioContext.createGain();
      notchLFO.frequency.value = 0.05;
      notchLFOGain.gain.value = 100 * this.params.atmosphericIntensity;
      notchLFO.connect(notchLFOGain);
      notchLFOGain.connect(notchFilter.frequency);
      notchLFO.start();
      
      // Store references for cleanup
      this.notchFilter = notchFilter;
      this.notchLFO = notchLFO;
    }

    // Connect noise to the filter chain
    noiseSource.connect(filters.bandpass1);
    filters.compressor.connect(this.masterGain);

    // Start the modulation effects
    this.startResonanceJumps();
    this.setupDrift();

    return {
      source: noiseSource,
      oscillator: atmosphericOsc,
      oscillator2: atmosphericOsc2
    };
  }

  async start() {
    await this.initialize();
    
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Create noise and start playing
    const nodes = this.createNoise();
    this.noiseSource = nodes.source;
    this.atmosphericOsc = nodes.oscillator;
    this.atmosphericOsc2 = nodes.oscillator2;
    this.noiseSource.start();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    // Gracefully stop everything
    const stopTime = this.audioContext?.currentTime + 0.1 || 0;
    
    if (this.noiseSource) {
      try {
        this.noiseSource.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping noise source:', e);
      }
      this.noiseSource = null;
    }
    
    if (this.atmosphericOsc) {
      try {
        this.atmosphericOsc.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping atmospheric oscillator:', e);
      }
      this.atmosphericOsc = null;
    }
    
    if (this.atmosphericOsc2) {
      try {
        this.atmosphericOsc2.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping second atmospheric oscillator:', e);
      }
      this.atmosphericOsc2 = null;
    }
    
    if (this.notchLFO) {
      try {
        this.notchLFO.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping notch LFO:', e);
      }
      this.notchLFO = null;
    }
    
    // Clear intervals
    if (this.jumpInterval) {
      clearInterval(this.jumpInterval);
      this.jumpInterval = null;
    }
    
    if (this.driftInterval) {
      clearInterval(this.driftInterval);
      this.driftInterval = null;
    }
    
    this.filterChain = null;
    this.notchFilter = null;
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1.5, value));
    }
  }

  // Set filter center frequency to match the Morse tone
  syncFrequency(toneFrequency) {
    this.params.filterFrequency = toneFrequency;
    if (this.filterChain) {
      this.filterChain.bandpass1.frequency.value = toneFrequency;
      this.filterChain.bandpass2.frequency.value = toneFrequency + 30;
    }
  }

  cleanup() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close().catch(err => console.warn('Error closing audio context:', err));
      this.audioContext = null;
    }
  }
}

export const filterNoise = new FilterNoiseGenerator();
