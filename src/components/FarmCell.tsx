import { FarmCellState } from '../types';
import { CropDisplay } from './CropDisplay';

interface Props {
  cell: FarmCellState;
  isSelected: boolean;
  isAnimating: boolean;
  onSelect: () => void;
}

const BASE = import.meta.env.BASE_URL;

const STATUS_LABELS: Record<string, string> = {
  empty: '空き地',
  tilled: '耕し済み',
  planted: '種まき済み',
  growing: '成長中',
  harvestable: '収穫OK！',
};

const showSoilImage = (_status: string) => true;

function getSoilImage(status: string): string {
  return status === 'empty'
    ? `${BASE}assets/crops/soil-empty.png`
    : `${BASE}assets/crops/soil-tilled.png`;
}

export function FarmCell({ cell, isSelected, isAnimating, onSelect }: Props) {
  const isHarvestable = cell.status === 'harvestable';

  return (
    <div className="pt-4">
      <button
        onClick={onSelect}
        aria-label={`マス ${cell.id + 1}: ${STATUS_LABELS[cell.status]}`}
        className={`
          relative aspect-square rounded-2xl min-h-[140px] w-full
          flex flex-col items-center justify-center
          transition-all duration-200 cursor-pointer
          border-3
          ${isSelected
            ? 'border-farm-green ring-4 ring-farm-green/50 scale-105 shadow-lg shadow-farm-green/30'
            : 'border-transparent hover:border-farm-green/30 hover:scale-[1.02]'
          }
          ${isHarvestable ? 'animate-sparkle' : ''}
          bg-soil-tilled
        `}
      >
        {/* 土の背景画像（空き地・耕し済みのみ） */}
        {showSoilImage(cell.status) && (
          <img
            src={getSoilImage(cell.status)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          />
        )}

        {/* 作物の表示 */}
        <div className={`
          relative z-10 flex items-center justify-center w-full h-full
          ${isAnimating ? 'animate-bounce-grow' : ''}
        `}>
          {cell.crop && cell.growthStage > 0 && (
            <CropDisplay crop={cell.crop} stage={cell.growthStage} />
          )}
        </div>

        {/* 選択インジケータ */}
        {isSelected && (
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 z-20
            bg-farm-green text-white text-xs font-bold px-3 py-1 rounded-full
            shadow-md whitespace-nowrap">
            ▼ 選択中
          </span>
        )}

        {/* ステータスラベル */}
        <span className={`
          absolute bottom-2 z-10 text-xs font-medium px-2 py-0.5 rounded-full
          ${isHarvestable
            ? 'bg-farm-gold/90 text-farm-text'
            : 'bg-black/40 text-white'
          }
        `}>
          {STATUS_LABELS[cell.status]}
        </span>
      </button>
    </div>
  );
}
