/** セル詳細ページの作物揺れプレビュー（試験用） — 波系・浮き系の派生 */

export type CropMotionPreviewId =
  | 'wave'
  | 'waveBrisk'
  | 'waveSurge'
  | 'bob'
  | 'bobDrift'
  | 'bobRise';

export const CROP_MOTION_STORAGE_KEY = 'virtual-saibai-cell-detail-crop-motion';

export const CROP_MOTION_OPTIONS: { id: CropMotionPreviewId; label: string }[] = [
  { id: 'wave', label: '波・標準' },
  { id: 'waveBrisk', label: '波・軽快' },
  { id: 'waveSurge', label: '波・強め' },
  { id: 'bob', label: '浮き・標準' },
  { id: 'bobDrift', label: '浮き・ゆるやか' },
  { id: 'bobRise', label: '浮き・強め' },
];

const IDS = new Set<string>(CROP_MOTION_OPTIONS.map(o => o.id));

export function parseCropMotionPreviewId(raw: string | null): CropMotionPreviewId | null {
  if (!raw || !IDS.has(raw)) return null;
  return raw as CropMotionPreviewId;
}
