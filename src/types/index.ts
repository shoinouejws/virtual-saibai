export type CellStatus = 'empty' | 'tilled' | 'planted' | 'growing' | 'harvestable';

export type CropType = 'tomato' | 'strawberry';

export type ActionType = 'till' | 'plant' | 'water' | 'fertilize' | 'harvest';

export interface FarmCellState {
  id: number;
  status: CellStatus;
  crop: CropType | null;
  growthPoints: number;
  maxGrowthPoints: number;
  growthStage: number;
  maxGrowthStage: number;
}

export interface HarvestRecord {
  crop: CropType;
  harvestedAt: string;
  exchangeQuantity: number;
}

export interface GameState {
  fertilizer: number;
  farmSize: number;
  cells: FarmCellState[];
  harvestLog: HarvestRecord[];
}

export interface CropDefinition {
  type: CropType;
  name: string;
  maxGrowthPoints: number;
  growthStages: number;
  stageImages: string[];
  exchangeQuantityRange: { min: number; max: number };
  exchangeUnit: string;
}
