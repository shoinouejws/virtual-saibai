import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface ShopItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  price: string;
  action: () => void;
}

export function ShopPage() {
  const { state, buyFertilizer, expandFarm } = useGame();

  const items: ShopItem[] = [
    {
      id: 'fert-5',
      icon: '🧪',
      name: '肥料 ×5',
      description: '肥料を5個追加します',
      price: '¥120',
      action: () => buyFertilizer(5),
    },
    {
      id: 'fert-15',
      icon: '🧪',
      name: '肥料 ×15',
      description: '肥料を15個追加します（お得！）',
      price: '¥300',
      action: () => buyFertilizer(15),
    },
    {
      id: 'expand',
      icon: '🌾',
      name: '畑拡張（+2マス）',
      description: '畑のマス数を2つ増やします',
      price: '¥500',
      action: expandFarm,
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-farm-green-dark font-medium
            hover:text-farm-green transition-colors"
        >
          ← 畑に戻る
        </Link>
        <h2 className="text-xl font-bold text-farm-text">🛒 ショップ</h2>
        <div className="w-20" /> {/* spacer */}
      </div>

      {/* 現在のステータス */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl">🧪</div>
            <div className="text-xs text-gray-500 mt-1">肥料在庫</div>
            <div className="font-bold text-farm-text">{state.fertilizer}個</div>
          </div>
          <div>
            <div className="text-2xl">🌾</div>
            <div className="text-xs text-gray-500 mt-1">畑のサイズ</div>
            <div className="font-bold text-farm-text">{state.farmSize}マス</div>
          </div>
          <div>
            <div className="text-2xl">📦</div>
            <div className="text-xs text-gray-500 mt-1">累計収穫</div>
            <div className="font-bold text-farm-text">{state.harvestLog.length}回</div>
          </div>
        </div>
      </div>

      {/* アイテム一覧 */}
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100
              flex items-center gap-4"
          >
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-farm-text">{item.name}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
            <button
              onClick={item.action}
              className="px-4 py-2 rounded-lg bg-farm-orange text-white font-bold text-sm
                hover:brightness-110 active:scale-95 transition-all duration-200
                whitespace-nowrap shadow-sm"
            >
              {item.price}
            </button>
          </div>
        ))}
      </div>

      {/* 注意書き */}
      <p className="text-center text-xs text-gray-400 mt-8">
        ※ プロトタイプのため、実際の決済は発生しません
      </p>
    </div>
  );
}
