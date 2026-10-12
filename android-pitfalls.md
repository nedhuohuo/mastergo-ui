# Android 落地陷阱

下面几条来自真实还原任务，改布局或写页面代码前扫一遍。规则本身在 SKILL.md，这里只放具体坑和确诊方式。

## 设计稿的 box-shadow 不要用 elevation 实现

`android:elevation` 画的是绕控件四周的投影，和设计稿里带方向的 `box-shadow` 不是一回事。实测：设计稿给底部汇总条 `box-shadow: 0px 4px 10px rgba(0,0,0,0.3)`（只向下），用 `elevation="8dp"` 实现后，汇总条**上方**（列表那侧）多出一条灰带，下方反而没有。

- 带方向的阴影画在**阴影落向的那一侧**：向下就画在下层容器背景的顶部，用 `layer-list` + `android:gravity="top"` 的渐变
- 模糊用三档渐变近似（如 `#3D000000` → `#14000000` → 透明），两档线性渐变看着偏硬
- `elevation` 只用于「悬浮卡片」这种四周都要投影的效果

## 容器背景的圆角不会裁掉子 View

`FrameLayout` / `LinearLayout` 的背景 drawable 画了圆角、里面再放一个铺满的 `ImageView` 时，**背景圆角不裁子 View**：图片（`match_parent` + `centerCrop`）画在背景之上，把四个角完整盖住，渲染出来是直角。实测：设计稿「容器 8」72×87 `borderRadius: 8px`，实现是「背景带圆角的 `FrameLayout` + 铺满的 `ImageView`」，截图放大 4 倍看四角，首行像素内缩恒为 0（应约 13px）。

- 设计稿把圆角写在容器节点上，位图节点通常没有 `borderRadius`；实现把圆角画在背景 drawable 上——两边单看都说得通，所以只看 DSL 或只看 drawable 都发现不了，只有角点像素能。
- 修法：容器加 `android:clipToOutline="true"`（拿背景 drawable 的圆角轮廓去裁子 View），或换工程里能裁圆的图片控件（`ShapeableImageView` 这类）。只给背景 drawable 圆角、不加裁切，等于没做。
- 复用模块的 `bg_` drawable 当轮廓时先确认它是圆角 shape：直角 drawable 的 outline 就是矩形，`clipToOutline` 不起作用，这时按本页设计值另立 drawable。
- 确诊方式：`uiautomator dump` 里没有圆角这个属性，缩略图也看不出来（8dp 圆角在 2x 屏只有约 13px 的弧）。取角点像素的判据同 [SKILL.md](SKILL.md) 完成标准：首行内缩 ≈ 半径，`dy` 行内缩 `r − √(r²−(r−dy)²)`；四个角都要看。

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

## FlexboxLayout 默认 nowrap，会把 chip 压扁

`com.google.android.flexbox.FlexboxLayout` 的 `flexWrap` 默认是 `nowrap`、`flexShrink` 默认 1。不写 `app:flexWrap="wrap"` 时，超额的子项会被**压扁**而不是换行：定宽项（设计写死 72）实测只剩 44.3，`wrap_content` 的标签项直接被压成一个字（「照顾孩子」渲染成「照」）。本次「我要护工」两个页面都中招。

判据（uiautomator 里 `text` 仍是完整文案，**只看文案清单会全部通过**，只能量控件宽度或看截图）：

- 同行多项的宽都相等且小于设计值 → 被 shrink 了。例：`6 × 72 + 5 × 12 = 492 > 327` 可用宽 → 每项被压成 `(327 − 5×12) / 6 = 44.5`（实测 44.3）。
- 定高容器里最后一行的高度小于设计值 → 内容溢出被裁。例：容器 54（设计 = 2 行 24 + 行距 6），子项还各带 6dp `bottomMargin` 后内容变 60 → 第二行只剩 18 高。

修法：

```xml
<com.google.android.flexbox.FlexboxLayout
    app:flexWrap="wrap"              <!-- 必须显式写，默认 nowrap -->
    app:alignItems="flex_start"
    app:justifyContent="flex_start"
    app:alignContent="space_between"  <!-- 容器定高、行数固定时用它分配行距 -->
    android:layout_height="54dp" />   <!-- 2 行 24 + 行距 6 -->
```

- 行距不要用「每个子项都带一个 `bottomMargin`」：末行那个尾巴会多算一次、撑破定高容器。优先容器 `alignContent="space_between"`；改成 `wrap_content` 会改外层链条，要连带把高度补回去。
- 每行最后一个子项的 `marginEnd` 同样会被算进宽度、可能提前换行；要「每行 N 个」就按行序去掉行尾那一个的横向 margin（`index % N == N - 1`）。

## 带「行高」字样的 dimen 不一定是行高

`nursing_line_height_16` 这类以字号命名、值却是行高的档位（该项目里 `_16 = 22dp`）很容易被当成「16dp 的小行」。设计稿 `容器 9` 是 `22(姓名行) + 4(gap) + 16(资料行)`，把资料行写成 22 就让右侧列从 42 变 48，把下面定高的标签流挤出容器、第二行被裁 6dp（实测容器 47.4 高、第二行 18 高）。

判据：卡内链条用设计稿每个子节点的**高**逐项相加，和要等于容器高（`22 + 4 + 16 = 42`）。差几 dp 就去翻 dimen 的真实值，不要相信 dimen 名字。定高的文字行在忽略 `lineHeight` 的 ROM 上要配 `android:includeFontPadding="false"`，否则 16dp 的行会裁字。

## 模块不要新建 dp / sp / 颜色：先查 TobBaseResource 的 `dp_*` / `sp_*` 标尺

`TobBaseResource` 不只有语义档：`dp_*` 有 1201 档（`dp_0`…`dp_600`，含 `.5`）、`sp_*` 有 100 档，形状值几乎全在里面。**同一个值只要 TobBaseResource 有，就不许在模块里再建一份——包括「语义别名」。** 判据很简单：`grep '<dimen name="dp_17"' <TobBaseResource 的 values.xml>` 有 `17dp`，模块就不该有第二个 17dp。

代价是实测过的：一个测试模块里 138 个模块 dimen，**逐个查下来 138 个都能在 TobBaseResource 找到同值的 `dp_*` / `sp_*`**——等于把标尺抄了一遍，改一个设计值要改两处、还会漂移。删掉之后模块的 `values/` 只剩颜色文件里的设计稿专有色。

**Kotlin 是唯一的硬约束**：工程开了 `nonTransitiveRClass`，业务模块的 Kotlin 取不到依赖模块的 R（实测写 `com.yilife.android.bu.module.tob.resource.R.dimen.dp_26` 编译报 `Unresolved reference: R`）。以往模块别名几乎都是为了「代码里要设这个值」而建的。正确做法是把值搬回 XML，而不是新建模块资源：

| 代码里原本在设 | 改成 |
| --- | --- |
| `tab.setTabItemHeightPx(resources.getDimensionPixelSize(...))`、`setTabItemSpacingPx`、`setTabTextSizePx`、`setTabTextColors`、`setTabDefaultBackground`、`setTabIndicator*` | 布局里的 `app:universalTabItemHeight` / `ItemSpacing` / `TextSize` / `SelectedTextColor` / `DefaultTextColor` / `DisabledTextColor` / `DefaultBackground` / `Indicator*`（枚举值小写：`normal` / `tag` / `card`、`equal` / `fixed` / `wrap_content`） |
| `radio.setRadioIconSizePx` / `setCheckboxIconSizePx` / `setCheckboxCheckedIcon` | item 布局里的 `app:radio_iconSize` / `app:radio_iconPadding` / `app:checkbox_iconSize` / `app:checkbox_iconPadding` / `app:checkbox_checkedIcon` / `app:checkbox_uncheckedIcon` |
| inflate chip 后 `(root.layoutParams as FlexboxLayout.LayoutParams).marginEnd = gap` | 间距写在该 item 布局的 `layout_marginEnd` / `layout_marginBottom` 上；只有「行尾清零」这种索引逻辑留在代码里（`if (index % N == N - 1) marginEnd = 0`） |
| 选中态 `setTextColor(ContextCompat.getColor(this, if (sel) R.color.a else R.color.b))` | `res/color/` 选择器：`<item android:state_selected="true" android:color="@color/color_primary"/>`，布局里 `android:textColor="@color/..._selector"`，代码只切 `view.isSelected = sel` |
| 多行文本按行数写死块高（`layoutParams.height = 64dp/96dp`） | `android:maxLines` 在代码里切（Int，不需要资源），行距用 `android:lineSpacingExtra`；实测 12sp 文字 + `@dimen/dp_2.5` 正好是设计稿 16dp 的行距，块高自然落到 64 / 96，不依赖被 ROM 忽略的 `android:lineHeight` |

**值确实 TobBaseResource 没有时才新建**，并在分析文档 ResourceMap 的备注列写明「TobBaseResource 无此值」。

**机械替换的坑**：把 `@dimen/nursing_x` 批量换成 `@dimen/dp_N` 时，短名是长名的前缀会漏网——`nursing_report_dot`（5dp）会命中 `nursing_report_dot_gap`（4dp）的前半段，变成 `@dimen/dp_5_gap`；`nursing_order_row_height` 命中 `..._form` / `..._line` / `..._2line`。替换后必须扫一遍 `grep -rE "@dimen/(dp|sp)_[0-9.]+[a-z_]" res/`，命中即残渣，按「谁是谁的前缀」反查真实值逐个修正。

## XML 布局要带 tools 预览属性（tools:text / tools:src）

布局里那些**由代码 `setText` / `setImageResource` 填值的控件**（列表 item、页头字段、卡片正文、动态图标位），一律补一个 `tools:text` / `tools:src`，值就写设计稿上的那一条真实数据。根节点加 `xmlns:tools="http://schemas.android.com/tools"`。

```xml
<TextView
    android:id="@+id/tv_follow_name"
    android:textColor="@color/text_gy1"
    tools:text="马小跳" />

<ImageView
    android:id="@+id/iv_follow_avatar"
    android:scaleType="centerCrop"
    tools:src="@mipmap/nursing_ic_follow_avatar" />
```

为什么：

- 没有 `tools:*` 时，**预览里这些控件全是空白**，只能靠跑真机截图对照设计稿；预览是唯一能在写布局阶段就看出「字号不对 / 行数不对 / 图片位空着」的手段。
- `tools:*` 只在 IDE 预览生效、**不进 APK**，不影响真机表现，也不与代码里的绑定冲突（同名的 `android:text` 只在写死文案时用）。
- 列表的 RecyclerView 补 `tools:listitem="@layout/xxx_item"`，预览里直接看到整行卡片，不用把 item 布局单独打开猜。

对照检查：布局里每个 `@+id/` 且代码里会 `setText`/`setImage*` 的控件，都应该有对应的 `tools:` 值；反过来，静态文案（设计稿写死、代码不碰）直接写 `android:text`，不要再写一遍 `tools:text`。

## 验收假通过

回台验证本身会骗人，下面几种都实际踩过：

| 假通过 | 真相 | 防法 |
| --- | --- | --- |
| 「判据文案消失 = 切页成功」 | 是崩溃后回到了桌面 | 每一步先断言前台是本页面，并看 `adb logcat -b crash`（本机型 `logcat -c` 不可用，可用 `-b crash` 条数增量） |
| 「设了参数但没生效」 | 装的是旧包，或 `adb install` 没真正完成 | 确认安装输出 `Success`、`lastUpdateTime` 已变，再量数据 |
| 「装完就生效了」 | 安装被中断/回滚，设备上的 `base.apk` 还是旧包——**`lastUpdateTime` 变了、进程也是新的，只有包内容没变**（实测：时间戳 17:23→17:28、进程 ETIME 01:14，但设备上的 `base.apk` 与本地新包 md5 不同、新属性零命中） | 装完**回读设备上的包**校验内容，不看时间戳：`P=$(adb shell pm path <包名>\|sed 's/package://')` → `adb pull $P` → 本地 `md5 -q` 与构建产物比；或直接 `aapt2 dump xmltree --file res/layout/xxx.xml <拉下来的包> \| grep 新属性` |
| 「量出来的数字全是旧的」 | dump 与截图不是同一帧：滑动后的动画没停就先后取了两份数据，按 dump 的坐标去截图里量，块位置差十几 px（实测照片少了 19px，看着像图片没铺满） | 滑动后先等动画停（≥5s）、dump 与截图紧邻取；量之前先用一个已知 ID 的节点 bounds 交叉校验截图，对不上就重取 |
| 「断言 `clickable` 失败」 | 可点区在文字外面的容器上，不在文字节点 | 取包含文字中心的最小可点节点 |
| 「同一文案判定错行」 | 同一段文案在多排结构里重复（如「全部」同时在两排），按文案取到第一个 | 先按行容器定位，再在容器范围内找项 |
| 「切页没生效」 | 点击时页签行还在滚动，或翻页动画未结束 | 点击前等锚点位置稳定，断言用轮询等状态而不是单次 dump |
| 「块内尺寸全对、卡片位置也对」 | 只量了块内尺寸和块间间距，没量绝对 y；间距被两层各吃一次时这几项都是正常的 | 逐块对设计稿的绝对 y（见下节） |
| 「用的是这次实测的数字」 | 数字来自改动那一版之前（重构、加一层 padding、换容器后链条已变） | 结构一改就整表重跑，交付说明标注测量版本 |
| 「uiautomator 报的 bounds 就是绘制范围」 | 它被系统栏裁过（本机所有节点底边都停在 2302，屏幕高 2412） | 判「压扁 / 裁切 / 被系统栏盖住」一律用截图扫像素；uiautomator 只用来确认节点在不在树里、文案和点击目标对不对 |

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

大包（200MB+）装机走 `adb push` 到 `/data/local/tmp` 再 `pm install`：`adb install` 是流式安装，中途断掉容易留下「时间戳变了、内容没变」的假象，而 push + `pm install` 每步都有可校验的结果（设备侧文件大小/md5）。

## 选中态 / indicator 只声明在其中一个容器里

页签的 indicator 如果只手写在某一个页签容器内，切到别的页签时 `findViewById` 在其它容器返回 null，原容器又被设成 GONE，指示条会永久消失。选中态和 indicator 交给组件托管（本项目用 `UniversalTabLayout`），业务布局里不放 indicator View。

## uiautomator 的 bounds 不是真实绘制范围

验收「控件有没有被压扁 / 被裁掉」时，`uiautomator dump` 里节点的 `bounds` 会被**系统栏裁掉**。实测（手势导航，屏高 2412）：所有节点的底边都被截到 2302——底部弹层面板报 `[0,1881][1084,2302]`（421px）、里面的保存条报 46px，看着像被挤扁；同一时刻截图逐行扫像素，那颗保存按钮是 `2268..2399` 的完整 132px（46dp），面板白底一直铺到 2411。差掉的 110px 只存在于 uiautomator 的裁剪里，不在绘制里。

- uiautomator 只能用来确认「节点在不在树里、文案对不对、点击目标对不对」；**不能**用来判断尺寸有没有被裁。
- 判「压扁 / 截断 / 被系统栏盖住」一律用截图：按行扫一列像素、按颜色分类连续段，看每段的起止 y。采样列要避开文字（文字会把色段切碎），本页用面板左白边（x=20）和卡片中线（x=542）两列交叉验证。
- 这个坑会让结论完全反掉：本次先得出「保存条被压扁成 46px，去改布局」，而布局本来是对的。

## 贴底页面 / 底部弹层的底部留白：系统 inset 可能就是 0

设计稿底部那条 34（iOS 的 home indicator 条）在 Android 上没有等价的固定值。实测华为手势导航（`navigation_mode=100`）：`WindowInsetsCompat.Type.navigationBars()` 与 `Type.systemGestures()` 返回的 bottom **都是 0**（窗口本来就铺满整屏，系统不占位），只按 inset 补底边等于没补——整条保存按钮压在 `2292..2412` 的手势条上；三键导航（不透明导航栏）的设备上，按钮最下面 38dp 会被系统栏直接盖住，用户会说「这个按钮我看不见」。

- 底部留白取 `max(系统导航栏 / 手势 inset, 设计稿的手势条高度)`。本项目模块已有档位 `nursing_bottom_inset`（34dp，2:7562 也在用），直接引用，不要另立同值 dimen。
- 用工程基类 `BaseDialogFragment` 时窗口是浮动窗口、位置本身已避开系统栏，这时再按 inset 补一次会补重：这种情况直接用设计稿那 34dp（写进布局的 `paddingBottom`，不用运行时算）。
- 反例（本次）：`windowIsFloating=false` + `setDecorFitsSystemWindows(false)` 的全屏窗口，系统 inset 为 0，按 inset 补 0 → 面板顶比设计低 98px，保存条整条压在系统手势条里。
- 验证方式：截图量保存条下沿到屏幕底边的距离（本机 110px = 34dp 留白 + 保存条自身 4dp 内边距 + 取整），并确认按钮下沿落在系统栏之外。
