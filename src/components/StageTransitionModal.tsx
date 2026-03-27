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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        {/* お祝いアイコン */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-lg font-bold text-farm-text">{msg.title}</h2>
        </div>

        {/* ステージ番号バッジ */}
        <div className="flex justify-center mb-4">
          <span className="bg-farm-green text-white text-xs font-bold px-3 py-1 rounded-full">
            ステージ {newStage} へ進みました
          </span>
        </div>

        {/* 内容 */}
        <div className="bg-green-50 rounded-2xl p-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {msg.body}
          </p>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-farm-green-dark text-white font-bold rounded-xl
            hover:brightness-110 active:scale-95 transition-all"
        >
          次のステージへ！
        </button>
      </div>
    </div>
  );
}
