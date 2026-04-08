import { FarmCellState, getCellDisplayStage } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';
import { CropDisplay } from './CropDisplay';
import { StrawberryStage8ReferenceSlot } from './StrawberryStage8LayoutFrame';
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
  harvestable: '収穫可能',
};

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
  /** FarmPage 畑マスと同一の 1:1 基準スロット＋fillContainer で段階8の相対座標を解釈する */
  const strawberryStage8Layered =
    showCropImage && cell.crop === 'strawberry' && displayStage === 8;
  const pestRiskForDisplay =
    cell.cropState?.modelType === 'advanced' ? cell.cropState.pestRisk : undefined;

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
          relative aspect-square rounded-xl min-h-[130px] w-full
          flex flex-col items-center justify-between
          transition-all duration-200 cursor-pointer
          overflow-hidden border-2
          ${isHarvestable
            ? 'border-farm-gold/60 animate-harvest-glow'
            : 'border-transparent hover:border-farm-green/30'
          }
          hover:shadow-md
        `}
      >
        {/* 土の背景画像 */}
        <img
          src={getSoilImage(cell)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.currentTarget as HTMLImageElement).src = `${BASE}assets/crops/soil/soil-tilled.png`; }}
        />

        {/* 作物名バッジ */}
        {cropName && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <span className="
              inline-flex items-center px-1.5 py-0.5 rounded
              text-[10px] font-semibold leading-none tracking-wide
              bg-black/55 text-white/90
              backdrop-blur-sm
            ">
              {cropName}
            </span>
          </div>
        )}

        {/* 収穫可能ラベル */}
        {isHarvestable && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-farm-gold text-white shadow-sm">
              収穫可
            </span>
          </div>
        )}

        {/* 作物の表示（いちご段階8は FarmPage 畑マスと同じ 1:1 基準スロット） */}
        <div
          className={`
            relative z-10 flex w-full flex-1 min-h-0 flex-col items-center justify-center
            ${isAnimating ? 'animate-bounce-grow' : ''}
          `}
        >
          {showCropImage &&
            (strawberryStage8Layered ? (
              <StrawberryStage8ReferenceSlot className="h-full w-full">
                <CropDisplay
                  crop={cell.crop!}
                  stage={displayStage}
                  status={cell.status}
                  className="h-full w-full"
                  fillContainer
                  pestRisk={pestRiskForDisplay}
                />
              </StrawberryStage8ReferenceSlot>
            ) : (
              <CropDisplay crop={cell.crop!} stage={displayStage} status={cell.status} />
            ))}
        </div>

        {/* 下部エリア */}
        <div className="relative z-10 w-full">
          {showGauge ? (
            <div className="bg-black/45 backdrop-blur-sm">
              <GrowthGauge cell={cell} mode={gaugeMode} />
            </div>
          ) : (
            <div className="flex justify-center pb-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/40 text-white/80">
                {stageLabel ?? STATUS_LABELS[cell.status]}
              </span>
            </div>
          )}
        </div>

        {/* 成長アニメーション */}
        {growthAnim && (
          <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-black/20">
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
