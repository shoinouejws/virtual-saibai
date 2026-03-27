import { FarmCellState, getCellStageProgress } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';

export type GaugeMode = 'total' | 'stage';

interface Props {
  cell: FarmCellState;
  mode: GaugeMode;
}

function getStageLabel(cell: FarmCellState): string {
  if (cell.status === 'harvestable') return '収穫OK！';
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

  // アドバンスドモデルは常に stageProgress を使う
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
  const stageProgress = getCellStageProgress(cell);

  const comment = isHarvestable
    ? '今が収穫のタイミングです！🎉'
    : stageProgress >= 50
      ? 'もう少しで次のステージへ！'
      : 'じっくり育てましょう';

  return (
    <div className="w-full px-2 pb-2 pt-1">
      <div className="mb-1">
        <span className={`
          text-[11px] font-semibold px-2 py-0.5 rounded-full leading-none
          ${isHarvestable
            ? 'bg-yellow-300 text-yellow-900'
            : 'bg-white/25 text-white'
          }
        `}>
          {stageLabel || (isHarvestable ? '収穫OK！' : '')}
        </span>
      </div>

      <div className="relative h-3 bg-white/20 rounded-full overflow-hidden border border-white/10">
        <div
          className={`
            h-full rounded-full transition-all duration-500
            ${isHarvestable
              ? 'bg-gradient-to-r from-yellow-300 to-yellow-400'
              : 'bg-gradient-to-r from-emerald-400 to-green-300'
            }
          `}
          style={{ width: `${percentage}%` }}
        />
        {markers.map(pos => (
          <div
            key={pos}
            className="absolute top-0 h-full w-0.5 bg-white/40"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      <div className={`
        text-[10px] mt-1 leading-tight
        ${isHarvestable ? 'text-yellow-200 font-medium' : 'text-white/75'}
      `}>
        {comment}
      </div>
    </div>
  );
}
