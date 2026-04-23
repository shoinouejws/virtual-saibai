import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: string;
  action: () => void;
  badge?: string;
}

interface ShopSection {
  title: string;
  items: ShopItem[];
}

export function ShopPage() {
  const { state, buyFertilizer, buyInsecticide, buyFungicide, buyTemperatureSheet, expandFarm } = useGame();

  const sections: ShopSection[] = [
    {
      title: '肥料',
      items: [
        {
          id: 'fert-250',
          name: '肥料 250g',
          description: '肥料を250g追加（5回分）',
          price: '¥120',
          action: () => buyFertilizer(250),
        },
        {
          id: 'fert-750',
          name: '肥料 750g',
          description: '肥料を750g追加（15回分）',
          price: '¥300',
          action: () => buyFertilizer(750),
          badge: 'お得',
        },
      ],
    },
    {
      title: '栽培資材（プロトタイプ: 無限配布）',
      items: [
        {
          id: 'insecticide-5',
          name: '殺虫剤 ×5',
          description: '害虫対策アクションに使用',
          price: '無料',
          action: () => buyInsecticide(5),
        },
        {
          id: 'fungicide-5',
          name: '殺菌剤 ×5',
          description: '病気対策アクションに使用',
          price: '無料',
          action: () => buyFungicide(5),
        },
        {
          id: 'sheet-5',
          name: '防寒・遮光シート ×5',
          description: '温度調整アクションに使用',
          price: '無料',
          action: () => buyTemperatureSheet(5),
        },
      ],
    },
    {
      title: '畑',
      items: [
        {
          id: 'expand',
          name: '畑拡張（+2マス）',
          description: '畑のマス数を2つ増やします',
          price: '¥500',
          action: expandFarm,
        },
      ],
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
            hover:opacity-75 transition-opacity"
        >
          ← 畑に戻る
        </Link>
        <h2 className="text-base font-bold text-farm-text">ショップ</h2>
        <div className="w-20" />
      </div>

      {/* 現在のアイテム在庫 */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-farm-border">
        <h3 className="text-[11px] font-semibold text-farm-text-secondary mb-3 tracking-wide">現在の在庫</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-farm-green-light rounded-lg p-2">
            <div className="text-[10px] text-farm-text-secondary">肥料</div>
            <div className="font-bold text-sm text-farm-text">{state.fertilizer}g</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2">
            <div className="text-[10px] text-farm-text-secondary">殺虫剤</div>
            <div className="font-bold text-sm text-farm-text">{state.insecticide}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="text-[10px] text-farm-text-secondary">殺菌剤</div>
            <div className="font-bold text-sm text-farm-text">{state.fungicide}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-[10px] text-farm-text-secondary">防寒シート</div>
            <div className="font-bold text-sm text-farm-text">{state.temperatureSheet}</div>
          </div>
        </div>
      </div>

      {/* セクション別アイテム一覧 */}
      <div className="space-y-5">
        {sections.map(section => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-farm-text mb-2 px-1">{section.title}</h3>
            <div className="flex flex-col gap-2">
              {section.items.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 border border-farm-border flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-farm-text text-sm">{item.name}</span>
                      {item.badge && (
                        <span className="bg-farm-accent text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-farm-text-secondary mt-0.5">{item.description}</div>
                  </div>
                  <button
                    onClick={item.action}
                    className="shrink-0 px-3 py-2 rounded-lg bg-farm-brown text-white font-semibold text-xs
                      hover:brightness-110 active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
                  >
                    {item.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/tools"
          className="text-xs text-farm-green-dark font-medium hover:underline"
        >
          道具一覧を見る（繰り返し使える計測器具など） →
        </Link>
      </div>

      <p className="text-center text-xs text-farm-text-secondary mt-4">
        ※ プロトタイプのため、実際の決済は発生しません
      </p>
    </div>
  );
}
