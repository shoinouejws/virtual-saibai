import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { CROP_DEFINITIONS } from '../data/crops';
import {
  CROP_MOTION_OPTIONS,
  CROP_MOTION_STORAGE_KEY,
  parseCropMotionPreviewId,
  type CropMotionPreviewId,
} from '../constants/cropMotionPreview';
import { CropDisplay } from '../components/CropDisplay';
import { StrawberryStage8ReferenceSlot } from '../components/StrawberryStage8LayoutFrame';
import { StageRoadmap } from '../components/StageRoadmap';
import { ParameterDisplay } from '../components/ParameterDisplay';
import { DailyAdvice } from '../components/DailyAdvice';
import { ActionButtons } from '../components/ActionButtons';
import { StageTransitionModal } from '../components/StageTransitionModal';
import { HarvestResultModal } from '../components/HarvestResultModal';
import { WeatherOverlay } from '../components/WeatherOverlay';
import { getCellDisplayStage, FarmCellState } from '../types';
import { getSoilImage } from '../utils/soilImage';
import {
  parseStrawberryBreezeVariantId,
  STRAWBERRY_BREEZE_VARIANT_OPTIONS,
  STRAWBERRY_BREEZE_VARIANT_STORAGE_KEY,
  type StrawberryBreezeVariantId,
} from '../data/strawberryStage8Breeze';

const BASE = import.meta.env.BASE_URL;

const STATUS_LABELS: Record<string, string> = {
  empty: '空き地',
  tilled: '耕し済み',
  planted: '種まき済み',
  growing: '成長中',
  harvestable: '収穫可能',
};

function shouldShowCropImage(cell: FarmCellState, displayStage: number): boolean {
  if (!cell.crop || displayStage <= 0) return false;
  if (cell.cropState?.modelType === 'advanced') {
    const cs = cell.cropState;
    if (cs.cultivationStage === 1) return false;
    if (cs.cultivationStage === 2 && !cs.isPlanted) return false;
  }
  return true;
}

function readStoredCropMotion(): CropMotionPreviewId {
  if (typeof window === 'undefined') return 'wave';
  return parseCropMotionPreviewId(sessionStorage.getItem(CROP_MOTION_STORAGE_KEY)) ?? 'wave';
}

function readStoredStrawberryBreezeVariant(): StrawberryBreezeVariantId {
  if (typeof window === 'undefined') return '15fps';
  return parseStrawberryBreezeVariantId(sessionStorage.getItem(STRAWBERRY_BREEZE_VARIANT_STORAGE_KEY)) ?? '15fps';
}

/** 作物レイヤーに CSS の揺れパターンを適用（試験用）
 *  注意: `motion-safe:animate-*` はソースに**そのままの文字列**で書くこと。
 *  Tailwind は動的に連結したクラス名を検出できず、CSS が生成されない。 */
function AnimatedCropLayer({ mode, children }: { mode: CropMotionPreviewId; children: ReactNode }) {
  switch (mode) {
    case 'wave':
      return (
        <div className="h-full w-full flex items-center justify-center origin-bottom motion-safe:animate-crop-wave-standard">
          {children}
        </div>
      );
    case 'waveBrisk':
      return (
        <div className="h-full w-full flex items-center justify-center origin-bottom motion-safe:animate-crop-wave-brisk">
          {children}
        </div>
      );
    case 'waveSurge':
      return (
        <div className="h-full w-full flex items-center justify-center origin-bottom motion-safe:animate-crop-wave-surge">
          {children}
        </div>
      );
    case 'bob':
      return (
        <div className="h-full w-full flex items-center justify-center origin-bottom motion-safe:animate-crop-bob-standard">
          {children}
        </div>
      );
    case 'bobDrift':
      return (
        <div className="h-full w-full flex items-center justify-center origin-bottom motion-safe:animate-crop-bob-drift">
          {children}
        </div>
      );
    case 'bobRise':
      return (
        <div className="h-full w-full flex items-center justify-center origin-bottom motion-safe:animate-crop-bob-rise">
          {children}
        </div>
      );
  }
}

export function CellDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, stageTransition, harvestResult, dismissStageTransition, dismissHarvestResult, clearWeatherEffect } = useGame();

  const cellId = id !== undefined ? Number(id) : -1;
  const cell = state.cells.find(c => c.id === cellId);

  if (!cell) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-farm-text-secondary">マスが見つかりません</p>
        <Link to="/" className="text-farm-green-dark underline text-sm">畑に戻る</Link>
      </div>
    );
  }

  const cropDef = cell.crop ? CROP_DEFINITIONS[cell.crop] : null;
  const displayStage = getCellDisplayStage(cell);
  const cs = cell.cropState;
  const advancedState = cs?.modelType === 'advanced' ? cs : null;
  const isAdvanced = advancedState !== null;

  const headerTitle = cell.crop
    ? `${cropDef?.name} — マス${cellId + 1}`
    : `マス${cellId + 1}`;

  const hasCrop = cell.status !== 'empty' && cell.status !== 'tilled';
  const showCropImage = shouldShowCropImage(cell, displayStage);
  /** Stage-8 strawberry: static by default; breeze（WebP 等）をボタン再生のみ; 外側 CSS 揺れラッパなし */
  const useStrawberryStage8Apng = cell.crop === 'strawberry' && displayStage === 8;

  const [cropMotion, setCropMotion] = useState<CropMotionPreviewId>(readStoredCropMotion);
  const [strawberryBreezeNonce, setStrawberryBreezeNonce] = useState(0);
  const [strawberryBreezeVariant, setStrawberryBreezeVariant] =
    useState<StrawberryBreezeVariantId>(readStoredStrawberryBreezeVariant);
  const [reduceMotionUi, setReduceMotionUi] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotionUi(mq.matches);
    const onChange = () => setReduceMotionUi(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(CROP_MOTION_STORAGE_KEY, cropMotion);
  }, [cropMotion]);

  useEffect(() => {
    sessionStorage.setItem(STRAWBERRY_BREEZE_VARIANT_STORAGE_KEY, strawberryBreezeVariant);
  }, [strawberryBreezeVariant]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-44px)] pb-24">

      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-farm-bg/95 backdrop-blur-sm border-b border-farm-border px-4 py-2.5">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link
            to="/"
            className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
              hover:bg-farm-green-light rounded-lg px-2 py-1 transition-colors"
          >
            ← 畑
          </Link>
          <span className="flex-1 text-center font-bold text-farm-text text-sm truncate">
            {headerTitle}
          </span>
          <span className={`
            text-[11px] font-semibold px-2 py-0.5 rounded-md
            ${cell.status === 'harvestable'
              ? 'bg-farm-gold-light text-farm-gold border border-farm-gold/30'
              : cell.status === 'growing'
                ? 'bg-farm-green-light text-farm-green-dark'
                : 'bg-farm-panel text-farm-text-secondary'
            }
          `}>
            {STATUS_LABELS[cell.status]}
          </span>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">

        {/* ステージロードマップ */}
        {advancedState && (
          <StageRoadmap cropState={advancedState} />
        )}

        {/* デイリーアドバイス */}
        {advancedState && advancedState.dailyAdvice && (
          <DailyAdvice cropState={advancedState} />
        )}

        {hasCrop && showCropImage && useStrawberryStage8Apng && (
          <div className="rounded-xl border border-farm-border/80 bg-white/70 px-3 py-2.5 space-y-2.5">
            <p className="text-[10px] font-semibold text-farm-text-secondary tracking-wide">
              風アニメ（試験）
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="風アニメのフレームレート">
              {STRAWBERRY_BREEZE_VARIANT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStrawberryBreezeVariant(opt.id)}
                  className={`
                    text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors
                    ${strawberryBreezeVariant === opt.id
                      ? 'bg-farm-green-dark text-white border-farm-green-dark shadow-sm'
                      : 'bg-white text-farm-text border-farm-border hover:border-farm-green/45'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStrawberryBreezeNonce(n => n + 1)}
              disabled={reduceMotionUi}
              className={`
                w-full text-xs font-semibold py-2 rounded-lg border transition-colors
                ${reduceMotionUi
                  ? 'bg-farm-panel text-farm-text-secondary border-farm-border cursor-not-allowed'
                  : 'bg-farm-green-dark text-white border-farm-green-dark hover:opacity-95 active:scale-[0.99]'
                }
              `}
            >
              ▶風アニメーション再生
            </button>
            {reduceMotionUi && (
              <p className="text-[10px] text-farm-text-secondary text-center">
                動きを抑える表示設定のため、再生できません
              </p>
            )}
          </div>
        )}

        {hasCrop && showCropImage && !useStrawberryStage8Apng && (
          <div className="rounded-xl border border-dashed border-farm-border/90 bg-white/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-farm-text-secondary mb-2 tracking-wide">
              揺れアニメ（試験・比較）
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="揺れアニメの種類">
              {CROP_MOTION_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCropMotion(opt.id)}
                  className={`
                    text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors
                    ${cropMotion === opt.id
                      ? 'bg-farm-green-dark text-white border-farm-green-dark shadow-sm'
                      : 'bg-white text-farm-text border-farm-border hover:border-farm-green/45'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 作物画像エリア */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-farm-border aspect-square max-h-80 w-full">
          <img
            src={getSoilImage(cell)}
            alt="土"
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.includes('soil-empty')) img.src = `${BASE}assets/crops/soil/soil-empty.png`;
            }}
          />
          {hasCrop && showCropImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              {useStrawberryStage8Apng ? (
                <StrawberryStage8ReferenceSlot className="h-full w-full">
                  <CropDisplay
                    crop={cell.crop!}
                    stage={displayStage}
                    status={cell.status}
                    className="h-full w-full"
                    fillContainer
                    strawberryBreezeTrigger={strawberryBreezeNonce}
                    strawberryBreezeVariant={strawberryBreezeVariant}
                  />
                </StrawberryStage8ReferenceSlot>
              ) : (
                <AnimatedCropLayer mode={cropMotion}>
                  <CropDisplay
                    crop={cell.crop!}
                    stage={displayStage}
                    status={cell.status}
                    className="w-full h-full"
                    fillContainer
                  />
                </AnimatedCropLayer>
              )}
            </div>
          )}

          {cell.status === 'harvestable' && (
            <div className="absolute top-3 right-3 z-[11] bg-farm-gold text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              収穫可能
            </div>
          )}
          <WeatherOverlay effect={state.activeWeatherEffect} onDismiss={clearWeatherEffect} />
        </div>

        {/* 作物の状態 */}
        {advancedState && (
          <ParameterDisplay cropState={advancedState} />
        )}

        {/* アクションエリア */}
        <div className="bg-white rounded-2xl border border-farm-border px-4 py-4 shadow-sm">
          <h3 className="text-[11px] font-semibold text-farm-text-secondary mb-3 tracking-wide">
            アクション
          </h3>
          <ActionButtons cell={cell} />
        </div>

        {/* アイテム在庫 */}
        {isAdvanced && (
          <div className="bg-white rounded-xl border border-farm-border px-4 py-3">
            <h3 className="text-[11px] font-semibold text-farm-text-secondary mb-2 tracking-wide">アイテム在庫</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <InventoryBadge label="肥料" value={`${state.fertilizer}g`} active={state.fertilizer > 0} color="green" />
              <InventoryBadge label="殺虫剤" value={String(state.insecticide)} active={state.insecticide > 0} color="amber" />
              <InventoryBadge label="殺菌剤" value={String(state.fungicide)} active={state.fungicide > 0} color="purple" />
              <InventoryBadge label="防寒シート" value={String(state.temperatureSheet)} active={state.temperatureSheet > 0} color="blue" />
            </div>
            <div className="flex gap-4 mt-2">
              <Link to="/shop" className="text-xs text-farm-accent font-medium hover:underline">
                ショップでアイテムを購入 →
              </Link>
              <Link to="/tools" className="text-xs text-farm-green-dark font-medium hover:underline">
                道具一覧 →
              </Link>
            </div>
          </div>
        )}
      </div>

      {stageTransition && stageTransition.cellId === cellId && (
        <StageTransitionModal
          newStage={stageTransition.newStage}
          onClose={dismissStageTransition}
        />
      )}

      {harvestResult && (
        <HarvestResultModal
          result={harvestResult}
          onClose={() => { dismissHarvestResult(); navigate('/harvest'); }}
        />
      )}
    </div>
  );
}

function InventoryBadge({ label, value, active, color }: { label: string; value: string; active: boolean; color: string }) {
  const colorMap: Record<string, string> = {
    green: active ? 'bg-farm-green-light text-farm-green-dark' : 'bg-gray-100 text-gray-400',
    amber: active ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400',
    purple: active ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-400',
    blue: active ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400',
  };
  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium ${colorMap[color]}`}>
      {label} <span className="font-bold">{value}</span>
    </span>
  );
}
