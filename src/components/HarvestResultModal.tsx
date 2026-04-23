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
    bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300',
    badge: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white', badgeText: 'Aランク',
    comment: '素晴らしい出来栄えです。プロ農家レベルの品質です。',
  },
  B: {
    bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300',
    badge: 'bg-gradient-to-r from-green-500 to-green-600 text-white', badgeText: 'Bランク',
    comment: 'よく育ちました。あと一歩でAランクです。',
  },
  C: {
    bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300',
    badge: 'bg-gradient-to-r from-sky-400 to-sky-500 text-white', badgeText: 'Cランク',
    comment: '無事に収穫完了。改善の余地があります。',
  },
  D: {
    bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300',
    badge: 'bg-gray-500 text-white', badgeText: 'Dランク',
    comment: '次回はヒントを参考にリベンジしましょう。',
  },
};

const BERRIES_PER_PACK = 15;

function toPackDisplay(berries: number): { packs: number; label: string } {
  const packs = Math.round(berries / BERRIES_PER_PACK);
  if (packs === 0) return { packs: 0, label: `${berries}粒（少量）` };
  return { packs, label: `${packs}パック（約${berries}粒）` };
}

function sugarContentInfo(value: number): { text: string; color: string } {
  if (value >= 70) return { text: 'とても甘い', color: 'text-pink-600' };
  if (value >= 50) return { text: '甘い', color: 'text-pink-500' };
  if (value >= 30) return { text: 'ほどほど', color: 'text-amber-600' };
  return { text: 'あまり甘くない', color: 'text-gray-500' };
}

export function HarvestResultModal({ result, onClose }: Props) {
  const { record, fruitCount, totalWeight, qualityScore, cropName } = result;
  const isAdvanced = !!record.qualityRank;
  const rank = record.qualityRank;
  const rankConfig = rank ? RANK_CONFIG[rank] : null;

  const hints = isAdvanced && record.qualityScore !== undefined
    ? getImprovementHints({
        sugarContent: record.sugarContent ?? 0,
        coloring: 0,
        qualityDamage: 0,
        rotRisk: 0,
        fruitCount: fruitCount,
        overripeRisk: 0,
        health: 70,
      } as unknown as AdvancedCropState)
    : [];

  const sweet = record.sugarContent !== undefined ? sugarContentInfo(record.sugarContent) : null;

  return (
    <div
      className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm my-4 animate-fade-in-down overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-b from-farm-green-light to-white px-6 pt-5 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-farm-green/15 mb-2">
            <span className="text-xl">🌾</span>
          </div>
          <h2 className="text-base font-bold text-farm-text">{cropName}を収穫しました</h2>
        </div>

        <div className="px-5 pb-5 space-y-4">

          {/* アドバンスドモデル: ランクと詳細 */}
          {isAdvanced && rank && rankConfig ? (
            <section className={`rounded-xl border ${rankConfig.border} ${rankConfig.bg} p-4`}>
              <div className="text-[11px] font-semibold text-farm-text-secondary mb-3 tracking-wide">
                今回育てた{cropName}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className={`text-lg font-bold px-5 py-1.5 rounded-xl whitespace-nowrap shadow-sm ${rankConfig.badge}`}>
                  {rankConfig.badgeText}
                </span>
                <div>
                  <div className={`text-sm ${rankConfig.text}`}>{rankConfig.comment}</div>
                  <div className="text-[11px] text-farm-text-secondary mt-0.5">品質スコア {qualityScore}点</div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <StatCard label="収穫した実" value={`${fruitCount}個`} />
                {totalWeight > 0 && <StatCard label="合計重量" value={`${totalWeight}g`} />}
                {sweet && <StatCard label="糖度" value={sweet.text} valueColor={sweet.color} />}
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-farm-green/30 bg-farm-green-light p-4">
              <div className="text-[11px] font-semibold text-farm-text-secondary mb-3 tracking-wide">
                今回収穫した{cropName}
              </div>
              <div className="text-2xl font-bold text-farm-green-dark">{fruitCount}個</div>
            </section>
          )}

          {/* 矢印 */}
          <div className="flex items-center justify-center text-farm-text-secondary text-sm select-none">↓</div>

          {/* 報酬セクション */}
          {(() => {
            const { packs } = toPackDisplay(record.exchangeQuantity);
            return (
              <section className="rounded-xl border-2 border-farm-green bg-farm-green-light/40 p-4">
                <div className="text-[11px] font-semibold text-farm-text-secondary mb-3 tracking-wide">
                  もらえる報酬
                </div>
                <div className="flex items-end gap-2 mb-1">
                  {packs > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-farm-green-dark leading-none">{packs}</span>
                      <span className="text-sm font-semibold text-farm-green-dark mb-0.5">パック</span>
                      <span className="text-[11px] text-farm-text-secondary mb-1">（約{15 * packs}粒）と交換できます</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-farm-green-dark leading-none">{record.exchangeQuantity}</span>
                      <span className="text-sm font-semibold text-farm-green-dark mb-0.5">粒</span>
                      <span className="text-[11px] text-farm-text-secondary mb-1">と交換できます</span>
                    </>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 改善ヒント */}
          {hints.length > 0 && (
            <section className="bg-farm-accent-light rounded-xl p-4 border border-farm-accent/20">
              <h3 className="text-[11px] font-bold text-farm-accent mb-2">次回への改善ポイント</h3>
              <ul className="space-y-1">
                {hints.map((hint, i) => (
                  <li key={i} className="text-xs text-farm-brown-dark flex gap-1.5">
                    <span className="shrink-0 text-farm-accent">•</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-farm-green-dark text-white font-semibold text-sm rounded-xl
              hover:bg-farm-green active:scale-[0.98] transition-all shadow-sm"
          >
            収穫リストで確認する
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-white/80 rounded-lg px-3 py-2 border border-white/50">
      <div className="text-[10px] text-farm-text-secondary">{label}</div>
      <div className={`text-sm font-bold ${valueColor ?? 'text-farm-text'}`}>{value}</div>
    </div>
  );
}
