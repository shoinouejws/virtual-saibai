import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { FarmGrid } from '../components/FarmGrid';
import { GaugeMode } from '../components/GrowthGauge';
import { WeatherOverlay } from '../components/WeatherOverlay';

/**
 * 畑の俯瞰（FarmGrid / FarmCell）。いちご・段階8の分割レイアウトの縦横比基準は FarmCell 内の
 * `StrawberryStage8ReferenceSlot`（1:1）に合わせ、相対座標は `strawberryStage8PartLayout.ts` の xRel/yRel/widthRel で統一する。
 */
export function FarmPage() {
  const { state, resetGame, advanceDays, clearWeatherEffect } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);
  const [gaugeMode, setGaugeMode] = useState<GaugeMode>('stage');
  const [showDayAdvance, setShowDayAdvance] = useState(false);
  const [advanceDaysInput, setAdvanceDaysInput] = useState(1);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-44px)]">

      {/* 畑グリッド */}
      <div className="flex-1 flex items-center justify-center px-2 py-2 relative">
        <FarmGrid gaugeMode={gaugeMode} />
        <WeatherOverlay effect={state.activeWeatherEffect} onDismiss={clearWeatherEffect} />
      </div>

      {/* 下部ナビゲーション */}
      <div className="sticky bottom-0 z-30 bg-farm-bg/95 backdrop-blur-sm border-t border-farm-border pb-safe">
        {/* 日送りパネル */}
        {showDayAdvance && (
          <div className="px-4 pt-3 pb-1 max-w-lg mx-auto">
            <div className="flex items-center gap-2 bg-white border border-farm-border rounded-xl px-3 py-2.5 shadow-sm">
              <span className="text-xs font-semibold text-farm-text shrink-0">日数経過</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => setAdvanceDaysInput(v => Math.max(1, v - 1))}
                  className="w-7 h-7 rounded-lg bg-farm-panel text-farm-text font-bold text-base leading-none hover:bg-farm-border transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={advanceDaysInput}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setAdvanceDaysInput(Math.max(1, Math.min(365, v)));
                  }}
                  className="w-14 text-center text-sm font-semibold border border-farm-border rounded-lg py-1 bg-white focus:outline-none focus:ring-2 focus:ring-farm-green/30"
                />
                <button
                  onClick={() => setAdvanceDaysInput(v => Math.min(365, v + 1))}
                  className="w-7 h-7 rounded-lg bg-farm-panel text-farm-text font-bold text-base leading-none hover:bg-farm-border transition-colors"
                >
                  ＋
                </button>
                <button
                  onClick={() => { advanceDays(advanceDaysInput); setShowDayAdvance(false); }}
                  className="ml-1 px-4 py-1.5 rounded-lg bg-farm-green-dark text-white font-semibold text-xs hover:bg-farm-green transition-colors"
                >
                  実行
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-3 max-w-lg mx-auto flex gap-2">
          <Link
            to="/shop"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
              bg-farm-accent text-white font-semibold text-sm
              hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <span className="text-base">🛒</span>
            ショップ
          </Link>
          <Link
            to="/events"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
              bg-farm-brown text-white font-semibold text-sm
              hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            イベント
          </Link>
          <button
            onClick={() => setShowDayAdvance(v => !v)}
            className={`py-2.5 px-4 rounded-xl font-semibold text-sm
              transition-all duration-200 ${
              showDayAdvance
                ? 'bg-farm-green-dark text-white shadow-sm'
                : 'bg-farm-green-light text-farm-green-dark border border-farm-green/30 hover:bg-farm-green/15'
            }`}
          >
            日送り
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="py-2.5 px-3 rounded-xl
              bg-farm-panel text-farm-text-secondary font-medium text-xs border border-farm-border
              hover:bg-farm-border/60 transition-colors"
            title="リセット"
          >
            リセット
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
            <h3 className="text-base font-bold text-farm-text text-center mb-2">
              データをリセット
            </h3>
            <p className="text-sm text-farm-text-secondary text-center mb-5">
              栽培状況・収穫履歴・アイテムがすべて初期状態に戻ります。よろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-farm-border text-farm-text-secondary
                  font-medium text-sm hover:bg-farm-panel transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => { resetGame(); setShowConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white
                  font-semibold text-sm hover:bg-red-700 active:scale-95 transition-all"
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
