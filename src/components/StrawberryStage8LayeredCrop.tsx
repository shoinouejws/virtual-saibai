import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  getStrawberryPartMotion,
  getStrawberryPartWindGust,
  getStrawberryWindGustTotalMs,
} from '../data/strawberryStage8PartMotion';
import { strawberryStage8PartPositionStyle } from '../data/strawberryStage8PartMetrics';
import {
  resolveStrawberryStage8PartAssetRelPath,
  type StrawberryStage8PartDefinition,
} from '../data/strawberryStage8PartLayout';

const DIR = `${import.meta.env.BASE_URL}assets/crops/strawberry/strawberry-8/`;

interface Props {
  parts: StrawberryStage8PartDefinition[];
  /** アドバンスドモデルの害虫リスク。閾値以上で葉パーツを食害画像に差し替え */
  pestRisk?: number;
  /** false のときアニメなし（静止の重ね表示のみ） */
  motionEnabled?: boolean;
  /** 一発の風（パーツ別の振幅・遅延）。ループ揺れの外側ラッパーで再生 */
  windGustActive?: boolean;
  /** 風アニメが一通り終わったとき（最遅パーツの delay + duration 後） */
  onWindGustEnd?: () => void;
  className?: string;
}

/**
 * いちご成長段階8: 調整済みパーツを重ね、パーツごとに揺れを付与する。
 * 座標・幅はレイアウトコンテナの実測サイズから相対値（xRel 等）で算出する。
 */
export function StrawberryStage8LayeredCrop({
  parts,
  pestRisk,
  motionEnabled = true,
  windGustActive = false,
  onWindGustEnd,
  className = '',
}: Props) {
  const sorted = [...parts].filter(p => p.visible).sort((a, b) => a.zIndex - b.zIndex);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [layoutSize, setLayoutSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = layoutRef.current;
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
    if (!windGustActive || !onWindGustEnd) return;
    const ms = getStrawberryWindGustTotalMs();
    const id = window.setTimeout(onWindGustEnd, ms);
    return () => clearTimeout(id);
  }, [windGustActive, onWindGustEnd]);

  return (
    <div ref={layoutRef} className={`relative h-full w-full min-h-0 ${className}`}>
      {sorted.map(p => {
        const rel = resolveStrawberryStage8PartAssetRelPath(p, pestRisk);
        const src = `${DIR}${rel}`;
        const motion = getStrawberryPartMotion(p.id);
        const wind = getStrawberryPartWindGust(p.id);
        const pos = strawberryStage8PartPositionStyle(p, layoutSize.w, layoutSize.h);
        return (
          <div key={p.id} className="pointer-events-none" style={pos}>
            <div
              className={`
                w-full origin-bottom
                ${windGustActive ? wind.className : ''}
              `}
              style={
                windGustActive
                  ? { animationDelay: `${wind.delayMs}ms` }
                  : undefined
              }
            >
              <div
                className={`
                  w-full origin-bottom
                  ${motionEnabled ? motion.className : ''}
                `}
                style={
                  motionEnabled
                    ? { animationDelay: motion.delay }
                    : undefined
                }
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-auto block select-none object-contain
                    drop-shadow-[0_3px_6px_rgba(0,0,0,0.28)]"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
