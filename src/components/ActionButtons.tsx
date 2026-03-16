import { useState } from 'react';
import { ActionType } from '../types';
import { useGame } from '../context/GameContext';
import { CropSelector } from './CropSelector';

const ACTION_CONFIG: { type: ActionType; label: string; icon: string }[] = [
  { type: 'till', label: '耕す', icon: '⛏️' },
  { type: 'plant', label: '植える', icon: '🌱' },
  { type: 'water', label: '水やり', icon: '💧' },
  { type: 'fertilize', label: '肥料', icon: '🧪' },
  { type: 'harvest', label: '収穫', icon: '✂️' },
];

function getAvailableActions(status: string | undefined, hasFertilizer: boolean): ActionType[] {
  switch (status) {
    case 'empty': return ['till'];
    case 'tilled': return ['plant'];
    case 'planted':
    case 'growing': {
      const actions: ActionType[] = ['water'];
      if (hasFertilizer) actions.push('fertilize');
      return actions;
    }
    case 'harvestable': return ['harvest'];
    default: return [];
  }
}

export function ActionButtons() {
  const { state, selectedCellId, till, plant, water, fertilize, harvest } = useGame();
  const [showCropSelector, setShowCropSelector] = useState(false);

  const selectedCell = state.cells.find(c => c.id === selectedCellId);
  const available = getAvailableActions(selectedCell?.status, state.fertilizer > 0);

  const handleAction = (action: ActionType) => {
    if (selectedCellId === null) return;
    switch (action) {
      case 'till': till(selectedCellId); break;
      case 'plant': setShowCropSelector(true); break;
      case 'water': water(selectedCellId); break;
      case 'fertilize': fertilize(selectedCellId); break;
      case 'harvest': harvest(selectedCellId); break;
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 px-4 py-3 max-w-lg mx-auto">
        {ACTION_CONFIG.map(({ type, label, icon }) => {
          const isAvailable = available.includes(type);
          return (
            <button
              key={type}
              onClick={() => handleAction(type)}
              disabled={!isAvailable || selectedCellId === null}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 rounded-lg
                font-medium text-sm transition-all duration-200
                ${isAvailable && selectedCellId !== null
                  ? 'bg-farm-green-dark text-white hover:bg-farm-green active:scale-95 shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {showCropSelector && selectedCellId !== null && (
        <CropSelector
          onSelect={(cropType) => {
            plant(selectedCellId, cropType);
            setShowCropSelector(false);
          }}
          onClose={() => setShowCropSelector(false)}
        />
      )}
    </>
  );
}
