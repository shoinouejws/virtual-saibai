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
      rounded-2xl px-4 py-3 text-sm font-medium shadow-sm
      ${isWarning
        ? 'bg-red-50 border border-red-200 text-red-700'
        : 'bg-amber-50 border border-amber-200 text-amber-800'
      }
    `}>
      {advice}
    </div>
  );
}
