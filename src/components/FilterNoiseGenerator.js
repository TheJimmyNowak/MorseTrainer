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
    this.amplitudeModulator = null;
    this.amGain = null;
    
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
    
    // Reference volume settings
    this.morseAudioVolume = 0.8; // Default Morse audio volume
    this.relativeVolume = 0.5;   // Default relative volume (50% of Morse volume)
    
    // Cleanup handles
    this.jumpInterval = null;
    this.driftInterval = null;
    this.fadingInterval = null;
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
      
      this.masterGain = this.audioContext.createGain();
      // Initialize with relative volume calculation
      this.masterGain.gain.value = this.calculateRelativeVolume();
      this.masterGain.connect(this.audioContext.destination);
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Calculate volume based on relative percentage to Morse audio volume
  calculateRelativeVolume() {
    return this.morseAudioVolume * this.relativeVolume;
  }

  // Set the reference Morse audio volume
  setMorseAudioVolume(volume) {
    this.morseAudioVolume = volume;
    if (this.masterGain) {
      this.masterGain.gain.value = this.calculateRelativeVolume();
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
            // Immediate effect for better feedback - increased effect
            const now = this.audioContext.currentTime;
            this.atmosphericGain.gain.cancelScheduledValues(now);
            this.atmosphericGain.gain.setValueAtTime(value * 5, now); // Increased from 3 to 5
          }
          if (this.atmosphericGain2) {
            const now = this.audioContext.currentTime;
            this.atmosphericGain2.gain.cancelScheduledValues(now);
            this.atmosphericGain2.gain.setValueAtTime(value * 4, now); // Increased from 2 to 4
          }
          
          // Set up amplitude modulation for higher atmospheric settings
          this.setupAmplitudeModulation(value);
          
          // Restart drift with new settings for immediate effect
          if (this.driftInterval) {
            clearInterval(this.driftInterval);
            this.setupDrift();
          }
          
          // Setup periodic fading for ionospheric simulation
          this.setupIonosphericFading(value);
          
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

  setupAmplitudeModulation(intensity) {
    // Clean up existing modulator
    if (this.amplitudeModulator) {
      try {
        this.amplitudeModulator.stop();
      } catch (e) {}
      this.amplitudeModulator = null;
    }
    
    if (this.amGain) {
      this.amGain.disconnect();
      this.amGain = null;
    }
    
    // Only setup AM for higher intensity values
    if (intensity > 3.0 && this.audioContext && this.masterGain) {
      const now = this.audioContext.currentTime;
      
      // Create amplitude modulation oscillator
      this.amplitudeModulator = this.audioContext.createOscillator();
      this.amGain = this.audioContext.createGain();
      
      // Slow AM frequency for ionospheric flutter 
      const amSpeed = 0.05 + (Math.random() * 0.1 * (intensity - 3.0));
      this.amplitudeModulator.frequency.value = amSpeed;
      
      // Calculate depth based on intensity (0 to 0.8)
      const amDepth = Math.min(0.8, (intensity - 3.0) * 0.15);
      this.amGain.gain.value = amDepth;
      
      // Connect AM to manipulate master gain
      this.amplitudeModulator.connect(this.amGain);
      
      // Start the modulator
      this.amplitudeModulator.start();
      
      // Setup periodic modulation pattern
      this.setupModulationPattern(intensity);
    }
  }
  
  setupModulationPattern(intensity) {
    if (!this.amGain || !this.masterGain || intensity <= 3.0) return;
    
    // First cancel any previous scheduled values
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    
    // Set current value to avoid jumps
    const currentGain = this.calculateRelativeVolume();
    this.masterGain.gain.setValueAtTime(currentGain, now);
    
    const modDepth = Math.min(0.7, (intensity - 3.0) * 0.15);
    
    // Instead of using setValueCurveAtTime, use individual value settings
    // This avoids the overlapping curves problem
    const duration = 5 + (Math.random() * 5);
    const steps = 10; // Reduced number of steps
    const stepTime = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const timeOffset = now + (i * stepTime);
      const normalizedPos = i / steps;
      
      // Create a sinusoidal modulation pattern
      const fadeAmount = Math.sin(normalizedPos * Math.PI * 2) * modDepth;
      const gainValue = currentGain * (1 - fadeAmount);
      
      // Schedule each point individually
      this.masterGain.gain.linearRampToValueAtTime(gainValue, timeOffset);
    }
    
    // Schedule next pattern with a safe delay
    setTimeout(() => {
      if (this.isPlaying && intensity > 3.0) {
        this.setupModulationPattern(intensity);
      }
    }, duration * 1000 + 50); // Full duration plus a small safety margin
  }
  
  setupIonosphericFading(intensity) {
    // Clear existing fading interval
    if (this.fadingInterval) {
      clearInterval(this.fadingInterval);
      this.fadingInterval = null;
    }
    
    // Only set up fading for higher intensity values
    if (intensity > 4.0 && this.audioContext) {
      const fadingIntervalTime = 2000 + (Math.random() * 3000);
      
      this.fadingInterval = setInterval(() => {
        if (this.isPlaying && this.masterGain) {
          // Random chance for fading based on intensity
          const fadeChance = (intensity - 4.0) * 0.15;
          
          if (Math.random() < fadeChance) {
            const now = this.audioContext.currentTime;
            const baseGain = this.calculateRelativeVolume();
            
            // How deep the fade goes (deeper at higher intensities)
            const fadeDepth = 0.7 + ((intensity - 4.0) * 0.1);
            const fadeTarget = baseGain * (1 - fadeDepth);
            
            // How long the fade lasts
            const fadeDuration = 0.2 + (Math.random() * 0.5);
            
            // Apply fade out
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(baseGain, now);
            this.masterGain.gain.linearRampToValueAtTime(fadeTarget, now + fadeDuration);
            
            // And fade back in
            this.masterGain.gain.linearRampToValueAtTime(baseGain, now + fadeDuration * 2);
          }
        }
      }, fadingIntervalTime);
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
        const driftRange = 40 + (this.params.atmosphericIntensity * 50); // Increased from 30 to 50
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
        
        // For high atmospheric intensity, add more randomness to the Q as well
        if (this.params.atmosphericIntensity > 1.0) {
          const qVariation = Math.random() * 15 * (this.params.atmosphericIntensity - 1.0); // Increased from 10 to 15
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
        
        // Add dramatic fading for higher atmospheric values (5+)
        if (this.params.atmosphericIntensity > 5.0) {
          // Random deep fades to simulate extreme ionospheric conditions
          if (Math.random() < 0.15) { // 15% chance per drift cycle
            const fadeDepth = 0.6 + (Math.random() * 0.3); // Between 60-90% reduction
            const fadeDuration = 0.3 + (Math.random() * 0.5); // 0.3-0.8 seconds
            const currentGain = this.calculateRelativeVolume();
            
            // Apply fade out then back in
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(currentGain, now);
            this.masterGain.gain.linearRampToValueAtTime(
              currentGain * (1 - fadeDepth), 
              now + fadeDuration
            );
            this.masterGain.gain.linearRampToValueAtTime(
              currentGain,
              now + (fadeDuration * 2)
            );
          }
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
    const atmosphericFactor = Math.min(3, 0.5 + this.params.atmosphericIntensity); // Increased from 2 to 3
    
    for (let i = 0; i < bufferSize; i++) {
      // Brownian noise component (smoother than white noise)
      const brown = (Math.random() * 2 - 1) * 0.02 * atmosphericFactor;
      lastValue = (lastValue + brown) / 1.02;
      
      // Slow atmospheric modulation
      phase += 0.0001;
      const slowVar = Math.sin(phase) * 0.05 * this.params.atmosphericIntensity * 3; // Increased from 2 to 3
      
      // Random pops and crackles
      const popProbability = 0.9995 - (this.params.atmosphericIntensity * 0.0002); // Increased impact
      const pop = Math.random() > popProbability ? 
        (Math.random() * 2 - 1) * this.params.crackleIntensity * atmosphericFactor : 0;
      
      lastValue2 = (lastValue2 + lastValue) / 2 + slowVar + pop;
      output[i] = lastValue2 * 4.0; // Increased from 3.0 to 4.0 for more pronounced effect
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
    this.atmosphericGain.gain.value = this.params.atmosphericIntensity * 5; // Enhanced atmospheric effect (from 3 to 5)
    atmosphericOsc.connect(this.atmosphericGain);
    this.atmosphericGain.connect(filters.bandpass1.frequency);
    atmosphericOsc.start();

    // Add a secondary atmospheric oscillator for more complex variations
    const atmosphericOsc2 = this.audioContext.createOscillator();
    this.atmosphericGain2 = this.audioContext.createGain();
    atmosphericOsc2.frequency.value = 0.17; // Slightly different frequency for modulation
    this.atmosphericGain2.gain.value = this.params.atmosphericIntensity * 4; // Increased from 2 to 4
    atmosphericOsc2.connect(this.atmosphericGain2);
    this.atmosphericGain2.connect(filters.bandpass2.frequency);
    atmosphericOsc2.start();
    
    // Add a third modulator for very high atmospheric settings (new)
    if (this.params.atmosphericIntensity > 4.0) {
      const atmosphericOsc3 = this.audioContext.createOscillator();
      const atmosphericGain3 = this.audioContext.createGain();
      // Use a faster modulation for fluttering effects
      atmosphericOsc3.frequency.value = 0.33 + (Math.random() * 0.2);
      atmosphericGain3.gain.value = this.params.atmosphericIntensity * 2;
      atmosphericOsc3.connect(atmosphericGain3);
      atmosphericGain3.connect(this.masterGain.gain);
      atmosphericOsc3.start();
      
      // Store a reference
      this.atmosphericOsc3 = atmosphericOsc3;
      this.atmosphericGain3 = atmosphericGain3;
    }

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
      notchLFO.frequency.value = 0.05 + (this.params.atmosphericIntensity * 0.01); // Vary with intensity
      notchLFOGain.gain.value = 150 * this.params.atmosphericIntensity; // Increased from 100 to 150
      notchLFO.connect(notchLFOGain);
      notchLFOGain.connect(notchFilter.frequency);
      notchLFO.start();
      
      // For very high atmospheric values, add a phasing effect
      if (this.params.atmosphericIntensity > 3.0) {
        const allpassFilter = this.audioContext.createBiquadFilter();
        allpassFilter.type = 'allpass';
        allpassFilter.frequency.value = this.params.filterFrequency * 0.9;
        allpassFilter.Q.value = 5;
        
        // Connect in parallel with the notch
        notchFilter.disconnect();
        notchFilter.connect(allpassFilter);
        allpassFilter.connect(filters.peaking1);
        
        // Modulate the allpass for phasing effects
        const phaserLFO = this.audioContext.createOscillator();
        const phaserGain = this.audioContext.createGain();
        phaserLFO.frequency.value = 0.03;
        phaserGain.gain.value = 200 * (this.params.atmosphericIntensity - 3.0);
        phaserLFO.connect(phaserGain);
        phaserGain.connect(allpassFilter.frequency);
        phaserLFO.start();
        
        // Store references
        this.allpassFilter = allpassFilter;
        this.phaserLFO = phaserLFO;
      }
      
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
    
    if (this.atmosphericOsc3) {
      try {
        this.atmosphericOsc3.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping third atmospheric oscillator:', e);
      }
      this.atmosphericOsc3 = null;
    }
    
    if (this.notchLFO) {
      try {
        this.notchLFO.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping notch LFO:', e);
      }
      this.notchLFO = null;
    }
    
    if (this.phaserLFO) {
      try {
        this.phaserLFO.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping phaser LFO:', e);
      }
      this.phaserLFO = null;
    }
    
    if (this.amplitudeModulator) {
      try {
        this.amplitudeModulator.stop(stopTime);
      } catch (e) {
        console.warn('Error stopping amplitude modulator:', e);
      }
      this.amplitudeModulator = null;
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
    
    if (this.fadingInterval) {
      clearInterval(this.fadingInterval);
      this.fadingInterval = null;
    }
    
    // Clean up filter chain references
    this.filterChain = null;
    this.notchFilter = null;
    this.allpassFilter = null;
    this.atmosphericGain = null;
    this.atmosphericGain2 = null;
    this.atmosphericGain3 = null;
    this.amGain = null;
  }

  setVolume(value) {
    // Increased the maximum volume to 5.0 (500% of CW signal)
    this.relativeVolume = Math.max(0, Math.min(5.0, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this.calculateRelativeVolume();
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
