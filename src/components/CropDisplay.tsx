import { useState } from 'react';
import { CropType, CellStatus } from '../types';
import { CROP_DEFINITIONS, CROP_STAGE_EMOJI } from '../data/crops';
import { STRAWBERRY_STAGE8_PART_DEFAULTS } from '../data/strawberryStage8PartLayout';
import { StrawberryStage8FillContent } from './StrawberryStage8LayoutFrame';
import { StrawberryStage8LayeredCrop } from './StrawberryStage8LayeredCrop';

interface Props {
  crop: CropType;
  stage: number;
  status?: CellStatus;
  className?: string;
  fillContainer?: boolean;
  /** いちご・アドバンスド時の害虫リスク（段階8の葉食害表示に使用） */
  pestRisk?: number;
  /** いちご段階8・一発の風（`StrawberryStage8LayeredCrop` に伝播） */
  windGustActive?: boolean;
  onWindGustEnd?: () => void;
}

const STAGE_CONFIG = [
  { imgClass: 'w-32 h-32', glowClass: 'w-36 h-36', glowColor: 'rgba(91, 140, 90, 0.25)' },
  { imgClass: 'w-36 h-36', glowClass: 'w-40 h-40', glowColor: 'rgba(91, 140, 90, 0.25)' },
  { imgClass: 'w-40 h-40', glowClass: 'w-48 h-48', glowColor: 'rgba(91, 140, 90, 0.20)' },
  { imgClass: 'w-48 h-48', glowClass: 'w-56 h-56', glowColor: 'rgba(91, 140, 90, 0.20)' },
];
const HARVESTABLE_GLOW = 'rgba(201, 168, 76, 0.35)';

export function CropDisplay({
  crop,
  stage,
  status,
  className = '',
  fillContainer = false,
  pestRisk,
  windGustActive = false,
  onWindGustEnd,
}: Props) {
  const [useEmoji, setUseEmoji] = useState(false);
  const emoji = CROP_STAGE_EMOJI[crop][stage - 1] ?? '🌱';
  const cropDef = CROP_DEFINITIONS[crop];
  const imageSrc = `${import.meta.env.BASE_URL}${cropDef.stageImages[stage - 1]}`;
  const isHarvestable = status === 'harvestable';

  const stageIdx = Math.min(stage - 1, STAGE_CONFIG.length - 1);
  const { imgClass, glowClass, glowColor } = STAGE_CONFIG[stageIdx];
  const activeGlowColor = isHarvestable ? HARVESTABLE_GLOW : glowColor;

  if (crop === 'strawberry' && stage === 8 && !useEmoji) {
    const outerFrameClass = fillContainer ? 'w-full h-full' : imgClass;
    return (
      <div className={`relative flex items-center justify-center min-h-0 ${className}`}>
        <div
          className={`
            absolute rounded-full blur-xl
            ${fillContainer ? 'inset-[15%]' : glowClass}
            ${isHarvestable ? 'animate-glow-pulse' : 'opacity-50'}
          `}
          style={{ backgroundColor: activeGlowColor }}
        />
        <div
          className={`
            relative z-10 flex items-center justify-center object-contain min-h-0
            ${outerFrameClass}
          `}
        >
          <StrawberryStage8FillContent>
            <StrawberryStage8LayeredCrop
              parts={STRAWBERRY_STAGE8_PART_DEFAULTS}
              pestRisk={pestRisk}
              motionEnabled
              windGustActive={windGustActive}
              onWindGustEnd={onWindGustEnd}
            />
          </StrawberryStage8FillContent>
        </div>
      </div>
    );
  }

  if (useEmoji) {
    return <span className={`text-5xl select-none ${className}`}>{emoji}</span>;
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 控えめな光の輪 */}
      <div
        className={`
          absolute rounded-full blur-xl
          ${fillContainer ? 'inset-[15%]' : glowClass}
          ${isHarvestable ? 'animate-glow-pulse' : 'opacity-50'}
        `}
        style={{ backgroundColor: activeGlowColor }}
      />

      {/* 作物画像 */}
      <img
        src={imageSrc}
        alt={`${cropDef.name} 段階${stage}`}
        className={`
          relative z-10 object-contain
          drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]
          transition-all duration-500
          ${fillContainer ? 'w-[88%] h-[88%]' : imgClass}
        `}
        onError={() => setUseEmoji(true)}
      />
    </div>
  );
}
