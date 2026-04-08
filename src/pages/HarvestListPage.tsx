import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { CROP_DEFINITIONS } from '../data/crops';
import { CropType } from '../types';

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function HarvestListPage() {
  const { state } = useGame();
  const [exchangedIndexes, setExchangedIndexes] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExchange = (index: number, cropName: string) => {
    setExchangedIndexes(prev => new Set(prev).add(index));
    showToast(`${cropName}の交換申請を受け付けました。後ほどご連絡します。`);
  };

  const sortedLog = [...state.harvestLog].reverse();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
            hover:opacity-75 transition-opacity"
        >
          ← 畑に戻る
        </Link>
        <h2 className="text-base font-bold text-farm-text">収穫リスト</h2>
        <div className="w-20" />
      </div>

      {/* 件数サマリー */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-farm-border text-center">
        <div className="text-2xl font-bold text-farm-green-dark">{state.harvestLog.length}</div>
        <div className="text-xs text-farm-text-secondary mt-0.5">累計収穫数</div>
      </div>

      {/* 収穫リスト */}
      {sortedLog.length === 0 ? (
        <div className="text-center py-16 text-farm-text-secondary">
          <p className="text-sm">まだ収穫した作物がありません</p>
          <p className="text-xs mt-1">畑で作物を育てて収穫しましょう</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedLog.map((record, i) => {
            const originalIndex = state.harvestLog.length - 1 - i;
            const cropDef = CROP_DEFINITIONS[record.crop];
            const isExchanged = exchangedIndexes.has(originalIndex);

            return (
              <div
                key={originalIndex}
                className="bg-white rounded-xl p-4 border border-farm-border
                  flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-farm-text text-sm">
                    {cropDef.name}
                    <span className="ml-2 text-farm-green-dark">
                      × {record.exchangeQuantity}{cropDef.exchangeUnit}
                    </span>
                  </div>
                  <div className="text-[11px] text-farm-text-secondary mt-0.5">{formatDate(record.harvestedAt)}</div>
                  {record.qualityRank && (
                    <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-farm-panel text-farm-text-secondary">
                      {record.qualityRank}ランク ・ {record.qualityScore}点
                    </span>
                  )}
                </div>
                {isExchanged ? (
                  <span className="text-xs font-medium text-farm-text-secondary bg-farm-panel
                    px-3 py-1.5 rounded-lg whitespace-nowrap">
                    申請済み
                  </span>
                ) : (
                  <button
                    onClick={() => handleExchange(originalIndex, cropDef.name)}
                    className="text-xs font-semibold text-white bg-farm-green-dark
                      px-3 py-1.5 rounded-lg whitespace-nowrap
                      hover:brightness-110 active:scale-[0.97] transition-all duration-200"
                  >
                    交換する
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-farm-text-secondary mt-8">
        ※ プロトタイプのため、実際の配送・交換は発生しません
      </p>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-white/95 backdrop-blur-sm text-farm-text px-5 py-3 rounded-xl
            shadow-lg border border-farm-border text-sm max-w-sm text-center">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
