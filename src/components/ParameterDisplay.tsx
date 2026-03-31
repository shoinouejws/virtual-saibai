import { AdvancedCropState } from '../types';

interface Props {
  cropState: AdvancedCropState;
}

// 5段階テキスト変換（strawberry_progress_design.md §2参照）
function toHealthLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: 'とても元気', color: 'text-emerald-600' };
  if (v >= 60) return { text: '元気', color: 'text-green-600' };
  if (v >= 40) return { text: 'やや弱っている', color: 'text-yellow-600' };
  if (v >= 20) return { text: 'とても弱っている', color: 'text-orange-600' };
  return { text: '枯れそう', color: 'text-red-600' };
}

function toMoistureLabel(v: number): { text: string; color: string } {
  if (v >= 85) return { text: '湿りすぎ', color: 'text-blue-700' };
  if (v >= 70) return { text: 'やや湿っている', color: 'text-blue-500' };
  if (v >= 40) return { text: 'ちょうどよい', color: 'text-green-600' };
  if (v >= 25) return { text: 'やや乾いている', color: 'text-yellow-600' };
  return { text: 'かなり乾いている', color: 'text-red-600' };
}

function toNutritionLabel(v: number): { text: string; color: string } {
  if (v >= 85) return { text: '多すぎる', color: 'text-orange-600' };
  if (v >= 70) return { text: 'やや多い', color: 'text-yellow-600' };
  if (v >= 40) return { text: 'ちょうどよい', color: 'text-green-600' };
  if (v >= 25) return { text: 'やや不足', color: 'text-yellow-600' };
  return { text: 'かなり不足', color: 'text-red-600' };
}

function toPestLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: '深刻', color: 'text-red-700' };
  if (v >= 60) return { text: '被害あり', color: 'text-red-500' };
  if (v >= 40) return { text: '害虫発生', color: 'text-orange-600' };
  if (v >= 20) return { text: '少し気になる', color: 'text-yellow-600' };
  return { text: '問題なし', color: 'text-green-600' };
}

function toDiseaseLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: '深刻', color: 'text-red-700' };
  if (v >= 60) return { text: '広がっている', color: 'text-red-500' };
  if (v >= 40) return { text: '病気発生', color: 'text-orange-600' };
  if (v >= 20) return { text: '気配あり', color: 'text-yellow-600' };
  return { text: '問題なし', color: 'text-green-600' };
}

function toWeedLabel(v: number): { text: string; color: string } {
  if (v >= 60) return { text: '多い', color: 'text-orange-600' };
  if (v >= 30) return { text: '少しある', color: 'text-yellow-600' };
  return { text: 'きれい', color: 'text-green-600' };
}

function toRotLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: '危険', color: 'text-red-700' };
  if (v >= 60) return { text: '腐敗の恐れ', color: 'text-red-500' };
  if (v >= 40) return { text: '注意', color: 'text-orange-600' };
  if (v >= 20) return { text: 'やや注意', color: 'text-yellow-600' };
  return { text: '安定', color: 'text-green-600' };
}

interface ParamRowProps {
  icon: string;
  label: string;
  text: string;
  color: string;
  value: number;
}

function ParamRow({ icon, label, text, color, value }: ParamRowProps) {
  const barColor = value >= 70
    ? 'bg-red-400'
    : value >= 40
      ? 'bg-green-400'
      : 'bg-yellow-400';

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-base w-6 text-center">{icon}</span>
      <span className="text-xs text-gray-600 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-20 text-right ${color}`}>{text}</span>
    </div>
  );
}

export function ParameterDisplay({ cropState: s }: Props) {
  const stage = s.cultivationStage;

  return (
    <div className="bg-white/80 rounded-2xl px-4 py-3 shadow-sm">
      <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">作物の状態</h3>

      <div className="space-y-0">
        <ParamRow icon="💚" label="株の元気" value={s.health} {...toHealthLabel(s.health)} />
        <ParamRow icon="💧" label="土の水分" value={s.moisture} {...toMoistureLabel(s.moisture)} />
        <ParamRow icon="🧪" label="栄養状態" value={s.nutrition} {...toNutritionLabel(s.nutrition)} />
        <ParamRow icon="🌿" label="雑草" value={s.weedAmount} {...toWeedLabel(s.weedAmount)} />
        <ParamRow icon="🐛" label="害虫" value={s.pestRisk} {...toPestLabel(s.pestRisk)} />
        <ParamRow icon="🦠" label="病気" value={s.diseaseRisk} {...toDiseaseLabel(s.diseaseRisk)} />

        {/* ステージ別追加表示 */}
        {stage >= 4 && stage <= 5 && (
          <div className="flex items-center gap-2 py-1.5 border-t border-gray-100">
            <span className="text-base w-6 text-center">🌸</span>
            <span className="text-xs text-gray-600 w-16 shrink-0">花の数</span>
            <span className="text-sm font-bold text-pink-600">{s.flowerCount}本</span>
          </div>
        )}
        {stage >= 6 && (
          <>
            <div className="flex items-center gap-2 py-1.5 border-t border-gray-100">
              <span className="text-base w-6 text-center">🍓</span>
              <span className="text-xs text-gray-600 w-16 shrink-0">実の数</span>
              <span className="text-sm font-bold text-red-500">{s.fruitCount}個</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
              <span className="text-base w-6 text-center">📏</span>
              <span className="text-xs text-gray-600 w-16 shrink-0">実の大きさ</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${s.fruitSize}%` }} />
              </div>
              <span className="text-xs font-medium text-red-600 w-20 text-right">{s.fruitSize}%</span>
            </div>
          </>
        )}
        {stage >= 7 && (
          <>
            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
              <span className="text-base w-6 text-center">🔴</span>
              <span className="text-xs text-gray-600 w-16 shrink-0">色づき</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${s.coloring}%` }} />
              </div>
              <span className="text-xs font-medium text-red-600 w-20 text-right">{s.coloring}%</span>
            </div>
            <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
              <span className="text-base w-6 text-center">🍬</span>
              <span className="text-xs text-gray-600 w-16 shrink-0">甘さ</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-400 rounded-full transition-all duration-500"
                  style={{ width: `${s.sweetness}%` }} />
              </div>
              <span className="text-xs font-medium text-pink-600 w-20 text-right">{s.sweetness}%</span>
            </div>
          </>
        )}
        {stage === 8 && (
          <div className="flex items-center gap-2 py-1.5 border-b border-gray-100">
            <span className="text-base w-6 text-center">⏰</span>
            <span className="text-xs text-gray-600 w-16 shrink-0">熟しすぎ</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${s.overripeRisk >= 50 ? 'bg-red-500' : 'bg-orange-400'}`}
                style={{ width: `${s.overripeRisk}%` }} />
            </div>
            <span className={`text-xs font-medium w-20 text-right ${s.overripeRisk >= 50 ? 'text-red-600' : 'text-orange-600'}`}>
              {s.overripeRisk >= 50 ? '⚠️ 注意' : `${s.overripeRisk}%`}
            </span>
          </div>
        )}

        {/* 腐りやすさ（果実期以降） */}
        {stage >= 6 && s.rotRisk > 0 && (
          <ParamRow icon="🍂" label="腐りやすさ" value={s.rotRisk} {...toRotLabel(s.rotRisk)} />
        )}
      </div>
    </div>
  );
}
