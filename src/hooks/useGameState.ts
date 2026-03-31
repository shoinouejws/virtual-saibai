import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, FarmCellState, CropType, SimpleCropState, AdvancedCropState, ActionDegree, HarvestRecord, WeatherEffectType } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';
import { saveGame, loadGame } from '../utils/storage';
import {
  createInitialAdvancedCropState,
  processOneDay,
  actionTillSoil, actionMakeRidge, actionLayMulch, actionBaseFertilizer,
  actionPlantSeedling, actionWater, actionFertilize, actionWeed, actionTrimLeaves,
  actionPestControl, actionDiseaseControl, actionTempAdjust, actionPollinate,
  actionThinFlowers, actionThinFruits, calculateHarvestResult,
  applyEvent, EventId,
} from '../utils/strawberryEngine';

// ===== 型・定数 =====

export interface GrowthAnimationInfo {
  cellId: number;
  fromStage: number;
  toStage: number;
  cropType: CropType;
}

export interface StageTransitionInfo {
  cellId: number;
  newStage: number;
}

export interface HarvestResultInfo {
  record: HarvestRecord;
  fruitCount: number;
  totalWeight: number;
  qualityScore: number;
  cropName: string;
}

const GROWTH_ANIM_DURATION_MS = 3000;
const STAGE_NAMES_SIMPLE = ['発芽', '双葉', '成長した芽', '開花', '結実'] as const;

// ===== ファクトリー関数 =====

function createEmptyCell(id: number): FarmCellState {
  return { id, status: 'empty', crop: null, cropState: null };
}

function createInitialState(): GameState {
  const today = todayString();
  return {
    fertilizer: 150,
    insecticide: 0,
    fungicide: 0,
    temperatureSheet: 0,
    farmSize: 4,
    cells: Array.from({ length: 4 }, (_, i) => createEmptyCell(i)),
    harvestLog: [],
    lastLoginDate: today,
    currentGameDate: today,
    activeWeatherEffect: null,
  };
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcGrowthStage(points: number, maxPoints: number, maxStage: number): number {
  if (points >= maxPoints) return maxStage;
  if (maxPoints === 0) return 1;
  const pps = maxPoints / maxStage;
  return Math.min(Math.floor(points / pps) + 1, maxStage);
}

// ===== 日次処理 =====

function processDailyForCell(cell: FarmCellState): FarmCellState {
  if (!cell.cropState || cell.cropState.modelType !== 'advanced') return cell;

  const newState = processOneDay(cell.cropState);
  const isHarvestable = newState.cultivationStage === 8;

  return {
    ...cell,
    status: isHarvestable ? 'harvestable' : 'growing',
    cropState: newState,
  };
}

function applyDailyProcessing(state: GameState, days: number): GameState {
  let next = { ...state };
  for (let d = 0; d < days; d++) {
    next = {
      ...next,
      cells: next.cells.map(cell => processDailyForCell(cell)),
    };
  }
  const today = todayString();
  return { ...next, lastLoginDate: today, currentGameDate: today, activeWeatherEffect: null };
}

// ===== フック本体 =====

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const loaded = loadGame();
    if (loaded) return loaded;
    return createInitialState();
  });

  const [notification, setNotification] = useState<{ message: string; key: number } | null>(null);
  const [growthAnimation, setGrowthAnimation] = useState<GrowthAnimationInfo | null>(null);
  const [animatingCellId, setAnimatingCellId] = useState<number | null>(null);
  const [stageTransition, setStageTransition] = useState<StageTransitionInfo | null>(null);
  const [harvestResult, setHarvestResult] = useState<HarvestResultInfo | null>(null);

  const growthAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStagesRef = useRef<Record<number, number>>({});
  const dailyProcessedRef = useRef(false);

  // ===== localStorage 保存 =====
  useEffect(() => { saveGame(state); }, [state]);

  // ===== 通知の自動消去 =====
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  // ===== 未ログイン日処理（初回マウント時のみ） =====
  useEffect(() => {
    if (dailyProcessedRef.current) return;
    dailyProcessedRef.current = true;

    const today = todayString();
    setState(prev => {
      if (!prev.lastLoginDate) {
        return { ...prev, lastLoginDate: today, currentGameDate: today };
      }
      const last = new Date(prev.lastLoginDate);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return prev;
      return applyDailyProcessing(prev, diffDays);
    });
  }, []);

  // ===== シンプルモデルのステージアップ検知 =====
  useEffect(() => {
    let detected: GrowthAnimationInfo | null = null;

    for (const cell of state.cells) {
      if (!cell.cropState || cell.cropState.modelType !== 'simple') continue;
      const curr = cell.cropState.growthStage;
      const prev = prevStagesRef.current[cell.id];
      if (prev !== undefined && curr > prev && prev > 0 && cell.status !== 'harvestable') {
        detected = { cellId: cell.id, fromStage: prev, toStage: curr, cropType: cell.crop! };
        break;
      }
      prevStagesRef.current[cell.id] = curr;
    }

    if (detected) {
      for (const cell of state.cells) {
        if (cell.cropState?.modelType === 'simple') {
          prevStagesRef.current[cell.id] = cell.cropState.growthStage;
        }
      }
      if (growthAnimTimerRef.current) clearTimeout(growthAnimTimerRef.current);
      setGrowthAnimation(detected);
      growthAnimTimerRef.current = setTimeout(() => setGrowthAnimation(null), GROWTH_ANIM_DURATION_MS);
    }
  }, [state.cells]);

  // ===== アドバンスドモデルのステージ遷移通知 =====
  useEffect(() => {
    for (const cell of state.cells) {
      if (!cell.cropState || cell.cropState.modelType !== 'advanced') continue;
      if (cell.cropState.pendingStageTransition) {
        setStageTransition({ cellId: cell.id, newStage: cell.cropState.cultivationStage });
        setState(prev => ({
          ...prev,
          cells: prev.cells.map(c =>
            c.id === cell.id && c.cropState?.modelType === 'advanced'
              ? { ...c, cropState: { ...c.cropState as AdvancedCropState, pendingStageTransition: false } }
              : c
          ),
        }));
        break;
      }
    }
  }, [state.cells]);

  const notify = useCallback((message: string) => {
    setNotification({ message, key: Date.now() });
  }, []);

  const triggerAnimation = useCallback((cellId: number) => {
    setAnimatingCellId(cellId);
    setTimeout(() => setAnimatingCellId(null), 500);
  }, []);

  // ===== 共通アクション（シンプル＆アドバンスド両対応） =====

  const till = useCallback((cellId: number) => {
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || cell.status !== 'empty') return prev;
      return {
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId ? { ...c, status: 'tilled' as const } : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify('土を耕しました！');
  }, [triggerAnimation, notify]);

  const plant = useCallback((cellId: number, cropType: CropType) => {
    const cropDef = CROP_DEFINITIONS[cropType];
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || cell.status !== 'tilled') return prev;

      let cropState: SimpleCropState | AdvancedCropState;

      if (cropDef.modelType === 'simple') {
        cropState = {
          modelType: 'simple',
          growthPoints: 0,
          maxGrowthPoints: cropDef.maxGrowthPoints!,
          growthStage: 1,
          maxGrowthStage: cropDef.growthStages,
        };
      } else {
        cropState = createInitialAdvancedCropState();
      }

      return {
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? { ...c, status: 'growing' as const, crop: cropType, cropState }
            : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify(`${cropDef.name}の栽培を開始しました！`);
  }, [triggerAnimation, notify]);

  // ===== シンプルモデル用アクション =====

  const waterSimple = useCallback((cellId: number) => {
    let message = '💧 水をやりました';
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'simple') return prev;
      if (cell.status !== 'planted' && cell.status !== 'growing') return prev;

      const cs = cell.cropState;
      const newPoints = Math.min(cs.growthPoints + 1, cs.maxGrowthPoints);
      const newStage = calcGrowthStage(newPoints, cs.maxGrowthPoints, cs.maxGrowthStage);
      const isReady = newPoints >= cs.maxGrowthPoints;
      const stageAdvanced = newStage > cs.growthStage;

      if (isReady) {
        message = '🎉 作物が実りました！収穫できます！';
      } else if (stageAdvanced) {
        const name = STAGE_NAMES_SIMPLE[Math.min(newStage - 1, STAGE_NAMES_SIMPLE.length - 1)];
        message = `🌱 成長しました！（${name}）`;
      }

      const newCropState: SimpleCropState = { ...cs, growthPoints: newPoints, growthStage: newStage };
      return {
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? { ...c, status: isReady ? 'harvestable' as const : 'growing' as const, cropState: newCropState }
            : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify(message);
  }, [triggerAnimation, notify]);

  const fertilizeSimple = useCallback((cellId: number) => {
    let message = '';
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'simple') return prev;
      if (cell.status !== 'planted' && cell.status !== 'growing') return prev;
      if (prev.fertilizer < 50) {
        message = '⚠️ 肥料がありません！ショップで購入しましょう';
        return prev;
      }

      const cs = cell.cropState;
      const newPoints = Math.min(cs.growthPoints + 3, cs.maxGrowthPoints);
      const newStage = calcGrowthStage(newPoints, cs.maxGrowthPoints, cs.maxGrowthStage);
      const isReady = newPoints >= cs.maxGrowthPoints;
      const stageAdvanced = newStage > cs.growthStage;

      if (isReady) {
        message = '🎉 作物が実りました！収穫できます！';
      } else if (stageAdvanced) {
        const name = STAGE_NAMES_SIMPLE[Math.min(newStage - 1, STAGE_NAMES_SIMPLE.length - 1)];
        message = `🌿 肥料をまきました！成長しました（${name}）`;
      } else {
        message = '🌿 肥料をまきました';
      }

      const newCropState: SimpleCropState = { ...cs, growthPoints: newPoints, growthStage: newStage };
      return {
        ...prev,
        fertilizer: prev.fertilizer - 50,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? { ...c, status: isReady ? 'harvestable' as const : 'growing' as const, cropState: newCropState }
            : c
        ),
      };
    });
    if (message) { triggerAnimation(cellId); notify(message); }
  }, [triggerAnimation, notify]);

  // ===== アドバンスドモデル用アクション（いちご） =====

  const updateAdvancedCell = useCallback((
    cellId: number,
    updater: (s: AdvancedCropState) => AdvancedCropState,
    message: string,
  ) => {
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'advanced') return prev;
      const newCropState = updater(cell.cropState);
      const isHarvestable = newCropState.cultivationStage === 8;
      return {
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? { ...c, status: isHarvestable ? 'harvestable' as const : 'growing' as const, cropState: newCropState }
            : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify(message);
  }, [triggerAnimation, notify]);

  const strawberryTillSoil = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionTillSoil, '土を整えました！雑草が減りステージが進みました');
  }, [updateAdvancedCell]);

  const strawberryMakeRidge = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionMakeRidge, '🏡 畝を作りました！次のステージへの準備ができました');
  }, [updateAdvancedCell]);

  const strawberryLayMulch = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionLayMulch, '🛡️ マルチを敷きました！水分と雑草を抑えられます');
  }, [updateAdvancedCell]);

  const strawberryBaseFertilizer = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionBaseFertilizer, '🧪 元肥を入れました！栄養が補われました');
  }, [updateAdvancedCell]);

  const strawberryPlantSeedling = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionPlantSeedling, '🌱 苗を植えました！根付きを見守りましょう');
  }, [updateAdvancedCell]);

  const strawberryWater = useCallback((cellId: number, degree: ActionDegree) => {
    const labels: Record<ActionDegree, string> = { light: '少なめ', normal: 'ふつう', heavy: 'たっぷり' };
    updateAdvancedCell(cellId, s => actionWater(s, degree), `💧 水やり（${labels[degree]}）をしました`);
  }, [updateAdvancedCell]);

  const strawberryFertilize = useCallback((cellId: number, degree: ActionDegree) => {
    const labels: Record<ActionDegree, string> = { light: '少なめ', normal: 'ふつう', heavy: 'たっぷり' };
    setState(prev => {
      if (prev.fertilizer < 50) {
        notify('⚠️ 肥料がありません！ショップで購入しましょう');
        return prev;
      }
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'advanced') return prev;
      const newCropState = actionFertilize(cell.cropState, degree);
      return {
        ...prev,
        fertilizer: prev.fertilizer - 50,
        cells: prev.cells.map(c =>
          c.id === cellId ? { ...c, cropState: newCropState } : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify(`🧪 追肥（${labels[degree]}）をしました`);
  }, [triggerAnimation, notify]);

  const strawberryWeed = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionWeed, '🌿 除草しました！足元がきれいになりました');
  }, [updateAdvancedCell]);

  const strawberryTrimLeaves = useCallback((cellId: number, degree: ActionDegree) => {
    const msg = degree === 'heavy' ? '✂️ 葉を整理しました（やや多め）' : '✂️ 葉を整理しました！風通しがよくなりました';
    updateAdvancedCell(cellId, s => actionTrimLeaves(s, degree), msg);
  }, [updateAdvancedCell]);

  const strawberryPestControl = useCallback((cellId: number) => {
    setState(prev => {
      if (prev.insecticide <= 0) {
        notify('⚠️ 殺虫剤がありません！');
        return prev;
      }
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'advanced') return prev;
      return {
        ...prev,
        insecticide: prev.insecticide - 1,
        cells: prev.cells.map(c =>
          c.id === cellId ? { ...c, cropState: actionPestControl(cell.cropState as AdvancedCropState) } : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify('🐛 害虫対策をしました！');
  }, [triggerAnimation, notify]);

  const strawberryDiseaseControl = useCallback((cellId: number) => {
    setState(prev => {
      if (prev.fungicide <= 0) {
        notify('⚠️ 殺菌剤がありません！');
        return prev;
      }
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'advanced') return prev;
      return {
        ...prev,
        fungicide: prev.fungicide - 1,
        cells: prev.cells.map(c =>
          c.id === cellId ? { ...c, cropState: actionDiseaseControl(cell.cropState as AdvancedCropState) } : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify('🦠 病気対策をしました！');
  }, [triggerAnimation, notify]);

  const strawberryTempAdjust = useCallback((cellId: number) => {
    setState(prev => {
      if (prev.temperatureSheet <= 0) {
        notify('⚠️ 防寒・遮光シートがありません！');
        return prev;
      }
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || !cell.cropState || cell.cropState.modelType !== 'advanced') return prev;
      return {
        ...prev,
        temperatureSheet: prev.temperatureSheet - 1,
        cells: prev.cells.map(c =>
          c.id === cellId ? { ...c, cropState: actionTempAdjust(cell.cropState as AdvancedCropState) } : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify('🌡️ 温度調整をしました！ストレスが軽減されました');
  }, [triggerAnimation, notify]);

  const strawberryPollinate = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionPollinate, '🌸 受粉補助をしました！実がつきやすくなりました');
  }, [updateAdvancedCell]);

  const strawberryThinFlowers = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionThinFlowers, '✂️ 花を減らしました！残りの実に栄養が集中します');
  }, [updateAdvancedCell]);

  const strawberryThinFruits = useCallback((cellId: number) => {
    updateAdvancedCell(cellId, actionThinFruits, '✂️ 摘果しました！1粒が大きく甘くなります');
  }, [updateAdvancedCell]);

  // ===== 収穫 =====

  const harvest = useCallback((cellId: number) => {
    const cell = state.cells.find(c => c.id === cellId);
    if (!cell || cell.status !== 'harvestable' || !cell.crop) return;

    const cropDef = CROP_DEFINITIONS[cell.crop];
    let harvestRecord: HarvestRecord;
    let resultInfo: HarvestResultInfo;

    if (cell.cropState?.modelType === 'advanced') {
      const result = calculateHarvestResult(cell.cropState);
      harvestRecord = {
        crop: cell.crop,
        harvestedAt: new Date().toISOString(),
        ...result.record,
      };
      resultInfo = {
        record: harvestRecord,
        fruitCount: result.fruitCount,
        totalWeight: result.totalWeight,
        qualityScore: result.qualityScore,
        cropName: cropDef.name,
      };
    } else {
      const { min, max } = cropDef.exchangeQuantityRange;
      const exchangeQuantity = Math.floor(Math.random() * (max - min + 1)) + min;
      harvestRecord = { crop: cell.crop, harvestedAt: new Date().toISOString(), exchangeQuantity };
      resultInfo = {
        record: harvestRecord,
        fruitCount: exchangeQuantity,
        totalWeight: 0,
        qualityScore: 0,
        cropName: cropDef.name,
      };
    }

    setState(prev => {
      const prevCell = prev.cells.find(c => c.id === cellId);
      if (!prevCell || prevCell.status !== 'harvestable' || !prevCell.crop) return prev;
      return {
        ...prev,
        harvestLog: [...prev.harvestLog, harvestRecord],
        cells: prev.cells.map(c => c.id === cellId ? createEmptyCell(cellId) : c),
      };
    });

    setHarvestResult(resultInfo);
    triggerAnimation(cellId);
  }, [state, triggerAnimation]);

  // ===== イベント適用（デバッグ・日次ランダム） =====

  const WEATHER_EFFECT_EVENTS: EventId[] = ['rain', 'longRain', 'highTemp', 'pest', 'birdDamage'];

  const applyGameEvent = useCallback((cellId: number | 'all', eventId: EventId) => {
    setState(prev => {
      const targetIds = cellId === 'all'
        ? prev.cells.map(c => c.id)
        : [cellId];

      const weatherEffect: WeatherEffectType = WEATHER_EFFECT_EVENTS.includes(eventId)
        ? eventId as WeatherEffectType
        : prev.activeWeatherEffect;

      return {
        ...prev,
        activeWeatherEffect: weatherEffect,
        cells: prev.cells.map(cell => {
          if (!targetIds.includes(cell.id)) return cell;
          if (!cell.cropState || cell.cropState.modelType !== 'advanced') return cell;
          const newCropState = applyEvent(cell.cropState, eventId);
          return { ...cell, cropState: newCropState };
        }),
      };
    });
    notify(`⚡ イベントを適用しました`);
  }, [notify]);

  // ===== ショップ =====

  const buyFertilizer = useCallback((amount: number) => {
    setState(prev => ({ ...prev, fertilizer: prev.fertilizer + amount }));
    notify(`肥料を${amount}g購入しました！`);
  }, [notify]);

  const buyInsecticide = useCallback((amount: number) => {
    setState(prev => ({ ...prev, insecticide: prev.insecticide + amount }));
    notify(`殺虫剤を${amount}個入手しました！`);
  }, [notify]);

  const buyFungicide = useCallback((amount: number) => {
    setState(prev => ({ ...prev, fungicide: prev.fungicide + amount }));
    notify(`殺菌剤を${amount}個入手しました！`);
  }, [notify]);

  const buyTemperatureSheet = useCallback((amount: number) => {
    setState(prev => ({ ...prev, temperatureSheet: prev.temperatureSheet + amount }));
    notify(`防寒・遮光シートを${amount}枚入手しました！`);
  }, [notify]);

  const expandFarm = useCallback(() => {
    setState(prev => {
      const newSize = prev.farmSize + 2;
      const newCells = [...prev.cells];
      for (let i = prev.farmSize; i < newSize; i++) {
        newCells.push(createEmptyCell(i));
      }
      return { ...prev, farmSize: newSize, cells: newCells };
    });
    notify('畑を拡張しました！ 🌾');
  }, [notify]);

  const advanceDays = useCallback((days: number) => {
    if (days <= 0) return;
    setState(prev => ({ ...applyDailyProcessing(prev, days), activeWeatherEffect: null }));
    notify(`⏭ ${days}日間経過させました`);
  }, [notify]);

  const clearWeatherEffect = useCallback(() => {
    setState(prev => ({ ...prev, activeWeatherEffect: null }));
  }, []);

  const resetGame = useCallback(() => {
    setState(createInitialState());
    prevStagesRef.current = {};
    dailyProcessedRef.current = false;
    notify('データをリセットしました');
  }, [notify]);

  const dismissStageTransition = useCallback(() => {
    setStageTransition(null);
  }, []);

  const dismissHarvestResult = useCallback(() => {
    setHarvestResult(null);
  }, []);

  return {
    state,
    notification: notification?.message ?? null,
    animatingCellId,
    growthAnimation,
    stageTransition,
    harvestResult,
    // 基本アクション
    till,
    plant,
    // シンプルモデル
    waterSimple,
    fertilizeSimple,
    // アドバンスドモデル（いちご）
    strawberryTillSoil,
    strawberryMakeRidge,
    strawberryLayMulch,
    strawberryBaseFertilizer,
    strawberryPlantSeedling,
    strawberryWater,
    strawberryFertilize,
    strawberryWeed,
    strawberryTrimLeaves,
    strawberryPestControl,
    strawberryDiseaseControl,
    strawberryTempAdjust,
    strawberryPollinate,
    strawberryThinFlowers,
    strawberryThinFruits,
    harvest,
    applyGameEvent,
    // ショップ
    buyFertilizer,
    buyInsecticide,
    buyFungicide,
    buyTemperatureSheet,
    expandFarm,
    resetGame,
    dismissStageTransition,
    dismissHarvestResult,
    advanceDays,
    clearWeatherEffect,
  };
}
