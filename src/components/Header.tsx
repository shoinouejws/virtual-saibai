import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';

export function Header() {
  const { state } = useGame();

  return (
    <header className="bg-farm-green-dark text-white px-4 py-3 shadow-md">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <h1 className="text-base font-bold tracking-wide">🌱 バーチャル栽培</h1>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
            🧪 <span className="font-medium">肥料 {state.fertilizer}g</span>
          </span>
          <Link
            to="/harvest"
            className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full
              hover:bg-white/20 transition-colors active:scale-95"
          >
            📦 <span className="font-medium">収穫済み {state.harvestLog.length}個</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
