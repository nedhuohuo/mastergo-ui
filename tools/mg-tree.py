#!/usr/bin/env python3
"""把 Magic MCP 的 getDesignSections 输出压成可读的层级树。

用法: python3 tools/mg-tree.py <section-*.txt> [...] > tree.txt

只做只读抽取：颜色按 styles 解析，文字合并逐字内容，图标只留 svgShortKey。
"""
import json
import sys


def resolve_color(styles, ref):
    if not ref:
        return None
    v = styles.get(ref, {}).get('value')
    if isinstance(v, list):
        return '/'.join(str(x) for x in v) if v else None
    return v


def fmt_num(x):
    if isinstance(x, float):
        return f'{x:g}'
    return str(x)


def text_of(node, styles):
    parts = []
    for t in node.get('text') or []:
        f = styles.get((t.get('font') or ''), {}).get('value', {})
        parts.append((t.get('text', ''), f))
    return parts


def walk(node, styles, out, depth=0, parent_xy=(0, 0)):
    ls = node.get('layoutStyle') or {}
    w, h = ls.get('width'), ls.get('height')
    rx, ry = ls.get('relativeX', 0), ls.get('relativeY', 0)
    ax, ay = parent_xy[0] + (rx or 0), parent_xy[1] + (ry or 0)

    bits = [f'{node.get("type")} {node.get("id")} "{node.get("name")}"']
    bits.append(f'{fmt_num(w)}x{fmt_num(h)} @{fmt_num(rx)},{fmt_num(ry)} (abs {fmt_num(ax)},{fmt_num(ay)})')

    fill = resolve_color(styles, node.get('fill'))
    if fill:
        bits.append(f'fill={fill}')
    if node.get('_color'):
        bits.append(f'_color={node["_color"]}')
    if node.get('_token'):
        bits.append(f'token={node["_token"]}')
    stroke = resolve_color(styles, node.get('strokeColor'))
    if stroke:
        bits.append(f'stroke={stroke}/{fmt_num(node.get("strokeWidth"))}/{node.get("strokeAlign")}')
    if node.get('borderRadius'):
        bits.append(f'radius={node["borderRadius"]}')
    if node.get('opacity') is not None:
        bits.append(f'opacity={node["opacity"]}')
    if node.get('effect'):
        bits.append('effect=' + json.dumps(node['effect'], ensure_ascii=False))
    fci = node.get('flexContainerInfo')
    if fci:
        seg = ','.join(f'{k}={v}' for k, v in fci.items() if v)
        if seg:
            bits.append(f'flex[{seg}]')
    for k in ('flexGrow', 'flexShrink'):
        if node.get(k) is not None:
            bits.append(f'{k}={node[k]}')
    if node.get('svgShortKey'):
        bits.append(f'SVG={node["svgShortKey"]} @@@ {node.get("svgName")}')
    if node.get('interactive'):
        bits.append('INTERACTIVE=' + json.dumps(node['interactive'], ensure_ascii=False))
    if node.get('_placeholder'):
        bits.append('_placeholder')

    out.append('  ' * depth + '- ' + ' | '.join(bits))

    for txt, f in text_of(node, styles):
        font = f'{fmt_num(f.get("size"))}sp/{fmt_num(f.get("lineHeight"))} w={f.get("weight")} {f.get("family")}'
        out.append('  ' * (depth + 1) + f'text: {txt!r} [{font}]')
    if node.get('textColor'):
        out.append('  ' * (depth + 1) + 'textColor: ' + json.dumps(node['textColor'], ensure_ascii=False))
    if node.get('textAlign'):
        out.append('  ' * (depth + 1) + f'textAlign={node["textAlign"]} mode={node.get("textMode")}')
    for key in ('path', '_mergedVector'):
        if node.get(key):
            out.append('  ' * (depth + 1) + f'{key}: {json.dumps(node[key], ensure_ascii=False)[:200]}')

    for c in node.get('children') or []:
        walk(c, styles, out, depth + 1, (ax, ay))
    return out


def main():
    for path in sys.argv[1:]:
        raw = open(path).read()
        try:
            d = json.loads(raw)
        except json.JSONDecodeError:
            print(f'## {path}: 不是 JSON（可能是错误信息）')
            print(raw[:500])
            continue
        print(f'## {path}  sectionIndex={d.get("sectionIndex")} id={d.get("section", {}).get("id")} name={d.get("section", {}).get("name")!r} nodeCount={d.get("nodeCount")}')
        styles = (d.get('dsl') or {}).get('styles') or {}
        for key in ('placeholders', 'placeholderTexts'):
            if d.get('dsl', {}).get(key):
                print(f'   {key}: {json.dumps(d["dsl"][key], ensure_ascii=False)}')
        if d.get('dsl', {}).get('placeholderTexts'):
            print('   placeholderTexts: ' + json.dumps(d['dsl']['placeholderTexts'], ensure_ascii=False))
        if d.get('dsl', {}).get('rowTexts'):
            print('   rowTexts: ' + json.dumps(d['dsl']['rowTexts'], ensure_ascii=False))
        for n in (d.get('dsl') or {}).get('nodes') or []:
            for line in walk(n, styles, [], 0):
                print(line)


if __name__ == '__main__':
    main()
