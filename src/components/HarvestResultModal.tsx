import { HarvestResultInfo } from '../hooks/useGameState';
import { QualityRank } from '../types';
import { getImprovementHints } from '../utils/strawberryEngine';
import type { AdvancedCropState } from '../types';

interface Props {
  result: HarvestResultInfo;
  onClose: () => void;
}

const RANK_CONFIG: Record<QualityRank, {
  bg: string; text: string; border: string;
  badge: string; badgeText: string;
  comment: string;
}> = {
  A: {
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300',
    badge: 'bg-amber-400 text-white', badgeText: 'Aランク',
    comment: '素晴らしい出来栄え！プロ農家レベルです',
  },
  B: {
    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300',
    badge: 'bg-green-500 text-white', badgeText: 'Bランク',
    comment: 'よく育ちました！あと一歩でAランクです',
  },
  C: {
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300',
    badge: 'bg-blue-400 text-white', badgeText: 'Cランク',
    comment: '無事に収穫完了。改善の余地あり',
  },
  D: {
    bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300',
    badge: 'bg-gray-400 text-white', badgeText: 'Dランク',
    comment: '次回はヒントを参考にリベンジしましょう',
  },
};

const BERRIES_PER_PACK = 15;

function toPackDisplay(berries: number): { packs: number; label: string } {
  const packs = Math.round(berries / BERRIES_PER_PACK);
  if (packs === 0) return { packs: 0, label: `${berries}粒（少量）` };
  return { packs, label: `${packs}パック（約${berries}粒）` };
}

function sweetnessInfo(sweetness: number): { text: string; emoji: string; color: string } {
  if (sweetness >= 70) return { text: 'とても甘い', emoji: '🍬', color: 'text-pink-600' };
  if (sweetness >= 50) return { text: '甘い', emoji: '😊', color: 'text-pink-500' };
  if (sweetness >= 30) return { text: 'ほどほど', emoji: '😐', color: 'text-yellow-600' };
  return { text: 'あまり甘くない', emoji: '😶', color: 'text-gray-500' };
}

export function HarvestResultModal({ result, onClose }: Props) {
  const { record, fruitCount, totalWeight, qualityScore, cropName } = result;
  const isAdvanced = !!record.qualityRank;
  const rank = record.qualityRank;
  const rankConfig = rank ? RANK_CONFIG[rank] : null;

  const hints = isAdvanced && record.qualityScore !== undefined
    ? getImprovementHints({
        sweetness: record.sweetness ?? 0,
        coloring: 0,
        qualityDamage: 0,
        rotRisk: 0,
        fruitCount: fruitCount,
        overripeRisk: 0,
        health: 70,
      } as unknown as AdvancedCropState)
    : [];

  const sweet = record.sweetness !== undefined ? sweetnessInfo(record.sweetness) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm my-4 animate-fade-in-down overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-b from-red-50 to-white px-6 pt-6 pb-4 text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-lg font-bold text-farm-text">{cropName}を収穫しました！</h2>
        </div>

        <div className="px-5 pb-5 space-y-4">

          {/* ===== 育ったいちごのセクション（アドバンスド） ===== */}
          {isAdvanced && rank && rankConfig ? (
            <section className={`rounded-2xl border ${rankConfig.border} ${rankConfig.bg} p-4`}>
              <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                今回育てた{cropName}
              </div>

              {/* ランク＋スコア */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-2xl font-black px-6 py-2 rounded-xl whitespace-nowrap ${rankConfig.badge}`}>
                  {rankConfig.badgeText}
                </span>
                <div>
                  <div className={`text-sm font-semibold ${rankConfig.text}`}>{rankConfig.comment}</div>
                  <div className="text-xs text-gray-400">品質スコア {qualityScore}点</div>
                </div>
              </div>

              {/* 収量・重量・甘さ */}
              <div className="flex gap-2 flex-wrap">
                <div className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <span className="text-lg">🍓</span>
                  <div>
                    <div className="text-xs text-gray-500">収穫した実</div>
                    <div className="text-sm font-bold text-gray-700">{fruitCount}個</div>
                  </div>
                </div>
                {totalWeight > 0 && (
                  <div className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <span className="text-lg">⚖️</span>
                    <div>
                      <div className="text-xs text-gray-500">合計重量</div>
                      <div className="text-sm font-bold text-gray-700">{totalWeight}g</div>
                    </div>
                  </div>
                )}
                {sweet && (
                  <div className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <span className="text-lg">{sweet.emoji}</span>
                    <div>
                      <div className="text-xs text-gray-500">甘さ</div>
                      <div className={`text-sm font-bold ${sweet.color}`}>{sweet.text}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            /* シンプルモデル用：収穫した量だけ表示 */
            <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                今回収穫した{cropName}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🍅</span>
                <span className="text-2xl font-black text-green-700">{fruitCount}個</span>
              </div>
            </section>
          )}

          {/* ===== 矢印 ===== */}
          <div className="flex items-center justify-center text-gray-400 text-lg select-none">▼</div>

          {/* ===== もらえる報酬セクション ===== */}
          {(() => {
            const { packs, label } = toPackDisplay(record.exchangeQuantity);
            return (
              <section className="rounded-2xl border-2 border-farm-green bg-farm-green/5 p-4">
                <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  もらえる報酬
                </div>
                <div className="flex items-end gap-2 mb-2">
                  {packs > 0 ? (
                    <>
                      <span className="text-4xl font-black text-farm-green-dark leading-none">{packs}</span>
                      <span className="text-base font-semibold text-farm-green-dark mb-0.5">パック</span>
                      <span className="text-xs text-gray-500 mb-1">（約{15 * packs}粒）と交換できます</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-farm-green-dark leading-none">{record.exchangeQuantity}</span>
                      <span className="text-base font-semibold text-farm-green-dark mb-0.5">粒</span>
                      <span className="text-xs text-gray-500 mb-1">と交換できます</span>
                    </>
                  )}
                </div>
                {/* {isAdvanced && (
                  <p className="text-xs text-gray-500">
                    品質スコア {qualityScore}点 ×{' '}
                    {rank === 'A' ? '高倍率' : rank === 'B' ? '標準倍率' : rank === 'C' ? '低倍率' : '最低倍率'}
                    で算出（1パック = {BERRIES_PER_PACK}粒換算）
                  </p>
                )} */}
              </section>
            );
          })()}

          {/* ===== 改善ヒント ===== */}
          {hints.length > 0 && (
            <section className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <h3 className="text-xs font-bold text-amber-700 mb-2">💡 次回への改善ポイント</h3>
              <ul className="space-y-1.5">
                {hints.map((hint, i) => (
                  <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                    <span className="shrink-0">▸</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-farm-green-dark text-white font-bold rounded-xl
              hover:brightness-110 active:scale-95 transition-all"
          >
            収穫リストで確認する
          </button>
        </div>
      </div>
    </div>
  );
}
