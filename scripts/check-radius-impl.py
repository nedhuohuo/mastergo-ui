#!/usr/bin/env python3
"""圆角落地的静态检查：找出「背景画了圆角、子 View 铺满又把角盖掉」和「裁切设了但背景不是圆角」。

用法:
  python3 scripts/check-radius-impl.py <模块目录 | res 目录>
  python3 scripts/check-radius-impl.py --self-test

判据（只看 XML，不替代真机角点采样）:
  ✗ 背景是带圆角的 shape/oval drawable，里面有铺满且会绘制内容的子 View，却没写
    android:clipToOutline="true" → 画出圆角的是背景，图片画在背景之上，渲染出来四个角是直角。
  ⚠ 写了 clipToOutline="true"，但背景不是带圆角的 drawable → outline 是矩形，裁切不起作用。

exit 1 = 有 ✗（必须清零再交付）；只有 ⚠ 或全干净时 exit 0。
解析不到的背景（@color、?attr、依赖库里的 drawable、values 里的别名）会跳过并计数，不当成问题。
"""
import os
import re
import sys
import tempfile

ANDROID = '{http://schemas.android.com/apk/res/android}'
FILL = {'match_parent', 'fill_parent'}
NOT_PAINTING = {'@null', '@android:color/transparent', 'transparent', 'none'}
PAINT_TAGS = ('ImageView', 'SurfaceView', 'TextureView', 'WebView', 'VideoView')


def find_res(path):
    """接受模块目录（含 src/main/res）或 res 目录本身。"""
    path = os.path.abspath(path)
    if os.path.basename(path) == 'res':
        return path
    for root, _dirs, _files in os.walk(path):
        if os.path.basename(root) == 'res' and os.path.basename(os.path.dirname(root)) == 'main':
            return root
    return path


def collect_rounded_drawables(res):
    """drawable 名 → 是否带圆角。selector / layer-list 里的 <item> 也算（引用它的 View 轮廓就是圆角）。"""
    rounded, seen = set(), {}
    for sub in sorted(os.listdir(res)):
        if not sub.startswith('drawable'):
            continue
        d = os.path.join(res, sub)
        if not os.path.isdir(d):
            continue
        for dirpath, _dirs, files in os.walk(d):
            for f in files:
                if not f.endswith('.xml'):
                    continue
                text = open(os.path.join(dirpath, f), encoding='utf-8').read()
                name = f[:-4]
                seen[name] = True
                if '<corners' in text or re.search(r'shape\s*=\s*"oval"', text):
                    rounded.add(name)
    return rounded, seen


def bg_name(el):
    """android:background 指向的 drawable 名；不是 @drawable/... 时返回 (None, 原始值)。"""
    raw = el.get(ANDROID + 'background')
    if not raw:
        return None, None
    m = re.match(r'^@(?:\+?android:)?drawable/(.+)$', raw)
    if not m:
        return None, raw
    name = m.group(1)
    if '/' in name:  # @drawable/ 之外的写法，如 @android:drawable/x
        return None, raw
    return name, raw


def paints(child):
    """子 View 会不会真的画出内容（透明覆盖层不算）。"""
    if child.get(ANDROID + 'src') or child.get('{http://schemas.android.com/apk/res-auto}srcCompat'):
        return True
    if child.tag in PAINT_TAGS or any(child.tag.endswith(t) for t in PAINT_TAGS):
        return True
    raw = child.get(ANDROID + 'background')
    if raw and raw not in NOT_PAINTING:
        return True
    return False


def fills(child):
    w = (child.get(ANDROID + 'layout_width') or '').strip()
    h = (child.get(ANDROID + 'layout_height') or '').strip()
    return w in FILL and h in FILL


def covers(child, el, axis):
    """child 在某个轴上是否铺到 el 的边界：match_parent，或者两边都 wrap_content 且 el 只有这一个子元素。"""
    c = (child.get(ANDROID + 'layout_' + axis) or '').strip()
    p = (el.get(ANDROID + 'layout_' + axis) or '').strip()
    if c in FILL:
        return True
    return c == 'wrap_content' and p == 'wrap_content' and len(list(el)) == 1


ZERO = {'0dp', '0dip', '0px', '0sp', '0', ''}


def inset(el):
    """元素自身的内边距 / 外边距：非零（或指向 @dimen 这类说不准的值）就算内容离角有距离。"""
    for k, v in el.attrib.items():
        if not k.startswith(ANDROID):
            continue
        attr = k[len(ANDROID):]
        if not (attr == 'padding' or attr.startswith('padding') or attr.startswith('layout_margin')):
            continue
        if (v or '').strip() not in ZERO:
            return True
    return False


def covering(el):
    """会把 el 的圆角盖掉的子 View：铺满、会绘制，而且中间没有 padding / margin 把内容推离角。

    只看直接子元素，透明容器往下递归；el 自己有内边距时内容根本到不了角上，直接算干净。
    （限定：layout_gravity / 约束把内容推离角的情况看不出来，所以只会漏报，不会误报。）
    """
    if inset(el):
        return []
    out = []
    for child in list(el):
        if not (covers(child, el, 'width') and covers(child, el, 'height')):
            continue
        if paints(child):
            out.append(child)
        elif not inset(child):
            out += covering(child)
    return out


def line_of(text, el):
    """ElementTree 不报行号：用 id / tag 回到原文里找。"""
    _id = el.get(ANDROID + 'id')
    if _id:
        m = re.search(r'@\+?id/' + re.escape(_id.split('/')[-1]) + r'\b', text)
        if m:
            return text[: m.start()].count('\n') + 1
    return 0


def check(res):
    rounded, known = collect_rounded_drawables(res)
    bad, warn, skipped = [], [], 0
    layout_dirs = [
        os.path.join(res, d) for d in sorted(os.listdir(res)) if d.startswith('layout')
    ]
    for d in layout_dirs:
        if not os.path.isdir(d):
            continue
        for dirpath, _dirs, files in os.walk(d):
            for f in sorted(files):
                if not f.endswith('.xml'):
                    continue
                p = os.path.join(dirpath, f)
                text = open(p, encoding='utf-8').read()
                try:
                    import xml.etree.ElementTree as ET

                    root = ET.fromstring(text)
                except ET.ParseError as e:
                    print(f'  ✗ 解析不了: {os.path.relpath(p)}（{e}）')
                    bad.append((p, 0, 'XML 解析失败', ''))
                    continue
                for el in root.iter():
                    name, raw = bg_name(el)
                    clip = (el.get(ANDROID + 'clipToOutline') or '').strip() == 'true'
                    is_rounded = bool(name) and name in rounded
                    if name and name not in known:
                        skipped += 1
                    if is_rounded and not clip:
                        cover = covering(el)
                        if cover:
                            bad.append((p, line_of(text, el), el.tag, el.get(ANDROID + 'id') or ''))
                    elif clip and not is_rounded:
                        warn.append((p, line_of(text, el), el.tag, el.get(ANDROID + 'id') or ''))
    return bad, warn, skipped


def report(res):
    bad, warn, skipped = check(res)
    rel = lambda p: os.path.relpath(p)
    for p, ln, tag, _id in bad:
        print(f'  ✗ {rel(p)}:{ln}  <{tag}> 背景是圆角 drawable，里面有铺满的子 View 却没裁切 → 四角会被盖成直角，加 android:clipToOutline="true"')
    for p, ln, tag, _id in warn:
        print(f'  ⚠ {rel(p)}:{ln}  <{tag}> 写了 clipToOutline 但背景不是带圆角的 drawable → outline 是矩形，裁切不生效')
    print(f'\n圆角裁切检查（{rel(res)}）：✗ {len(bad)} 处、⚠ {len(warn)} 处、跳过（背景指向依赖库 / 颜色 / 别名）{skipped} 处')
    if bad:
        print('✗ 的位置必须清零：背景圆角不裁子 View，图片会把角盖掉（见 android-pitfalls.md「容器背景的圆角不会裁掉子 View」）')
    return 1 if bad else 0


SELF_TEST_CLEAN = '''<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent" android:layout_height="wrap_content">
    <FrameLayout android:layout_width="80dp" android:layout_height="80dp"
        android:background="@drawable/rounded" android:clipToOutline="true">
        <ImageView android:layout_width="match_parent" android:layout_height="match_parent"
            android:scaleType="centerCrop" android:src="@mipmap/x" />
    </FrameLayout>
</LinearLayout>
'''

SELF_TEST_BAD = SELF_TEST_CLEAN.replace(' android:clipToOutline="true"', '')

# 无内边距的卡 + 中间一层透明容器 + 铺满的图片：图片真的盖到角上，要报
SELF_TEST_NESTED = '''<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent" android:layout_height="wrap_content"
    android:background="@drawable/rounded">
    <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content"
        android:orientation="vertical">
        <ImageView android:layout_width="match_parent" android:layout_height="match_parent"
            android:scaleType="centerCrop" android:src="@mipmap/x" />
    </LinearLayout>
</LinearLayout>
'''

# 带 12dp 内边距的卡：子 View 到不了角上，不该报（误报会拦住交付）
SELF_TEST_PADDED = SELF_TEST_NESTED.replace(
    'android:background="@drawable/rounded">',
    'android:background="@drawable/rounded" android:padding="12dp">',
)


def self_test():
    """真跑四个 fixture：该干净的干净，该报的报（误报会拦住交付，所以两个方向都验）。"""
    cases = [
        ('裁切齐全', SELF_TEST_CLEAN, 0),
        ('漏裁切', SELF_TEST_BAD, 1),
        ('无内边距 + 透明层（图片真盖到角上）', SELF_TEST_NESTED, 1),
        ('有 12dp 内边距（子 View 到不了角上）', SELF_TEST_PADDED, 0),
    ]
    ok = True
    with tempfile.TemporaryDirectory() as tmp:
        res = os.path.join(tmp, 'res')
        os.makedirs(os.path.join(res, 'drawable'))
        os.makedirs(os.path.join(res, 'layout'))
        open(os.path.join(res, 'drawable', 'rounded.xml'), 'w').write(
            '<shape xmlns:android="http://schemas.android.com/apk/res/android">'
            '<corners android:radius="8dp"/></shape>'
        )
        layout = os.path.join(res, 'layout', 'a.xml')
        for label, xml, want in cases:
            open(layout, 'w').write(xml)
            got = report(res)
            flag = '✓' if got == want else '✗'
            if got != want:
                ok = False
            print(f'  自检 {flag} {label}：exit={got}（期望 {want}）\n')
    print('自检:', '通过' if ok else '不通过')
    return 0 if ok else 1


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    if '--self-test' in sys.argv[1:]:
        sys.exit(self_test())
    if not args:
        print(__doc__)
        sys.exit(2)
    sys.exit(report(find_res(args[0])))
