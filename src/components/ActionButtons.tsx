import { useState } from 'react';
import { FarmCellState, AdvancedCropState, ActionDegree } from '../types';
import { useGame } from '../context/GameContext';
import { CropSelector } from './CropSelector';
import { ActionDegreeSelector } from './ActionDegreeSelector';

interface Props {
  cell: FarmCellState;
}

// シンプルモデル用アクション定義
interface SimpleAction {
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  onPress: () => void;
}

// アドバンスドモデル用アクション定義
interface AdvancedAction {
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  hasDegree?: boolean;  // 強度選択あり
  onPress: (degree?: ActionDegree) => void;
  highlight?: boolean;  // 重要アクション
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

  // ===== セルの状態に応じたアクション構築 =====

  // 空き地・耕し済み（共通）
  if (cell.status === 'empty') {
    return (
      <ActionGrid>
        <ActionBtn label="耕す" icon="⛏️" onClick={() => game.till(cellId)} />
      </ActionGrid>
    );
  }

  if (cell.status === 'tilled') {
    return (
      <>
        <ActionGrid>
          <ActionBtn label="作物を選択" icon="🌱" onClick={() => setShowCropSelector(true)} highlight />
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

  // ===== シンプルモデル（トマト） =====
  if (cell.cropState?.modelType === 'simple') {
    const cs = cell.cropState;
    const simpleActions: SimpleAction[] = [];

    if (cell.status === 'planted' || cell.status === 'growing') {
      simpleActions.push({
        key: 'water', label: '水やり', icon: '💧', disabled: false,
        onPress: () => game.waterSimple(cellId),
      });
      simpleActions.push({
        key: 'fertilize', label: `肥料 (${Math.floor(game.state.fertilizer/50)}回分)`, icon: '🧪',
        disabled: !hasFertilizer,
        onPress: () => game.fertilizeSimple(cellId),
      });
    }

    if (cell.status === 'harvestable') {
      simpleActions.push({
        key: 'harvest', label: '収穫する', icon: '✂️', disabled: false,
        onPress: () => game.harvest(cellId),
      });
    }

    // 簡易ゲージ表示
    const progress = cs.maxGrowthPoints > 0
      ? Math.round((cs.growthPoints / cs.maxGrowthPoints) * 100)
      : 0;

    return (
      <>
        <div className="mb-3 bg-white/60 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500">成長 {progress}%</span>
          </div>
        </div>
        <ActionGrid>
          {simpleActions.map(a => (
            <ActionBtn key={a.key} label={a.label} icon={a.icon} disabled={a.disabled} onClick={a.onPress} />
          ))}
        </ActionGrid>
      </>
    );
  }

  // ===== アドバンスドモデル（いちご） =====
  if (cell.cropState?.modelType === 'advanced') {
    const cs: AdvancedCropState = cell.cropState;
    const stage = cs.cultivationStage;
    const actions: AdvancedAction[] = [];

    // ===== ステージ別アクション =====
    switch (stage) {
      case 1: { // 栽培準備期
        // 土を整える: マルチ後は不可（覆われた土は耕せない）
        if (!cs.isTilled) actions.push({ key: 'till', label: '土を整える', icon: '⛏️', disabled: cs.hasMulch, onPress: () => game.strawberryTillSoil(cellId), highlight: !cs.hasMulch });
        // 元肥は土に混ぜ込む作業のためマルチ後は不可
        if (!cs.hasMulch) actions.push({ key: 'baseFert', label: '元肥を入れる', icon: '🧪', disabled: false, onPress: () => game.strawberryBaseFertilizer(cellId) });
        // 畝はマルチ後は作れない（物理的に困難）
        if (!cs.hasRidge) actions.push({ key: 'ridge', label: '畝を作る', icon: '🏡', disabled: cs.hasMulch, onPress: () => game.strawberryMakeRidge(cellId) });
        // マルチは耕した後のみ敷設可能（耕す前に敷くと詰むため設計上制限）
        if (cs.isTilled && !cs.hasMulch) actions.push({ key: 'mulch', label: 'マルチを敷く', icon: '🛡️', disabled: false, onPress: () => game.strawberryLayMulch(cellId) });
        // 苗を植える: 耕してから（isTilled）が必須。植えるとステージ2へ即時遷移
        actions.push({ key: 'plant', label: '苗を植える', icon: '🌱', disabled: !cs.isTilled, onPress: () => game.strawberryPlantSeedling(cellId), highlight: cs.isTilled });
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        break;
      }

      case 2: // 定植・活着期
        if (!cs.isPlanted) actions.push({ key: 'plant', label: '苗を植える', icon: '🌱', disabled: false, onPress: () => game.strawberryPlantSeedling(cellId), highlight: true });
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'fert', label: '軽く肥料', icon: '🧪', disabled: !hasFertilizer, onPress: () => game.strawberryFertilize(cellId, 'light') });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 3: // 葉成長期
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'fert', label: '追肥', icon: '🧪', disabled: !hasFertilizer, hasDegree: true, onPress: d => game.strawberryFertilize(cellId, d ?? 'normal') });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, hasDegree: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        break;

      case 4: // 花芽形成期
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'fert', label: '追肥', icon: '🧪', disabled: !hasFertilizer, hasDegree: true, onPress: d => game.strawberryFertilize(cellId, d ?? 'normal') });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId), highlight: true });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 5: // 開花期
        actions.push({ key: 'pollinate', label: '受粉補助', icon: '🌸', disabled: cs.todayPollinated, onPress: () => game.strawberryPollinate(cellId), highlight: true });
        actions.push({ key: 'thinFlowers', label: '花を減らす', icon: '✂️', disabled: cs.flowerCount <= 3, onPress: () => game.strawberryThinFlowers(cellId) });
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'light') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'fert', label: '軽く追肥', icon: '🧪', disabled: !hasFertilizer, onPress: () => game.strawberryFertilize(cellId, 'light') });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 6: // 果実肥大期
        actions.push({ key: 'water', label: '水やり', icon: '💧', disabled: cs.moisture >= 100, hasDegree: true, onPress: d => game.strawberryWater(cellId, d ?? 'normal') });
        actions.push({ key: 'fert', label: '追肥', icon: '🧪', disabled: !hasFertilizer, hasDegree: true, onPress: d => game.strawberryFertilize(cellId, d ?? 'normal') });
        if (cs.fruitCount > 8) actions.push({ key: 'thinFruits', label: '摘果する', icon: '✂️', disabled: false, onPress: () => game.strawberryThinFruits(cellId), highlight: cs.fruitCount > 12 });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal') });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 7: // 成熟期
        actions.push({ key: 'water', label: '水やり(少なめ)', icon: '💧', disabled: cs.moisture >= 85, onPress: () => game.strawberryWater(cellId, 'light') });
        actions.push({ key: 'trim', label: '葉の整理', icon: '✂️', disabled: false, onPress: () => game.strawberryTrimLeaves(cellId, 'normal'), highlight: true });
        actions.push({ key: 'weed', label: '除草', icon: '🌿', disabled: cs.weedAmount <= 0, onPress: () => game.strawberryWeed(cellId) });
        actions.push({ key: 'temp', label: '温度調整', icon: '🌡️', disabled: !hasSheet, onPress: () => game.strawberryTempAdjust(cellId) });
        actions.push({ key: 'disease', label: '病気対策', icon: '🦠', disabled: !hasFungicide, onPress: () => game.strawberryDiseaseControl(cellId) });
        actions.push({ key: 'pest', label: '害虫対策', icon: '🐛', disabled: !hasInsecticide, onPress: () => game.strawberryPestControl(cellId) });
        break;

      case 8: // 収穫可能期
        actions.push({ key: 'harvest', label: '収穫する！', icon: '🍓', disabled: false, onPress: () => game.harvest(cellId), highlight: true });
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

    return (
      <>
        <ActionGrid>
          {actions.map(a => (
            <ActionBtn
              key={a.key}
              label={a.label}
              icon={a.icon}
              disabled={a.disabled}
              onClick={() => handleAdvancedAction(a)}
              highlight={a.highlight}
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

// ===== サブコンポーネント =====

function ActionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}

interface ActionBtnProps {
  label: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
  highlight?: boolean;
}

function ActionBtn({ label, icon, disabled = false, onClick, highlight }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 px-3 py-2.5 rounded-xl
        font-medium text-sm transition-all duration-150
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
          : highlight
            ? 'bg-farm-green text-white hover:bg-farm-green-dark active:scale-95 shadow-md shadow-green-500/20'
            : 'bg-farm-green-dark text-white hover:brightness-110 active:scale-95 shadow-sm'
        }
      `}
      aria-label={label}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
