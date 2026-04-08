export type CellStatus = 'empty' | 'tilled' | 'planted' | 'growing' | 'harvestable';
export type CropType = 'tomato' | 'strawberry';
export type CropModelType = 'simple' | 'advanced';
export type QualityRank = 'A' | 'B' | 'C' | 'D';
export type ActionDegree = 'light' | 'normal' | 'heavy';

// シンプルモデル（トマト用）の成長状態
export interface SimpleCropState {
  modelType: 'simple';
  growthPoints: number;
  maxGrowthPoints: number;
  growthStage: number;
  maxGrowthStage: number;
}

// アドバンスドモデル（いちご用）の成長状態
// 各パラメーターの詳細は strawberry_progress_design.md セクション2を参照
export interface AdvancedCropState {
  modelType: 'advanced';
  cultivationStage: number;    // 1〜8
  daysInStage: number;         // 現在ステージに入ってからの日数
  health: number;              // 健全度 0〜100
  moisture: number;            // 水分 0〜100
  nutrition: number;           // 栄養 0〜100
  stress: number;              // ストレス 0〜100
  pestRisk: number;            // 害虫リスク 0〜100
  diseaseRisk: number;         // 病気リスク 0〜100
  weedAmount: number;          // 雑草量 0〜100
  rotRisk: number;             // 腐りやすさ 0〜100
  stageProgress: number;       // ステージ進行度 0〜100
  flowerCount: number;         // 花の数
  fruitCount: number;          // 実の数
  fruitSize: number;           // 実の大きさ 0〜100
  sweetness: number;           // 甘さ 0〜100
  coloring: number;            // 色づき 0〜100
  qualityDamage: number;       // 品質被害蓄積 0〜100
  qualityBonus: number;        // 品質補正（摘花・摘果ボーナス）
  overripeRisk: number;        // 熟しすぎリスク 0〜100（ステージ8で使用）
  // ステージ固有フラグ
  isTilled: boolean;           // 耕し済み（ステージ1）
  hasRidge: boolean;           // 畝あり（ステージ1）
  hasMulch: boolean;           // マルチ（ビニールシート）あり
  isPlanted: boolean;          // 定植済み（ステージ2）
  rootEstablishment: number;   // 根付き度 0〜100（ステージ2）
  // 当日のアクション追跡
  todayPollinated: boolean;    // 受粉補助をした
  todayPollinationRate: number; // 当日の受粉成功率%（50ベース）
  // UI用
  dailyAdvice: string | null;        // デイリーアドバイス
  pendingStageTransition: boolean;   // ステージ遷移モーダル表示フラグ
}

export interface FarmCellState {
  id: number;
  status: CellStatus;
  crop: CropType | null;
  cropState: SimpleCropState | AdvancedCropState | null;
}

export interface HarvestRecord {
  crop: CropType;
  harvestedAt: string;
  exchangeQuantity: number;
  // アドバンスドモデル用
  qualityRank?: QualityRank;
  qualityScore?: number;
  fruitCount?: number;
  totalWeight?: number;
  sweetness?: number;
}

export type WeatherEffectType = 'rain' | 'longRain' | 'highTemp' | 'pest' | 'birdDamage' | null;

/** 直近に適用されたイベント（表示用）。`strawberryEngine` の EventId と同一集合。 */
export type ActiveEventId =
  | 'rain' | 'longRain' | 'highTemp' | 'lowTemp' | 'sunnyContinue'
  | 'lowLight' | 'strongWind' | 'dryWeather'
  | 'pest' | 'disease'
  | 'birdDamage';

export interface GameState {
  fertilizer: number;
  insecticide: number;
  fungicide: number;
  temperatureSheet: number;
  farmSize: number;
  cells: FarmCellState[];
  harvestLog: HarvestRecord[];
  lastLoginDate: string | null;
  currentGameDate: string | null;
  activeWeatherEffect: WeatherEffectType;
  /** 画面上部に表示する「発生中」イベント。日付変更・エフェクト解除でクリア */
  activeEventId: ActiveEventId | null;
}

export interface CropDefinition {
  type: CropType;
  name: string;
  modelType: CropModelType;
  maxGrowthPoints?: number;    // シンプルモデル用
  growthStages: number;        // 表示用段階数
  stageImages: string[];       // 各段階の画像パス
  stageNames?: string[];       // 各段階の名称（アドバンスドモデル用）
  exchangeQuantityRange: { min: number; max: number };
  exchangeUnit: string;
}

// ヘルパー: セルの表示用ステージ番号を取得
export function getCellDisplayStage(cell: FarmCellState): number {
  if (!cell.cropState) return 0;
  if (cell.cropState.modelType === 'simple') return cell.cropState.growthStage;
  return cell.cropState.cultivationStage;
}

// ヘルパー: セルのステージ進行度(0〜100)を取得
export function getCellStageProgress(cell: FarmCellState): number {
  if (!cell.cropState) return 0;
  if (cell.cropState.modelType === 'simple') {
    const { growthPoints, maxGrowthPoints } = cell.cropState;
    return maxGrowthPoints > 0 ? Math.min((growthPoints / maxGrowthPoints) * 100, 100) : 0;
  }
  return cell.cropState.stageProgress;
}
