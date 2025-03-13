import { Cpu, AlertCircle } from 'lucide-react';

export const AlphaBanner = () => (
  <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600/90 via-red-500/90 to-red-600/90 text-white py-3 px-4 text-center font-bold z-50 shadow-lg backdrop-blur-sm">
    <div className="flex items-center justify-center gap-6">
      <span className="animate-pulse">⚠️</span>
      <span>ALPHA VERSION - EXPERIMENTAL</span>
      <span className="animate-pulse">⚠️</span>

      <div className="hidden sm:flex items-center gap-4 ml-4">
        <AlertCircle size={18} className="text-white/80" />
        <span className="text-white/90 text-sm">Contest Runner is under active development</span>
      </div>
    </div>
  </div>
);

export default AlphaBanner;
