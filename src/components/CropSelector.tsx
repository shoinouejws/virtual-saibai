import { CropType } from '../types';
import { CROP_DEFINITIONS, CROP_LIST, CROP_STAGE_EMOJI } from '../data/crops';

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
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-farm-text text-center mb-4">
          🌱 作物を選んでください
        </h3>
        <div className="flex flex-col gap-3">
          {CROP_LIST.map(type => {
            const crop = CROP_DEFINITIONS[type];
            const emoji = CROP_STAGE_EMOJI[type];
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl
                  bg-farm-bg hover:bg-farm-green/10 border-2 border-transparent
                  hover:border-farm-green transition-all duration-200 active:scale-95"
              >
                <span className="text-3xl">{emoji[emoji.length - 1]}</span>
                <div className="text-left">
                  <div className="font-bold text-farm-text">{crop.name}</div>
                  <div className="text-xs text-gray-500">
                    成長段階: {crop.growthStages} → {emoji.join(' → ')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
