import { CropDefinition, CropType } from '../types';

export const CROP_DEFINITIONS: Record<CropType, CropDefinition> = {
  tomato: {
    type: 'tomato',
    name: 'トマト',
    maxGrowthPoints: 15,
    growthStages: 5,
    stageImages: [
      'assets/crops/tomato_stage1.png',  // Stage1: 発芽
      'assets/crops/tomato_stage2.png',  // Stage2: 双葉（新規）
      'assets/crops/tomato-2.png',       // Stage3: 成長した芽
      'assets/crops/tomato-3.png',       // Stage4: 開花
      'assets/crops/tomato-4.png',       // Stage5: 結実
    ],
    exchangeQuantityRange: { min: 3, max: 6 },
    exchangeUnit: '玉',
  },
  strawberry: {
    type: 'strawberry',
    name: 'いちご',
    maxGrowthPoints: 12,
    growthStages: 4,
    stageImages: [
      'assets/crops/strawberry-1.png',
      'assets/crops/strawberry-2.png',
      'assets/crops/strawberry-3.png',
      'assets/crops/strawberry-4_real.png',
    ],
    exchangeQuantityRange: { min: 10, max: 20 },
    exchangeUnit: '粒',
  },
};

export const CROP_STAGE_EMOJI: Record<CropType, string[]> = {
  tomato: ['🌱', '🌿', '🍃', '🌼', '🍅'],
  strawberry: ['🌱', '🍀', '🌸', '🍓'],
};

export const CROP_LIST: CropType[] = ['tomato', 'strawberry'];
