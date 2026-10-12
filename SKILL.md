---
name: mastergo-ui
description: >-
  Use when the user mentions MasterGo, 设计稿, 设计链接, page_id, layer_id,
  DSL, D2C, 还原界面, 出 UI, or asks to inspect or implement a screen from a
  MasterGo file.
---

# MasterGo 出 UI

先拿到设计数据，再按本仓库已有基类和 TobBaseResource 落代码。本技能不限定 AI 工具；优先复用当前会话中可用的 MasterGo MCP。缺少所需能力时按 [reference.md](reference.md) 为当前 AI 工具检查或接入，不要编一版界面；不要用浏览器、移动设备截图或猜测数据替代 Magic MCP。

按任务选择能力：Magic 读取设计链接，Vibe 读取当前选中图层或操作画布。`mastergo-magic-mcp`、`mastergo-vibe` 只是示例服务名，不要求固定别名。本地启动 Magic 时通过进程环境注入 `MG_MCP_TOKEN`；令牌不进仓库、不写进共享 MCP 配置、不在对话中输出。

## MCP 访问预检

1. 查看当前会话的 MCP 工具列表，按任务确认所需能力，而不是只检查配置文件或服务名。已连接且可读设计数据时直接复用，不要求用户重复安装或提供本机令牌。
2. 读取实际工具名称、描述和参数 schema。下文的 `getPageLayers`、`getDsl` 等是能力名称参考；客户端命名空间、前缀、服务别名或版本不同，使用实际暴露的对应工具，不硬编码某个 AI 工具的调用格式。版本缺少所需能力时说明缺失，不虚构调用。
3. 能力缺失时，识别当前 AI 客户端及其 MCP 接入方式，按 [reference.md](reference.md) 选择配置入口、格式和环境变量传递方式；客户端不明先询问。只配置任务需要的服务，不覆盖现有配置、不要求改用 Cursor。修改后重载或重新连接，确认工具在当前会话出现。
4. `MG_MCP_TOKEN` 存在不等于授权成功。Magic 必须实际调用页面图层查询（如 `getPageLayers`）或其他只读设计接口验证。Vibe 也需用只读选中图层接口确认连接。
5. `401`、错误码 `10002` 表示 token 无效/过期，或账号没有 MasterGo 团队版编辑席位/研发席位；先解决授权，不要继续读 DSL。
6. MCP 进程能启动只代表协议服务可用，只有设计接口返回图层数据才算访问条件满足。所需能力仍不可用时停止设计实现并说明原因。

## 先判断任务类型

- **规格检查**（尺寸、颜色、字号、间距、状态）：`getPageLayers` → 对顶层图层调用 `getDesignSections` 概览 → 只读取目标组件 section 的 DSL。不要获取全部 section，不要生成 HTML，不要调用 `applyDesign`。
- **页面还原**：才执行完整的 section 列举、逐 section DSL、SVG 占位符、HTML 和 `applyDesign` 流程。

## 开工检查

```
进度：
- [ ] 有 mastergo 链接 → Magic；改当前画布或读选中图层 → Vibe
- [ ] 当前 AI 会话已暴露所需 MCP 能力，实际工具名称和参数已确认
- [ ] 知护办 Android 工程：读 [android-tob.md](android-tob.md)。其他工程读 design-system/mastergo.md（有才读）
- [ ] 取到设计数据
- [ ] 先写页面结构、组件、资源、布局、状态五项分析，没有待定值才写布局；模板见 [templates/android-ui-analysis.md](templates/android-ui-analysis.md)
- [ ] 列出复用的组件 / 必须新建的组件
- [ ] 先组件，后页面
- [ ] 核对文案、间距、颜色、设计稿里已有的状态
- [ ] 每块区域先定：自己绘制、用图标，或自定义控件。自定义控件写下效果和传入的数据
- [ ] 对着设计图把每个区块写成「形态 → 组件 → 行为」，形态按 [先看形态，再定组件](#先看形态再定组件) 判；一页有多排同形态结构时逐排写
- [ ] 写布局前读 [android-pitfalls.md](android-pitfalls.md)（尺寸塌陷、代码拼布局、写死尺寸）
- [ ] 布局里由代码 setText / setImage* 的控件带 `tools:text` / `tools:src`，列表带 `tools:listitem`（预览要直接看到设计稿数据；规则见 [android-pitfalls.md](android-pitfalls.md)）
- [ ] 尺寸 / 颜色先查 TobBaseResource 的 `dp_*` / `sp_*` 与语义档；有同值就不在模块新建（组件配置写 XML、间距写 item margin、状态色写 selector）
- [ ] 知护办：资源名带模块前缀，控件 ID 只带类型前缀，控件按 UniversalComponents → 已接入三方 → 原生选用
- [ ] 知护办：图标先用 UniversalComponents，没有再从 MasterGo 取 webp，按 `{prefix}_ic_` 放进当前模块 `mipmap-xhdpi`
- [ ] 颐挚：已检索 UniversalComponents，且当前模块 `build.gradle` 已有 `implementation Module.universalComponents`，能复用时不得复制或重写
- [ ] 颐挚：禁止硬编码颜色、尺寸和用户可见文案；页面基类、生命周期、ViewModel / UiState 职责符合项目规范
```

## 链接还原（Magic）

链接要带 `fileId` 和 `layer_id` / `page_id`，或短链 `/goto/...`。文件在团队项目里。

### ID 分流

- URL 使用 `?page_id=`：这是页面容器 ID，先调用 `getPageLayers(fileId, layerId)`，再从返回的顶层 FRAME/COMPONENT 中定位真实 `layer_id`。
- URL 使用 `?layer_id=`：这是内容图层，可直接调用 `getDesignSections`。
- 不要把 `page_id` 直接传给 `getDesignSections`；页面 ID 通常只能用于列举子图层。

### 页面还原流程

1. 对真实 `layer_id` 调用 `getMeta`（完整页面或需要站点规则时）。
2. 大页面用 `getDesignSections`，小区块再用 `getDsl`。重复样式用 `format=tree`，逐字文案用 `format=json`。
3. 超时或过大时，按区块链接分开拉。
4. 映射到已有组件。会再出现的结构抽成共享组件。只出现一次的装饰留在页面里。
5. 只实现设计稿里有的状态。

### 规格读取原则

- 先记录来源的 `fileId`、真实 `layer_id`、section ID，再引用尺寸和颜色。
- 读取 DSL 时同时提取：节点尺寸、容器尺寸、字号/行高、节点与文字间距、Item 间距、连接线宽度/颜色、节点填充/文字/描边颜色、各状态差异。
- `structureSiblingCount` 相同不代表内容相同；只有页面还原才需要完整读取全部 section，规格检查只读取与问题相关的 section。
- 设计稿本身会有伪影，不要照抄成缺陷：`flex-end` 加溢出会把首项裁到容器外；页面内重复图层、`name` 等于文案的组件库占位文本都属此类。判断依据是该处不合常理（首项被裁、文案是组件名），按可用的等价布局还原，并在交付说明里写清楚。
- `_placeholder: true` 只当提示，不当删除依据：逐条看这段文字在页面上是不是真实内容（标题、页签名、选项、分值），不整批删。文案直接写在布局里，不抽 `strings.xml`。
- 同一个文本的颜色会有三个来源且互相矛盾：节点级 `fill`、节点级 `_color`、逐字 `textColor`。这三者打架算 UI 事故，按「同一个语义组里出现次数最多的颜色」取值（例如同一行 4 个分值都被算一遍，而不是只看当前节点的两个字段）。选中 / 未选中 / 禁用造成的颜色差异不算冲突，那是状态色，按 `textColor` 取各自的值。次数相同或只有一个来源时，固定选一种落地，不来回改，并把冲突写进交付说明。不要因为 Magic MCP 说「优先 `_color`」就照抄 `_color`：组件实例的节点级 `fill` 常是组件基底传下来的过期值。
- **页面级背景在 section 列表之外**。`getDesignSections` 的列表响应里有 `splitContainers`，那是铺在内容下面的整块背景层（例如「375×1153 @0,100 白底」的内容底、「351×385 @12,544 灰卡」），section 列表只给内容节点。只读 section 会漏掉整块底色，症状是「标题下方少了一块背景」。开局先把 `splitContainers` 逐层写进 PageStructure 的「页面层」，再对 section。
- **背景按纵向区段分区，逐段指到图层，不许用根布局底色兼顶**。实现里常见的错法：为了把状态栏染成导航栏的白色，把根布局设成白，结果导航栏以下（页签区、内容区）继承了根底色、整段变白——设计稿那里其实是页面灰 `#F6F6F6`。正确的做法是在 PageStructure 里写一张背景分区表：把页面从上到下切成区段，每段写「设计稿哪一层负责 / 颜色或圆角 / 实现里哪个 view 负责」，**任何一段不允许是「没写，跟根底色」**。典型分区：状态栏+导航栏（导航栏自己的 fill）→ 导航栏下到页面底（`rootContainer.background` 一般是页面灰，需要一层专门的容器承担）→ 内容底（`splitContainers` 里那层，透明也要写清楚「透出上一段」）。
- **摘要字段不含圆角、描边、内边距，拿到 id 要回查该层自己的元数据**。`splitContainers` 只给 `name/type/id/宽高/x/y/background/fill`；圆角在该层的 `rootMetadata.borderRadius`（形如 `"12px 12px 0px 0px"`，四角可不同）、内边距和描边也在那里。用同一工具传 `layerId=该 id` 再查一次就能拿到。不回查只能猜，猜错就是把整块背景画错：本例白色内容底实际是「上两角 12px、下两角 0」，灰卡实际 8px（按同类卡片猜 12 就错了）。
- **`fill` 和 `stroke` 一起读**。白底卡片落在白色内容底上时，卡片的边界完全靠 `stroke`（常见 `border_lighter` 1px）支撑；只抄 `fill` 会得到一堆看不见的白块。同理，白底按钮的 `stroke` 跟 `fill` 同时出现时不要只取一个。
- **按设计稿的绝对 y 对账，不要只用相对间距拼积木**。每层各自吃一个边距 token 单看都对（页边距 12、卡片间距 12），累加就错：页签到卡片设计只隔 12dp，实现里 Activity 的 ViewPager2 有 `marginTop 12`、分页布局又整块 `padding 12`，两处都吃了一次 → 实测卡片顶 149.5dp、设计 139dp。规则：PageStructure 每块要写**设计稿绝对 y**（或距页面顶的距离）；LayoutSpec 里同一段间距**只能有一个来源**（要么容器 padding，要么子项 margin，二选一，禁止两处都吃）；相对间距只用来表达设计稿内部重复单元的节距（行距、chip 间距）。

## 先分析页面，再动组件代码

拿到设计数据不等于可以写代码。先把页面拆成结构，再判断每块的形态和组件，最后才写布局和样式。形态认错要重做，结构拆错则组件、间距、状态一起错。

分析产出五项中间结果，没填完不进入实现：

| 结果 | 内容 | 完成条件 |
| --- | --- | --- |
| PageStructure | 页面 → 区域 → 容器 → 重复单元的层级树 | 每个区块都能归到一个区域，重复结构已标出 |
| ComponentMap | 区块 → 形态 → 组件 → 行为 → 复用来源 | 每块都写了组件和行为，复用项有工程出处 |
| ResourceMap | 设计值 → TobBaseResource / 模块资源 / 图标来源 | 颜色、尺寸、字号、圆角都有出处，无待定值 |
| LayoutSpec | 页面边距、区块间距、Item 间距、组件尺寸、对齐、圆角 / 描边（逐元素） | 关键数值能对着设计稿量出来 |
| StateSpec | 默认 / 选中 / 按下 / 禁用 / 加载 / 空 / 错误态 | 只列设计稿里真实出现的状态 |

模板见 [templates/android-ui-analysis.md](templates/android-ui-analysis.md)；知护办的资源、组件和基类选用见 [android-tob.md](android-tob.md)。

分析写进模板的实例后，跑 `scripts/check-ui-analysis.sh <分析文档>`：exit 0 才进实现，报缺项就补齐，不带着空项写布局。

页面结构按三层看，不要一上来就盯节点坐标：

1. **页面层**：标题栏、页签、内容区、底部操作区；哪些固定、哪些滚动。
2. **区域层**：卡片、分组、筛选区、列表区；边距和间距由哪一层承担。
3. **内容层**：重复单元、单条字段、图标位；哪些随数据变化。

间距先定层级再定数值：页面边距、区块间距、Item 间距、组件内间距是四个不同的量，不要一个数值一把梭；设计稿量出的具体值填进 LayoutSpec。对不上的地方按 [规格读取原则](#规格读取原则) 判断伪影，不照抄。

**卡内每一行都要写清行内对齐，不能只写行高。** 区块高度和行距对得上，不代表行内文字位置对：设计稿的「行」节点除了高，还常带自己的 `padding`（如 `0px 0px 12px`）和 `alignItems`，它决定文字是贴行顶还是居中。实现时一律用 `gravity=center_vertical` 会把整排文字推低 5–6dp，症状是「第一段间距偏大、最后一段偏小、卡片底部留白偏大」——而区块高、行距、分割线、文案全都对得上。LayoutSpec 里按行写四项：行高 / 行内 padding / 内容对齐（顶或中）/ 文字相对 y。带分割线的行，分割线画在行的底边（设计稿是 `strokeWidth: 0px 0px 0.5px`）；**分割线位置对不代表文字位置对**，它恰恰会掩盖文字偏低。

结构拆完之后，每个区块的形态判定走下一节。

## 先看形态，再定组件

看设计图先认形态，再选组件。形态认错，后面写多少代码都是重做。按「一眼看到的形状」判断：

| 设计稿里的形态 | 是什么 | 必须有的行为 |
| --- | --- | --- |
| 一排文字，选中项带下划线 / 变色 / 加粗 | 页签 | 点了换内容，要有真实内容容器（如 `ViewPager2`），不是只换文字颜色 |
| 一排连体按钮，选中项是实色块 | 分段页签 | 同上，只是同一套页签组件的另一种样式 |
| 一排纯文字，选中项变色、无下划线 | 无指示器页签 | 同上，只是页签组件关掉 indicator |
| 输入框右端带 `▾`，或点了要选一个值 | 下拉 / 单选 | 点击弹层，选中回填到控件 |
| 整行右侧带 `>` 且可点 | 可跳转列表项 | 点击跳转，按下有反馈 |
| 间距一致、结构相同的重复行 | 列表 | 用列表容器 + 列表项布局，不要复制多份静态行 |
| 顶部固定高、左侧返回图标、居中标题 | 标题栏 | 状态栏留白，返回可点，标题基线与字号对齐 |
| 左侧竖线 + 圆点的记录 | 时间线列表 | 条目由列表承载，竖线随条目高度伸缩 |
| 底部一排图标 + 文字 | 底部导航 | 用导航组件承载，切换有选中态 |
| 圆角块 + 文字 | 按钮 / 标签 | 按是否可点决定用按钮还是标签 |

判定经验：

- **同一个组件有多种样式**。下划线页签、分段按钮组、纯文字页签是同一套页签组件的三个样式参数，不是三个控件，也不要手写。
- **一页里可能有多排同形态结构**。设计稿常有 2–3 排页签（页面页签 / 分段筛选 / 文字筛选），每一排都要单独识别，不要只做第一排。
- **有交互语义就不是装饰**。带 `▾`、带 `>`、带选中态的结构都要挂能点、能回填的组件；只画形状不算还原。
- **认不出就先问**。把一块当成什么组件，会直接决定后面所有代码；认不出时问一句比返工便宜。

形态识别放在开工阶段：对着设计图把每个区块写一遍「形态 → 组件 → 行为」，再动手写代码。

## 自己绘制，还是用图标

先分节点，再动手。结构自己画，图形用资源。

自己绘制：容器、卡片、列表、按钮、标签、分割线、文字。纯色、线性渐变、圆角、描边、阴影也写在样式里。这些有宽高和间距，用布局表达。

用图标：设计稿里的 PATH、图标、插画、蒙版装饰。放进和节点一样大的容器，用导出的 svg 或图片，不改形状。人形、爱心、波形、月亮这类象形都算图标。不要用矩形、圆形或 `background-image` 去仿。填充渐变写在 svg 上，不要写到 `img` 的背景上，否则透明轮廓会变成色块。不得用 `rotation`、镜像、缩放复用另一个图标顶替设计稿图标。

图标资源本身画不出来时，仍然用图，不要改成手绘。包括：`foreignObject`、`backdrop-filter`、`mask`、`clip-path` 叠在一起；对照截图后变成色块、缺一层、或画出容器外。从设计截图按该图形的像素范围裁一块，贴回原位。裁图只盖这块图形，不盖文字和布局。不要整页换成一张截图。

MasterGo 图片导出经验：当前 `mastergo-magic-mcp` 的 `extractSvg` 只返回 SVG/PATH 字符串，不提供 PNG/WebP 二进制导出。需要像素图片时，要求用户从 MasterGo 客户端导出 PNG；不要把 MCP 返回的 SVG 本地转换后冒充 MasterGo 图片，也不要手写 Vector XML 替代图片。客户端导出的 ZIP 通常按 `mdpi` / `hdpi` / `xhdpi` / `xxhdpi` / `xxxhdpi` 分目录，按需求只接入指定密度；用户要求 xxhdpi 时只接入 `xxhdpi`，再按工程要求转为无损 WebP，放入对应 `mipmap-xxhdpi`，不要无选择地复制全部密度。资源目录和命名按组件引用方式及工程规范选择，代码使用 `ContextCompat.getDrawable` 时可通过 `R.mipmap` 引用 mipmap 图片资源，文件名带模块前缀。

## 什么时候用自定义控件

图标和布局定完之后，看这块要不要成控件。先写它要呈现的效果，以及会不会随数据或状态变化，再选实现。

用已有控件：按钮、输入、列表、Tab、弹层、下拉刷新、空态、轮播，以及只切换开/关颜色的开关。组件库、已接入三方或原生控件能表达该效果，就不新建。

按「先看形态，再定组件」定完形态后，有交互语义的结构一律挂已有组件，不另写一套。

选定组件后，落代码前核对三件事，不要靠猜：

- **组件有没有这个能力**。读它的属性枚举和 API，而不是先写再试。设计稿要的布局方式在枚举里就不存在（例如页签的「内容宽 + 固定间距」），那就是能力缺失，不是自己写法不对。
- **组件的默认值会不会改写设计稿数值**。默认内边距、默认间距、最小尺寸都会吃掉量好的宽高；实测尺寸对不上设计稿时，先算这个差值。
- **能力确实缺失时的顺序**：先用现有配置表达 → 再考虑扩展公共组件（公共 API 变更要先征得确认）→ 只能近似还原时，把偏差写进交付说明，不要闷着做。

用自定义控件：现有控件只能近似，设计稿要求的效果会丢。

- 数据驱动的非矩形图形。环形进度、多段弧、仪表、波形、点状趋势。数值一变，图形要重画。
- 轨道和滑块的形状、尺寸按设计稿来，不是系统开关换个颜色。
- 裁切、蒙版、重叠热区要能点。一张静态图或普通布局保不住点击和状态。
- 同一块有多套视觉状态，并且状态跟业务数据走，例如正常、偏高、未绑定。

静态装饰用图标或裁图，不做成控件。没有数据、没有交互、只出现一次的结构留在页面里。

处理时记下四件事：效果、现有控件为什么不够、控件负责画什么、外面传进什么数据。会再出现的抽成共享组件。只服务当前页、但效果属于上面几类的，仍然单独成控件，绘制不散在页面里。知护办的选用顺序和命名见 [android-tob.md](android-tob.md)。HTML 把这块抽成独立组件，页面只传数据。

## 颐挚 UI 生成约束

Obsidian 中的「颐挚项目技术规范（AI速查手册）」及其 UI、资源、基类子文档是颐挚 Android 的规范来源。按任务只读取需要的子文档，不凭经验补一套视觉或架构规则。

### 组件优先级

生成或还原 UI 前，先在当前工程和 `UniversalComponents` 中检索已有组件、基类、资源及调用示例，并记录复用项。选用顺序固定为：

1. `UniversalComponents` 已有组件（按钮、输入、选择、弹层、空态、Tab、日历等）；
2. 工程已接入的三方组件；
3. Google / AndroidX 原生组件；
4. 只有前三档无法表达设计效果时，才在业务模块新增控件。

不要复制已有组件、另加依赖或新建第二套按钮、导航、列表单元。UniversalComponents 走远端 maven：常量是 AppShell `Dept.kt` 的 `Module.universalComponents`，模块 `build.gradle` 用 `implementation Module.universalComponents`；缺依赖时只补这一行，不写死版本、不新增其他依赖。图标同样先找 `UniversalComponents`，没有再从 MasterGo 取 webp，按 `{prefix}_ic_` 放进当前模块 `mipmap-xhdpi`。

### 页面与 UI 分层

- Activity 默认继承 `com.yilife.android.arch.page.page.BaseActivity`（模块 `build.gradle` 加 `implementation Module.basePage`），入口是 `afterCreate(Bundle?)`，初始化顺序固定为 `initView()` → `initListener()` → `initData()`；ViewBinding 用 `private val binding by bindings<XxxBinding>()`，委托内部已 `setContentView`，不要再手动 inflate + `setContentView`。禁止直接继承 `android.app.Activity` / `AppCompatActivity`，也禁止重写 `onCreate`。
- `BaseActivity` 继承自 `androidx.appcompat.app.AppCompatActivity`，所以它的 Manifest 主题必须是 AppCompat 系（如 `Theme.AppCompat.Light.NoActionBar`）；配 `Theme.DeviceDefault.*` 会启动即崩。
- 例外：UI Kit / 基础模块内部的 Demo、第三方适配或依赖条件不满足时可不继承，但要在交付说明里写明原因。
- Fragment 默认使用 `BaseFragment` 的 `bindRootView()`、`initData()`；ViewBinding 在 `onDestroyView()` 置空。
- ViewModel 只编排页面状态、请求和用户意图，不持有或直接操作 View、Binding、Context、Adapter、Dialog 或 PopupWindow；跳转、Toast 和弹窗由宿主执行。
- `UiState` 只承载同一块 UI 的强关联展示结果；一次性事件、输入值和不同消费方的状态拆开传递。
- UI 复杂度优先下沉到 ViewModel、Mapper、Policy、Controller 或具体 `ui/view`，不要泛化出 `Helper`、`CommonUtils`、`DataUtils`、`ViewUtils`。
- Kotlin 属性 setter 只赋值；需要刷新 UI、校验或重新绑定时使用显式 `setXxx()` 方法。

### 跨模块与双端调用

Maven 包会被 Java 与 Kotlin 模块同时依赖，对外入口按 Java 可调用的形态暴露：

- `object` / `companion object` 的对外方法和属性加 `@JvmStatic`，Java 端才写 `XxxManager.bar()`；不要把 `INSTANCE` 当对外约定。
- 顶层 `fun` / `val` 不做跨模块 API，放到 `object` / `class` 上（Java 会看到 `XxxKt.bar()`）。
- 跨模块公开模型用普通 `class` + `JSONObject` 与 `@JvmStatic` 工厂；禁止用 `data class` 当契约（`copy` / `componentN` 泄漏后增删字段易二进制不兼容），也不要拿 Gson/Moshi 序列化公共模型。模块内 DTO 仍可用 `data class`。
- 模块间跳转走 API 模块的 Route + Manager，不直接引用其他实现模块的类。
- 自查：`grep -rn 'INSTANCE\.' <调用方模块>/src | grep -v '/build/'`，命中处说明漏了 `@JvmStatic`。

## Android 资源核对（知护办）

在修改尺寸或颜色前，先检查模块是否依赖 `TobBaseResource`，再按实际值查找已有资源。优先级固定为：

```text
MasterGo token/十六进制或 dp/sp
→ TobBaseResource 已有资源
→ 仅在 TobBaseResource 确实没有该值时，才在当前模块新建
```

**TobBaseResource 有同值的 dp / sp / 颜色时，禁止在当前模块新建资源——包括「语义别名」。** 它的 `dp_*` 标尺有 1201 档（`dp_0`…`dp_600`，含 `.5`）、`sp_*` 有 100 档，形状值几乎全都在里面；语义档 `space_base` / `space_mini` / `space_micro` / `radius_small` / `radius_large` / `radius_larger` / `font_basic_*` 也在里面。所以「模块资源文件」在正常页面里应该只留**TobBaseResource 没有的那些值**（如设计稿专有的浅色底、8% 描边、页面底色），不应该是尺寸的仓库。

落地顺序（模块不新建的前提全靠这三条）：

1. **组件能靠 XML 属性配的，一律写进布局**：`UniversalTabLayout` 的 `app:universalTab*`（样式 / 模式 / 项高 / 间距 / 字号 / 内边距 / 选中加粗 / 三个文字色 / 默认背景 / indicator）、`CheckboxComponents` / `RadioButtonComponents` 的 `app:radio_*` / `app:checkbox_*`（图标尺寸 / 内边距 / 选中与未选中图标）。Kotlin 只在数据层面（`setTabs` 的标题与选中项）动。
2. **间距落回 item 布局的 margin**：chip / 标签流的横向纵向间距写在该 item 布局的 `layout_marginEnd` / `layout_marginBottom` 上，不要 inflate 后再用 `resources.getDimensionPixelSize` 补 margin。行尾要清零这类索引逻辑可以在代码里把 `marginEnd` 置 0，但值来自布局。
3. **状态色用 `res/color/` 选择器**：`state_selected` / `state_checked` 指向 TobBaseResource 的颜色，代码只切 `view.isSelected`，不在 Kotlin 里查 `R.color`（工程开了 `nonTransitiveRClass`，Kotlin 本来就取不到依赖模块的 R，这正是以往被写成模块别名的地方）。

只有 TobBaseResource 确实没有时，才在模块资源文件里新建，并在分析文档 ResourceMap 的「备注」列写明「TobBaseResource 无此值」，而不是笼统写「新增」。颜色核对不能只看节点主色，还要检查连接线、空心描边、节点底色、错误底色、文字和图标色。

方向互斥时，共用一个运行时配置字段没有问题：例如组件同一时刻只处于横向或纵向，`itemSpacingPx` 可以按当前方向使用一个默认值。不要仅因为两个方向的设计值不同就拆成两套属性；先确认是否会同时生效。

## 画布（Vibe）

客户端开着，文件内 MCP 在线，地址和端口与当前 AI 工具的 MCP 配置一致，以 MasterGo 客户端显示为准。操作画布时不要换页。

1. 用户先选中图层，再 `get_selection_code`。
2. 改样式用 `agent_update_node`，换图标或图片用 `agent_replace_node`。改父节点时保留全部子节点。
3. 用团队库：`get_library_list` → 用户选定 → `get_component_info` → `design_page` 来源 `component-library`。规范页用 `full-components`。
4. 只有用户明确说「同步到画布」才 `agent_sync_design`。只传静态 HTML 和根节点 id。`.kt`、`.xml`、`.vue`、`.tsx` 不能当同步文件。

`.mastergo/` 是画布缓存，不是业务源码。

## 完成标准

- 页面结构、组件、资源、布局、状态五项分析先于代码完成，每项都有出处，没有待定值。
- 没有第二套按钮、导航、列表单元。
- 交互结构真的能点：页签能切、下拉能弹并回填、返回能退。
- 能量化的设计值写成断言：项宽、间距、字号直接拿设计稿的数字去量实际控件（例如「项宽 29/29/57/57/57dp、间距 17dp」），不只看截图顺眼。
- 块高、颜色、圆角、位置逐块取像素断言，不只核对文案在不在。「看不出来」的属性（圆角、描边、内边距）最容易被漏，而这些恰恰是设计稿有明确值、截图又不显眼的地方。采样点要落在块内部：全宽的背景层，圆角只影响 `x < 半径` 的那一小块，采样点选在 x≥半径 的位置会误判成直角（判据：dy 行上白区左边缘 ≈ `r − √(r²−(r−dy)²)`，例如 r=35px 时 dy=4 应约 x=19、dy=12 应约 x=9）。
- **断言粒度要到「行」和「子元素」，不只到「区块」**。区块顶/底、区块高、文案、颜色全对，仍可能错在区块内部：卡内某一行的行内对齐、某个图片位的圆角。逐行取样：卡内每行取一个 y（文字字形顶或该行分割线的 y），和设计稿该行的相对 y 对一次（±2dp）；同一个块里至少取两行，否则整排等距偏移看不出来。实例：套餐内块三行节距实测 44.9 / 52.6 / 46.7dp，设计 39 / 52 / 52dp，而区块高 190、行距 16、两条分割线 y 全部正确。
- **圆角要问一句「谁在画」**：容器背景画圆角、里面又有 `ImageView` 或子 View 铺满时，背景圆角不裁子 View，图片会把圆角盖掉。角点采样必须落在**图片的角**（不是卡片角）上：放大 4 倍看首行像素，内缩应 ≈ 半径（r=8dp、2x 屏约 13px 起，逐行按 `r − √(r²−(r−dy)²)` 收敛到 0）；内缩恒为 0 就是圆角没生效。机制和修法见 [android-pitfalls.md](android-pitfalls.md)「容器背景的圆角不会裁掉子 View」。
- **底色也要断言，不只断言卡片和文字**。按背景分区表逐段采样：在页面边缘内侧竖着取一条像素，打印颜色变化点，确认每一段的颜色和分界位置与设计稿一致（例：导航栏白 → 88dp 处变页面灰）。只看卡片对不对，会把“整段底色错但卡片正常”放过去。
- **绝对 y 也要断言**：导航栏、页签行、每个卡片/区块的顶与底都跟设计稿的 y 对一次（±2dp 以内），不只对块内尺寸和块间间距。间距被两层各吃一次这类错误，只有绝对 y 能抓到（相对尺寸、块内颜色全部正常）。
- **改过结构就整表重跑，不复用改动前的数字**。重构（把 `<include>` 拆成 Fragment 布局、换容器、加一层 padding）会让之前所有验收结论失效；交付说明里的每个实测值都要是当前这一版测的。实例：重构后交付说明仍写着「卡片顶 139dp」，而实际是 149.5dp，就是复用了改前的旧截图数据。
- 真机对照过一遍：`adb shell uiautomator dump` 里能找到设计稿的每一段文案，某块文案整片缺失说明这块没渲染出来，不是「设计稿里没数据」；`adb exec-out screencap -p` 截图与设计稿逐块比对标题栏、页签、卡片。
- 验证前先确认装的是本次构建的包（`adb install` 输出 `Success`、`lastUpdateTime` 已更新），旧包上量出来的结论是错的。
- 知护办工程的颜色和尺寸来自 TobBaseResource。
- 设计稿中的文案和状态都在。
- 没在设备上点过的部分，交付说明里写清楚。

## 本技能维护规则

反哺新问题前先读这四条，避免规则重复和前后矛盾：

1. **一条问题只写一个地方。** 先检索现有小节，能并入已有段落就不新开节；同一事实写两遍，两处迟早会不一致。
2. **核心只放决策与流程，具体编码陷阱下沉子文档。** SKILL.md 保持能一次读完；按平台/语言的实现坑放 `references/`，项目特有的放对应项目子文档。
3. **每条规则要可判定。** 带上能跑的命令或能看的现象，否则只是口号。
4. **冲突时以已有规范为准。** 新写的条目与旧条目矛盾时，先删新的重复条目，再确认旧条目是否真的适用于当前工程。

问题按类型归位：

| 类型 | 落点 |
| --- | --- |
| 页面结构识别、间距层级、实现前分析产物 | 「先分析页面，再动组件代码」 |
| 卡内行内对齐（行高 / 行内 padding / 内容对齐 / 文字相对 y） | 「先分析页面，再动组件代码」 |
| 形态识别（看设计图定该用什么组件） | 「先看形态，再定组件」 |
| 组件能力与默认值（能不能表达、默认值吃掉尺寸） | 「什么时候用自定义控件」的核对三条 |
| 验收假通过（崩溃伪装、旧包、点错节点、抖动） | [android-pitfalls.md](android-pitfalls.md) |
| 设计数据读取（伪影、占位、重复图层） | 「规格读取原则」追加判例 |
| 交互结构保真（页签 / 分页 / 下拉 / 标题栏） | 「先看形态，再定组件」的形态表 |
| 图标还原（形状、切图、复用顶替） | 「自己绘制，还是用图标」 |
| Android 编码陷阱（尺寸塌陷、代码拼布局、写死尺寸） | [android-pitfalls.md](android-pitfalls.md) |
| XML 布局的 tools 预览属性（tools:text / tools:src / tools:listitem） | [android-pitfalls.md](android-pitfalls.md) |
| 模块新建 dp / sp / 颜色（该不该建、怎么避开） | [android-pitfalls.md](android-pitfalls.md) |
| 圆角被铺满的子 View 盖掉（背景圆角不裁切） | [android-pitfalls.md](android-pitfalls.md) |
| 验收方法 | 「完成标准」 |
