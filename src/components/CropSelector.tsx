import { CropType } from '../types';
import { CROP_DEFINITIONS, CROP_LIST } from '../data/crops';

interface Props {
  onSelect: (crop: CropType) => void;
  onClose: () => void;
}

export function CropSelector({ onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-farm-text text-center mb-4">
          作物を選んでください
        </h3>
        <div className="flex flex-col gap-2">
          {CROP_LIST.map(type => {
            const crop = CROP_DEFINITIONS[type];
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg
                  bg-farm-panel hover:bg-farm-green-light border border-farm-border
                  hover:border-farm-green/40 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="text-left">
                  <div className="font-semibold text-farm-text text-sm">{crop.name}</div>
                  <div className="text-[11px] text-farm-text-secondary">
                    成長段階: {crop.growthStages}段階
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-farm-text-secondary hover:text-farm-text transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
