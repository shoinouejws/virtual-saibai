import { FarmCellState } from '../types';

const BASE = import.meta.env.BASE_URL;

/**
 * セルの状態に応じた土背景画像のパスを返す。
 *
 * 選択ロジック（SPECIFICATION.md 土画像の選択ロジック参照）:
 *   empty                               → soil-empty.png
 *   advanced: hasRidge && hasMulch      → soil-ridged_mulched.png
 *   advanced: hasRidge && !hasMulch     → soil-ridged.png
 *   advanced: !hasRidge && hasMulch     → soil-mulched.png
 *   それ以外                             → soil-tilled.png
 */
export function getSoilImage(cell: FarmCellState): string {
  if (cell.status === 'empty') return `${BASE}assets/crops/soil/soil-empty.png`;

  if (cell.cropState?.modelType === 'advanced') {
    const cs = cell.cropState;
    if (cs.hasRidge && cs.hasMulch) return `${BASE}assets/crops/soil/soil-ridged_mulched.png`;
    if (cs.hasRidge)                return `${BASE}assets/crops/soil/soil-ridged.png`;
    if (cs.hasMulch)                return `${BASE}assets/crops/soil/soil-mulched.png`;
  }

  return `${BASE}assets/crops/soil/soil-tilled.png`;
}
