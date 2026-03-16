import { CropDefinition, CropType } from '../types';

export const CROP_DEFINITIONS: Record<CropType, CropDefinition> = {
  tomato: {
    type: 'tomato',
    name: 'トマト',
    maxGrowthPoints: 5,
    growthStages: 4,
    stageImages: [
      'assets/crops/tomato-1.png',
      'assets/crops/tomato-2.png',
      'assets/crops/tomato-3.png',
      'assets/crops/tomato-4.png',
    ],
  },
  strawberry: {
    type: 'strawberry',
    name: 'いちご',
    maxGrowthPoints: 5,
    growthStages: 4,
    stageImages: [
      'assets/crops/strawberry-1.png',
      'assets/crops/strawberry-2.png',
      'assets/crops/strawberry-3.png',
      'assets/crops/strawberry-4.png',
    ],
  },
};

export const CROP_STAGE_EMOJI: Record<CropType, string[]> = {
  tomato: ['🌱', '🌿', '🌼', '🍅'],
  strawberry: ['🌱', '🍀', '🌸', '🍓'],
};

export const CROP_LIST: CropType[] = ['tomato', 'strawberry'];
