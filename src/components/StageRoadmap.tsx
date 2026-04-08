import { AdvancedCropState } from '../types';

const STAGE_NAMES = [
  '栽培準備',
  '定植・活着',
  '葉の成長',
  '花芽形成',
  '開花',
  '果実肥大',
  '成熟',
  '収穫',
] as const;

interface Props {
  cropState: AdvancedCropState;
}

export function StageRoadmap({ cropState }: Props) {
  const current = cropState.cultivationStage;
  const progress = Math.round(cropState.stageProgress);
  const isLastStage = current >= 8;

  const currentName = STAGE_NAMES[current - 1];
  const nextName = isLastStage ? null : STAGE_NAMES[current];

  return (
    <div className="bg-white rounded-2xl border border-farm-border px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-bold text-farm-text tracking-wide">栽培ステージ</span>
        <span className="text-[10px] text-farm-text-secondary ml-auto">{current} / 8</span>
      </div>

      {/* ステージ進行インジケーター */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i + 1 < current
                ? 'bg-farm-green'
                : i + 1 === current
                  ? 'bg-farm-green/50'
                  : 'bg-farm-border'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* 現在ステージ */}
        <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
          <div className="
            flex items-center justify-center
            w-12 h-12 rounded-xl
            bg-farm-green-light border-2 border-farm-green/40
            text-farm-green-dark text-sm font-bold
          ">
            {current}
          </div>
          <span className="text-[11px] font-bold text-farm-green-dark text-center leading-tight truncate w-full">
            {currentName}
          </span>
        </div>

        {/* 矢印 + 進行度 */}
        <div className="flex flex-col items-center gap-1 flex-[2] min-w-0">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-farm-green rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-farm-text-secondary font-medium">
            {isLastStage ? '収穫できます' : `進行度 ${progress}%`}
          </span>
        </div>

        {/* 次のステージ */}
        {isLastStage ? (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
            <div className="
              flex items-center justify-center
              w-12 h-12 rounded-xl
              bg-farm-gold-light border-2 border-farm-gold/30
              text-farm-gold text-sm font-bold
            ">
              ✓
            </div>
            <span className="text-[11px] font-bold text-farm-gold text-center leading-tight">
              収穫
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
            <div className="
              flex items-center justify-center
              w-12 h-12 rounded-xl
              bg-farm-panel border-2 border-dashed border-farm-border
              text-farm-text-secondary text-sm font-bold
            ">
              {current + 1}
            </div>
            <span className="text-[10px] font-medium text-farm-text-secondary text-center leading-tight truncate w-full">
              {nextName}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-farm-border/60 text-center">
        <span className="text-[11px] text-farm-text-secondary">
          このステージ <span className="font-semibold text-farm-text">{cropState.daysInStage}日目</span>
        </span>
      </div>
    </div>
  );
}
