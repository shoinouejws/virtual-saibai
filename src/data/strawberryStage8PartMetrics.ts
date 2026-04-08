import type { CSSProperties } from 'react';
import type { StrawberryStage8PartDefinition } from './strawberryStage8PartLayout';

/**
 * 計測矩形が正方形でない場合（flex 内の % 高さなどで縦が潰れる等）でも、
 * xRel/yRel/widthRel は **辺長 u = min(w,h) の内接正方形** 上の 0〜1 として解釈する。
 */
export function strawberryStage8LayoutSquare(
  contentW: number,
  contentH: number,
): { u: number; ox: number; oy: number } {
  if (contentW <= 0 || contentH <= 0) return { u: 0, ox: 0, oy: 0 };
  const u = Math.min(contentW, contentH);
  return {
    u,
    ox: (contentW - u) / 2,
    oy: (contentH - u) / 2,
  };
}

/** ポインタ座標を内接正方形の相対座標へ（調整ページのドラッグと表示で同一式） */
export function strawberryStage8PointerToRel(
  clientX: number,
  clientY: number,
  rect: DOMRectReadOnly,
): { xRel: number; yRel: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const { u, ox, oy } = strawberryStage8LayoutSquare(rect.width, rect.height);
  if (u <= 0) return null;
  const xRel = (clientX - rect.left - ox) / u;
  const yRel = (clientY - rect.top - oy) / u;
  return {
    xRel: Math.max(0, Math.min(1, xRel)),
    yRel: Math.max(0, Math.min(1, yRel)),
  };
}

/**
 * レイアウトコンテナ（88% 内側・正方形想定）の実寸からパーツの absolute スタイルを求める。
 * 未計測（0）のときは % フォールバック。
 */
export function strawberryStage8PartPositionStyle(
  p: Pick<StrawberryStage8PartDefinition, 'xRel' | 'yRel' | 'widthRel' | 'zIndex'>,
  contentW: number,
  contentH: number,
): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: 'translate(-50%, -50%)',
    zIndex: p.zIndex,
    pointerEvents: 'none',
  };

  const { u, ox, oy } = strawberryStage8LayoutSquare(contentW, contentH);
  if (u > 0) {
    return {
      ...base,
      left: ox + p.xRel * u,
      top: oy + p.yRel * u,
      width: p.widthRel * u,
    };
  }

  return {
    ...base,
    left: `${p.xRel * 100}%`,
    top: `${p.yRel * 100}%`,
    width: `${p.widthRel * 100}%`,
  };
}
