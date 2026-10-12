# Android 落地陷阱

下面几条来自真实还原任务，改布局或写页面代码前扫一遍。规则本身在 SKILL.md，这里只放具体坑和确诊方式。

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

## 组件的默认内边距会吃掉文字

用组件承载设计稿时，组件的默认内容内边距会占掉量好的槽位宽度，文字放不下就变成省略号（`沟通记录` → `沟…`，整排甚至只剩 `…`）。本品实测：TAG 默认水平内边距 16dp、NORMAL 12dp，`UniversalTabLayout` 用 `universalTabContentHorizontalPadding="0dp"` 关掉。

确诊方式：量「item 宽 − 内容宽」，差值等于 2×默认内边距就是这个问题，而不是字体或字号。

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

## 选中态 / indicator 只声明在其中一个容器里

页签的 indicator 如果只手写在某一个页签容器内，切到别的页签时 `findViewById` 在其它容器返回 null，原容器又被设成 GONE，指示条会永久消失。选中态和 indicator 交给组件托管（本项目用 `UniversalTabLayout`），业务布局里不放 indicator View。
