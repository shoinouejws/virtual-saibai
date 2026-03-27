import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, FarmCellState, CropType } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';
import { saveGame, loadGame } from '../utils/storage';

export interface GrowthAnimationInfo {
  cellId: number;
  fromStage: number;
  toStage: number;
  cropType: CropType;
}

function createEmptyCell(id: number): FarmCellState {
  return {
    id,
    status: 'empty',
    crop: null,
    growthPoints: 0,
    maxGrowthPoints: 0,
    growthStage: 0,
    maxGrowthStage: 0,
  };
}

function createInitialState(): GameState {
  return {
    fertilizer: 150,
    farmSize: 4,
    cells: Array.from({ length: 4 }, (_, i) => createEmptyCell(i)),
    harvestLog: [],
  };
}

function calcGrowthStage(points: number, maxPoints: number, maxStage: number): number {
  if (points >= maxPoints) return maxStage;
  if (maxPoints === 0) return 1;
  const pointsPerStage = maxPoints / maxStage;
  return Math.min(Math.floor(points / pointsPerStage) + 1, maxStage);
}

const GROWTH_ANIM_DURATION_MS = 3000;

const STAGE_NAMES = ['発芽', '双葉', '成長した芽', '開花', '結実'] as const;

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadGame() ?? createInitialState());
  const [notification, setNotification] = useState<{ message: string; key: number } | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [animatingCellId, setAnimatingCellId] = useState<number | null>(null);
  const [growthAnimation, setGrowthAnimation] = useState<GrowthAnimationInfo | null>(null);

  const growthAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 各マスの直前のステージを追跡する（ステージアップ検知用）
  const prevStagesRef = useRef<Record<number, number>>({});

  useEffect(() => { saveGame(state); }, [state]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // state.cells が変化したとき、ステージアップを検知してアニメーションをトリガー
  useEffect(() => {
    let detected: GrowthAnimationInfo | null = null;

    for (const cell of state.cells) {
      const prev = prevStagesRef.current[cell.id];
      const curr = cell.growthStage;

      // 種まき後（0→1）や収穫後（N→0）は除外し、純粋なステージアップのみ対象
      if (prev !== undefined && curr > prev && prev > 0 && cell.crop && cell.status !== 'harvestable') {
        detected = { cellId: cell.id, fromStage: prev, toStage: curr, cropType: cell.crop };
        break;
      }

      prevStagesRef.current[cell.id] = curr;
    }

    // detected があった場合は残りのセルの ref も更新
    if (detected) {
      for (const cell of state.cells) {
        prevStagesRef.current[cell.id] = cell.growthStage;
      }

      if (growthAnimTimerRef.current) clearTimeout(growthAnimTimerRef.current);
      setGrowthAnimation(detected);
      growthAnimTimerRef.current = setTimeout(() => {
        setGrowthAnimation(null);
      }, GROWTH_ANIM_DURATION_MS);
    }
  }, [state.cells]);

  const notify = useCallback((message: string) => {
    setNotification({ message, key: Date.now() });
  }, []);

  const triggerAnimation = useCallback((cellId: number) => {
    setAnimatingCellId(cellId);
    setTimeout(() => setAnimatingCellId(null), 500);
  }, []);

  const selectCell = useCallback((id: number | null) => {
    setSelectedCellId(prev => prev === id ? null : id);
  }, []);

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
      return {
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? {
                ...c,
                status: 'planted' as const,
                crop: cropType,
                growthPoints: 0,
                maxGrowthPoints: cropDef.maxGrowthPoints,
                growthStage: 1,
                maxGrowthStage: cropDef.growthStages,
              }
            : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify(`${cropDef.name}の種を植えました！`);
  }, [triggerAnimation, notify]);

  const water = useCallback((cellId: number) => {
    let message = '💧 水をやりました';
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || (cell.status !== 'planted' && cell.status !== 'growing')) return prev;

      const newPoints = Math.min(cell.growthPoints + 1, cell.maxGrowthPoints);
      const newStage = calcGrowthStage(newPoints, cell.maxGrowthPoints, cell.maxGrowthStage);
      const isReady = newPoints >= cell.maxGrowthPoints;
      const stageAdvanced = newStage > cell.growthStage;

      if (isReady) {
        message = '🎉 作物が実りました！収穫できます！';
      } else if (stageAdvanced) {
        const stageName = STAGE_NAMES[Math.min(newStage - 1, STAGE_NAMES.length - 1)];
        message = `🌱 成長しました！（${stageName}）`;
      }

      return {
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? {
                ...c,
                status: isReady ? 'harvestable' as const : 'growing' as const,
                growthPoints: newPoints,
                growthStage: newStage,
              }
            : c
        ),
      };
    });
    triggerAnimation(cellId);
    notify(message);
  }, [triggerAnimation, notify]);

  const fertilize = useCallback((cellId: number) => {
    let message = '';
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || (cell.status !== 'planted' && cell.status !== 'growing')) return prev;
      if (prev.fertilizer < 50) {
        message = '⚠️ 肥料がありません！ショップで購入しましょう';
        return prev;
      }

      const newPoints = Math.min(cell.growthPoints + 3, cell.maxGrowthPoints);
      const newStage = calcGrowthStage(newPoints, cell.maxGrowthPoints, cell.maxGrowthStage);
      const isReady = newPoints >= cell.maxGrowthPoints;
      const stageAdvanced = newStage > cell.growthStage;

      if (isReady) {
        message = '🎉 作物が実りました！収穫できます！';
      } else if (stageAdvanced) {
        const stageName = STAGE_NAMES[Math.min(newStage - 1, STAGE_NAMES.length - 1)];
        message = `🌿 肥料をまきました！成長しました（${stageName}）`;
      } else {
        message = '🌿 肥料をまきました';
      }

      return {
        ...prev,
        fertilizer: prev.fertilizer - 50,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? {
                ...c,
                status: isReady ? 'harvestable' as const : 'growing' as const,
                growthPoints: newPoints,
                growthStage: newStage,
              }
            : c
        ),
      };
    });
    if (message) {
      triggerAnimation(cellId);
      notify(message);
    }
  }, [triggerAnimation, notify]);

  const harvest = useCallback((cellId: number) => {
    let cropName = '';
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || cell.status !== 'harvestable' || !cell.crop) return prev;
      const cropDef = CROP_DEFINITIONS[cell.crop];
      cropName = cropDef.name;
      const { min, max } = cropDef.exchangeQuantityRange;
      const exchangeQuantity = Math.floor(Math.random() * (max - min + 1)) + min;
      return {
        ...prev,
        harvestLog: [
          ...prev.harvestLog,
          { crop: cell.crop, harvestedAt: new Date().toISOString(), exchangeQuantity },
        ],
        cells: prev.cells.map(c =>
          c.id === cellId ? createEmptyCell(cellId) : c
        ),
      };
    });
    triggerAnimation(cellId);
    if (cropName) {
      notify(`🎉 おめでとう！${cropName}を収穫しました！${cropName}が届きます！`);
    }
  }, [triggerAnimation, notify]);

  const buyFertilizer = useCallback((amount: number) => {
    setState(prev => ({ ...prev, fertilizer: prev.fertilizer + amount }));
    notify(`肥料を${amount}g購入しました！`);
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

  const resetGame = useCallback(() => {
    setState(createInitialState());
    setSelectedCellId(null);
    prevStagesRef.current = {};
    notify('データをリセットしました');
  }, [notify]);

  return {
    state,
    notification: notification?.message ?? null,
    selectedCellId,
    animatingCellId,
    growthAnimation,
    selectCell,
    till,
    plant,
    water,
    fertilize,
    harvest,
    buyFertilizer,
    expandFarm,
    resetGame,
  };
}
