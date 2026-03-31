import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { EventId } from '../utils/strawberryEngine';

const ANIMATED_EVENTS: Set<EventId> = new Set(['rain', 'longRain', 'highTemp', 'pest', 'birdDamage']);

interface EventItem {
  eventId: EventId;
  icon: string;
  name: string;
  type: 'good' | 'bad' | 'neutral';
}

interface EventCategory {
  id: string;
  icon: string;
  label: string;
  events: EventItem[];
}

const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'weather',
    icon: '☁️',
    label: '天候イベント',
    events: [
      { eventId: 'rain', icon: '🌧️', name: '雨', type: 'good' },
      { eventId: 'longRain', icon: '🌧️', name: '長雨', type: 'bad' },
      { eventId: 'highTemp', icon: '☀️', name: '高温', type: 'bad' },
      { eventId: 'lowTemp', icon: '❄️', name: '低温', type: 'bad' },
      { eventId: 'sunnyContinue', icon: '☀️', name: '晴天続き', type: 'neutral' },
      { eventId: 'lowLight', icon: '🌫️', name: '日照不足', type: 'bad' },
      { eventId: 'strongWind', icon: '💨', name: '強風', type: 'bad' },
      { eventId: 'dryWeather', icon: '🏜️', name: '乾燥', type: 'bad' },
    ],
  },
  {
    id: 'pest',
    icon: '🐛',
    label: '害虫・病気',
    events: [
      { eventId: 'pest', icon: '🐛', name: '害虫発生', type: 'bad' },
      { eventId: 'disease', icon: '🦠', name: '病気発生', type: 'bad' },
    ],
  },
  {
    id: 'bird',
    icon: '🐦',
    label: '鳥害',
    events: [
      { eventId: 'birdDamage', icon: '🐦', name: '鳥害', type: 'bad' },
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
      ? 'border-green-300 bg-green-50'
      : type === 'bad'
        ? 'border-red-200 bg-red-50/60'
        : 'border-yellow-300 bg-yellow-50';

  const typeBadge = (type: EventItem['type']) =>
    type === 'good'
      ? 'bg-green-100 text-green-700'
      : type === 'bad'
        ? 'bg-red-100 text-red-600'
        : 'bg-yellow-100 text-yellow-700';

  const typeBadgeText = (type: EventItem['type']) =>
    type === 'good' ? '良' : type === 'bad' ? '悪' : '中';

  return (
    <div className="min-h-[calc(100dvh-52px)] bg-farm-bg">
      {/* ページヘッダー */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-farm-green-dark font-medium text-sm
            hover:opacity-75 active:scale-95 transition-all"
        >
          ← 畑に戻る
        </Link>
        <h1 className="flex-1 text-center font-bold text-farm-text text-base pr-16">
          ⚡ イベント（デバッグ）
        </h1>
      </div>

      {/* 説明文 */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <p className="font-semibold mb-0.5">🧪 デバッグ用イベントメニュー</p>
        <p>天候・害虫イベントを手動で発生させ、いちご栽培への影響をシミュレーションできます。</p>
        {!hasAdvancedCells && (
          <p className="mt-1.5 text-amber-600 font-medium">⚠️ いちご栽培中のマスがありません。いちごを植えてからお試しください。</p>
        )}
      </div>

      {/* イベントカテゴリ一覧 */}
      <div className="px-4 pb-8 space-y-5 mt-3 max-w-md mx-auto">
        {EVENT_CATEGORIES.map(category => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{category.icon}</span>
              <h2 className="font-bold text-farm-text text-sm">{category.label}</h2>
            </div>

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
                      py-3 rounded-xl border shadow-sm
                      transition-all
                      ${enabled
                        ? `${typeBorder(event.type)} hover:shadow-md active:scale-95`
                        : 'border-gray-200 bg-gray-100 opacity-40 cursor-not-allowed grayscale'
                      }
                    `}
                  >
                    <span className="text-xl leading-none">{event.icon}</span>
                    <span className={`text-[10px] font-bold leading-tight mt-0.5 ${enabled ? 'text-farm-text' : 'text-gray-400'}`}>
                      {event.name}
                    </span>
                    <span className={`absolute top-1 right-1 text-[8px] px-0.5 rounded font-bold leading-tight ${
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
