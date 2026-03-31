#!/usr/bin/env python3
"""
remove_bg.py

チェック柄背景が焼き込まれたPNG/画像から、前景を抽出して透過PNGを生成する。

使い方:
    python checker_bg_remove.py input.png output.png

依存:
    pip install opencv-python pillow numpy
"""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def remove_checker_background(
    image_rgb: np.ndarray,
    tile_size: int = 41,
    offset_x: int = 40,
    offset_y: int = 40,
    bg_color0: tuple[int, int, int] = (148, 148, 148),
    bg_color1: tuple[int, int, int] = (212, 212, 212),
    border_bg_width: int = 30,
    bg_dist_threshold: float = 12.0,
    bg_sat_threshold: int = 25,
    fg_sat_threshold: int = 50,
    fg_hue_min: int = 18,
    fg_hue_max: int = 110,
    fg_green_margin: int = 8,
    dilate_kernel_size: int = 9,
    grabcut_iter: int = 7,
    min_component_area: int = 100,
    median_blur_ksize: int = 3,
) -> np.ndarray:
    """
    入力RGB画像からRGBA画像を返す。
    """

    if image_rgb.ndim != 3 or image_rgb.shape[2] != 3:
        raise ValueError("image_rgb must be an RGB image with shape (H, W, 3).")

    img = image_rgb.copy()
    h, w = img.shape[:2]

    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    h_ch, s_ch, _v_ch = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    yy, xx = np.indices((h, w))
    checker_parity = (((xx - offset_x) // tile_size) + ((yy - offset_y) // tile_size)) & 1

    bg0 = np.array(bg_color0, dtype=np.int32)
    bg1 = np.array(bg_color1, dtype=np.int32)
    pred_bg = np.where(checker_parity[:, :, None] == 0, bg0, bg1).astype(np.int32)

    diff = img.astype(np.int32) - pred_bg
    dist = np.sqrt((diff * diff).sum(axis=2)).astype(np.float32)

    mask = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)

    # 背景確定: 予測背景にかなり近く、かつ低彩度
    definite_bg = (dist < bg_dist_threshold) & (s_ch < bg_sat_threshold)
    mask[definite_bg] = cv2.GC_BGD

    # 画像の外周は背景確定
    b = border_bg_width
    mask[:b, :] = cv2.GC_BGD
    mask[-b:, :] = cv2.GC_BGD
    mask[:, :b] = cv2.GC_BGD
    mask[:, -b:] = cv2.GC_BGD

    # 前景確定:
    # 1) 十分に高彩度で、植物に多い色相レンジ
    # 2) または RGB 的に G が他チャンネルより優勢
    definite_fg = (
        ((s_ch > fg_sat_threshold) & (h_ch > fg_hue_min) & (h_ch < fg_hue_max))
        | ((img[:, :, 1] > img[:, :, 0] + fg_green_margin) & (img[:, :, 1] > img[:, :, 2] + fg_green_margin))
    )
    mask[definite_fg] = cv2.GC_FGD

    # 前景候補: 強い前景を膨張して周辺を probable foreground にする
    kernel = np.ones((dilate_kernel_size, dilate_kernel_size), np.uint8)
    probable_fg = cv2.dilate(definite_fg.astype(np.uint8), kernel, iterations=1).astype(bool)
    mask[probable_fg & (mask != cv2.GC_BGD)] = cv2.GC_PR_FGD

    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    cv2.grabCut(
        img,
        mask,
        None,
        bgd_model,
        fgd_model,
        grabcut_iter,
        cv2.GC_INIT_WITH_MASK,
    )

    alpha = np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD),
        255,
        0,
    ).astype(np.uint8)

    # 小さなゴミを除去
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 0).astype(np.uint8), 8)
    keep = np.zeros(num_labels, dtype=bool)
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if area > min_component_area:
            keep[i] = True

    alpha = (np.isin(labels, np.where(keep)[0]).astype(np.uint8) * 255)

    # エッジの粗さを少し軽減
    if median_blur_ksize >= 3 and median_blur_ksize % 2 == 1:
        alpha = cv2.medianBlur(alpha, median_blur_ksize)

    rgba = np.dstack([img, alpha]).astype(np.uint8)
    return rgba


def main() -> None:
    parser = argparse.ArgumentParser(
        description="チェック柄背景を除去して透過PNGを出力する"
    )
    parser.add_argument("input", type=Path, help="入力画像パス")
    parser.add_argument("output", type=Path, help="出力PNGパス")
    args = parser.parse_args()

    if not args.input.exists():
        raise FileNotFoundError(f"Input file not found: {args.input}")

    image_rgb = np.array(Image.open(args.input).convert("RGB"))
    rgba = remove_checker_background(image_rgb)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba).save(args.output)
    print(f"Saved: {args.output}")


if __name__ == "__main__":
    main()