#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从品牌图（深色渐变底 + 破壳种子图形）中抽取透明底徽标。

用法：
    python scripts/extract_logo.py <源图路径> [输出目录]

默认输出目录为 assets/，生成三个文件：
    logo-mark.png   完整徽标（含破壳幼芽），透明底
    logo-seed.png   方形图标（仅种子主体），适用于 App 图标
    favicon.png     128px 站点图标

原理：
    1. 用图像四条边环带拟合背景的二次曲面，模拟暗角渐变（比单一底色更准）；
    2. 按「与背景模型的颜色距离」生成 alpha，并用色相/明度门控剔除投影；
    3. 从种子中心洪泛取最大连通域，排除上方文字与水印；
    4. 背景反混合，去掉半透明边缘残留的底色；
    5. 交集裁剪出内容包围盒。

依赖：pillow, numpy
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FRAME = 70          # 用于拟合背景的边框宽度（像素）
DIST_LO, DIST_HI = 16.0, 52.0   # alpha 过渡区间（颜色距离）
HUE_GATE = 26.0     # 与背景色相差小于该角度视为同色
VAL_GATE = 0.10     # 明度高于背景该比例即视为前景


def fit_background(rgb):
    """用边界环带最小二乘拟合背景的二次曲面，返回同形状的背景图。"""
    h, w = rgb.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    xn, yn = xs / w, ys / h
    ring = np.zeros((h, w), bool)
    ring[:FRAME, :] = ring[-FRAME:, :] = True
    ring[:, :FRAME] = ring[:, -FRAME:] = True

    basis = np.stack([np.ones_like(xn), xn, yn, xn * xn, yn * yn, xn * yn], -1)
    coef, *_ = np.linalg.lstsq(basis[ring], rgb[ring], rcond=None)
    return basis @ coef


def hsv(rgb):
    """向量化 RGB→HSV（H 单位度，S/V 归一化）。"""
    mx, mn = rgb.max(-1), rgb.min(-1)
    v = mx / 255.0
    d = np.maximum(mx - mn, 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(v)
    nz = d > 1e-3
    m = (mx == r) & nz
    h[m] = ((g - b) / d)[m] % 6
    m = (mx == g) & nz
    h[m] = ((b - r) / d)[m] + 2
    m = (mx == b) & nz
    h[m] = ((r - g) / d)[m] + 4
    return h * 60.0 % 360.0, np.where(mx > 1e-3, d / np.maximum(mx, 1e-6), 0), v


def largest_component_containing(alpha, seed_xy):
    """保留包含指定种子点的连通域（略微膨胀以接住抗锯齿边缘）。"""
    binimg = Image.fromarray(((alpha > 0.10) * 255).astype(np.uint8), 'L')
    flood = binimg.copy()
    ImageDraw.floodfill(flood, seed_xy, 128)
    comp = np.asarray(flood) == 128
    comp = np.asarray(
        Image.fromarray((comp * 255).astype(np.uint8), 'L').filter(ImageFilter.MaxFilter(5))
    ) > 0
    return comp


def extract(src, outdir):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    rgb = np.asarray(im).astype(np.float32)
    print(f'源图 {w}x{h}')

    bg = fit_background(rgb)
    dist = np.sqrt(((rgb - bg) ** 2).sum(-1))

    hp, _, vp = hsv(rgb)
    hb, _, vb = hsv(bg)
    dh = np.abs(hp - hb)
    dh = np.minimum(dh, 360 - dh)

    alpha = np.clip((dist - DIST_LO) / (DIST_HI - DIST_LO), 0, 1)
    # 与背景同色相且不比背景亮 → 判为投影/底色
    alpha *= ~((dh < HUE_GATE) & (vp - vb < VAL_GATE))
    alpha[:120, :250] = 0.0                      # 去掉生成水印区域

    lower = dist.copy()
    lower[:int(h * 0.42)] = 0                    # 主体在下半部
    cy, cx = np.unravel_index(np.argmax(lower), lower.shape)
    alpha *= largest_component_containing(alpha, (int(cx), int(cy)))
    alpha[alpha < 0.06] = 0.0

    # 背景反混合（去除半透明边缘残留的底色）
    a3 = alpha[..., None]
    fg = np.where(a3 > 0.03, (rgb - (1 - a3) * bg) / np.maximum(a3, 0.03), rgb)
    mark = Image.fromarray(np.dstack([np.clip(fg, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')

    bbox = mark.getchannel('A').point(lambda v: 255 if v > 15 else 0).getbbox()
    mark = mark.crop(bbox)
    pad = max(4, int(max(mark.size) * 0.05))
    canvas = Image.new('RGBA', (mark.width + pad * 2, mark.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(mark, (pad, pad), mark)
    mark = canvas
    print(f'徽标 {mark.size[0]}x{mark.size[1]}  bbox={bbox}')

    os.makedirs(outdir, exist_ok=True)

    full = mark.copy()
    full.thumbnail((800, 800), Image.LANCZOS)
    full.save(os.path.join(outdir, 'logo-mark.png'))

    # 方形图标：裁掉幼芽，只留种子主体并居中
    seed = mark.crop((0, int(mark.height * 0.215), mark.width, mark.height))
    seed = seed.crop(seed.getchannel('A').point(lambda v: 255 if v > 15 else 0).getbbox())
    side = int(max(seed.size) * 1.10)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    square.paste(seed, ((side - seed.width) // 2, (side - seed.height) // 2), seed)
    square.thumbnail((256, 256), Image.LANCZOS)
    square.save(os.path.join(outdir, 'logo-seed.png'))

    icon = square.copy()
    icon.thumbnail((128, 128), Image.LANCZOS)
    icon.save(os.path.join(outdir, 'favicon.png'))

    for name in ('logo-mark.png', 'logo-seed.png', 'favicon.png'):
        p = os.path.join(outdir, name)
        print(f'  写出 {p}  ({os.path.getsize(p) // 1024} KB)')


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    outdir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, 'assets')
    extract(sys.argv[1], outdir)
    return 0


if __name__ == '__main__':
    sys.exit(main())
