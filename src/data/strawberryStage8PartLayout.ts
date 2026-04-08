/**
 * いちご 成長段階8 の分割画像パーツ（`public/assets/crops/strawberry/strawberry-8/`）。
 * 座標調整ページの初期値・リセット値として使用する。
 *
 * **設計**: `xRel` / `yRel` / `widthRel` は **レイアウトコンテナ**に対する 0〜1 の相対値。
 * レイアウトコンテナは `StrawberryStage8FillContent` の内側（見た目 88% の正方形）で、
 * その外側の **1:1 基準スロット**（`StrawberryStage8ReferenceSlot`／FarmCell と同一）は
 * FarmPage の畑マス表示に合わせた正方形とする。
 * 表示時はコンテナの実測幅・高さに掛けて px（または初回は %）で配置する（`strawberryStage8PartMetrics.ts`）。
 */

export interface StrawberryStage8PartDefinition {
  id: string;
  label: string;
  /** `assets/crops/strawberry/strawberry-8/` からのファイル名 */
  file: string;
  /** レイアウトコンテナ幅に対する中心の横位置（0〜1） */
  xRel: number;
  /** レイアウトコンテナ高さに対する中心の縦位置（0〜1） */
  yRel: number;
  /** レイアウトコンテナ幅に対するパーツ幅（0〜1、1 超可）。高さは画像アスペクト比に従う */
  widthRel: number;
  zIndex: number;
  visible: boolean;
}

/** おおまかな重なり順の初期案（調整画面で上書きする） */
// strawberryStage8PartLayout.ts へ貼り替え用（zIndex 昇順）
export const STRAWBERRY_STAGE8_PART_DEFAULTS: StrawberryStage8PartDefinition[] = [
  { id: 'base', label: '株（ベース）', file: 'strawberry-8_base.png', xRel: 0.508, yRel: 0.482, widthRel: 0.5, zIndex: 0, visible: true },
  { id: 'leafL', label: '葉・左', file: 'strawberry-8_leaf-left.png', xRel: 0.2979, yRel: 0.4036, widthRel: 0.5, zIndex: 1, visible: true },
  { id: 'leafC', label: '葉・中央', file: 'strawberry-8_leaf-center.png', xRel: 0.4984, yRel: 0.3463, widthRel: 0.58, zIndex: 2, visible: true },
  { id: 'leafR', label: '葉・右', file: 'strawberry-8_leaf-right.png', xRel: 0.6846, yRel: 0.41, widthRel: 0.54, zIndex: 3, visible: true },
  { id: 'fruitL', label: '実・左', file: 'strawberry-8_fruit-left.png', xRel: 0.3297, yRel: 0.6487, widthRel: 0.46, zIndex: 6, visible: true },
  { id: 'fruitR', label: '実・右', file: 'strawberry-8_fruit-right.png', xRel: 0.6416, yRel: 0.6726, widthRel: 0.46, zIndex: 7, visible: true },
];


export function cloneStrawberryStage8Defaults(): StrawberryStage8PartDefinition[] {
  return STRAWBERRY_STAGE8_PART_DEFAULTS.map(p => ({ ...p }));
}

/**
 * 害虫リスクがこの値以上のとき、段階8の葉3枚を `worm-eaten/` の食害テクスチャに差し替える。
 * `strawberry_progress_design.md` の害虫状態「40〜59: 害虫発生」および `ParameterDisplay` の「害虫発生」帯と整合。
 */
export const STRAWBERRY_STAGE8_LEAF_WORM_EATEN_PEST_THRESHOLD = 40;

const LEAF_PART_WORM_EATEN_REL_PATH: Partial<Record<string, string>> = {
  leafL: 'worm-eaten/strawberry-8_leaf-left_worm-eaten.png',
  leafC: 'worm-eaten/strawberry-8_leaf-center_worm-eaten.png',
  leafR: 'worm-eaten/strawberry-8_leaf-right_worm-eaten.png',
};

/**
 * `public/assets/crops/strawberry/strawberry-8/` からの相対パス（通常画像 or `worm-eaten/` 下）。
 */
export function resolveStrawberryStage8PartAssetRelPath(
  part: StrawberryStage8PartDefinition,
  pestRisk: number | undefined,
): string {
  if (
    pestRisk === undefined ||
    pestRisk < STRAWBERRY_STAGE8_LEAF_WORM_EATEN_PEST_THRESHOLD
  ) {
    return part.file;
  }
  return LEAF_PART_WORM_EATEN_REL_PATH[part.id] ?? part.file;
}

/** sessionStorage 等の旧形式（x / y / widthPct が %）を相対値へ寄せる */
export function normalizeStrawberryStage8Part(
  raw: Record<string, unknown>,
): StrawberryStage8PartDefinition | null {
  if (typeof raw.id !== 'string' || typeof raw.file !== 'string') return null;
  if (typeof raw.label !== 'string' || typeof raw.zIndex !== 'number' || typeof raw.visible !== 'boolean') {
    return null;
  }
  if (
    typeof raw.xRel === 'number' &&
    typeof raw.yRel === 'number' &&
    typeof raw.widthRel === 'number'
  ) {
    return raw as unknown as StrawberryStage8PartDefinition;
  }
  if (typeof raw.x === 'number' && typeof raw.y === 'number' && typeof raw.widthPct === 'number') {
    return {
      id: raw.id,
      label: raw.label,
      file: raw.file,
      xRel: raw.x / 100,
      yRel: raw.y / 100,
      widthRel: raw.widthPct / 100,
      zIndex: raw.zIndex,
      visible: raw.visible,
    };
  }
  return null;
}
