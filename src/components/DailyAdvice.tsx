import { AdvancedCropState } from '../types';

interface Props {
  cropState: AdvancedCropState;
}

export function DailyAdvice({ cropState }: Props) {
  const advice = cropState.dailyAdvice;
  if (!advice) return null;

  const isWarning = advice.startsWith('⚠️') || advice.startsWith('⏰');

  return (
    <div className={`
      rounded-xl px-4 py-3 border
      ${isWarning
        ? 'bg-red-50/60 border-red-200/60'
        : 'bg-amber-50/60 border-amber-200/60'
      }
    `}>
      <h3 className={`text-[11px] font-semibold mb-1 ${isWarning ? 'text-red-600' : 'text-amber-700'}`}>
        今日のアドバイス
      </h3>
      <p className={`text-sm ${isWarning ? 'text-red-700' : 'text-amber-800'}`}>
        {advice}
      </p>
    </div>
  );
}
