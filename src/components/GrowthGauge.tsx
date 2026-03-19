import { CellStatus } from '../types';

export type GaugeMode = 'total' | 'stage';

const STAGE_NAMES = ['発芽', '双葉', '成長した芽', '開花', '結実'] as const;

// [stage][progress < 50%, progress >= 50%]
const STAGE_COMMENTS: Record<number, [string, string]> = {
  1: ['芽が出ました！', '焦らず育てましょう！'],
  2: ['双葉が開いてきました！', 'ぐんぐん大きくなっています！'],
  3: ['葉っぱが元気に広がっています', 'しっかりした苗になってきました！'],
  4: ['きれいな花が咲きました！', '実がつくまであと少し、、？'],
  5: ['実がつきました！', '収穫のタイミングです！'],
};
const HARVESTABLE_COMMENT = '今が収穫のタイミングです！🎉';

interface Props {
  growthPoints: number;
  maxGrowthPoints: number;
  growthStage: number;
  maxGrowthStage: number;
  status: CellStatus;
  mode: GaugeMode;
}

export function GrowthGauge({
  growthPoints,
  maxGrowthPoints,
  growthStage,
  maxGrowthStage,
  status,
  mode,
}: Props) {
  const isHarvestable = status === 'harvestable';
  const pointsPerStage = maxGrowthPoints / maxGrowthStage;
  const stageName = STAGE_NAMES[Math.min(growthStage - 1, STAGE_NAMES.length - 1)];

  let percentage: number;

  if (isHarvestable) {
    percentage = 100;
  } else if (mode === 'total') {
    percentage = Math.min((growthPoints / maxGrowthPoints) * 100, 100);
  } else {
    const stageStart = (growthStage - 1) * pointsPerStage;
    const stageProgress = growthPoints - stageStart;
    percentage = Math.min((stageProgress / pointsPerStage) * 100, 100);
  }

  const comment = isHarvestable
    ? HARVESTABLE_COMMENT
    : (STAGE_COMMENTS[growthStage]?.[percentage >= 50 ? 1 : 0] ?? '');

  const stageMarkers = mode === 'total'
    ? Array.from({ length: maxGrowthStage - 1 }, (_, i) => ((i + 1) / maxGrowthStage) * 100)
    : [];

  return (
    <div className="w-full px-2 pb-2 pt-1">
      {/* ステージ名 */}
      <div className="mb-1">
        <span className={`
          text-[11px] font-semibold px-2 py-0.5 rounded-full leading-none
          ${isHarvestable
            ? 'bg-yellow-300 text-yellow-900'
            : 'bg-white/25 text-white'
          }
        `}>
          {isHarvestable ? '収穫OK！' : stageName}
        </span>
      </div>

      {/* ゲージバー */}
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
        {stageMarkers.map(pos => (
          <div
            key={pos}
            className="absolute top-0 h-full w-0.5 bg-white/40"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      {/* コメント */}
      <div className={`
        text-[10px] mt-1 leading-tight
        ${isHarvestable ? 'text-yellow-200 font-medium' : 'text-white/75'}
      `}>
        {comment}
      </div>
    </div>
  );
}
