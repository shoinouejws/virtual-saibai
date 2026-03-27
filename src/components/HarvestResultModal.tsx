import { HarvestResultInfo } from '../hooks/useGameState';
import { QualityRank } from '../types';
import { getImprovementHints } from '../utils/strawberryEngine';
import type { AdvancedCropState } from '../types';

interface Props {
  result: HarvestResultInfo;
  onClose: () => void;
}

const RANK_CONFIG: Record<QualityRank, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', label: '素晴らしい出来です！プロ農家も驚くほどの仕上がりですね' },
  B: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', label: 'よく育てましたね！あと少しの工夫でさらに良くなりそうです' },
  C: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', label: '無事に収穫できました。いくつか改善ポイントがあります' },
  D: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300', label: '栽培は難しいですよね。次回はポイントを押さえてリベンジしましょう' },
};

function SweetnessLabel({ sweetness }: { sweetness: number }) {
  const labels = [
    { min: 70, text: 'とても甘い 🍬', color: 'text-pink-600' },
    { min: 50, text: '甘い', color: 'text-pink-500' },
    { min: 30, text: 'ほどほど', color: 'text-yellow-600' },
    { min: 0, text: 'あまり甘くない', color: 'text-gray-500' },
  ];
  const { text, color } = labels.find(l => sweetness >= l.min)!;
  return <span className={`text-sm font-medium ${color}`}>{text}</span>;
}

export function HarvestResultModal({ result, onClose }: Props) {
  const { record, fruitCount, totalWeight, qualityScore, cropName } = result;
  const isAdvanced = !!record.qualityRank;
  const rank = record.qualityRank;
  const rankConfig = rank ? RANK_CONFIG[rank] : null;

  // ヒント（アドバンスドのみ）
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm my-4 animate-fade-in-down"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🍓</div>
          <h2 className="text-lg font-bold text-farm-text">{cropName}を収穫しました！</h2>
        </div>

        {/* 結果サマリー */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">収穫数</div>
            <div className="text-xl font-bold text-red-600">{fruitCount}個</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">交換できる数</div>
            <div className="text-xl font-bold text-green-700">
              {record.exchangeQuantity}
              <span className="text-sm ml-1">粒</span>
            </div>
          </div>
          {isAdvanced && totalWeight > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">総重量</div>
              <div className="text-xl font-bold text-blue-600">{totalWeight}g</div>
            </div>
          )}
          {isAdvanced && record.sweetness !== undefined && (
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">甘さ</div>
              <SweetnessLabel sweetness={record.sweetness} />
            </div>
          )}
        </div>

        {/* 品質ランク（アドバンスドのみ） */}
        {isAdvanced && rank && rankConfig && (
          <div className={`rounded-2xl p-4 mb-4 border ${rankConfig.bg} ${rankConfig.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-3xl font-black ${rankConfig.text}`}>ランク {rank}</span>
              <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600">
                スコア {qualityScore}点
              </span>
            </div>
            <p className={`text-sm ${rankConfig.text}`}>{rankConfig.label}</p>
          </div>
        )}

        {/* 改善ヒント */}
        {hints.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
            <h3 className="text-xs font-bold text-amber-700 mb-2">💡 次回への改善ヒント</h3>
            <ul className="space-y-1.5">
              {hints.map((hint, i) => (
                <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                  <span className="shrink-0">▸</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
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
  );
}
