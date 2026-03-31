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
      rounded-2xl px-4 py-3 shadow-sm
      ${isWarning
        ? 'bg-red-50 border border-red-200'
        : 'bg-amber-50 border border-amber-200'
      }
    `}>
      <h3 className={`text-xs font-bold mb-1 ${isWarning ? 'text-red-500' : 'text-amber-600'}`}>
        💡 ひとことアドバイス
      </h3>
      <p className={`text-sm font-medium ${isWarning ? 'text-red-700' : 'text-amber-800'}`}>
        {advice}
      </p>
    </div>
  );
}
