import { FarmCellState, getCellDisplayStage } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';
import { CropDisplay } from './CropDisplay';
import { GrowthGauge, GaugeMode } from './GrowthGauge';
import { GrowthAnimationInfo } from '../hooks/useGameState';
import { getSoilImage } from '../utils/soilImage';

interface Props {
  cell: FarmCellState;
  isAnimating: boolean;
  gaugeMode: GaugeMode;
  growthAnim: GrowthAnimationInfo | null;
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

// 作物画像を表示すべきか（ステージ1・苗植え前は非表示）
function shouldShowCropImage(cell: FarmCellState, displayStage: number): boolean {
  if (!cell.crop || displayStage <= 0) return false;
  if (cell.cropState?.modelType === 'advanced') {
    const cs = cell.cropState;
    if (cs.cultivationStage === 1) return false;
    if (cs.cultivationStage === 2 && !cs.isPlanted) return false;
  }
  return true;
}

function getGrowthAnimSrc(anim: GrowthAnimationInfo): string {
  return `${BASE}assets/crops/${anim.cropType}/${anim.cropType}_stage${anim.fromStage}to${anim.toStage}_400ms.webp`;
}

function hasCrop(status: string): boolean {
  return status === 'planted' || status === 'growing' || status === 'harvestable';
}

export function FarmCell({ cell, isAnimating, gaugeMode, growthAnim, onSelect }: Props) {
  const isHarvestable = cell.status === 'harvestable';
  const showGauge = hasCrop(cell.status) && cell.crop !== null;
  const cropName = cell.crop ? CROP_DEFINITIONS[cell.crop].name : null;
  const displayStage = getCellDisplayStage(cell);
  const showCropImage = shouldShowCropImage(cell, displayStage);

  // いちごのステージ表示ラベル
  const stageLabel = (() => {
    if (!cell.crop || !cell.cropState) return null;
    if (cell.cropState.modelType === 'advanced') {
      const names = CROP_DEFINITIONS[cell.crop].stageNames;
      if (names) return names[cell.cropState.cultivationStage - 1] ?? null;
    }
    return null;
  })();

  return (
    <div className="pt-5 relative">
      <button
        onClick={onSelect}
        aria-label={`マス ${cell.id + 1}: ${STATUS_LABELS[cell.status]}${cropName ? ` (${cropName})` : ''}`}
        className={`
          relative aspect-square rounded-2xl min-h-[130px] w-full
          flex flex-col items-center justify-between
          transition-all duration-200 cursor-pointer
          border-3 overflow-hidden
          border-transparent hover:border-farm-green/30 hover:scale-[1.02]
          ${isHarvestable ? 'animate-sparkle' : ''}
        `}
      >
        {/* 土の背景画像 */}
        <img
          src={getSoilImage(cell)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          onError={e => { (e.currentTarget as HTMLImageElement).src = `${BASE}assets/crops/soil/soil-tilled.png`; }}
        />

        {/* 作物名バッジ */}
        {cropName && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <span className="
              inline-flex items-center px-2 py-1 rounded-lg
              text-[11px] font-semibold leading-none tracking-wide
              bg-gradient-to-br from-green-900/90 to-emerald-900/85
              text-white border border-white/25
              shadow-[0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-sm
            ">
              {cropName}
            </span>
          </div>
        )}

        {/* タップ誘導アイコン */}
        <div className="absolute top-1.5 right-1.5 z-20">
          <span className="text-white/50 text-xs">›</span>
        </div>

        {/* 作物の表示 */}
        <div className={`
          relative z-10 flex items-center justify-center w-full flex-1
          ${isAnimating ? 'animate-bounce-grow' : ''}
        `}>
          {showCropImage && (
            <CropDisplay crop={cell.crop!} stage={displayStage} status={cell.status} />
          )}
        </div>

        {/* 下部エリア */}
        <div className="relative z-10 w-full">
          {showGauge ? (
            <div className="bg-black/40 backdrop-blur-sm">
              <GrowthGauge cell={cell} mode={gaugeMode} />
            </div>
          ) : (
            <div className="flex justify-center pb-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 text-white">
                {stageLabel ?? STATUS_LABELS[cell.status]}
              </span>
            </div>
          )}
        </div>

        {/* 成長アニメーション */}
        {growthAnim && (
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl overflow-hidden bg-black/20">
            <img
              key={`${growthAnim.fromStage}-${growthAnim.toStage}`}
              src={getGrowthAnimSrc(growthAnim)}
              alt="成長アニメーション"
              className="w-full h-full object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </button>
    </div>
  );
}
