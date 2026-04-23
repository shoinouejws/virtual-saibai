/**
 * いちご段階8の分割パーツごとの揺れ（CSS クラス名・周期は `src/index.css` の `.strawberry-motion-*`）
 * および一発「風」（`.strawberry-wind-gust-*-once` と `getStrawberryPartWindGust`）
 *
 * 調整の目安:
 * - **ループ揺れの位相だけ**変えたい → `getStrawberryPartMotion` の `delay` のみ編集
 * - **ループ揺れの形・速さ** → `index.css` の `@keyframes` と `animation: ... Ns` の秒数
 * - **ループ揺れの振幅を一括スケール** → パーツの内側 div に `--strawberry-loop-sway-scale`（セル詳細「揺れ2倍」で 2。`@keyframes` は `calc(... * var(--strawberry-loop-sway-scale, 1))`）
 * - **風の強さ・横ずれ** → `index.css` の `@keyframes strawberry-wind-gust-*`
 * - **風の伝わり（どのパーツが先に動くか）** → `WIND_SPECS` の `delayMs`
 */

export interface StrawberryPartMotionSpec {
  /** `index.css`（@media prefers-reduced-motion: no-preference 内）の `.strawberry-motion-*` */
  className: 'strawberry-motion-stem' | 'strawberry-motion-leaf' | 'strawberry-motion-fruit';
  /** 同一周期のなかで少しずらすだけ（秒）。大きくするとバラバラに見えやすい */
  delay: string;
}

const DEFAULT_STEM: StrawberryPartMotionSpec = {
  className: 'strawberry-motion-stem',
  delay: '0s',
};

/** 風アニメの長さ（ms）。`index.css` の `.strawberry-wind-gust-*-once` の秒数と一致させる */
export const STRAWBERRY_WIND_GUST_DURATION_MS = 2500;

export type StrawberryWindGustClassName =
  | 'strawberry-wind-gust-stem-once'
  | 'strawberry-wind-gust-leaf-once'
  | 'strawberry-wind-gust-fruit-once';

export interface StrawberryPartWindGustSpec {
  /** `index.css`（prefers-reduced-motion: no-preference 内）の `.strawberry-wind-gust-*-once` */
  className: StrawberryWindGustClassName;
  /**
   * 風が当たるタイミングのずれ（ms）。茎を先に、葉・実はわずかに遅らせて伝播感を出す。
   * ループ揺れの `delay`（秒）とは別。
   */
  delayMs: number;
}

/** 風の再生時間に対する遅延の比率 */
const WIND_SPECS: Record<string, StrawberryPartWindGustSpec> = {
  base: { className: 'strawberry-wind-gust-stem-once', delayMs: 0 },
  leafL: { className: 'strawberry-wind-gust-leaf-once', delayMs: 86 },
  leafC: { className: 'strawberry-wind-gust-leaf-once', delayMs: 180 },
  leafR: { className: 'strawberry-wind-gust-leaf-once', delayMs: 134 },
  fruitL: { className: 'strawberry-wind-gust-fruit-once', delayMs: 276 },
  fruitR: { className: 'strawberry-wind-gust-fruit-once', delayMs: 362 },
};

/** 風が終わって状態を戻すまでの待ち時間（最長 delay + アニメ長） */
export function getStrawberryWindGustTotalMs(): number {
  const maxDelay = Math.max(...Object.values(WIND_SPECS).map(s => s.delayMs));
  return STRAWBERRY_WIND_GUST_DURATION_MS + maxDelay;
}

/** 一発の風: パーツ種別ごとに振幅の異なるキーフレーム + delay で位相をずらす */
export function getStrawberryPartWindGust(partId: string): StrawberryPartWindGustSpec {
  return WIND_SPECS[partId] ?? WIND_SPECS.base;
}

/** 葉は同じアニメで、delay だけずらして一体感を出す */
export function getStrawberryPartMotion(partId: string): StrawberryPartMotionSpec {
  switch (partId) {
    case 'base':
      return DEFAULT_STEM;
    case 'leafL':
      return { className: 'strawberry-motion-leaf', delay: '0s' };
    case 'leafC':
      return { className: 'strawberry-motion-leaf', delay: '0.35s' };
    case 'leafR':
      return { className: 'strawberry-motion-leaf', delay: '0.7s' };
    case 'fruitL':
      return { className: 'strawberry-motion-fruit', delay: '0.12s' };
    case 'fruitR':
      return { className: 'strawberry-motion-fruit', delay: '0.38s' };
    default:
      return DEFAULT_STEM;
  }
}
