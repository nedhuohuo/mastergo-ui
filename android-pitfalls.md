# Android 落地陷阱

下面几条来自真实还原任务，改布局或写页面代码前扫一遍。规则本身在 SKILL.md，这里只放具体坑和确诊方式。

## 设计稿的 box-shadow 不要用 elevation 实现

`android:elevation` 画的是绕控件四周的投影，和设计稿里带方向的 `box-shadow` 不是一回事。实测：设计稿给底部汇总条 `box-shadow: 0px 4px 10px rgba(0,0,0,0.3)`（只向下），用 `elevation="8dp"` 实现后，汇总条**上方**（列表那侧）多出一条灰带，下方反而没有。

- 带方向的阴影画在**阴影落向的那一侧**：向下就画在下层容器背景的顶部，用 `layer-list` + `android:gravity="top"` 的渐变
- 模糊用三档渐变近似（如 `#3D000000` → `#14000000` → 透明），两档线性渐变看着偏硬
- `elevation` 只用于「悬浮卡片」这种四周都要投影的效果

## 容器尺寸被写成 0 → 整块空白

`LinearLayout.LayoutParams(0, 0, weight)` 放在**垂直**容器里时，`layout_width` 也按 0 测量，卡片整棵子树宽度为 0，界面上就是一片空白。

- 垂直容器：`LayoutParams(MATCH_PARENT, 0, weight)`
- 水平容器：`LayoutParams(0, MATCH_PARENT, weight)`

确诊方式：`adb shell uiautomator dump` 里那一块的文案整片消失（连同卡片节点一起不在树里），就是容器量成了 0，不是「设计稿里没数据」。

## 固定高度区块在代码里现拼

设计稿里高度和内容确定的区块写进 XML；只有重复条目（列表项）和随数据变化的部分才在代码里生成。运行时现拼固定尺寸布局既容易踩上面的尺寸塌陷，也让代码里的尺寸无法和设计稿逐块对照。

## 按设计稿宽度写死横向尺寸

设计稿宽度只是参考值，机型可用宽度不同：375 的设计稿落到 361dp 的机型上，写死宽度的页签会被挤到裁字，卡片里的固定宽 chip 会溢出。

- 横向用 `match_parent` + 权重 / 百分比 / 约束链
- 只有图标、圆角、描边、分割线、头像这类与宽度无关的值才写死

而且工程装了 `AndroidAutoSize`，dp / sp 会按「屏宽 ÷ 设计基准宽」再缩放一层，**设计稿数值和设备实测值不是 1:1**。本机（361dp 宽、density 480）实测缩放约 0.96：设计 24dp 的工具条文字实测 23.0dp、设计 20dp 的卡片标题实测 19.3dp。量尺寸时先把设计值按缩放折算再和实测比，否则会把缩放误判成「尺寸写错了」。

## ViewPager2 的页面必须铺满

在代码里给 ViewPager2 造页面（例如给没有内容的页签做占位页）时，返回的 View 必须带 `MATCH_PARENT` 布局参数：

- 用 `inflate(layoutInflater, parent, false)`，或显式 `RecyclerView.LayoutParams(MATCH_PARENT, MATCH_PARENT)`

否则第一次切到该页就抛 `IllegalStateException: Pages must fill the whole ViewPager2 (use match_parent)`。

这个崩溃的症状很容易误判：崩完界面回桌面，肉眼像是「页签行不见了」或「这块没有内容」，而不像崩溃。回台验证里一旦发现「切页签后整块内容凭空消失」，先看 `adb logcat -b crash`，不要先怀疑布局尺寸。

## 系统状态栏底色会和设计稿顶部断开

设计稿顶部带渐变的页面，系统状态栏默认底色（浅色主题下通常是白/灰）会在状态栏和页面渐变之间留一条横断带，截图上看得出来。

- 状态栏底色显式设成设计稿顶部渐变的起始色：`window.statusBarColor = 顶部色`
- 顶部是浅色时同步设 `WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true`，否则状态栏图标看不见
- 状态栏高度与设计稿不一致（iOS 设计稿常 44dp，Android 常见 38dp）时，窗口内的标题栏和内容会整体上移几 dp。这是平台差异，不要为了对齐去撑高标题栏；要撑就在交付说明里写清楚

验证方式：截图取像素比对——状态栏区域颜色 = 设计稿顶部色，且与渐变起点无接缝（差 ≤ 2）。仅看截图容易把很浅的紫当成灰。

还有一种相反的症状：状态栏透明（`statusBar { immersive(darkMode = true) }`）后内容会从 y=0 开始，**标题和返回会被顶进状态栏、与状态栏图标同一水平线**。这是因为 `immersive` 内部设了 `LAYOUT_FULLSCREEN`（布局入侵），必须在根布局加 `android:fitsSystemWindows="true"` 消费状态栏内边距；两者配对写法见 [android-tob.md](android-tob.md) 的「状态栏」。确诊方式：截图里标题与状态栏图标同一水平线，或返回按钮被系统图标压住。

第三种：顶部带渐变的页面，**标题栏自带的白色底会把渐变截断**，看上去只剩状态栏那一条是渐变色、标题区域变白。用 `immersive` + 自绘渐变层时，标题栏要显式 `setBackgroundColor(Color.TRANSPARENT)`（`android:background` 属性不一定压得住组件构造里的赋值，放在 `initializeHeader` 之后调用）。确认方式：在屏上取竖直一条像素，标题栏那几行的颜色应该和设计稿的渐变值一致，而不是 `#FFFFFF`。

## 设计稿的行高在部分 ROM 上不生效

设计稿逐字给了 `lineHeight`（如 12sp→20、16sp→22），Android 侧 `android:lineHeight` 要 API 28+，而 `android:lineSpacingExtra` / `lineSpacingMultiplier` 对最后一行不生效。**实测华为 Android 12（FOA-AL00）：`android:lineHeight`、`android:lineSpacingMultiplier` 都完全无效**——属性确实编进了 APK（`aapt2 dump xmltree` 可见、dimen 值也对），视图类就是 `android.widget.TextView`，但渲染仍按默认行高（约 1.35×字号）。

落地方式：

- 行高属性照写（标准 Android 上有效），但**块高不要只靠它**：设计稿给了行/块高度的，再给容器显式高度兜底（行 22dp、内块 `minHeight` 52dp 之类）。两者不冲突：行高生效时文本正好填满容器，不生效时容器尺寸仍然对。
- 验证要看**像素**而不是 uiautomator：`uiautomator dump` 在这种 ROM 上报的 TextView 高度是文本字形框（在华为上与真实视图高不一致），用截图采样块底色/描边的纵向范围才准。

```bash
ffmpeg -v error -i shot.png -f rawvideo -pix_fmt rgb24 - > full.raw   # 全屏 RGB
# 再按目标色（如 #FFEFEE）扫一列，取连续段的 min/max y / 2.89 得到设计 dp
```

## 组件的默认内边距会吃掉文字

用组件承载设计稿时，组件的默认内容内边距会占掉量好的槽位宽度，文字放不下就变成省略号（`沟通记录` → `沟…`，整排甚至只剩 `…`）。本品实测：TAG 默认水平内边距 16dp、NORMAL 12dp，`UniversalTabLayout` 用 `universalTabContentHorizontalPadding="0dp"` 关掉。

确诊方式：量「item 宽 − 内容宽」，差值等于 2×默认内边距就是这个问题，而不是字体或字号。

同一个组件还有两个会吃掉横向空间的行为（实测于 `UniversalTabLayout`，`NORMAL` 样式、内容宽模式）：

- **首项前的留白也占一个 `itemSpacing`**：横向共占 4 个间距（首、项间 ×2、尾），所以约束是「各项文字宽合计 + 4 × 间距 ≤ 行宽」，不是 2 个。实测三项文字 230/230/322px、行宽 1014px，间距取 32dp 时第三项被裁 47px（差一个字），降到 16dp 才完整。
- **`EQUAL` 模式不能当退路**：三项被压成等宽后全部省略（「压疮评…」「跌倒评…」「导管脱…」），比截断更难认。
- 组件**没有 `space-between`、也不支持横向滚动**（源码里没有 `HorizontalScrollView`，也没有滚动 API），窄屏上只能靠减小间距，铺满效果做不到。

所以页签这类结构，选定组件后先算「各项文字宽合计 + 4 × 间距 vs 行宽」再定间距，不要直接抄设计稿的间隙值。

注意：`uiautomator dump` 里的 `text` 仍是完整原文，省略号只存在渲染层，**这类问题只能看截图发现**。

## 验收假通过

回台验证本身会骗人，下面几种都实际踩过：

| 假通过 | 真相 | 防法 |
| --- | --- | --- |
| 「判据文案消失 = 切页成功」 | 是崩溃后回到了桌面 | 每一步先断言前台是本页面，并看 `adb logcat -b crash`（本机型 `logcat -c` 不可用，可用 `-b crash` 条数增量） |
| 「设了参数但没生效」 | 装的是旧包，或 `adb install` 没真正完成 | 确认安装输出 `Success`、`lastUpdateTime` 已变，再量数据 |
| 「断言 `clickable` 失败」 | 可点区在文字外面的容器上，不在文字节点 | 取包含文字中心的最小可点节点 |
| 「同一文案判定错行」 | 同一段文案在多排结构里重复（如「全部」同时在两排），按文案取到第一个 | 先按行容器定位，再在容器范围内找项 |
| 「切页没生效」 | 点击时页签行还在滚动，或翻页动画未结束 | 点击前等锚点位置稳定，断言用轮询等状态而不是单次 dump |
| 「块内尺寸全对、卡片位置也对」 | 只量了块内尺寸和块间间距，没量绝对 y；间距被两层各吃一次时这几项都是正常的 | 逐块对设计稿的绝对 y（见下节） |
| 「用的是这次实测的数字」 | 数字来自改动那一版之前（重构、加一层 padding、换容器后链条已变） | 结构一改就整表重跑，交付说明标注测量版本 |

## 绝对坐标对账

块内尺寸、块间间距、颜色全部对，位置仍可能错——只要链条上多一个或少一个 12dp。唯一能抓到的是**拿设计稿的绝对 y 逐块对**。实测方法（这台机器 AutoSize 下 1 设计 dp = 2.89px）：

- 不要用「扫一列找连续同色段」这种脆方法：块里有文字、内嵌白块、chip，同色段会被切碎；`tol` 放宽到 6 还会把相邻两块的颜色认成同一块（`#EEEFFF` 与 `#F4EEFF` 只差 6）。
- 改成**从上往下找第一个命中色**得到块顶，**从下往上找第一个命中色**得到块底，`tol` 收到 2。
- 采样列要同时避开文字和圆角：文字距卡片左边缘 12dp 内边距，贴在 12dp 边距外的列（如 x=200px 处）既在卡片内、又在文字左边、也在圆角半径之外（半径 12dp = 35px，x 要 ≥ 距左边缘 35px）。

```python
W, D = 1084, 2.89            # 1084px 宽 / 375 设计宽
c = open('shot.raw','rb').read()
def px(x, y):
    i = (y * W + x) * 3
    return (c[i], c[i+1], c[i+2])
def near(a, b, tol):
    return all(abs(u - v) <= tol for u, v in zip(a, b))
def first(color, y0, y1, tol=2, x=200):     # 块顶
    for y in range(int(y0*D), int(y1*D)):
        if near(px(x, y), color, tol): return round(y/D, 1)
def last(color, y0, y1, tol=2, x=200):      # 块底
    for y in range(int(y1*D), int(y0*D), -1):
        if near(px(x, y), color, tol): return round(y/D, 1)
```

断言表按「设计稿 y → 实测 y」逐行写进交付说明，超 2dp 就回头查链条：从前一个块的底 + 设计稿间距 推算当前块的顶，看差在哪个容器的 padding / margin 上。实例：`.png → .raw` 用 `ffmpeg -v error -i shot.png -f rawvideo -pix_fmt rgb24 - > shot.raw`。

## 选中态 / indicator 只声明在其中一个容器里

页签的 indicator 如果只手写在某一个页签容器内，切到别的页签时 `findViewById` 在其它容器返回 null，原容器又被设成 GONE，指示条会永久消失。选中态和 indicator 交给组件托管（本项目用 `UniversalTabLayout`），业务布局里不放 indicator View。
