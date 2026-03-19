import { useGame } from '../context/GameContext';
import { FarmCell } from './FarmCell';
import { GaugeMode } from './GrowthGauge';

interface Props {
  gaugeMode: GaugeMode;
}

export function FarmGrid({ gaugeMode }: Props) {
  const { state, selectedCellId, animatingCellId, growthAnimation, selectCell } = useGame();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 pb-4 w-full max-w-2xl mx-auto">
      {state.cells.map(cell => {
        const cellGrowthAnim =
          growthAnimation?.cellId === cell.id ? growthAnimation : null;
        return (
          <FarmCell
            key={cell.id}
            cell={cell}
            isSelected={selectedCellId === cell.id}
            isAnimating={animatingCellId === cell.id}
            gaugeMode={gaugeMode}
            growthAnim={cellGrowthAnim}
            onSelect={() => selectCell(cell.id)}
          />
        );
      })}
    </div>
  );
}
