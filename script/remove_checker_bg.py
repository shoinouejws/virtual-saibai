"""
remove_checker_bg.py
====================
グレースケールのチェッカーボード背景を自動検出して除去するスクリプト。

使い方:
    python remove_checker_bg.py

構成:
    ./remove_bg_target/   ← 処理対象の PNG 画像を置くフォルダ
    ./remove_bg_output/   ← 結果（透過 PNG）を出力するフォルダ（なければ自動作成）

依存ライブラリ:
    pip install pillow opencv-python numpy
"""

import os
import sys
import numpy as np
import cv2
from PIL import Image


# ─────────────────────────────────────────────
# 1. チェッカーボードパラメータの自動検出
# ─────────────────────────────────────────────

def detect_checker_params(gray: np.ndarray, border: int = 100):
    """
    画像の境界領域からチェッカーボードの
    タイルサイズ・位相オフセット・2色の輝度値を推定する。

    Returns
    -------
    tile_size : int
    x0, y0   : int  (位相オフセット)
    c0, c1   : float (2色のグレー値)
    """
    h, w = gray.shape

    # ── タイルサイズ推定（上端付近の行で輝度変化を検出）──
    row = gray[min(10, h - 1)].astype(int)
    transitions = np.where(np.abs(np.diff(row)) > 20)[0]
    if len(transitions) >= 4:
        gaps = np.diff(transitions)
        gaps = gaps[gaps > 3]   # 1px アンチエイリアス端を除外
        tile_size = int(np.median(gaps)) if len(gaps) > 0 else 41
    else:
        tile_size = 41          # フォールバック

    tile_size = max(10, min(tile_size, 128))   # 妥当な範囲にクリップ

    # ── 境界ピクセルをサブサンプリング ──
    bmask = np.zeros((h, w), bool)
    bmask[:border, :]  = True
    bmask[-border:, :] = True
    bmask[:, :border]  = True
    bmask[:, -border:] = True
    ys, xs = np.where(bmask)

    step = max(1, len(xs) // 3000)   # 最大 3000 点に絞る
    ys, xs = ys[::step], xs[::step]
    vals = gray.astype(float)[ys, xs]

    # ── 位相 (x0, y0) の総当たり最適化 ──
    best_err = float('inf')
    best_params = (0, 0, 128.0, 192.0)

    s = tile_size
    px_base = ((xs[None, :] - np.arange(s)[:, None]) // s) & 1   # (s, N)

    for xi, x_par in enumerate(px_base):
        for y0 in range(s):
            pat = (x_par + ((ys - y0) // s)) & 1                  # (N,)
            v0 = vals[pat == 0]
            v1 = vals[pat == 1]
            if len(v0) < 5 or len(v1) < 5:
                continue
            c0 = float(np.median(v0))
            c1 = float(np.median(v1))
            pred = np.where(pat == 0, c0, c1)
            err = float(np.mean((vals - pred) ** 2))
            if err < best_err:
                best_err = err
                best_params = (xi, y0, c0, c1)

    x0, y0, c0, c1 = best_params
    return tile_size, x0, y0, c0, c1


# ─────────────────────────────────────────────
# 2. 1枚の画像を処理して透過 PNG として保存
# ─────────────────────────────────────────────

def remove_checker_bg(img_path: str, out_path: str) -> None:
    # ── 読み込み ──
    img = np.array(Image.open(img_path).convert('RGB'))
    h, w = img.shape[:2]

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    hsv  = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    # ── チェッカーボード検出 ──
    tile_size, x0, y0, c0, c1 = detect_checker_params(gray)
    print(f"    checker: tile={tile_size}px  offset=({x0},{y0})  "
          f"gray=({c0:.0f},{c1:.0f})")

    # ── 予測背景との色距離マップ ──
    par  = (((np.arange(w)[None, :] - x0) // tile_size +
              (np.arange(h)[:, None] - y0) // tile_size) & 1)
    bg0  = np.array([c0, c0, c0], dtype=np.int32)
    bg1  = np.array([c1, c1, c1], dtype=np.int32)
    pred = np.where(par[:, :, None] == 0, bg0, bg1)
    dist = np.sqrt(((img.astype(np.int32) - pred) ** 2).sum(axis=2))

    # ── GrabCut 用マスク構築 ──
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)

    # 確実な背景:
    #   ① 予測チェッカー色との距離が近い（白い花弁は dist が高くなるので誤検出しない）
    #   ② かつ低彩度
    #   ③ かつ明度が予測値から大きく外れていない（白い花弁を除外）
    V = hsv[:, :, 2]
    pred_gray = np.where(par == 0, c0, c1)          # 予測グレー値
    bright_delta = np.abs(V.astype(float) - pred_gray)  # 明度の乖離
    def_bg = (dist < 18) & (S < 30) & (bright_delta < 30)
    mask[def_bg] = cv2.GC_BGD

    # 画像外周は確実な背景
    border_px = max(20, min(50, h // 40, w // 40))
    mask[:border_px, :]  = cv2.GC_BGD
    mask[-border_px:, :] = cv2.GC_BGD
    mask[:, :border_px]  = cv2.GC_BGD
    mask[:, -border_px:] = cv2.GC_BGD

    # 確実な前景: 緑・黄など鮮やかな色
    img_i = img.astype(int)
    def_fg = (
        ((S > 50) & (H > 18) & (H < 110)) |
        ((img_i[:, :, 1] > img_i[:, :, 0] + 8) &
         (img_i[:, :, 1] > img_i[:, :, 2] + 8))
    )
    mask[def_fg] = cv2.GC_FGD

    # 確実前景を大きめに膨張させて白い花弁周辺を「おそらく前景」にカバー
    pr_fg = cv2.dilate(
        def_fg.astype(np.uint8),
        np.ones((21, 21), np.uint8),   # 9→21: 花弁周辺を広くカバー
        iterations=2
    ).astype(bool)
    mask[pr_fg & (mask != cv2.GC_BGD)] = cv2.GC_PR_FGD

    # ── GrabCut 実行 ──
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd_model, fgd_model, 7, cv2.GC_INIT_WITH_MASK)

    alpha = np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0
    ).astype(np.uint8)

    # ── 後処理① モルフォロジークローズで前景の小さな穴を埋める ──
    alpha = cv2.morphologyEx(
        alpha, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8)
    )

    # ── 後処理② 境界非到達の背景領域 = 実は前景（白い花弁など）を復元 ──
    #   背景(alpha==0)領域のうち、画像の外周から連結していない = 植物に囲まれた内側
    #   → それらはすべて前景として扱う
    bg_mask = (alpha == 0).astype(np.uint8)
    # 1px の枠を付けて外周から flood fill
    bordered = cv2.copyMakeBorder(bg_mask, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=1)
    flood = bordered.copy()
    cv2.floodFill(flood, None, (0, 0), 2)   # 外周連結 bg を値 2 に塗る
    enclosed_bg = (flood[1:-1, 1:-1] != 2)  # 到達できなかった = 内側の穴
    alpha[enclosed_bg] = 255                 # 穴を前景として復元

    # ── 後処理③ 小さい孤立領域を除去 + スムージング ──
    num, labels, stats, _ = cv2.connectedComponentsWithStats(
        (alpha > 0).astype(np.uint8), connectivity=8
    )
    keep = np.zeros(num, bool)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] > 100:
            keep[i] = True

    alpha = (np.isin(labels, np.where(keep)[0]).astype(np.uint8) * 255)
    alpha = cv2.medianBlur(alpha, 3)

    # ── 透過 PNG として保存 ──
    rgba = np.dstack([img, alpha])
    Image.fromarray(rgba).save(out_path)


# ─────────────────────────────────────────────
# 3. メイン: フォルダ一括処理
# ─────────────────────────────────────────────

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir  = os.path.join(script_dir, 'remove_bg_target')
    output_dir = os.path.join(script_dir, 'remove_bg_output')

    # 入力フォルダの存在確認
    if not os.path.isdir(input_dir):
        print(f"[ERROR] 入力フォルダが見つかりません: {input_dir}")
        sys.exit(1)

    # 出力フォルダを作成（なければ）
    os.makedirs(output_dir, exist_ok=True)

    # PNG ファイル一覧を取得
    png_files = sorted(
        f for f in os.listdir(input_dir) if f.lower().endswith('.png')
    )

    if not png_files:
        print(f"[INFO] PNG ファイルが見つかりません: {input_dir}")
        return

    print(f"[INFO] {len(png_files)} 件の PNG を処理します。\n")

    for i, fname in enumerate(png_files, 1):
        in_path  = os.path.join(input_dir, fname)
        out_path = os.path.join(output_dir, fname)
        print(f"[{i}/{len(png_files)}] {fname}")

        try:
            remove_checker_bg(in_path, out_path)
            print(f"    -> 保存完了: {out_path}")
        except Exception as e:
            print(f"    [ERROR] 処理失敗: {e}")

    print("\n[INFO] 全処理完了。")


if __name__ == '__main__':
    main()
