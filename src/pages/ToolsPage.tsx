import { Link } from 'react-router-dom';

const BASE = import.meta.env.BASE_URL;

interface Tool {
  id: string;
  name: string;
  icon: string;
  image: string;
  description: string;
  usableStages: string;
  owned: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'saccharimeter',
    name: '糖度計',
    icon: '🔬',
    image: `${BASE}assets/tools/saccharimeter.png`,
    description: 'いちごの糖度（Brix）を計測する非破壊式糖度計。果実の表面に当てるだけで糖度を計測できます。',
    usableStages: '成熟期（S7）〜 収穫可能期（S8）',
    owned: true,
  },
];

export function ToolsPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
            hover:opacity-75 transition-opacity"
        >
          ← 畑に戻る
        </Link>
        <h2 className="text-base font-bold text-farm-text">道具一覧</h2>
        <div className="w-20" />
      </div>

      <div className="space-y-4">
        {TOOLS.map(tool => (
          <div
            key={tool.id}
            className="bg-white rounded-2xl border border-farm-border p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="shrink-0 w-20 h-20 rounded-xl bg-farm-panel flex items-center justify-center overflow-hidden border border-farm-border/50">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-full h-full object-contain"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-3xl">${tool.icon}</span>`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{tool.icon}</span>
                  <h3 className="text-sm font-bold text-farm-text">{tool.name}</h3>
                  {tool.owned && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-farm-green-light text-farm-green-dark">
                      所持中
                    </span>
                  )}
                </div>
                <p className="text-xs text-farm-text-secondary leading-relaxed mb-1.5">
                  {tool.description}
                </p>
                <div className="text-[10px] text-farm-text-secondary">
                  <span className="font-semibold">使用可能:</span> {tool.usableStages}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          to="/shop"
          className="text-xs text-farm-accent font-medium hover:underline"
        >
          消耗品はショップで購入 →
        </Link>
      </div>
    </div>
  );
}
