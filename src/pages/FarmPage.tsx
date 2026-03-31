import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { FarmGrid } from '../components/FarmGrid';
import { GaugeMode } from '../components/GrowthGauge';
import { WeatherOverlay } from '../components/WeatherOverlay';

export function FarmPage() {
  const { state, resetGame, advanceDays, clearWeatherEffect } = useGame();
  const [showConfirm, setShowConfirm] = useState(false);
  const [gaugeMode, setGaugeMode] = useState<GaugeMode>('stage');
  const [showDayAdvance, setShowDayAdvance] = useState(false);
  const [advanceDaysInput, setAdvanceDaysInput] = useState(1);

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

      {/* 畑グリッド（マスをタップ → セル詳細ページへ） */}
      <div className="flex-1 flex items-center justify-center px-2 py-2 relative">
        <FarmGrid gaugeMode={gaugeMode} />
        <WeatherOverlay effect={state.activeWeatherEffect} onDismiss={clearWeatherEffect} />
      </div>

      {/* 下部ナビゲーション */}
      <div className="sticky bottom-0 z-30 bg-farm-bg/90 backdrop-blur-sm border-t border-gray-200 pb-safe">
        {/* 日送りパネル */}
        {showDayAdvance && (
          <div className="px-4 pt-3 pb-1 max-w-lg mx-auto">
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-sky-700 shrink-0">⏭ 日数経過</span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setAdvanceDaysInput(v => Math.max(1, v - 1))}
                  className="w-7 h-7 rounded-full bg-sky-200 text-sky-800 font-bold text-base leading-none hover:bg-sky-300 active:scale-90 transition-all"
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
                  className="w-14 text-center text-sm font-bold border border-sky-300 rounded-lg py-1 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  onClick={() => setAdvanceDaysInput(v => Math.min(365, v + 1))}
                  className="w-7 h-7 rounded-full bg-sky-200 text-sky-800 font-bold text-base leading-none hover:bg-sky-300 active:scale-90 transition-all"
                >
                  ＋
                </button>
                <button
                  onClick={() => { advanceDays(advanceDaysInput); setShowDayAdvance(false); }}
                  className="ml-1 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 active:scale-95 transition-all shadow-sm"
                >
                  実行
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-3 max-w-lg mx-auto flex gap-3">
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
            onClick={() => setShowDayAdvance(v => !v)}
            className={`py-3 px-3 rounded-xl font-bold text-sm
              active:scale-[0.98] transition-all duration-200 shadow-sm ${
              showDayAdvance
                ? 'bg-sky-500 text-white'
                : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
            }`}
          >
            ⏭
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="py-3 px-4 rounded-xl
              bg-gray-400 text-white font-bold text-sm
              hover:bg-gray-500 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            🔄
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
