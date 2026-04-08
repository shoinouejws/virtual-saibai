import { STAGE_TRANSITION_MESSAGES } from '../utils/strawberryEngine';

interface Props {
  newStage: number;
  onClose: () => void;
}

export function StageTransitionModal({ newStage, onClose }: Props) {
  const msg = STAGE_TRANSITION_MESSAGES[newStage];
  if (!msg) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-farm-green-light mb-3">
            <span className="text-2xl">🌱</span>
          </div>
          <h2 className="text-base font-bold text-farm-text">{msg.title}</h2>
        </div>

        <div className="flex justify-center mb-4">
          <span className="bg-farm-green-dark text-white text-xs font-semibold px-3 py-1 rounded-lg">
            ステージ {newStage} へ進みました
          </span>
        </div>

        <div className="bg-farm-green-light/60 rounded-xl p-4 mb-4 border border-farm-green/20">
          <p className="text-sm text-farm-text leading-relaxed whitespace-pre-line">
            {msg.body}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-farm-green-dark text-white font-semibold text-sm rounded-xl
            hover:bg-farm-green active:scale-[0.98] transition-all shadow-sm"
        >
          次のステージへ
        </button>
      </div>
    </div>
  );
}
