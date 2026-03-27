import { ActionDegree } from '../types';

interface Props {
  label: string;
  icon: string;
  onSelect: (degree: ActionDegree) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const DEGREES: { degree: ActionDegree; label: string; description: string; color: string }[] = [
  { degree: 'light', label: '少なめ', description: '控えめに', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { degree: 'normal', label: 'ふつう', description: '適量で', color: 'bg-green-100 text-green-700 border-green-200' },
  { degree: 'heavy', label: 'たっぷり', description: '多めに', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

export function ActionDegreeSelector({ label, icon, onSelect, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <h3 className="text-sm font-bold text-farm-text text-center">
            {icon} {label} — 量を選んでください
          </h3>
        </div>
        <div className="p-3 flex gap-2">
          {DEGREES.map(({ degree, label: dl, description, color }) => (
            <button
              key={degree}
              onClick={() => onSelect(degree)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border
                font-medium text-sm active:scale-95 transition-all duration-150
                ${color}
              `}
            >
              <span className="text-lg">
                {degree === 'light' ? '🌦️' : degree === 'normal' ? '☔' : '🌊'}
              </span>
              <span className="font-bold">{dl}</span>
              <span className="text-[11px] opacity-70">{description}</span>
            </button>
          ))}
        </div>
        <div className="px-3 pb-3">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium
              hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
