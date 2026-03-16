import { useGame } from '../context/GameContext';

export function Notification() {
  const { notification } = useGame();

  if (!notification) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
      <div className="bg-white/95 backdrop-blur-sm text-farm-text px-5 py-3 rounded-xl shadow-lg
        border border-farm-green/20 text-sm font-medium max-w-sm text-center">
        {notification}
      </div>
    </div>
  );
}
