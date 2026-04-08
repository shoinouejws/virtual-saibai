import { FarmCellState, getCellStageProgress } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';

export type GaugeMode = 'total' | 'stage';

interface Props {
  cell: FarmCellState;
  mode: GaugeMode;
}

function getStageLabel(cell: FarmCellState): string {
  if (cell.status === 'harvestable') return '収穫可能';
  if (!cell.cropState) return '';

  if (cell.cropState.modelType === 'simple') {
    const NAMES = ['発芽', '双葉', '成長した芽', '開花', '結実'] as const;
    return NAMES[Math.min(cell.cropState.growthStage - 1, NAMES.length - 1)] ?? '';
  }

  const stageNames = cell.crop ? CROP_DEFINITIONS[cell.crop].stageNames : undefined;
  if (stageNames) return stageNames[cell.cropState.cultivationStage - 1] ?? '';
  return `ステージ${cell.cropState.cultivationStage}`;
}

function calcPercentage(cell: FarmCellState, mode: GaugeMode): number {
  if (cell.status === 'harvestable') return 100;
  if (!cell.cropState) return 0;

  if (cell.cropState.modelType === 'simple') {
    const { growthPoints, maxGrowthPoints, growthStage, maxGrowthStage } = cell.cropState;
    if (mode === 'total') {
      return Math.min((growthPoints / maxGrowthPoints) * 100, 100);
    }
    const pps = maxGrowthPoints / maxGrowthStage;
    const stageStart = (growthStage - 1) * pps;
    const stageProgress = growthPoints - stageStart;
    return Math.min((stageProgress / pps) * 100, 100);
  }

  return cell.cropState.stageProgress;
}

function getStageMarkers(cell: FarmCellState, mode: GaugeMode): number[] {
  if (mode !== 'total' || !cell.cropState || cell.cropState.modelType !== 'simple') return [];
  const { maxGrowthStage } = cell.cropState;
  return Array.from({ length: maxGrowthStage - 1 }, (_, i) => ((i + 1) / maxGrowthStage) * 100);
}

export function GrowthGauge({ cell, mode }: Props) {
  const isHarvestable = cell.status === 'harvestable';
  const percentage = calcPercentage(cell, mode);
  const stageLabel = getStageLabel(cell);
  const markers = getStageMarkers(cell, mode);

  return (
    <div className="w-full px-2 pb-2 pt-1">
      <div className="mb-1">
        <span className={`
          text-[10px] font-medium px-1.5 py-0.5 rounded leading-none
          ${isHarvestable
            ? 'bg-farm-gold/30 text-farm-gold'
            : 'bg-white/15 text-white/80'
          }
        `}>
          {stageLabel || (isHarvestable ? '収穫可能' : '')}
        </span>
      </div>

      <div className="relative h-2 bg-white/15 rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-500
            ${isHarvestable
              ? 'bg-farm-gold'
              : 'bg-white/60'
            }
          `}
          style={{ width: `${percentage}%` }}
        />
        {markers.map(pos => (
          <div
            key={pos}
            className="absolute top-0 h-full w-px bg-white/30"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>
    </div>
  );
}
