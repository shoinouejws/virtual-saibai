import { useState, useEffect, useRef } from 'react';
import { CropType, CellStatus } from '../types';
import { CROP_DEFINITIONS, CROP_STAGE_EMOJI } from '../data/crops';
import {
  getStrawberryStage8BreezeAnimatedPath,
  getStrawberryStage8BreezePlayMs,
  STRAWBERRY_STAGE8_STATIC,
  type StrawberryBreezeVariantId,
} from '../data/strawberryStage8Breeze';
import { StrawberryStage8FillContent } from './StrawberryStage8LayoutFrame';

interface Props {
  crop: CropType;
  stage: number;
  status?: CellStatus;
  className?: string;
  fillContainer?: boolean;
  /** いちご段8のみ: 値が増えるたびに breeze WebP を1回分再生（セル詳細の再生ボタンなど） */
  strawberryBreezeTrigger?: number;
  /** いちご段8のみ: 風アニメの種類（fps） */
  strawberryBreezeVariant?: StrawberryBreezeVariantId;
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
  strawberryBreezeTrigger = 0,
  strawberryBreezeVariant = '15fps',
}: Props) {
  const [useEmoji, setUseEmoji] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playingBreeze, setPlayingBreeze] = useState(false);
  const prevBreezeTriggerRef = useRef(0);
  const emoji = CROP_STAGE_EMOJI[crop][stage - 1] ?? '\u{1F331}';
  const cropDef = CROP_DEFINITIONS[crop];
  const baseUrl = import.meta.env.BASE_URL;
  const imageSrc = `${baseUrl}${cropDef.stageImages[stage - 1]}`;
  const isHarvestable = status === 'harvestable';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) setPlayingBreeze(false);
  }, [reduceMotion]);

  useEffect(() => {
    if (crop !== 'strawberry' || stage !== 8) setPlayingBreeze(false);
  }, [crop, stage]);

  useEffect(() => {
    if (crop !== 'strawberry' || stage !== 8) return;
    const t = strawberryBreezeTrigger;
    if (t === 0 || t === prevBreezeTriggerRef.current) return;
    prevBreezeTriggerRef.current = t;
    if (reduceMotion) return;
    setPlayingBreeze(true);
    const id = window.setTimeout(
      () => setPlayingBreeze(false),
      getStrawberryStage8BreezePlayMs(strawberryBreezeVariant),
    );
    return () => clearTimeout(id);
    // strawberryBreezeVariant はトリガー時点の値で十分（deps に含めると同じ nonce で再実行され早期 return し、クリーンアップでタイマーだけ消えて表示が固まる）
  }, [strawberryBreezeTrigger, crop, stage, reduceMotion]);

  const stageIdx = Math.min(stage - 1, STAGE_CONFIG.length - 1);
  const { imgClass, glowClass, glowColor } = STAGE_CONFIG[stageIdx];
  const activeGlowColor = isHarvestable ? HARVESTABLE_GLOW : glowColor;

  if (crop === 'strawberry' && stage === 8 && !useEmoji) {
    const breezeSrc = `${baseUrl}${getStrawberryStage8BreezeAnimatedPath(strawberryBreezeVariant)}`;
    const staticSrc = `${baseUrl}${STRAWBERRY_STAGE8_STATIC}`;
    const showBreeze = playingBreeze && !reduceMotion;
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
            <img
              key={showBreeze ? `breeze-${strawberryBreezeTrigger}-${strawberryBreezeVariant}` : 'static'}
              src={showBreeze ? breezeSrc : staticSrc}
              alt={`${cropDef.name} stage ${stage}`}
              className="w-full h-full max-w-full max-h-full object-contain select-none pointer-events-none
                drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
              draggable={false}
              onError={() => setUseEmoji(true)}
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
      <div
        className={`
          absolute rounded-full blur-xl
          ${fillContainer ? 'inset-[15%]' : glowClass}
          ${isHarvestable ? 'animate-glow-pulse' : 'opacity-50'}
        `}
        style={{ backgroundColor: activeGlowColor }}
      />

      <img
        src={imageSrc}
        alt={`${cropDef.name} stage ${stage}`}
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
