import { Link } from 'react-router-dom';

interface EventItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  effect: string;
  type: 'good' | 'bad';
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
        id: 'rain',
        icon: '🌧️',
        name: '恵みの雨',
        description: '大地を潤す恵みの雨が降った！',
        effect: '全マスに水やり効果（+1pt）',
        type: 'good',
      },
      {
        id: 'heatwave',
        icon: '☀️',
        name: '猛暑日',
        description: '厳しい暑さで土が乾燥してしまった…',
        effect: '成長中の全作物の成長ポイント-1',
        type: 'bad',
      },
      {
        id: 'storm',
        icon: '⛈️',
        name: '嵐',
        description: '強風と豪雨が作物に打撃を与えた！',
        effect: '全成長中の作物の成長ポイント-2',
        type: 'bad',
      },
      {
        id: 'sunshine',
        icon: '🌈',
        name: '快晴続き',
        description: '晴天が続き光合成が促進された！',
        effect: '全作物の成長ポイント+2',
        type: 'good',
      },
    ],
  },
  {
    id: 'pest',
    icon: '🐛',
    label: '虫害イベント',
    events: [
      {
        id: 'caterpillar',
        icon: '🐛',
        name: 'アオムシ発生',
        description: '葉を食い荒らすアオムシが現れた！',
        effect: 'ランダムな作物1マスの成長ポイント-2',
        type: 'bad',
      },
      {
        id: 'locust',
        icon: '🦗',
        name: 'バッタの大群',
        description: 'バッタの大群が畑を襲来！',
        effect: '全成長中の作物の成長ポイント-1',
        type: 'bad',
      },
      {
        id: 'bee',
        icon: '🐝',
        name: 'ミツバチ来訪',
        description: 'ミツバチが花粉を運んで受粉を助けてくれた！',
        effect: '開花中（ステージ3）の作物の成長ポイント+2',
        type: 'good',
      },
      {
        id: 'slug',
        icon: '🐌',
        name: 'ナメクジの害',
        description: '夜のうちにナメクジが若芽を食べてしまった…',
        effect: '植えたばかりの作物の成長ポイント-1',
        type: 'bad',
      },
    ],
  },
  {
    id: 'bird',
    icon: '🐦',
    label: '鳥害イベント',
    events: [
      {
        id: 'sparrow',
        icon: '🐦',
        name: 'スズメの群れ',
        description: 'スズメが群れをなして種をついばんでしまった！',
        effect: '種まき直後の作物が1段階後退',
        type: 'bad',
      },
      {
        id: 'crow',
        icon: '🦅',
        name: 'カラスの侵入',
        description: '賢いカラスが熟した実を狙ってきた！',
        effect: '収穫可能な作物が1段階後退',
        type: 'bad',
      },
      {
        id: 'swan',
        icon: '🦢',
        name: '白鳥の来訪',
        description: '幸運を運ぶ白鳥が畑に舞い降りた！',
        effect: 'ランダムな成長中の作物+3pt',
        type: 'good',
      },
    ],
  },
  {
    id: 'lucky',
    icon: '🍀',
    label: '幸運イベント',
    events: [
      {
        id: 'blessing',
        icon: '⭐',
        name: '豊穣の加護',
        description: '豊穣の女神が畑に祝福を与えてくれた！',
        effect: '全作物の成長ポイント+3',
        type: 'good',
      },
      {
        id: 'fullmoon',
        icon: '🌟',
        name: '満月の夜',
        description: '満月の月光が作物の成長を促進した！',
        effect: '全作物の成長ポイント+2',
        type: 'good',
      },
      {
        id: 'clover',
        icon: '🍀',
        name: '四つ葉のクローバー',
        description: '畑で四つ葉のクローバーを見つけた！',
        effect: '次の収穫の交換個数+5',
        type: 'good',
      },
    ],
  },
];

export function EventMenuPage() {
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
          ⚡ イベント
        </h1>
      </div>

      {/* 説明文 */}
      <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
        <p className="font-semibold mb-0.5">🧪 シミュレーション機能</p>
        <p>様々なイベントを手動で発生させて、作物への影響をシミュレーションできます。</p>
        <p className="mt-1 text-amber-500">※ イベント効果は近日実装予定です</p>
      </div>

      {/* イベントカテゴリ一覧 */}
      <div className="px-4 pb-8 space-y-5 mt-3">
        {EVENT_CATEGORIES.map(category => (
          <div key={category.id}>
            {/* カテゴリヘッダー */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{category.icon}</span>
              <h2 className="font-bold text-farm-text text-sm">{category.label}</h2>
            </div>

            {/* イベントカード一覧 */}
            <div className="space-y-2">
              {category.events.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* 左の色帯 */}
                    <div
                      className={`w-1.5 flex-shrink-0 ${
                        event.type === 'good' ? 'bg-farm-green' : 'bg-red-400'
                      }`}
                    />

                    {/* コンテンツ */}
                    <div className="flex items-center gap-3 px-3 py-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{event.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-farm-text text-sm">{event.name}</p>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                              event.type === 'good'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {event.type === 'good' ? '✨ 良' : '⚠️ 悪'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">
                          効果: {event.effect}
                        </p>
                      </div>

                      {/* 発動ボタン */}
                      <button
                        disabled
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold
                          bg-gray-200 text-gray-400 cursor-not-allowed"
                        title="近日実装予定"
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
