import { useState } from 'react';
import { AdvancedCropState } from '../types';

const STAGE_ICONS = ['🌱', '🏠', '🍃', '💮', '🌸', '🫐', '🍓', '✂️'] as const;
const STAGE_NAMES = [
  '栽培準備期', '定植・活着期', '葉成長期', '花芽形成期',
  '開花期', '果実肥大期', '成熟期', '収穫可能期',
] as const;

interface Props {
  cropState: AdvancedCropState;
}

export function StageRoadmap({ cropState }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const current = cropState.cultivationStage;

  return (
    <div>
      {/* コンパクトバー */}
      <button
        onClick={() => setShowDetail(v => !v)}
        className="w-full bg-white/80 rounded-2xl px-3 py-2.5 shadow-sm"
        aria-label="ステージ詳細を表示"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-farm-text">栽培ステージ</span>
          <span className="text-xs text-gray-400">{showDetail ? '▲ 閉じる' : '▼ 詳細'}</span>
        </div>
        <div className="flex items-center justify-between gap-0.5">
          {STAGE_ICONS.map((icon, i) => {
            const stage = i + 1;
            const isCurrent = stage === current;
            const isPast = stage < current;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                <span className={`
                  text-base leading-none transition-all
                  ${isCurrent ? 'text-2xl drop-shadow-sm' : isPast ? 'opacity-70' : 'opacity-30'}
                `}>
                  {icon}
                </span>
                {/* 矢印（最後のステージ以外） */}
                {i < 7 && (
                  <span className={`text-[9px] ${isPast ? 'text-farm-green' : 'text-gray-300'}`}>
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {/* 現在ステージ名 */}
        <div className="mt-1.5 text-center">
          <span className="text-xs font-semibold text-farm-green-dark bg-farm-green/10 px-2 py-0.5 rounded-full">
            {STAGE_ICONS[current - 1]} {STAGE_NAMES[current - 1]}
          </span>
        </div>
      </button>

      {/* 詳細パネル */}
      {showDetail && (
        <div className="mt-2 bg-white/80 rounded-2xl px-4 py-3 shadow-sm">
          <h3 className="text-sm font-bold text-farm-text mb-2">全ステージ一覧</h3>
          <div className="space-y-1.5">
            {STAGE_NAMES.map((name, i) => {
              const stage = i + 1;
              const isCurrent = stage === current;
              const isPast = stage < current;
              return (
                <div key={i} className={`
                  flex items-center gap-2 rounded-lg px-2 py-1.5
                  ${isCurrent ? 'bg-farm-green/10 border border-farm-green/20' : ''}
                `}>
                  <span className={`text-base ${isPast ? '' : isCurrent ? '' : 'opacity-30'}`}>
                    {STAGE_ICONS[i]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium ${
                      isCurrent ? 'text-farm-green-dark' : isPast ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      S{stage}: {name}
                    </span>
                  </div>
                  <span className="text-xs">
                    {isPast ? '✅' : isCurrent ? '▶️' : '○'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              進行度: <span className="font-semibold text-farm-green-dark">{Math.round(cropState.stageProgress)}%</span>
              <span className="ml-2">経過日数: <span className="font-semibold">{cropState.daysInStage}日</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
