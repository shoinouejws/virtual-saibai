import { FarmCellState } from '../types';
import { CropDisplay } from './CropDisplay';

interface Props {
  cell: FarmCellState;
  isSelected: boolean;
  isAnimating: boolean;
  onSelect: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  empty: 'bg-soil-empty',
  tilled: 'bg-soil-tilled',
  planted: 'bg-soil-tilled',
  growing: 'bg-soil-tilled',
  harvestable: 'bg-soil-tilled',
};

const STATUS_LABELS: Record<string, string> = {
  empty: '空き地',
  tilled: '耕し済み',
  planted: '種まき済み',
  growing: '成長中',
  harvestable: '収穫OK！',
};

export function FarmCell({ cell, isSelected, isAnimating, onSelect }: Props) {
  const bgClass = STATUS_STYLES[cell.status] ?? 'bg-soil-empty';
  const isHarvestable = cell.status === 'harvestable';

  return (
    <button
      onClick={onSelect}
      aria-label={`マス ${cell.id + 1}: ${STATUS_LABELS[cell.status]}`}
      className={`
        relative aspect-square rounded-2xl min-h-[140px]
        flex flex-col items-center justify-center gap-1
        transition-all duration-200 cursor-pointer
        border-3
        ${bgClass}
        ${isSelected
          ? 'border-farm-green ring-4 ring-farm-green/50 scale-105 shadow-lg shadow-farm-green/30'
          : 'border-transparent hover:border-farm-green/30 hover:scale-[1.02]'
        }
        ${isHarvestable ? 'animate-sparkle' : ''}
      `}
    >
      {/* 作物の表示 */}
      <div className={`
        flex items-center justify-center w-full h-full
        ${isAnimating ? 'animate-bounce-grow' : ''}
      `}>
        {cell.crop && cell.growthStage > 0 ? (
          <CropDisplay crop={cell.crop} stage={cell.growthStage} />
        ) : cell.status === 'tilled' ? (
          <span className="text-4xl opacity-60">〰️</span>
        ) : (
          <span className="text-4xl opacity-30">🟫</span>
        )}
      </div>

      {/* 選択インジケータ */}
      {isSelected && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2
          bg-farm-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full
          shadow-sm whitespace-nowrap z-10">
          ▼ 選択中
        </span>
      )}

      {/* ステータスラベル */}
      <span className={`
        absolute bottom-2 text-xs font-medium px-2 py-0.5 rounded-full
        ${isHarvestable
          ? 'bg-farm-gold/90 text-farm-text'
          : 'bg-black/30 text-white'
        }
      `}>
        {STATUS_LABELS[cell.status]}
      </span>
    </button>
  );
}
