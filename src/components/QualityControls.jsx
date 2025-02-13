import { InteractiveButton } from './InteractiveButton';

export const QualityControls = ({
  qsbAmount,
  onQsbChange,
  qrnAmount,
  onQrnChange
}) => (
  <div className="space-y-3 pb-1">
    <div className="bg-gray-700/50 p-3 rounded-lg">
      <div className="text-sm mb-2">Signal Fading (QSB)</div>
      <div className="flex items-center gap-2">
        <InteractiveButton
          onClick={() => onQsbChange(-10)}
          className="w-10 h-10 rounded bg-gray-600"
          disabled={qsbAmount <= 0}
        >-</InteractiveButton>
        <div className="flex-1">
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${qsbAmount}%` }}
            />
          </div>
          <div className="text-center mt-1">{qsbAmount}%</div>
        </div>
        <InteractiveButton
          onClick={() => onQsbChange(10)}
          className="w-10 h-10 rounded bg-gray-600"
          disabled={qsbAmount >= 100}
        >+</InteractiveButton>
      </div>
    </div>

    <div className="bg-gray-700/50 p-3 rounded-lg">
      <div className="text-sm mb-2">Interference (QRN)</div>
      <div className="flex items-center gap-2">
        <InteractiveButton
          onClick={() => onQrnChange(-10)}
          className="w-10 h-10 rounded bg-gray-600"
          disabled={qrnAmount <= 0}
        >-</InteractiveButton>
        <div className="flex-1">
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${qrnAmount}%` }}
            />
          </div>
          <div className="text-center mt-1">{qrnAmount}%</div>
        </div>
        <InteractiveButton
          onClick={() => onQrnChange(10)}
          className="w-10 h-10 rounded bg-gray-600"
          disabled={qrnAmount >= 100}
        >+</InteractiveButton>
      </div>
    </div>
  </div>
);
