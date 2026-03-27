import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { FarmGrid } from '../components/FarmGrid';
import { ActionButtons } from '../components/ActionButtons';
import { GaugeMode } from '../components/GrowthGauge';

export function FarmPage() {
  const { resetGame } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);
  const [gaugeMode, setGaugeMode] = useState<GaugeMode>('stage');

  return (
    <div className="flex flex-col min-h-[calc(100dvh-52px)]">

      {/* ゲージモード切り替え */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="flex items-center gap-1 bg-black/10 rounded-full p-0.5 text-xs">
          <button
            onClick={() => setGaugeMode('stage')}
            className={`px-3 py-1 rounded-full transition-all duration-200 font-medium ${
              gaugeMode === 'stage'
                ? 'bg-farm-green-dark text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            段階ゲージ
          </button>
          <button
            onClick={() => setGaugeMode('total')}
            className={`px-3 py-1 rounded-full transition-all duration-200 font-medium ${
              gaugeMode === 'total'
                ? 'bg-farm-green-dark text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全体ゲージ
          </button>
        </div>
      </div>

      {/* 畑グリッド */}
      <div className="flex-1 flex items-center justify-center px-2 py-2">
        <FarmGrid gaugeMode={gaugeMode} />
      </div>

      {/* アクションエリア（z-30 でマスのラベルより必ず前面） */}
      <div className="sticky bottom-0 z-30 bg-farm-bg/90 backdrop-blur-sm border-t border-gray-200 pb-safe">
        <ActionButtons />

        <div className="px-4 pb-4 max-w-lg mx-auto flex gap-3">
          <Link
            to="/shop"
            className="flex-1 block text-center py-3 rounded-xl
              bg-farm-orange text-white font-bold text-sm
              hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            🛒 ショップへ
          </Link>
          <Link
            to="/events"
            className="flex-1 block text-center py-3 rounded-xl
              bg-purple-500 text-white font-bold text-sm
              hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            ⚡ イベント
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="py-3 px-4 rounded-xl
              bg-gray-400 text-white font-bold text-sm
              hover:bg-gray-500 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            🔄 リセット
          </button>
        </div>
      </div>

      {/* リセット確認ダイアログ */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs animate-fade-in-down"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-farm-text text-center mb-2">
              データをリセット
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              栽培状況・収穫履歴・アイテムがすべて初期状態に戻ります。よろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600
                  font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => { resetGame(); setShowConfirm(false); }}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white
                  font-bold text-sm hover:bg-red-600 active:scale-95 transition-all"
              >
                リセットする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
