import { useState, useCallback, useEffect } from 'react';
import { GameState, FarmCellState, CropType } from '../types';
import { CROP_DEFINITIONS } from '../data/crops';
import { saveGame, loadGame } from '../utils/storage';

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
    fertilizer: 3,
    farmSize: 4,
    cells: Array.from({ length: 4 }, (_, i) => createEmptyCell(i)),
    harvestLog: [],
  };
}

function calcGrowthStage(points: number, maxPoints: number, maxStage: number): number {
  if (points >= maxPoints) return maxStage;
  if (maxPoints === 0) return 1;
  return Math.min(Math.floor((points / maxPoints) * (maxStage - 1)) + 1, maxStage);
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadGame() ?? createInitialState());
  const [notification, setNotification] = useState<{ message: string; key: number } | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [animatingCellId, setAnimatingCellId] = useState<number | null>(null);

  useEffect(() => { saveGame(state); }, [state]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

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
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || (cell.status !== 'planted' && cell.status !== 'growing')) return prev;

      const newPoints = cell.growthPoints + 1;
      const newStage = calcGrowthStage(newPoints, cell.maxGrowthPoints, cell.maxGrowthStage);
      const isReady = newPoints >= cell.maxGrowthPoints;

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

    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (cell?.status === 'harvestable') {
        notify('作物が実りました！収穫できます！ 🎉');
      } else {
        notify('水をやりました 💧');
      }
      return prev;
    });
  }, [triggerAnimation, notify]);

  const fertilize = useCallback((cellId: number) => {
    let hasFertilizer = false;
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || (cell.status !== 'planted' && cell.status !== 'growing')) return prev;
      if (prev.fertilizer <= 0) return prev;
      hasFertilizer = true;

      const newPoints = cell.growthPoints + 2;
      const newStage = calcGrowthStage(newPoints, cell.maxGrowthPoints, cell.maxGrowthStage);
      const isReady = newPoints >= cell.maxGrowthPoints;

      return {
        ...prev,
        fertilizer: prev.fertilizer - 1,
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

    if (!hasFertilizer) {
      notify('肥料がありません！ショップで購入しましょう');
      return;
    }
    triggerAnimation(cellId);

    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (cell?.status === 'harvestable') {
        notify('作物が実りました！収穫できます！ 🎉');
      } else {
        notify('肥料をまきました 🌿');
      }
      return prev;
    });
  }, [triggerAnimation, notify]);

  const harvest = useCallback((cellId: number) => {
    let cropName = '';
    setState(prev => {
      const cell = prev.cells.find(c => c.id === cellId);
      if (!cell || cell.status !== 'harvestable' || !cell.crop) return prev;
      cropName = CROP_DEFINITIONS[cell.crop].name;
      return {
        ...prev,
        harvestLog: [
          ...prev.harvestLog,
          { crop: cell.crop, harvestedAt: new Date().toISOString() },
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
    notify(`肥料を${amount}個購入しました！`);
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
    notify('データをリセットしました');
  }, [notify]);

  return {
    state,
    notification: notification?.message ?? null,
    selectedCellId,
    animatingCellId,
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
