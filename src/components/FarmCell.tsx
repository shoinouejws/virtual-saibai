import { FarmCellState } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';
import { CropDisplay } from './CropDisplay';
import { GrowthGauge, GaugeMode } from './GrowthGauge';
import { GrowthAnimationInfo } from '../hooks/useGameState';

interface Props {
  cell: FarmCellState;
  isSelected: boolean;
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

const hasCrop = (status: string) =>
  status === 'planted' || status === 'growing' || status === 'harvestable';

function getSoilImage(status: string): string {
  return status === 'empty'
    ? `${BASE}assets/crops/soil-empty.png`
    : `${BASE}assets/crops/soil-tilled.png`;
}

function getGrowthAnimSrc(anim: GrowthAnimationInfo): string {
  return `${BASE}assets/crops/${anim.cropType}_stage${anim.fromStage}to${anim.toStage}_400ms.webp`;
}

export function FarmCell({ cell, isSelected, isAnimating, gaugeMode, growthAnim, onSelect }: Props) {
  const isHarvestable = cell.status === 'harvestable';
  const showGauge = hasCrop(cell.status) && cell.crop !== null;
  const cropName = cell.crop ? CROP_DEFINITIONS[cell.crop].name : null;

  return (
    <div className="pt-5 relative">
      <button
        onClick={onSelect}
        aria-label={`マス ${cell.id + 1}: ${STATUS_LABELS[cell.status]}`}
        className={`
          relative aspect-square rounded-2xl min-h-[130px] w-full
          flex flex-col items-center justify-between
          transition-all duration-200 cursor-pointer
          border-3 overflow-hidden
          ${isSelected
            ? 'border-farm-green ring-4 ring-farm-green/50 scale-105 shadow-lg shadow-farm-green/30'
            : 'border-transparent hover:border-farm-green/30 hover:scale-[1.02]'
          }
          ${isHarvestable ? 'animate-sparkle' : ''}
        `}
      >
        {/* 土の背景画像 */}
        <img
          src={getSoilImage(cell.status)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        />

        {/* 作物名バッジ（左上・作物エフェクトより前面） */}
        {cropName && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <span className="
              inline-flex items-center px-2 py-1 rounded-lg
              text-[11px] font-semibold leading-none tracking-wide
              bg-gradient-to-br from-green-900/90 to-emerald-900/85
              text-white
              border border-white/25
              shadow-[0_2px_8px_rgba(0,0,0,0.4)]
              backdrop-blur-sm
            ">
              {cropName}
            </span>
          </div>
        )}

        {/* 作物の表示 */}
        <div className={`
          relative z-10 flex items-center justify-center w-full flex-1
          ${isAnimating ? 'animate-bounce-grow' : ''}
        `}>
          {cell.crop && cell.growthStage > 0 && (
            <CropDisplay crop={cell.crop} stage={cell.growthStage} status={cell.status} />
          )}
        </div>

        {/* 下部エリア: ゲージ or ステータスラベル */}
        <div className="relative z-10 w-full">
          {showGauge ? (
            <div className="bg-black/40 backdrop-blur-sm">
              <GrowthGauge
                growthPoints={cell.growthPoints}
                maxGrowthPoints={cell.maxGrowthPoints}
                growthStage={cell.growthStage}
                maxGrowthStage={cell.maxGrowthStage}
                status={cell.status}
                mode={gaugeMode}
              />
            </div>
          ) : (
            <div className="flex justify-center pb-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black/40 text-white">
                {STATUS_LABELS[cell.status]}
              </span>
            </div>
          )}
        </div>

        {/* 成長アニメーション WebP オーバーレイ */}
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

      {/* 選択インジケータ（セル外・上部） */}
      {isSelected && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-farm-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
            ▼ 選択中
          </span>
        </div>
      )}
    </div>
  );
}
