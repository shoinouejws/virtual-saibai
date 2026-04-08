import { useState, useCallback, useRef, useEffect, useLayoutEffect, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import {
  cloneStrawberryStage8Defaults,
  normalizeStrawberryStage8Part,
  type StrawberryStage8PartDefinition,
} from '../data/strawberryStage8PartLayout';
import {
  strawberryStage8PartPositionStyle,
  strawberryStage8PointerToRel,
} from '../data/strawberryStage8PartMetrics';
import { getStrawberryPartMotion } from '../data/strawberryStage8PartMotion';
import { StrawberryStage8FillContent, StrawberryStage8ReferenceSlot } from '../components/StrawberryStage8LayoutFrame';

const BASE = import.meta.env.BASE_URL;
const DIR = `${BASE}assets/crops/strawberry/strawberry-8/`;

const STORAGE_KEY = 'virtual-saibai-strawberry-stage8-parts-layout';

function loadStoredParts(): StrawberryStage8PartDefinition[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const defaults = cloneStrawberryStage8Defaults();
    if (parsed.length !== defaults.length) return null;
    const normalized: StrawberryStage8PartDefinition[] = [];
    for (const item of parsed) {
      const n = normalizeStrawberryStage8Part(item as Record<string, unknown>);
      if (!n) return null;
      normalized.push(n);
    }
    return normalized;
  } catch {
    return null;
  }
}

function swapZOrder(
  parts: StrawberryStage8PartDefinition[],
  id: string,
  direction: 'forward' | 'back',
): StrawberryStage8PartDefinition[] {
  const sorted = [...parts].sort((a, b) => a.zIndex - b.zIndex);
  const i = sorted.findIndex(p => p.id === id);
  if (i < 0) return parts;
  const j = direction === 'forward' ? i + 1 : i - 1;
  if (j < 0 || j >= sorted.length) return parts;
  const a = sorted[i];
  const b = sorted[j];
  return parts.map(p => {
    if (p.id === a.id) return { ...p, zIndex: b.zIndex };
    if (p.id === b.id) return { ...p, zIndex: a.zIndex };
    return p;
  });
}

export function StrawberryPartsCalibrationPage() {
  const [parts, setParts] = useState<StrawberryStage8PartDefinition[]>(() =>
    loadStoredParts() ?? cloneStrawberryStage8Defaults(),
  );
  const [calibrationMode, setCalibrationMode] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(parts[0]?.id ?? null);
  const [showSelectionRing, setShowSelectionRing] = useState(true);
  const fillRef = useRef<HTMLDivElement>(null);
  const [layoutSize, setLayoutSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = fillRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setLayoutSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    } catch {
      /* ignore */
    }
  }, [parts]);

  const selected = selectedId !== null ? parts.find(p => p.id === selectedId) ?? null : null;

  const handleDrag = useCallback((id: string, xRel: number, yRel: number) => {
    const xr = Math.round(xRel * 10000) / 10000;
    const yr = Math.round(yRel * 10000) / 10000;
    setParts(prev => prev.map(p => (p.id === id ? { ...p, xRel: xr, yRel: yr } : p)));
  }, []);

  const handleWidthDelta = useCallback((id: string, deltaRel: number) => {
    setParts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              widthRel:
                Math.round(Math.max(0.15, Math.min(1.6, p.widthRel + deltaRel)) * 10000) / 10000,
            }
          : p,
      ),
    );
  }, []);

  const handleToggleVisible = useCallback((id: string) => {
    setParts(prev => prev.map(p => (p.id === id ? { ...p, visible: !p.visible } : p)));
  }, []);

  const handleZ = useCallback((id: string, dir: 'forward' | 'back') => {
    setParts(prev => swapZOrder(prev, id, dir));
  }, []);

  const handleReset = () => {
    const next = cloneStrawberryStage8Defaults();
    setParts(next);
    setSelectedId(next[0]?.id ?? null);
  };

  const copyLayoutSnippet = () => {
    const sorted = [...parts].sort((a, b) => a.zIndex - b.zIndex);
    const lines = sorted.map(
      p =>
        `  { id: '${p.id}', label: '${p.label}', file: '${p.file}', xRel: ${Number(p.xRel.toFixed(4))}, yRel: ${Number(p.yRel.toFixed(4))}, widthRel: ${Number(p.widthRel.toFixed(4))}, zIndex: ${p.zIndex}, visible: ${p.visible} },`,
    );
    const text = `// strawberryStage8PartLayout.ts へ貼り替え用（zIndex 昇順）\nexport const STRAWBERRY_STAGE8_PART_DEFAULTS: StrawberryStage8PartDefinition[] = [\n${lines.join('\n')}\n];\n`;
    void navigator.clipboard.writeText(text);
  };

  const sortedForRender = [...parts].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-44px)] pb-24">
      <div className="sticky top-0 z-20 bg-farm-bg/95 backdrop-blur-sm border-b border-farm-border px-4 py-2.5">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link
            to="/"
            className="flex items-center gap-1 text-farm-green-dark font-medium text-sm
              hover:bg-farm-green-light rounded-lg px-2 py-1 transition-colors"
          >
            ← 畑
          </Link>
          <div className="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center pointer-events-none">
            <span className="font-bold text-farm-text text-sm pointer-events-auto">🍓 いちごパーツ座標</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        <button
          type="button"
          onClick={() => {
            setCalibrationMode(v => {
              if (!v) setSelectedId(parts[0]?.id ?? null);
              else setSelectedId(null);
              return !v;
            });
          }}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
            calibrationMode
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          {calibrationMode
            ? '🔧 座標調整モード ON — 一覧で選択し、画像をドラッグ'
            : '🔧 座標調整モード（プレビューのみ）'}
        </button>

        {calibrationMode && (
          <div className="bg-white rounded-xl border border-amber-200 px-4 py-3 space-y-3">
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-semibold text-farm-text-secondary tracking-wide">パーツ一覧（タップで選択）</div>
              <label className="flex items-center gap-2 text-[11px] text-farm-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSelectionRing}
                  onChange={e => setShowSelectionRing(e.target.checked)}
                  className="rounded border-farm-border"
                />
                選択パーツの枠線ハイライトを表示
              </label>
            </div>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {[...parts].sort((a, b) => a.zIndex - b.zIndex).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`
                    text-left text-[11px] px-2 py-1.5 rounded-lg border transition-colors
                    ${selectedId === p.id
                      ? 'bg-amber-50 border-amber-400 text-amber-950'
                      : 'bg-gray-50 border-gray-200 text-farm-text-secondary hover:bg-gray-100'
                    }
                    ${!p.visible ? 'opacity-50' : ''}
                  `}
                >
                  <span className="font-semibold text-farm-text">{p.label}</span>
                  <span className="ml-2 font-mono text-[10px]">
                    z{p.zIndex} · {(p.xRel * 100).toFixed(1)}% , {(p.yRel * 100).toFixed(1)}% · w
                    {(p.widthRel * 100).toFixed(1)}%
                  </span>
                </button>
              ))}
            </div>

            {selected ? (
              <div className="border-t border-amber-100 pt-3 space-y-2">
                <div className="text-[10px] font-semibold text-farm-text-secondary">
                  選択中: {selected.label}
                  <span className="text-amber-700 ml-1 font-mono">
                    x:{(selected.xRel * 100).toFixed(1)}% y:{(selected.yRel * 100).toFixed(1)}% w:
                    {(selected.widthRel * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-farm-text-secondary w-12 shrink-0">横幅</span>
                  <button
                    type="button"
                    onClick={() => handleWidthDelta(selected.id, -0.02)}
                    className="w-8 h-8 rounded-lg bg-gray-100 font-bold hover:bg-gray-200"
                  >
                    −
                  </button>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{
                        width: `${((selected.widthRel - 0.15) / (1.6 - 0.15)) * 100}%`,
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWidthDelta(selected.id, 0.02)}
                    className="w-8 h-8 rounded-lg bg-gray-100 font-bold hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleZ(selected.id, 'back')}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-[11px] font-semibold
                      hover:bg-gray-100"
                  >
                    奥へ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZ(selected.id, 'forward')}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-[11px] font-semibold
                      hover:bg-gray-100"
                  >
                    手前へ
                  </button>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-farm-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.visible}
                    onChange={() => handleToggleVisible(selected.id)}
                    className="rounded border-farm-border"
                  />
                  表示する
                </label>
              </div>
            ) : (
              <p className="text-[11px] text-farm-text-secondary text-center border-t border-amber-100 pt-2">
                パーツを一覧から選択してください
              </p>
            )}

            <div className="flex gap-2 border-t border-amber-100 pt-3">
              <button
                type="button"
                onClick={copyLayoutSnippet}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200
                  hover:bg-blue-100"
              >
                📋 レイアウトをコピー
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200
                  hover:bg-gray-100"
              >
                初期化
              </button>
            </div>
            <p className="text-[10px] text-farm-text-secondary leading-relaxed">
              調整内容はこのブラウザの sessionStorage に自動保存されます。確定した値は「コピー」から
              <code className="mx-0.5 text-[9px]">strawberryStage8PartLayout.ts</code>
              へ反映してください。
            </p>
          </div>
        )}

        {/*
          外枠は aspect-square + shrink-0 で列 flex 内でも高さが幅に連動（min-h-0 親とセット）。
          内側は FarmCell と同じ ReferenceSlot → FillContent（ref は幅基準 aspect-square の正方形）。
        */}
        <div
          className={`
            relative aspect-square w-full min-h-0 shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm
            ${calibrationMode ? 'border-2 border-amber-400' : 'border border-farm-border'}
          `}
        >
          {calibrationMode && (
            <div className="pointer-events-none absolute left-3 top-3 z-[200] rounded-lg bg-amber-400/95 px-2.5 py-1.5 text-[11px] font-bold text-amber-950 shadow-sm">
              選択パーツをドラッグで移動
            </div>
          )}

          <div className="absolute inset-0 flex min-h-0 min-w-0 items-center justify-center">
            <StrawberryStage8ReferenceSlot className="h-full w-full min-h-0 min-w-0">
              <div className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center">
                <StrawberryStage8FillContent ref={fillRef}>
                  {sortedForRender.map(p => {
                    if (!p.visible) return null;
                    const src = `${DIR}${p.file}`;
                    const isSel = calibrationMode && selectedId === p.id;
                    return (
                      <DraggableStrawberryPart
                        key={p.id}
                        part={p}
                        src={src}
                        containerRef={fillRef}
                        layoutW={layoutSize.w}
                        layoutH={layoutSize.h}
                        interactive={calibrationMode && isSel}
                        highlight={calibrationMode && isSel && showSelectionRing}
                        onDrag={handleDrag}
                      />
                    );
                  })}
                </StrawberryStage8FillContent>
              </div>
            </StrawberryStage8ReferenceSlot>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DraggableStrawberryPartProps {
  part: StrawberryStage8PartDefinition;
  src: string;
  containerRef: RefObject<HTMLDivElement | null>;
  layoutW: number;
  layoutH: number;
  interactive: boolean;
  highlight: boolean;
  onDrag: (id: string, xRel: number, yRel: number) => void;
}

function DraggableStrawberryPart({
  part,
  src,
  containerRef,
  layoutW,
  layoutH,
  interactive,
  highlight,
  onDrag,
}: DraggableStrawberryPartProps) {
  const dragging = useRef(false);
  const [pointerActive, setPointerActive] = useState(false);
  const motion = getStrawberryPartMotion(part.id);

  const getRel = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    return strawberryStage8PointerToRel(clientX, clientY, el.getBoundingClientRect());
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    setPointerActive(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !dragging.current) return;
    const pos = getRel(e.clientX, e.clientY);
    if (pos) onDrag(part.id, pos.xRel, pos.yRel);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    setPointerActive(false);
  };

  const z = part.zIndex + (interactive ? 50 : 0);
  const pos = strawberryStage8PartPositionStyle(part, layoutW, layoutH);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`
        ${interactive ? 'cursor-grab touch-none active:cursor-grabbing' : ''}
        ${highlight ? 'rounded-sm ring-2 ring-amber-500 ring-offset-2 ring-offset-transparent' : ''}
      `}
      style={{
        ...pos,
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: z,
      }}
    >
      <div
        className={`w-full origin-bottom ${motion.className}`}
        style={{
          animationDelay: motion.delay,
          animationPlayState: interactive && pointerActive ? 'paused' : 'running',
        }}
      >
        <img
          src={src}
          alt=""
          className="w-full h-auto block select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
