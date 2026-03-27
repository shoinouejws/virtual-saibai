import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { EventId } from '../utils/strawberryEngine';

interface EventItem {
  eventId: EventId;
  icon: string;
  name: string;
  description: string;
  effect: string;
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
      {
        eventId: 'rain',
        icon: '🌧️', name: '雨', type: 'good',
        description: '雨が降った。土が湿る。',
        effect: '水分 +10',
      },
      {
        eventId: 'longRain',
        icon: '🌧️', name: '長雨', type: 'bad',
        description: '雨が続いて土が湿りすぎ気味。',
        effect: '水分 +20、病気リスク +5〜10',
      },
      {
        eventId: 'highTemp',
        icon: '☀️', name: '高温', type: 'bad',
        description: '暑さで株に負担がかかる。',
        effect: 'ストレス +8〜10、水分 -5〜10',
      },
      {
        eventId: 'lowTemp',
        icon: '❄️', name: '低温', type: 'bad',
        description: '寒さで成長が鈍る。',
        effect: 'ストレス +8〜10',
      },
      {
        eventId: 'sunnyContinue',
        icon: '☀️', name: '晴天続き', type: 'neutral',
        description: '土が乾きやすい。',
        effect: '水分 -8',
      },
      {
        eventId: 'lowLight',
        icon: '🌫️', name: '日照不足', type: 'bad',
        description: '光合成が弱まる。',
        effect: '進行度 -5〜8',
      },
      {
        eventId: 'strongWind',
        icon: '💨', name: '強風', type: 'bad',
        description: '風で株が揺れる。',
        effect: 'ストレス +2',
      },
      {
        eventId: 'dryWeather',
        icon: '🏜️', name: '乾燥', type: 'bad',
        description: '土が乾燥している。',
        effect: '水分 -10',
      },
    ],
  },
  {
    id: 'pest',
    icon: '🐛',
    label: '害虫・病気イベント',
    events: [
      {
        eventId: 'pest',
        icon: '🐛', name: '害虫発生', type: 'bad',
        description: '害虫が発生した。',
        effect: '害虫リスク +8〜12',
      },
      {
        eventId: 'disease',
        icon: '🦠', name: '病気発生', type: 'bad',
        description: '病気の症状が現れた。',
        effect: '病気リスク +10〜12',
      },
    ],
  },
  {
    id: 'bird',
    icon: '🐦',
    label: '鳥害イベント',
    events: [
      {
        eventId: 'birdDamage',
        icon: '🐦', name: '鳥害・虫害', type: 'bad',
        description: '実が傷つけられた。成熟期以降に発生。',
        effect: '品質被害蓄積 +5〜8',
      },
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
        <p>様々な天候・害虫イベントを手動で発生させ、いちご栽培への影響をシミュレーションできます。</p>
        {!hasAdvancedCells && (
          <p className="mt-1.5 text-amber-600 font-medium">⚠️ いちご栽培中のマスがありません。いちごを植えてからお試しください。</p>
        )}
      </div>

      {/* イベントカテゴリ一覧 */}
      <div className="px-4 pb-8 space-y-5 mt-3">
        {EVENT_CATEGORIES.map(category => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{category.icon}</span>
              <h2 className="font-bold text-farm-text text-sm">{category.label}</h2>
            </div>

            <div className="space-y-2">
              {category.events.map(event => (
                <div
                  key={event.eventId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    <div className={`w-1.5 flex-shrink-0 ${
                      event.type === 'good' ? 'bg-farm-green'
                      : event.type === 'bad' ? 'bg-red-400'
                      : 'bg-yellow-400'
                    }`} />
                    <div className="flex items-center gap-3 px-3 py-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{event.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-farm-text text-sm">{event.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            event.type === 'good'
                              ? 'bg-green-100 text-green-700'
                              : event.type === 'bad'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {event.type === 'good' ? '✨ 良' : event.type === 'bad' ? '⚠️ 悪' : '→ 中'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">効果: {event.effect}</p>
                      </div>

                      <button
                        onClick={() => handleEvent(event.eventId)}
                        disabled={!hasAdvancedCells}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                          ${hasAdvancedCells
                            ? 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        発動
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
