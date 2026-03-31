import { AdvancedCropState } from '../types';

const STAGE_ICONS = ['🌱', '🏠', '🍃', '💮', '🌸', '🫐', '🍓', '✂️'] as const;

const STAGE_FRIENDLY_NAMES = [
  '畑の準備',
  '苗の植えつけ',
  '葉っぱの成長',
  'つぼみ準備',
  '花が咲く',
  '実がなる',
  '実が色づく',
  '収穫どき',
] as const;

interface Props {
  cropState: AdvancedCropState;
}

export function StageRoadmap({ cropState }: Props) {
  const current = cropState.cultivationStage;
  const progress = Math.round(cropState.stageProgress);
  const isLastStage = current >= 8;

  const currentIcon = STAGE_ICONS[current - 1];
  const currentName = STAGE_FRIENDLY_NAMES[current - 1];
  const nextName = isLastStage ? null : STAGE_FRIENDLY_NAMES[current];

  return (
    <div className="bg-white/80 rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-farm-text">栽培ステージ</span>
        <span className="text-[10px] text-gray-400 ml-auto">{current} / 8</span>
      </div>

      <div className="flex items-center gap-3">
        {/* 現在ステージ */}
        <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
          <div className="
            flex items-center justify-center
            w-14 h-14 rounded-2xl
            bg-farm-green/15 border-2 border-farm-green/40
            shadow-sm
          ">
            <span className="text-3xl leading-none">{currentIcon}</span>
          </div>
          <span className="text-xs font-bold text-farm-green-dark text-center leading-tight truncate w-full">
            {currentName}
          </span>
        </div>

        {/* 矢印 + 進行度 */}
        <div className="flex flex-col items-center gap-1 flex-[2] min-w-0">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-farm-green rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 font-medium">
            {isLastStage ? '収穫できます！' : `あと ${100 - progress}%`}
          </span>
        </div>

        {/* 次のステージ（または収穫完了表示） */}
        {isLastStage ? (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
            <div className="
              flex items-center justify-center
              w-14 h-14 rounded-2xl
              bg-yellow-50 border-2 border-yellow-300/60
            ">
              <span className="text-3xl leading-none">🎉</span>
            </div>
            <span className="text-xs font-bold text-yellow-600 text-center leading-tight">
              収穫！
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
            <div className="
              flex items-center justify-center
              w-14 h-14 rounded-2xl
              bg-gray-100 border-2 border-dashed border-gray-300
            ">
              <span className="text-2xl leading-none text-gray-400">？</span>
            </div>
            <span className="text-xs font-medium text-gray-400 text-center leading-tight truncate w-full">
              {nextName}
            </span>
          </div>
        )}
      </div>

      {/* 経過日数 */}
      <div className="mt-2 pt-2 border-t border-gray-100 text-center">
        <span className="text-[11px] text-gray-500">
          このステージ <span className="font-semibold text-farm-green-dark">{cropState.daysInStage}日目</span>
        </span>
      </div>
    </div>
  );
}
