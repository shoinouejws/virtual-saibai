/**
 * Strawberry stage-8 breeze: 10/12/15fps は Animated WebP、6.7fps は軽量の animated PNG（150ms 間隔）。
 * アニメは `public/assets/crops/strawberry/strawberry-8/animation/`、静止画は親ディレクトリ。
 */

export type StrawberryBreezeVariantId = '10fps' | '12fps' | '15fps' | '6p7ms';

export const STRAWBERRY_BREEZE_VARIANT_STORAGE_KEY = 'virtual-saibai-cell-detail-strawberry-breeze-variant';

export const STRAWBERRY_BREEZE_VARIANT_OPTIONS: { id: StrawberryBreezeVariantId; label: string }[] = [
  { id: '6p7ms', label: '6.7fps' },
  { id: '10fps', label: '10fps' },
  { id: '12fps', label: '12fps' },
  { id: '15fps', label: '15fps' },
];

const BREEZE_IDS = new Set<string>(STRAWBERRY_BREEZE_VARIANT_OPTIONS.map(o => o.id));

export function parseStrawberryBreezeVariantId(raw: string | null): StrawberryBreezeVariantId | null {
  if (!raw || !BREEZE_IDS.has(raw)) return null;
  return raw as StrawberryBreezeVariantId;
}

const BREEZE_ANIM_BASE = 'assets/crops/strawberry/strawberry-8/animation';

const BREEZE_ANIMATED_PATH: Record<StrawberryBreezeVariantId, string> = {
  '6p7ms': `${BREEZE_ANIM_BASE}/strawberry-8_breeze_150ms.png`,
  '10fps': `${BREEZE_ANIM_BASE}/20260423_strawberry-8_breeze_lightened_720p_frames_fps10_method5_q60.webp`,
  '12fps': `${BREEZE_ANIM_BASE}/20260423_strawberry-8_breeze_lightened_720p_frames_fps12_method4_q80.webp`,
  '15fps': `${BREEZE_ANIM_BASE}/20260423_strawberry-8_breeze_lightened_720p_frames_fps15_method4_q80.webp`,
};

export function getStrawberryStage8BreezeAnimatedPath(variant: StrawberryBreezeVariantId): string {
  return BREEZE_ANIMATED_PATH[variant];
}

/** Static PNG when prefers-reduced-motion or fallback */
export const STRAWBERRY_STAGE8_STATIC = 'assets/crops/strawberry/strawberry-8/20260420_strawberry-8.png';

/** Show breeze animation duration before switching back to static (ms), per variant */
const BREEZE_PLAY_MS: Record<StrawberryBreezeVariantId, number> = {
  /** `animation/strawberry-8_breeze_150ms.png` */
  '6p7ms': 3750,
  /** 100ms × 95 フレーム ≈ 9.5s */
  '10fps': 95 * 100,
  '12fps': 83 * 143,
  '15fps': 67 * 143,
};

export function getStrawberryStage8BreezePlayMs(variant: StrawberryBreezeVariantId): number {
  return BREEZE_PLAY_MS[variant];
}
