import { CropDefinition, CropType } from '../types';

export const CROP_DEFINITIONS: Record<CropType, CropDefinition> = {
  tomato: {
    type: 'tomato',
    name: 'トマト',
    modelType: 'simple',
    maxGrowthPoints: 15,
    growthStages: 5,
    stageImages: [
      'assets/crops/tomato/tomato_stage1.png',
      'assets/crops/tomato/tomato_stage2.png',
      'assets/crops/tomato/tomato-2.png',
      'assets/crops/tomato/tomato-3.png',
      'assets/crops/tomato/tomato-4.png',
    ],
    exchangeQuantityRange: { min: 3, max: 6 },
    exchangeUnit: '玉',
  },
  strawberry: {
    type: 'strawberry',
    name: 'いちご',
    modelType: 'advanced',
    growthStages: 8,
    stageImages: [
      'assets/crops/soil/soil-ridged.png',    // S1: 栽培準備期
      'assets/crops/strawberry/strawberry-2.png',    // S2: 定植・活着期
      'assets/crops/strawberry/strawberry-3.png',    // S3: 葉成長期
      'assets/crops/strawberry/strawberry-4.png',    // S4: 花芽形成期
      'assets/crops/strawberry/strawberry-5.png',    // S5: 開花期
      'assets/crops/strawberry/strawberry-6.png',    // S6: 果実肥大期
      'assets/crops/strawberry/strawberry-7.png',    // S7: 成熟期
      'assets/crops/strawberry/strawberry-8.png',    // S8: 収穫可能期
    ],
    stageNames: [
      '栽培準備期',
      '定植・活着期',
      '葉成長期',
      '花芽形成期',
      '開花期',
      '果実肥大期',
      '成熟期',
      '収穫可能期',
    ],
    exchangeQuantityRange: { min: 10, max: 20 },
    exchangeUnit: '粒',
  },
};

export const CROP_STAGE_EMOJI: Record<CropType, string[]> = {
  tomato: ['🌱', '🌿', '🍃', '🌼', '🍅'],
  strawberry: ['🌱', '🏠', '🍃', '💮', '🌸', '🫐', '🍓', '🍓'],
};

export const CROP_LIST: CropType[] = ['tomato', 'strawberry'];
