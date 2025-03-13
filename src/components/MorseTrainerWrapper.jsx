'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Settings, Radio, AlertCircle } from 'lucide-react';

// Dynamically load MorseTrainer to prevent SSR issues with audio contexts
const MorseTrainer = dynamic(() => import('./MorseTrainer'), {
  ssr: false,
  loading: () => <LoadingScreen />
});

// Simple loading screen while the trainer loads
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Morse Code Trainer
        </h1>
        <div className="mt-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-6 text-xl text-gray-400">Loading audio components...</p>
      </div>
    </div>
  </div>
);

// Audio fallback for browsers that don't support Web Audio API
const AudioFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Morse Code Trainer
        </h1>
        <div className="mt-12 flex items-center justify-center text-red-500">
          <AlertCircle size={48} />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-red-400">Audio Not Supported</h2>
        <p className="mt-6 text-xl text-gray-400">
          Your browser doesn't support the Web Audio API required for this application.
          <br />
          Please try using a modern browser like Chrome, Firefox, or Edge.
        </p>
      </div>
    </div>
  </div>
);

export default function MorseTrainerWrapper() {
  const [audioSupported, setAudioSupported] = useState(true);
  
  // Check if browser supports Web Audio API
  useEffect(() => {
    try {
      // Test if AudioContext is available
      if (typeof window !== 'undefined' && 
          (window.AudioContext || window.webkitAudioContext)) {
        setAudioSupported(true);
      } else {
        setAudioSupported(false);
      }
    } catch (e) {
      setAudioSupported(false);
    }
  }, []);

  if (!audioSupported) {
    return <AudioFallback />;
  }

  return <MorseTrainer />;
}
