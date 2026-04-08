import { useState } from 'react';
import { FarmCellState, AdvancedCropState, ActionDegree } from '../types';
import { useGame } from '../context/GameContext';
import { CropSelector } from './CropSelector';
import { ActionDegreeSelector } from './ActionDegreeSelector';

interface Props {
  cell: FarmCellState;
}

interface SimpleAction {
  key: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

interface AdvancedAction {
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  hasDegree?: boolean;
  onPress: (degree?: ActionDegree) => void;
  highlight?: boolean;
}

export function ActionButtons({ cell }: Props) {
  const game = useGame();
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [degreeAction, setDegreeAction] = useState<{ key: string; label: string; icon: string; onSelect: (d: ActionDegree) => void } | null>(null);

  const cellId = cell.id;
  const hasFertilizer = game.state.fertilizer >= 50;
  const hasInsecticide = game.state.insecticide > 0;
  const hasFungicide = game.state.fungicide > 0;
  const hasSheet = game.state.temperatureSheet > 0;

  if (cell.status === 'empty') {
    return (
      <ActionGrid>
        <PrimaryBtn label="耕す" icon="⛏️" onClick={() => game.till(cellId)} />
      </ActionGrid>
    );
  }

  if (cell.status === 'tilled') {
    return (
      <>
        <ActionGrid>
          <PrimaryBtn label="作物を選んで植える" icon="🌱" onClick={() => setShowCropSelector(true)} />
        </ActionGrid>
        {showCropSelector && (
          <CropSelector
            onSelect={cropType => { game.plant(cellId, cropType); setShowCropSelector(false); }}
            onClose={() => setShowCropSelector(false)}
          />
        )}
      </>
    );
  }

  if (cell.cropState?.modelType === 'simple') {
    const cs = cell.cropState;
    const simpleActions: SimpleAction[] = [];

    if (cell.status === 'planted' || cell.status === 'growing') {
      simpleActions.push({
        key: 'water', label: '水やり', disabled: false,
        onPress: () => game.waterSimple(cellId),
      });
      simpleActions.push({
        key: 'fertilize', label: `肥料 (${Math.floor(game.state.fertilizer/50)}回分)`,
        disabled: !hasFertilizer,
        onPress: () => game.fertilizeSimple(cellId),
      });
    }

    if (cell.status === 'harvestable') {
      simpleActions.push({
        key: 'harvest', label: '収穫する', disabled: false,
        onPress: () => game.harvest(cellId),
      });
    }

    const progress = cs.maxGrowthPoints > 0
      ? Math.round((cs.growthPoints / cs.maxGrowthPoints) * 100)
      : 0;

    return (
      <>
        <div className="mb-3 bg-farm-panel rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-farm-green rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] text-farm-text-secondary">成長 {progress}%</span>
          </div>
        </div>
        <ActionGrid>
          {simpleActions.map(a => (
            a.key === 'harvest'
              ? <PrimaryBtn key={a.key} label={a.label} icon="✂️" onClick={a.onPress} />
              : <SecondaryBtn key={a.key} label={a.label} disabled={a.disabled} onClick={a.onPress} />
          ))}
        </ActionGrid>
      </>
    );
  }

  if (cell.cropState?.modelType === 'advanced') {
    const cs: AdvancedCropState = cell.cropState;
    const stage = cs.cultivationStage;
    const actions: AdvancedAction[] = [];

    switch (stage) {
      case 1: {
        if (!cs.isTilled) actions.push({ key: 'till', label: '土を整える', icon: '⛏️', disabled: cs.hasMulch, onPress: () => game.strawberryTillSoil(cellId), highlight: !cs.hasMulch });
        if (!cs.hasMulch) actions.push({ key: 'baseFert', label: '元肥を入れる', icon: '🧪', disabled: false, onPress: () => game.strawberryBaseFertilizer(cellId) });
        if (!cs.hasRidge) actions.push({ key: 'ridge', label: '畝を作る', icon: '🏗️', disabled: cs.hasMulch, onPress: () => game.strawberryMakeRidge(cellId) });
        if (cs.isTilled && !cs.hasMulch) actions.push({ key: 'mulch', label: 'マルチを敷く', icon: '🛡️', disabled: false, onPress: () => game.strawberryLayMulch(cellId) });
        actions.push({ key: 'plant', label: '苗を植える', icon: '🌱', disabled: !cs.isTilled, onPress: () => game.strawberryPlantSeedling(cellId), highlight: cs.isTilled });
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        break;
      }

      case 2:
        if (!cs.isPlanted) actions.push({ key: 'plant', label: '苗を植える', icon: '🌱', disabled: false, onPress: () => game.strawberryPlantSeedling(cellId), highlight: true });
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'fert', label: '軽く肥料', icon: '🧪', disabled: !hasFertilizer, onPress: () => game.strawberryFertilize(cellId, 'light') });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 3:
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'fert', label: '追肥', icon: '🧪', disabled: !hasFertilizer, hasDegree: true, onPress: d => game.strawberryFertilize(cellId, d ?? 'normal') });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, hasDegree: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        break;

      case 4:
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'fert', label: '追肥', icon: '🧪', disabled: !hasFertilizer, hasDegree: true, onPress: d => game.strawberryFertilize(cellId, d ?? 'normal') });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId), highlight: true });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 5:
        actions.push({ key: 'pollinate', label: '受粉補助', icon: '🌸', disabled: cs.todayPollinated, onPress: () => game.strawberryPollinate(cellId), highlight: true });
        actions.push({ key: 'thinFlowers', label: '花を減らす', icon: '✂️', disabled: cs.flowerCount <= 3, onPress: () => game.strawberryThinFlowers(cellId) });
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'light') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'fert', label: '軽く追肥', icon: '🧪', disabled: !hasFertilizer, onPress: () => game.strawberryFertilize(cellId, 'light') });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 6:
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'fert', label: '追肥', icon: '🧪', disabled: !hasFertilizer, hasDegree: true, onPress: d => game.strawberryFertilize(cellId, d ?? 'normal') });
        if (cs.fruitCount > 8) actions.push({ key: 'thinFruits', label: '摘果する', icon: '✂️', disabled: false, onPress: () => game.strawberryThinFruits(cellId), highlight: cs.fruitCount > 12 });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 7:
        actions.push({ key: 'water', label: '水やり(少なめ)', icon: '💧', disabled: cs.moisture >= 85, onPress: () => game.strawberryWater(cellId, 'light') });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal'), highlight: true });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 8:
        actions.push({ key: 'harvest', label: '収穫する', icon: '🍓', disabled: false, onPress: () => game.harvest(cellId), highlight: true });
        actions.push({ key: 'water', label: '少量の水やり', icon: '💧', disabled: cs.moisture >= 70, onPress: () => game.strawberryWater(cellId, 'light') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        break;

      default:
        break;
    }

    const handleAdvancedAction = (action: AdvancedAction) => {
      if (action.hasDegree) {
        setDegreeAction({
          key: action.key,
          label: action.label,
          icon: action.icon,
          onSelect: d => { action.onPress(d); setDegreeAction(null); },
        });
      } else {
        action.onPress();
      }
    };

    const primaryActions = actions.filter(a => a.highlight && !a.disabled);
    const regularActions = actions.filter(a => !a.highlight || a.disabled);

    return (
      <>
        {/* 推奨アクション (highlight) を目立つ形で表示 */}
        {primaryActions.length > 0 && (
          <div className="mb-3 space-y-2">
            {primaryActions.map(a => (
              <PrimaryBtn
                key={a.key}
                label={a.label}
                icon={a.icon}
                onClick={() => handleAdvancedAction(a)}
                fullWidth
              />
            ))}
          </div>
        )}

        {/* その他のアクション */}
        <ActionGrid>
          {regularActions.map(a => (
            <SecondaryBtn
              key={a.key}
              label={a.label}
              icon={a.icon}
              disabled={a.disabled}
              onClick={() => handleAdvancedAction(a)}
            />
          ))}
        </ActionGrid>

        {degreeAction && (
          <ActionDegreeSelector
            label={degreeAction.label}
            icon={degreeAction.icon}
            onSelect={d => { degreeAction.onSelect(d); setDegreeAction(null); }}
            onCancel={() => setDegreeAction(null)}
          />
        )}
      </>
    );
  }

  return null;
}

function ActionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}

interface PrimaryBtnProps {
  label: string;
  icon?: string;
  onClick: () => void;
  fullWidth?: boolean;
}

function PrimaryBtn({ label, icon, onClick, fullWidth }: PrimaryBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 px-4 py-3 rounded-xl
        bg-farm-green-dark text-white font-semibold text-sm
        hover:bg-farm-green active:scale-[0.97]
        transition-all duration-150 shadow-sm shadow-farm-green-dark/20
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

interface SecondaryBtnProps {
  label: string;
  icon?: string;
  disabled?: boolean;
  onClick: () => void;
}

function SecondaryBtn({ label, icon, disabled = false, onClick }: SecondaryBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-lg
        font-medium text-sm transition-all duration-150
        ${disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-farm-text border border-farm-border hover:border-farm-green/40 hover:bg-farm-green-light active:scale-[0.97]'
        }
      `}
      aria-label={label}
    >
      {icon && <span className="text-sm opacity-70">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
