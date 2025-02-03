export const ModeToggle = ({ label, description, isActive, onToggle }) => (
  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-base font-semibold text-gray-200">{label}</div>
        {description && (
          <div className="text-sm text-gray-400 mt-1">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            ${isActive ? 'bg-blue-500' : 'bg-gray-600'}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
              transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
        <span className="text-sm text-gray-400">
          {isActive ? 'On' : 'Off'}
        </span>
      </div>
    </div>
  </div>
);