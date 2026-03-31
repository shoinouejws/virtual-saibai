import { useState } from 'react';
import { CropType, CellStatus } from '../types';
import { CROP_DEFINITIONS, CROP_STAGE_EMOJI } from '../data/crops';

interface Props {
  crop: CropType;
  stage: number;
  status?: CellStatus;
  className?: string;
  fillContainer?: boolean;
}

// ステージごとの画像サイズ・グロー色・グローサイズ
const STAGE_CONFIG = [
  { imgClass: 'w-32 h-32', glowClass: 'w-40 h-40', glowColor: 'rgba(74, 222, 128, 0.55)' },
  { imgClass: 'w-36 h-36', glowClass: 'w-44 h-44', glowColor: 'rgba(163, 230, 53, 0.55)' },
  { imgClass: 'w-40 h-40', glowClass: 'w-52 h-52', glowColor: 'rgba(244, 114, 182, 0.55)' },
  { imgClass: 'w-48 h-48', glowClass: 'w-60 h-60', glowColor: 'rgba(251, 146, 60, 0.55)' },
];
const HARVESTABLE_GLOW = 'rgba(255, 215, 0, 0.75)';

export function CropDisplay({ crop, stage, status, className = '', fillContainer = false }: Props) {
  const [useEmoji, setUseEmoji] = useState(false);
  const emoji = CROP_STAGE_EMOJI[crop][stage - 1] ?? '🌱';
  const cropDef = CROP_DEFINITIONS[crop];
  const imageSrc = `${import.meta.env.BASE_URL}${cropDef.stageImages[stage - 1]}`;
  const isHarvestable = status === 'harvestable';

  const stageIdx = Math.min(stage - 1, STAGE_CONFIG.length - 1);
  const { imgClass, glowClass, glowColor } = STAGE_CONFIG[stageIdx];
  const activeGlowColor = isHarvestable ? HARVESTABLE_GLOW : glowColor;

  if (useEmoji) {
    return <span className={`text-6xl select-none ${className}`}>{emoji}</span>;
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 光の輪（グロー） */}
      <div
        className={`
          absolute rounded-full blur-xl
          ${fillContainer ? 'inset-[10%]' : glowClass}
          ${isHarvestable ? 'animate-glow-pulse' : 'opacity-60'}
        `}
        style={{ backgroundColor: activeGlowColor }}
      />

      {/* 作物画像 */}
      <img
        src={imageSrc}
        alt={`${cropDef.name} 段階${stage}`}
        className={`
          relative z-10 object-contain
          drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]
          transition-all duration-500
          ${fillContainer ? 'w-[90%] h-[90%]' : imgClass}
          ${isHarvestable ? 'drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]' : ''}
        `}
        onError={() => setUseEmoji(true)}
      />

      {/* 収穫OK 星パーティクル */}
      {isHarvestable && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-0 right-1 text-sm animate-bounce" style={{ animationDelay: '0s' }}>✨</span>
          <span className="absolute bottom-1 left-0 text-xs animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</span>
          <span className="absolute top-1 left-1 text-xs animate-bounce" style={{ animationDelay: '0.8s' }}>✨</span>
        </div>
      )}
    </div>
  );
}
