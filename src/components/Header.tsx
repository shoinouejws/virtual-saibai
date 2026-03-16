import { useGame } from '../context/GameContext';

export function Header() {
  const { state } = useGame();

  return (
    <header className="bg-farm-green-dark text-white px-4 py-3 shadow-md">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide">🌱 バーチャル栽培</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1" title="肥料の在庫">
            🧪 {state.fertilizer}
          </span>
          <span className="flex items-center gap-1" title="収穫回数">
            📦 {state.harvestLog.length}
          </span>
        </div>
      </div>
    </header>
  );
}
