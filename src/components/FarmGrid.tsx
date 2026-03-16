import { useGame } from '../context/GameContext';
import { FarmCell } from './FarmCell';

export function FarmGrid() {
  const { state, selectedCellId, animatingCellId, selectCell } = useGame();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 w-full max-w-2xl mx-auto">
      {state.cells.map(cell => (
        <FarmCell
          key={cell.id}
          cell={cell}
          isSelected={selectedCellId === cell.id}
          isAnimating={animatingCellId === cell.id}
          onSelect={() => selectCell(cell.id)}
        />
      ))}
    </div>
  );
}
