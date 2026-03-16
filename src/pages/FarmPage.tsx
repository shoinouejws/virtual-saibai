import { Link } from 'react-router-dom';
import { FarmGrid } from '../components/FarmGrid';
import { ActionButtons } from '../components/ActionButtons';

export function FarmPage() {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-52px)]">
      {/* 畑グリッド */}
      <div className="flex-1 flex items-center justify-center px-2 py-3">
        <FarmGrid />
      </div>

      {/* アクションエリア */}
      <div className="sticky bottom-0 bg-farm-bg/90 backdrop-blur-sm border-t border-gray-200 pb-safe">
        <ActionButtons />

        <div className="px-4 pb-4 max-w-lg mx-auto">
          <Link
            to="/shop"
            className="block w-full text-center py-3 rounded-xl
              bg-farm-orange text-white font-bold text-sm
              hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            🛒 ショップへ
          </Link>
        </div>
      </div>
    </div>
  );
}
