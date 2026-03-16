import { useState } from 'react';
import { CropType } from '../types';
import { CROP_DEFINITIONS, CROP_STAGE_EMOJI } from '../data/crops';

interface Props {
  crop: CropType;
  stage: number;
  className?: string;
}

export function CropDisplay({ crop, stage, className = '' }: Props) {
  const [useEmoji, setUseEmoji] = useState(false);
  const emoji = CROP_STAGE_EMOJI[crop][stage - 1] ?? '🌱';
  const cropDef = CROP_DEFINITIONS[crop];
  const imageSrc = `${import.meta.env.BASE_URL}${cropDef.stageImages[stage - 1]}`;

  if (useEmoji) {
    return <span className={`text-6xl select-none ${className}`}>{emoji}</span>;
  }

  return (
    <img
      src={imageSrc}
      alt={`${cropDef.name} 段階${stage}`}
      className={`w-24 h-24 object-contain ${className}`}
      onError={() => setUseEmoji(true)}
    />
  );
}
