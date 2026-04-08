import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

const BASE = import.meta.env.BASE_URL;

/**
 * カーソル用は **128×128px 以下** の PNG（Chrome 等はそれ以上を無視する）。
 * 元画像 `scissors.png` が大きい場合は `scissors-cursor-128.png` を使う（`script/make_thinning_cursor.py` で再生成可）。
 */
const SCISSORS_CURSOR_PNG = `${BASE}assets/ui/thinning/scissors-cursor-128.png`;
/** 128×128 画像左上からのクリック位置（元 1024×1024 で 12,8 相当にスケール） */
const SCISSORS_CURSOR_HOTSPOT = { x: 0, y: 0 } as const;

function thinningCursorCss(): string {
  return `url("${SCISSORS_CURSOR_PNG}") ${SCISSORS_CURSOR_HOTSPOT.x} ${SCISSORS_CURSOR_HOTSPOT.y}, crosshair`;
}

type FruitType = 'green' | 'half' | 'red';

interface FruitSlot {
  id: number;
  x: number;
  y: number;
  type: FruitType;
  size: number;  // diameter in % of container
  removed: boolean;
}

const DEFAULT_SIZES: Record<FruitType, number> = { green: 6, half: 8, red: 9 };

const INITIAL_FRUITS: FruitSlot[] = [
  { id:  0, x: 12, y: 49, type: 'red',   size: 18, removed: false },
  { id:  1, x: 18, y: 52, type: 'red',   size: 19, removed: false },
  { id:  2, x: 27, y: 54, type: 'red',   size: 17, removed: false },
  { id:  4, x: 32, y: 58, type: 'green', size: 14, removed: false },
  { id:  5, x: 16, y: 59, type: 'green', size: 13, removed: false },
  { id:  6, x: 23, y: 56, type: 'green', size: 17, removed: false },
  { id:  7, x: 38, y: 63, type: 'green', size: 10, removed: false },
  { id:  8, x: 75, y: 58, type: 'half',  size: 16, removed: false },
  { id:  9, x: 80, y: 63, type: 'half',  size: 17, removed: false },
  { id: 10, x: 62, y: 67, type: 'green', size:  7, removed: false },
  { id: 11, x: 65, y: 65, type: 'green', size: 10, removed: false },
  { id: 12, x: 69, y: 63, type: 'green', size:  9, removed: false },
  { id: 13, x: 60, y: 62, type: 'green', size:  8, removed: false },
  { id: 14, x: 66, y: 59, type: 'green', size:  8, removed: false },
  { id: 15, x: 85, y: 61, type: 'green', size: 13, removed: false },
  { id: 16, x: 88, y: 55, type: 'green', size: 11, removed: false },
];

const RECOMMENDED_COUNT = 8;

/** データ上の size に対する外枠の表示倍率（小さくするとマーカー全体がコンパクトに） */
const MARKER_FRAME_SCALE = 0.88;

/** マーカー内で実画像が占める割合（%）。大きいほど実が大きく見える */
const FRUIT_IMAGE_FILL_PCT = 90;
const FRUIT_IMAGE_INSET_PCT = (100 - FRUIT_IMAGE_FILL_PCT) / 2;

/** 内側の薄いリングの inset（%）— 実を大きくした分、やや内側に */
const INNER_RING_INSET_PCT = 6;

/** 摘果モード用: 実の種類ごとの画像（赤・青緑の未熟・白〜ピンクの半熟） */
const FRUIT_IMAGE: Record<FruitType, string> = {
  red:   `${BASE}assets/ui/thinning/fruit-red.png`,
  green: `${BASE}assets/ui/thinning/fruit-green.png`,
  half:  `${BASE}assets/ui/thinning/fruit-half.png`,
};

/** 座標調整モード: 種類の色付きマーカー（画像読み込み前のフォールバックにも使用） */
const FRUIT_COLORS: Record<FruitType, string> = {
  red:   'bg-red-500/80 border-red-300',
  half:  'bg-pink-200/80 border-pink-300',
  green: 'bg-green-500/80 border-green-300',
};

const FRUIT_LABEL: Record<FruitType, string> = {
  red: '赤', half: '白', green: '緑',
};

const TYPE_ORDER: FruitType[] = ['green', 'half', 'red'];

export function ThinningPrototypePage() {
  const [fruits, setFruits] = useState<FruitSlot[]>(INITIAL_FRUITS);
  const [scissorActive, setScissorActive] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [fallingId, setFallingId] = useState<number | null>(null);

  const remaining = fruits.filter(f => !f.removed);
  const removedCount = fruits.filter(f => f.removed).length;
  const selectedFruit = selectedId !== null ? fruits.find(f => f.id === selectedId) ?? null : null;

  const handleCutStart = useCallback((id: number) => {
    if (!scissorActive || calibrationMode || fallingId !== null) return;
    const remaining = fruits.filter(f => !f.removed);
    if (remaining.length <= 1) return;
    setFallingId(id);
  }, [scissorActive, calibrationMode, fallingId, fruits]);

  const handleFallComplete = useCallback((id: number) => {
    setFallingId(null);
    setFruits(prev => prev.map(f =>
      f.id === id ? { ...f, removed: true } : f
    ));
  }, []);

  const handleDrag = useCallback((id: number, x: number, y: number) => {
    setFruits(prev => prev.map(f =>
      f.id === id ? { ...f, x: Math.round(x), y: Math.round(y) } : f
    ));
  }, []);

  const handleResize = useCallback((id: number, delta: number) => {
    setFruits(prev => prev.map(f =>
      f.id === id ? { ...f, size: Math.max(3, Math.min(20, f.size + delta)) } : f
    ));
  }, []);

  const handleChangeType = useCallback((id: number, type: FruitType) => {
    setFruits(prev => prev.map(f =>
      f.id === id ? { ...f, type } : f
    ));
  }, []);

  const handleDelete = useCallback((id: number) => {
    setFruits(prev => prev.filter(f => f.id !== id));
    setSelectedId(null);
  }, []);

  const handleAdd = useCallback((type: FruitType) => {
    const nextId = fruits.length > 0 ? Math.max(...fruits.map(f => f.id)) + 1 : 0;
    const newFruit: FruitSlot = {
      id: nextId, x: 50, y: 50,
      type, size: DEFAULT_SIZES[type], removed: false,
    };
    setFruits(prev => [...prev, newFruit]);
    setSelectedId(nextId);
  }, [fruits]);

  const handleReset = () => {
    setFruits(INITIAL_FRUITS);
    setShowResult(false);
    setScissorActive(true);
    setSelectedId(null);
    setFallingId(null);
  };

  const handleConfirm = () => {
    setScissorActive(false);
    setShowResult(true);
  };

  const copyCoordinates = () => {
    const code = fruits.map(f =>
      `  { id: ${String(f.id).padStart(2)}, x: ${String(f.x).padStart(2)}, y: ${String(f.y).padStart(2)}, type: '${f.type}',${' '.repeat(5 - f.type.length)} size: ${String(f.size).padStart(2)}, removed: false },`
    ).join('\n');
    navigator.clipboard.writeText(code);
  };

  const qualityHint = remaining.length <= RECOMMENDED_COUNT
    ? { text: '実の数が適正です。1粒が大きく甘くなります！', color: 'text-farm-green-dark', bg: 'bg-farm-green-light' }
    : remaining.length <= RECOMMENDED_COUNT + 2
      ? { text: 'もう少し減らすと品質が上がります', color: 'text-amber-700', bg: 'bg-amber-50' }
      : { text: '実が多すぎます。摘果して数を減らしましょう', color: 'text-red-600', bg: 'bg-red-50' };

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
          <div className="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center pointer-events-none">
            <span className="font-bold text-farm-text text-sm pointer-events-auto">
              ✂️ 摘果画面
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4">

        {/* 座標調整モード切り替え */}
        <button
          onClick={() => { setCalibrationMode(v => !v); setSelectedId(null); }}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
            calibrationMode
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          {calibrationMode ? '🔧 座標調整モード ON — ドラッグで実を移動' : '🔧 座標調整モード'}
        </button>

        {/* 調整パネル */}
        {calibrationMode && (
          <div className="bg-white rounded-xl border border-amber-200 px-4 py-3 space-y-3">
            {/* マーカー追加 */}
            <div>
              <div className="text-[10px] font-semibold text-farm-text-secondary mb-1.5">マーカーを追加</div>
              <div className="flex gap-2">
                {TYPE_ORDER.map(t => (
                  <button
                    key={t}
                    onClick={() => handleAdd(t)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors
                      hover:brightness-95 active:scale-[0.97] ${FRUIT_COLORS[t]}`}
                  >
                    + {FRUIT_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* 選択中のマーカー操作 */}
            {selectedFruit ? (
              <div className="border-t border-amber-100 pt-3">
                <div className="text-[10px] font-semibold text-farm-text-secondary mb-1.5">
                  選択中: #{selectedFruit.id}（{FRUIT_LABEL[selectedFruit.type]}）
                  <span className="text-amber-600 ml-1">
                    x:{selectedFruit.x} y:{selectedFruit.y} size:{selectedFruit.size}
                  </span>
                </div>
                {/* サイズ調整 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-farm-text-secondary w-10 shrink-0">サイズ</span>
                  <button
                    onClick={() => handleResize(selectedFruit.id, -1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-farm-text font-bold text-sm
                      hover:bg-gray-200 transition-colors"
                  >−</button>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-amber-400 rounded-full transition-all"
                      style={{ width: `${((selectedFruit.size - 3) / 17) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => handleResize(selectedFruit.id, 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-farm-text font-bold text-sm
                      hover:bg-gray-200 transition-colors"
                  >+</button>
                  <span className="text-[11px] font-mono text-farm-text w-6 text-center">{selectedFruit.size}</span>
                </div>
                {/* 種類変更 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-farm-text-secondary w-10 shrink-0">種類</span>
                  <div className="flex gap-1.5 flex-1">
                    {TYPE_ORDER.map(t => (
                      <button
                        key={t}
                        onClick={() => handleChangeType(selectedFruit.id, t)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold border transition-colors
                          ${selectedFruit.type === t
                            ? `${FRUIT_COLORS[t]} ring-2 ring-amber-400`
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                      >
                        {FRUIT_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 削除 */}
                <button
                  onClick={() => handleDelete(selectedFruit.id)}
                  className="w-full py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600
                    text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  このマーカーを削除
                </button>
              </div>
            ) : (
              <div className="border-t border-amber-100 pt-2 text-[11px] text-farm-text-secondary text-center">
                マーカーをタップして選択
              </div>
            )}

            {/* 座標コピー・リセット */}
            <div className="flex gap-2 border-t border-amber-100 pt-3">
              <button
                onClick={copyCoordinates}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200
                  hover:bg-blue-100 transition-colors"
              >
                📋 座標をコピー
              </button>
              <button
                onClick={handleReset}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200
                  hover:bg-gray-100 transition-colors"
              >
                リセット
              </button>
            </div>

            <div className="text-[10px] text-farm-text-secondary">
              合計 {fruits.length} 個
            </div>
          </div>
        )}

        {/* ガイド（通常モード時） */}
        {!calibrationMode && (
          <div className={`rounded-xl px-4 py-3 ${qualityHint.bg}`}>
            <p className={`text-sm font-medium ${qualityHint.color}`}>
              {qualityHint.text}
            </p>
            <p className="text-xs text-farm-text-secondary mt-1">
              プロ農家は1株あたり6〜8粒に摘果します。小さい実や形の悪い実を取り除きましょう。
            </p>
          </div>
        )}

        {/* 実の数カウンター */}
        {!calibrationMode && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-farm-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-farm-text">{remaining.length}</div>
                <div className="text-[10px] text-farm-text-secondary">残り</div>
              </div>
              <div className="text-farm-text-secondary text-lg">/</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-farm-text-secondary">{INITIAL_FRUITS.length}</div>
                <div className="text-[10px] text-farm-text-secondary">元の数</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{removedCount}</div>
              <div className="text-[10px] text-farm-text-secondary">摘果済み</div>
            </div>
          </div>
        )}

        {/* 摘果エリア */}
        <div
          className={`
            relative rounded-2xl overflow-hidden shadow-md border-2 aspect-square w-full
            transition-colors duration-300 bg-white
            ${calibrationMode ? 'border-amber-400' : scissorActive ? 'border-farm-green-dark' : 'border-farm-border'}
          `}
          style={(!calibrationMode && scissorActive)
            ? { cursor: thinningCursorCss() }
            : undefined
          }
        >
          <PlantBase />

          {fruits.map(fruit => (
            calibrationMode ? (
              <DraggableFruit
                key={fruit.id}
                fruit={fruit}
                selected={fruit.id === selectedId}
                onDrag={handleDrag}
                onSelect={() => setSelectedId(fruit.id === selectedId ? null : fruit.id)}
              />
            ) : (
              <FruitMarker
                key={fruit.id}
                fruit={fruit}
                active={scissorActive && fallingId === null}
                isFalling={fallingId === fruit.id}
                onCutStart={() => handleCutStart(fruit.id)}
                onFallComplete={() => handleFallComplete(fruit.id)}
              />
            )
          ))}

          {!calibrationMode && scissorActive && (
            <div className="absolute top-3 left-3 bg-white/90 text-farm-green-dark text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
              ✂️ 実をタップして摘果
            </div>
          )}

          {calibrationMode && (
            <div className="absolute top-3 left-3 bg-amber-400/90 text-amber-900 text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
              ドラッグで移動 / タップで選択
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {!calibrationMode && showResult && (
          <div className="bg-white rounded-xl border border-farm-border px-4 py-4 animate-fade-in-down">
            <h3 className="text-sm font-bold text-farm-text mb-2">摘果結果</h3>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div className="bg-farm-panel rounded-lg py-2">
                <div className="text-lg font-bold text-farm-text">{removedCount}個</div>
                <div className="text-[10px] text-farm-text-secondary">摘果した数</div>
              </div>
              <div className="bg-farm-panel rounded-lg py-2">
                <div className="text-lg font-bold text-farm-green-dark">{remaining.length}個</div>
                <div className="text-[10px] text-farm-text-secondary">残した実</div>
              </div>
              <div className="bg-farm-panel rounded-lg py-2">
                <div className="text-lg font-bold text-farm-gold">
                  {remaining.length <= RECOMMENDED_COUNT ? '◎' : remaining.length <= RECOMMENDED_COUNT + 2 ? '○' : '△'}
                </div>
                <div className="text-[10px] text-farm-text-secondary">品質見込み</div>
              </div>
            </div>
            <div className="text-xs text-farm-text-secondary">
              {remaining.length <= RECOMMENDED_COUNT
                ? '適切な摘果ができました！残った実に栄養が集中し、大きく甘いいちごが期待できます。'
                : 'もう少し実を減らすと、1粒あたりの品質が上がります。'}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        {!calibrationMode && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl bg-gray-200 border border-farm-border text-farm-text-secondary
                font-medium text-sm hover:bg-farm-panel transition-colors"
            >
              リセット
            </button>
            {scissorActive ? (
              <button
                onClick={handleConfirm}
                disabled={removedCount === 0}
                className={`
                  flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${removedCount > 0
                    ? 'bg-farm-green-dark text-white hover:bg-farm-green active:scale-[0.97] shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                確定する ({removedCount}個摘果)
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-farm-accent text-white
                  font-semibold text-sm hover:brightness-110 active:scale-[0.97] transition-all shadow-sm"
              >
                もう一度試す
              </button>
            )}
          </div>
        )}

        {/* 操作説明 */}
        {!calibrationMode && (
          <div className="bg-farm-panel rounded-xl px-4 py-3">
            <h4 className="text-[11px] font-semibold text-farm-text-secondary mb-2">操作説明</h4>
            <ul className="text-xs text-farm-text-secondary space-y-1">
              <li>・ 実をタップ（クリック）すると摘果できます</li>
              <li>・ 小さい緑の実を優先的に取り除きましょう</li>
              <li>・ 推奨は6〜8粒です（残り1個以下にはできません）</li>
              <li>・ 「確定する」で結果を確認できます</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function PlantBase() {
  return (
    <img
      src={`${BASE}assets/ui/thinning/plant-base.png`}
      alt="いちごの株"
      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
    />
  );
}

// --- 通常モード: タップで摘果するマーカー ---

interface FruitMarkerProps {
  fruit: FruitSlot;
  active: boolean;
  isFalling: boolean;
  onCutStart: () => void;
  onFallComplete: () => void;
}

function FruitMarker({ fruit, active, isFalling, onCutStart, onFallComplete }: FruitMarkerProps) {
  if (fruit.removed) return null;

  const boxStyle = {
    left: `${fruit.x}%`,
    top: `${fruit.y}%`,
    width: `${fruit.size * MARKER_FRAME_SCALE}%`,
    height: `${fruit.size * MARKER_FRAME_SCALE}%`,
    transform: 'translate(-50%, -50%)',
    '--fruit-y': `${fruit.y}%`,
  } as React.CSSProperties;

  const inner = (
    <>
      <span
        className="pointer-events-none absolute rounded-full border border-gray-200/45"
        style={{ inset: `${INNER_RING_INSET_PCT}%` }}
        aria-hidden
      />
      <img
        src={FRUIT_IMAGE[fruit.type]}
        alt=""
        className="absolute z-[1] object-contain pointer-events-none select-none"
        style={{
          left: `${FRUIT_IMAGE_INSET_PCT}%`,
          top: `${FRUIT_IMAGE_INSET_PCT}%`,
          width: `${FRUIT_IMAGE_FILL_PCT}%`,
          height: `${FRUIT_IMAGE_FILL_PCT}%`,
        }}
        draggable={false}
      />
    </>
  );

  if (isFalling) {
    return (
      <div
        role="presentation"
        className="absolute rounded-full overflow-hidden bg-transparent animate-thin-fall
          border-2 border-gray-400/55 shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
        style={boxStyle}
        onAnimationEnd={onFallComplete}
      >
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onCutStart(); }}
      disabled={!active}
      aria-label="摘果する"
      className={`
        absolute rounded-full overflow-hidden bg-transparent p-0
        border-2 border-gray-400/55
        shadow-[0_1px_4px_rgba(0,0,0,0.35)]
        transition-all duration-200
        ${active
          ? 'opacity-95 hover:scale-125 hover:border-gray-300/80 hover:shadow-[0_2px_10px_rgba(0,0,0,0.4)] cursor-pointer active:scale-90'
          : 'opacity-40 pointer-events-none'
        }
      `}
      style={boxStyle}
    >
      {inner}
    </button>
  );
}

// --- 座標調整モード: ドラッグで動かせるマーカー ---

interface DraggableFruitProps {
  fruit: FruitSlot;
  selected: boolean;
  onDrag: (id: number, x: number, y: number) => void;
  onSelect: () => void;
}

function DraggableFruit({ fruit, selected, onDrag, onSelect }: DraggableFruitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);

  const getPercent = (clientX: number, clientY: number) => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return null;
    const rect = parent.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    moved.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    moved.current = true;
    const pos = getPercent(e.clientX, e.clientY);
    if (pos) onDrag(fruit.id, pos.x, pos.y);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    if (!moved.current) onSelect();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`
        absolute rounded-full overflow-hidden bg-transparent cursor-grab active:cursor-grabbing
        flex items-center justify-center select-none touch-none
        border-2 border-gray-400/55
        shadow-[0_1px_4px_rgba(0,0,0,0.35)]
        ${selected ? 'ring-2 ring-gray-400/90 ring-offset-2 ring-offset-white z-10 opacity-100' : 'opacity-85'}
      `}
      style={{
        left: `${fruit.x}%`,
        top: `${fruit.y}%`,
        width: `${fruit.size * MARKER_FRAME_SCALE}%`,
        height: `${fruit.size * MARKER_FRAME_SCALE}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span
        className="pointer-events-none absolute rounded-full border border-gray-200/45"
        style={{ inset: `${INNER_RING_INSET_PCT}%` }}
        aria-hidden
      />
      <img
        src={FRUIT_IMAGE[fruit.type]}
        alt=""
        className="absolute z-[1] object-contain pointer-events-none"
        style={{
          left: `${FRUIT_IMAGE_INSET_PCT}%`,
          top: `${FRUIT_IMAGE_INSET_PCT}%`,
          width: `${FRUIT_IMAGE_FILL_PCT}%`,
          height: `${FRUIT_IMAGE_FILL_PCT}%`,
        }}
        draggable={false}
      />
      <span className="absolute top-0.5 left-0.5 z-[2] text-[7px] font-bold text-gray-800 drop-shadow-[0_0_2px_rgba(255,255,255,0.9)] pointer-events-none">
        {fruit.id}
      </span>
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-gray-600 font-mono whitespace-nowrap pointer-events-none">
        {fruit.x},{fruit.y}
      </span>
    </div>
  );
}
