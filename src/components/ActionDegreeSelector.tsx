import { ActionDegree } from '../types';

interface Props {
  label: string;
  icon: string;
  onSelect: (degree: ActionDegree) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const DEGREES: { degree: ActionDegree; label: string; description: string; color: string }[] = [
  { degree: 'light', label: '少なめ', description: '控えめに', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { degree: 'normal', label: 'ふつう', description: '適量で', color: 'bg-farm-green-light text-farm-green-dark border-farm-green/30' },
  { degree: 'heavy', label: 'たっぷり', description: '多めに', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export function ActionDegreeSelector({ label, onSelect, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2 border-b border-farm-border">
          <h3 className="text-sm font-semibold text-farm-text text-center">
            {label} — 量を選択
          </h3>
        </div>
        <div className="p-3 flex gap-2">
          {DEGREES.map(({ degree, label: dl, description, color }) => (
            <button
              key={degree}
              onClick={() => onSelect(degree)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border
                font-medium text-sm active:scale-[0.97] transition-all duration-150
                ${color}
              `}
            >
              <span className="font-bold">{dl}</span>
              <span className="text-[11px] opacity-70">{description}</span>
            </button>
          ))}
        </div>
        <div className="px-3 pb-3">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-lg border border-farm-border text-farm-text-secondary text-sm font-medium
              hover:bg-farm-panel transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
