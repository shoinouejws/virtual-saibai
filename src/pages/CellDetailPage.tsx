import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { CROP_DEFINITIONS } from '../data/crops';
import { CropDisplay } from '../components/CropDisplay';
import { StageRoadmap } from '../components/StageRoadmap';
import { ParameterDisplay } from '../components/ParameterDisplay';
import { DailyAdvice } from '../components/DailyAdvice';
import { ActionButtons } from '../components/ActionButtons';
import { StageTransitionModal } from '../components/StageTransitionModal';
import { HarvestResultModal } from '../components/HarvestResultModal';
import { getCellDisplayStage } from '../types';

const BASE = import.meta.env.BASE_URL;

const STATUS_LABELS: Record<string, string> = {
  empty: '空き地',
  tilled: '耕し済み',
  planted: '種まき済み',
  growing: '成長中',
  harvestable: '収穫OK！',
};

function getSoilImage(status: string): string {
  if (status === 'empty') return `${BASE}assets/crops/soil-empty.png`;
  return `${BASE}assets/crops/soil-tilled.png`;
}

export function CellDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, stageTransition, harvestResult, dismissStageTransition, dismissHarvestResult } = useGame();

  const cellId = id !== undefined ? Number(id) : -1;
  const cell = state.cells.find(c => c.id === cellId);

  if (!cell) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">マスが見つかりません</p>
        <Link to="/" className="text-farm-green underline">畑に戻る</Link>
      </div>
    );
  }

  const cropDef = cell.crop ? CROP_DEFINITIONS[cell.crop] : null;
  const displayStage = getCellDisplayStage(cell);
  const isAdvanced = cell.cropState?.modelType === 'advanced';
  const advancedState = isAdvanced ? cell.cropState : null;

  const headerTitle = cell.crop
    ? `${cropDef?.name} （マス${cellId + 1}）`
    : `マス${cellId + 1}`;

  const hasCrop = cell.status !== 'empty' && cell.status !== 'tilled';

  return (
    <div className="flex flex-col min-h-[calc(100dvh-52px)] pb-24">

      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-farm-bg/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link
            to="/"
            className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
              hover:bg-farm-green/10 active:bg-farm-green/20 rounded-lg px-2 py-1 transition-colors"
          >
            ← 畑に戻る
          </Link>
          <span className="flex-1 text-center font-bold text-farm-text truncate">
            {headerTitle}
          </span>
          <span className={`
            text-xs font-semibold px-2.5 py-1 rounded-full
            ${cell.status === 'harvestable'
              ? 'bg-yellow-100 text-yellow-700'
              : cell.status === 'growing'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }
          `}>
            {STATUS_LABELS[cell.status]}
          </span>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">

        {/* ステージロードマップ（アドバンスドモデルのみ） */}
        {advancedState && (
          <StageRoadmap cropState={advancedState} />
        )}

        {/* デイリーアドバイス（アドバンスドモデルのみ） */}
        {advancedState && advancedState.dailyAdvice && (
          <DailyAdvice cropState={advancedState} />
        )}

        {/* 作物画像エリア */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100 to-green-100 shadow-md aspect-square max-h-64 flex items-center justify-center">
          {hasCrop && cell.crop && displayStage > 0 ? (
            <CropDisplay
              crop={cell.crop}
              stage={displayStage}
              status={cell.status}
              className="w-40 h-40"
            />
          ) : (
            <img
              src={getSoilImage(cell.status)}
              alt="土"
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).src = `${BASE}assets/crops/soil-empty.png`; }}
            />
          )}

          {/* ステータスバッジ */}
          {cell.status === 'harvestable' && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full animate-bounce shadow-md">
              🎉 収穫OK！
            </div>
          )}
        </div>

        {/* パラメーター表示（アドバンスドモデルのみ） */}
        {advancedState && (
          <ParameterDisplay cropState={advancedState} />
        )}

        {/* アクションエリア */}
        <div className="bg-white/80 rounded-2xl px-4 py-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
            アクション
          </h3>
          <ActionButtons cell={cell} />
        </div>

        {/* アイテム在庫（アドバンスドモデルのみ） */}
        {isAdvanced && (
          <div className="bg-white/60 rounded-2xl px-4 py-3 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">アイテム在庫</h3>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1 bg-green-50 px-2.5 py-1.5 rounded-lg">
                🧪 肥料 <span className="font-bold">{state.fertilizer}g</span>
              </span>
              <span className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${state.insecticide > 0 ? 'bg-yellow-50' : 'bg-gray-100 opacity-60'}`}>
                🐛 殺虫剤 <span className="font-bold">{state.insecticide}</span>
              </span>
              <span className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${state.fungicide > 0 ? 'bg-purple-50' : 'bg-gray-100 opacity-60'}`}>
                🦠 殺菌剤 <span className="font-bold">{state.fungicide}</span>
              </span>
              <span className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${state.temperatureSheet > 0 ? 'bg-blue-50' : 'bg-gray-100 opacity-60'}`}>
                🛡️ 防寒シート <span className="font-bold">{state.temperatureSheet}</span>
              </span>
            </div>
            <Link to="/shop" className="mt-2 block text-xs text-farm-green-dark underline hover:no-underline">
              ショップでアイテムを購入する →
            </Link>
          </div>
        )}
      </div>

      {/* ステージ遷移モーダル（このセルのものだけ） */}
      {stageTransition && stageTransition.cellId === cellId && (
        <StageTransitionModal
          newStage={stageTransition.newStage}
          onClose={dismissStageTransition}
        />
      )}

      {/* 収穫結果モーダル */}
      {harvestResult && (
        <HarvestResultModal
          result={harvestResult}
          onClose={() => { dismissHarvestResult(); navigate('/harvest'); }}
        />
      )}
    </div>
  );
}
