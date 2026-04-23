import { AdvancedCropState } from '../types';
import { useGame } from '../context/GameContext';

interface Props {
  cropState: AdvancedCropState;
}

function toHealthLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: 'とても元気', color: 'text-emerald-600' };
  if (v >= 60) return { text: '元気', color: 'text-green-600' };
  if (v >= 40) return { text: 'やや弱っている', color: 'text-amber-600' };
  if (v >= 20) return { text: 'とても弱っている', color: 'text-orange-600' };
  return { text: '枯れそう', color: 'text-red-600' };
}

function toMoistureLabel(v: number): { text: string; color: string } {
  if (v >= 85) return { text: '湿りすぎ', color: 'text-blue-600' };
  if (v >= 70) return { text: 'やや湿っている', color: 'text-blue-500' };
  if (v >= 40) return { text: 'ちょうどよい', color: 'text-green-600' };
  if (v >= 25) return { text: 'やや乾いている', color: 'text-amber-600' };
  return { text: 'かなり乾いている', color: 'text-red-600' };
}

function toNutritionLabel(v: number): { text: string; color: string } {
  if (v >= 85) return { text: '多すぎる', color: 'text-orange-600' };
  if (v >= 70) return { text: 'やや多い', color: 'text-amber-600' };
  if (v >= 40) return { text: 'ちょうどよい', color: 'text-green-600' };
  if (v >= 25) return { text: 'やや不足', color: 'text-amber-600' };
  return { text: 'かなり不足', color: 'text-red-600' };
}

function toPestLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: '深刻', color: 'text-red-600' };
  if (v >= 60) return { text: '被害あり', color: 'text-red-500' };
  if (v >= 40) return { text: '害虫発生', color: 'text-orange-600' };
  if (v >= 20) return { text: '少し気になる', color: 'text-amber-600' };
  return { text: '問題なし', color: 'text-green-600' };
}

function toDiseaseLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: '深刻', color: 'text-red-600' };
  if (v >= 60) return { text: '広がっている', color: 'text-red-500' };
  if (v >= 40) return { text: '病気発生', color: 'text-orange-600' };
  if (v >= 20) return { text: '気配あり', color: 'text-amber-600' };
  return { text: '問題なし', color: 'text-green-600' };
}

function toWeedLabel(v: number): { text: string; color: string } {
  if (v >= 60) return { text: '多い', color: 'text-orange-600' };
  if (v >= 30) return { text: '少しある', color: 'text-amber-600' };
  return { text: 'きれい', color: 'text-green-600' };
}

function toRotLabel(v: number): { text: string; color: string } {
  if (v >= 80) return { text: '危険', color: 'text-red-600' };
  if (v >= 60) return { text: '腐敗の恐れ', color: 'text-red-500' };
  if (v >= 40) return { text: '注意', color: 'text-orange-600' };
  if (v >= 20) return { text: 'やや注意', color: 'text-amber-600' };
  return { text: '安定', color: 'text-green-600' };
}

interface ParamRowProps {
  icon: string;
  label: string;
  text: string;
  color: string;
  value: number;
  barColor?: string;
}

function getBarColor(value: number, isNegative = false): string {
  if (isNegative) {
    if (value >= 60) return 'bg-red-400';
    if (value >= 30) return 'bg-amber-400';
    return 'bg-emerald-400';
  }
  if (value >= 70) return 'bg-emerald-500';
  if (value >= 40) return 'bg-green-400';
  if (value >= 20) return 'bg-amber-400';
  return 'bg-red-400';
}

function ParamRow({ icon, label, text, color, value, barColor }: ParamRowProps) {
  const bar = barColor ?? getBarColor(value);

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100/80 last:border-0">
      <span className="text-sm w-5 text-center opacity-70">{icon}</span>
      <span className="text-[11px] text-farm-text-secondary w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-[11px] font-medium w-24 text-right ${color}`}>{text}</span>
    </div>
  );
}

export function ParameterDisplay({ cropState: s }: Props) {
  const { state } = useGame();
  const stage = s.cultivationStage;
  const isSugarMeasuredToday = s.sugarContentMeasuredDate != null
    && state.currentGameDate != null
    && s.sugarContentMeasuredDate === state.currentGameDate;

  return (
    <div className="bg-white rounded-2xl border border-farm-border px-4 py-3 shadow-sm">
      <h3 className="text-[11px] font-bold text-farm-text-secondary mb-2 tracking-wide">作物の状態</h3>

      <div className="space-y-0">
        <ParamRow icon="💚" label="株の元気" value={s.health} {...toHealthLabel(s.health)} />
        <ParamRow icon="💧" label="土の水分" value={s.moisture} {...toMoistureLabel(s.moisture)} />
        <ParamRow icon="🧪" label="栄養状態" value={s.nutrition} {...toNutritionLabel(s.nutrition)} />
        <ParamRow icon="🌿" label="雑草" value={s.weedAmount} {...toWeedLabel(s.weedAmount)} barColor={getBarColor(s.weedAmount, true)} />
        <ParamRow icon="🐛" label="害虫" value={s.pestRisk} {...toPestLabel(s.pestRisk)} barColor={getBarColor(s.pestRisk, true)} />
        <ParamRow icon="🦠" label="病気" value={s.diseaseRisk} {...toDiseaseLabel(s.diseaseRisk)} barColor={getBarColor(s.diseaseRisk, true)} />

        {stage >= 4 && stage <= 5 && (
          <div className="flex items-center gap-2 py-1.5 border-t border-gray-100/80">
            <span className="text-sm w-5 text-center opacity-70">🌸</span>
            <span className="text-[11px] text-farm-text-secondary w-14 shrink-0">花の数</span>
            <span className="text-sm font-semibold text-pink-600">{s.flowerCount}本</span>
          </div>
        )}
        {stage >= 6 && (
          <>
            <div className="flex items-center gap-2 py-1.5 border-t border-gray-100/80">
              <span className="text-sm w-5 text-center opacity-70">🍓</span>
              <span className="text-[11px] text-farm-text-secondary w-14 shrink-0">実の数</span>
              <span className="text-sm font-semibold text-red-500">{s.fruitCount}個</span>
            </div>
            <ParamRow icon="📏" label="実の大きさ" value={s.fruitSize} text={`${s.fruitSize}%`} color="text-farm-accent" barColor="bg-farm-accent/70" />
          </>
        )}
        {stage >= 7 && (
          <>
            <ParamRow icon="🔴" label="色づき" value={s.coloring} text={`${s.coloring}%`} color="text-red-500" barColor="bg-red-400" />
            {isSugarMeasuredToday ? (
              <ParamRow icon="🔬" label="糖度" value={s.sugarContentMeasured!} text={`${s.sugarContentMeasured}%`} color="text-pink-500" barColor="bg-pink-400" />
            ) : (
              <div className="flex items-center gap-2 py-1.5 border-b border-gray-100/80 last:border-0">
                <span className="text-sm w-5 text-center opacity-70">🔬</span>
                <span className="text-[11px] text-farm-text-secondary w-14 shrink-0">糖度</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" />
                <div className="w-24 text-right">
                  <span className="text-[11px] font-medium text-farm-text-secondary">? 未計測</span>
                  {s.sugarContentMeasured != null && s.sugarContentMeasuredDate && (
                    <div className="text-[9px] text-gray-400 leading-tight">
                      前回 {s.sugarContentMeasured}%（{s.sugarContentMeasuredDate}）
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {stage === 8 && (
          <ParamRow
            icon="⏰"
            label="熟しすぎ"
            value={s.overripeRisk}
            text={s.overripeRisk >= 50 ? '⚠ 注意' : `${s.overripeRisk}%`}
            color={s.overripeRisk >= 50 ? 'text-red-600' : 'text-orange-500'}
            barColor={s.overripeRisk >= 50 ? 'bg-red-500' : 'bg-orange-400'}
          />
        )}

        {stage >= 6 && s.rotRisk > 0 && (
          <ParamRow icon="🍂" label="腐りやすさ" value={s.rotRisk} {...toRotLabel(s.rotRisk)} barColor={getBarColor(s.rotRisk, true)} />
        )}
      </div>
    </div>
  );
}
