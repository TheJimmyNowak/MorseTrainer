import { useEffect, useState } from 'react';

export const Notification = ({ message, color = 'blue', onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const duration = 3000; // 3 seconds total duration

  useEffect(() => {
    if (onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 200); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, onDismiss, duration]);

  if (!message) return null;

  const colors = {
    blue: 'from-blue-500/95 to-blue-600/95',
    red: 'from-red-500/95 to-red-600/95',
    yellow: 'from-yellow-500/95 to-yellow-600/95',
    green: 'from-green-500/95 to-green-600/95',
    gray: 'from-gray-500/95 to-gray-600/95'
  };

  const progressColors = {
    blue: 'bg-blue-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
    gray: 'bg-gray-400'
  };

  return (
    <div
      className={`bg-gradient-to-r ${colors[color] || colors.blue}
        text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10
        backdrop-blur-sm animate-notification-fade-in relative
        transition-opacity duration-200 overflow-hidden
        ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="text-base font-medium text-center break-words mb-2">
        {message}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10">
        <div
          className={`h-full ${progressColors[color] || progressColors.blue} animate-notification-progress`}
          style={{
            animationDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
};