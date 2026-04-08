import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { EventId } from '../utils/strawberryEngine';

const ANIMATED_EVENTS: Set<EventId> = new Set(['rain', 'longRain', 'highTemp', 'pest', 'birdDamage']);

interface EventItem {
  eventId: EventId;
  name: string;
  type: 'good' | 'bad' | 'neutral';
}

interface EventCategory {
  id: string;
  label: string;
  events: EventItem[];
}

const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'weather',
    label: '天候イベント',
    events: [
      { eventId: 'rain', name: '雨', type: 'good' },
      { eventId: 'longRain', name: '長雨', type: 'bad' },
      { eventId: 'highTemp', name: '高温', type: 'bad' },
      { eventId: 'lowTemp', name: '低温', type: 'bad' },
      { eventId: 'sunnyContinue', name: '晴天続き', type: 'neutral' },
      { eventId: 'lowLight', name: '日照不足', type: 'bad' },
      { eventId: 'strongWind', name: '強風', type: 'bad' },
      { eventId: 'dryWeather', name: '乾燥', type: 'bad' },
    ],
  },
  {
    id: 'pest',
    label: '害虫・病気',
    events: [
      { eventId: 'pest', name: '害虫発生', type: 'bad' },
      { eventId: 'disease', name: '病気発生', type: 'bad' },
    ],
  },
  {
    id: 'bird',
    label: '鳥害',
    events: [
      { eventId: 'birdDamage', name: '鳥害', type: 'bad' },
    ],
  },
];

export function EventMenuPage() {
  const { state, applyGameEvent } = useGame();

  const hasAdvancedCells = state.cells.some(
    c => c.cropState?.modelType === 'advanced'
  );

  const handleEvent = (eventId: EventId) => {
    applyGameEvent('all', eventId);
  };

  const typeBorder = (type: EventItem['type']) =>
    type === 'good'
      ? 'border-green-200 bg-green-50/60'
      : type === 'bad'
        ? 'border-red-100 bg-red-50/40'
        : 'border-amber-200 bg-amber-50/60';

  const typeBadge = (type: EventItem['type']) =>
    type === 'good'
      ? 'bg-green-100 text-green-700'
      : type === 'bad'
        ? 'bg-red-100 text-red-600'
        : 'bg-amber-100 text-amber-700';

  const typeBadgeText = (type: EventItem['type']) =>
    type === 'good' ? '良' : type === 'bad' ? '悪' : '中';

  return (
    <div className="min-h-[calc(100dvh-44px)] bg-farm-bg">
      {/* ページヘッダー */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-farm-border bg-white/60 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
            hover:opacity-75 transition-opacity"
        >
          ← 畑に戻る
        </Link>
        <h1 className="flex-1 text-center font-bold text-farm-text text-sm pr-16">
          イベント（デバッグ）
        </h1>
      </div>

      {/* 説明文 */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-700">
        <p className="font-semibold mb-0.5">デバッグ用イベントメニュー</p>
        <p>天候・害虫イベントを手動で発生させ、栽培への影響をシミュレーションできます。</p>
        {!hasAdvancedCells && (
          <p className="mt-1.5 text-amber-600 font-medium">いちご栽培中のマスがありません。いちごを植えてからお試しください。</p>
        )}
      </div>

      {/* イベントカテゴリ一覧 */}
      <div className="px-4 pb-8 space-y-5 mt-3 max-w-md mx-auto">
        {EVENT_CATEGORIES.map(category => (
          <div key={category.id}>
            <h2 className="font-semibold text-farm-text text-sm mb-2 px-1">{category.label}</h2>

            <div className="grid grid-cols-4 gap-2">
              {category.events.map(event => {
                const hasAnim = ANIMATED_EVENTS.has(event.eventId);
                const enabled = hasAdvancedCells && hasAnim;
                return (
                  <button
                    key={event.eventId}
                    onClick={() => handleEvent(event.eventId)}
                    disabled={!enabled}
                    className={`
                      relative flex flex-col items-center justify-center gap-0.5
                      py-3 rounded-lg border
                      transition-all
                      ${enabled
                        ? `${typeBorder(event.type)} hover:shadow-sm active:scale-[0.97]`
                        : 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className={`text-[11px] font-semibold leading-tight ${enabled ? 'text-farm-text' : 'text-gray-400'}`}>
                      {event.name}
                    </span>
                    <span className={`text-[9px] px-1 rounded font-semibold leading-tight ${
                      enabled ? typeBadge(event.type) : 'bg-gray-200 text-gray-400'
                    }`}>
                      {hasAnim ? typeBadgeText(event.type) : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
