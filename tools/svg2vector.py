#!/usr/bin/env python3
"""把 MasterGo extractSvg 返回的 SVG 转成 Android VectorDrawable。

用法: python3 tools/svg2vector.py <输入 svg 文件> <输出 xml> [--fill-color "#RRGGBB"]

只支持本仓库遇到的简单形状：<path> + 纯色/单色渐变 fill，可选 transform 会直接拒绝
（宁可报错让人工确认，也不静默丢变换）。
"""
import re
import sys
import xml.etree.ElementTree as ET


def parse_viewbox(root):
    vb = root.get('viewBox')
    if not vb:
        raise SystemExit('SVG 缺少 viewBox')
    return [float(x) for x in re.split(r'[\s,]+', vb.strip())]


def reject_transform(t):
    raise SystemExit(f'path 带 transform（{t}），可能是旋转/镜像，需人工确认后再转')


def main():
    src, dst = sys.argv[1], sys.argv[2]
    fill_override = None
    if '--fill-color' in sys.argv:
        fill_override = sys.argv[sys.argv.index('--fill-color') + 1]

    tree = ET.parse(src)
    root = tree.getroot()
    minx, miny, vw, vh = parse_viewbox(root)

    paths = []
    for p in root.iter():
        tag = p.tag.split('}')[-1]
        if tag != 'path':
            continue
        d = p.get('d')
        fill = p.get('fill', '#000000')
        if fill_override:
            fill = fill_override
        if fill.startswith('url('):
            raise SystemExit(f'{src}: 渐变 fill 需人工处理或指定 --fill-color')
        tx, ty = 0.0, 0.0
        if p.get('transform'):
            reject_transform(p.get('transform'))
        paths.append((d, fill))

    if not paths:
        raise SystemExit(f'{src}: 没有 path')

    lines = [
        '<?xml version="1.0" encoding="utf-8"?>',
        f'<!-- 由 tools/svg2vector.py 从 MasterGo extractSvg 输出转换，源文件 {src.split("/")[-1]} -->',
        '<vector xmlns:android="http://schemas.android.com/apk/res/android"',
        f'    android:width="{round(vw, 2)}dp"',
        f'    android:height="{round(vh, 2)}dp"',
        f'    android:viewportWidth="{round(vw, 4)}"',
        f'    android:viewportHeight="{round(vh, 4)}">',
    ]
    for d, fill in paths:
        lines.append(f'    <group android:translateX="{round(-minx, 4)}" android:translateY="{round(-miny, 4)}">')
        pad = '        '
        lines.append(f'{pad}<path')
        lines.append(f'{pad}    android:fillColor="{fill}"')
        lines.append(f'{pad}    android:pathData="{d}" />')
        lines.append('    </group>')
    lines.append('</vector>')
    open(dst, 'w').write('\n'.join(lines) + '\n')
    print(f'✅ {dst}（{len(paths)} path, viewport {vw}x{vh}）')


if __name__ == '__main__':
    main()
