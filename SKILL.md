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
- `_placeholder: true` 不是删除依据。先判这段文字是静态还是动态：静态文案（页面标题、页签名、分类名、按钮名）进 `strings.xml` 按资源引用；动态文案（课程名、`已学章节：N`、`¥99`）写成带占位符的 string，用 `%1$s` / `%1$d` 由数据填充。判据是它会不会随数据变，不是字段名。整页文案全被标 `_placeholder` 时按语义逐条判，不要整批删。

## 先分析页面，再动组件代码

拿到设计数据不等于可以写代码。先把页面拆成结构，再判断每块的形态和组件，最后才写布局和样式。形态认错要重做，结构拆错则组件、间距、状态一起错。

分析产出五项中间结果，没填完不进入实现：

| 结果 | 内容 | 完成条件 |
| --- | --- | --- |
| PageStructure | 页面 → 区域 → 容器 → 重复单元的层级树 | 每个区块都能归到一个区域，重复结构已标出 |
| ComponentMap | 区块 → 形态 → 组件 → 行为 → 复用来源 | 每块都写了组件和行为，复用项有工程出处 |
| ResourceMap | 设计值 → TobBaseResource / 模块资源 / 图标来源 | 颜色、尺寸、字号、圆角都有出处，无待定值 |
| LayoutSpec | 页面边距、区块间距、Item 间距、组件尺寸、对齐 | 关键数值能对着设计稿量出来 |
| StateSpec | 默认 / 选中 / 按下 / 禁用 / 加载 / 空 / 错误态 | 只列设计稿里真实出现的状态 |

模板见 [templates/android-ui-analysis.md](templates/android-ui-analysis.md)；知护办的资源、组件和基类选用见 [android-tob.md](android-tob.md)。

页面结构按三层看，不要一上来就盯节点坐标：

1. **页面层**：标题栏、页签、内容区、底部操作区；哪些固定、哪些滚动。
2. **区域层**：卡片、分组、筛选区、列表区；边距和间距由哪一层承担。
3. **内容层**：重复单元、单条字段、图标位；哪些随数据变化。

间距先定层级再定数值：页面边距、区块间距、Item 间距、组件内间距是四个不同的量，不要一个数值一把梭；设计稿量出的具体值填进 LayoutSpec。对不上的地方按 [规格读取原则](#规格读取原则) 判断伪影，不照抄。

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
→ 模块资源文件中的语义别名
→ 仅在不存在时新增资源
```

不要把已存在的颜色写成新的十六进制值，也不要把已存在的 `dp_*` / `sp_*` 重复定义。颜色核对不能只看节点主色，还要检查连接线、空心描边、节点底色、错误底色、文字和图标色。

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
| 形态识别（看设计图定该用什么组件） | 「先看形态，再定组件」 |
| 组件能力与默认值（能不能表达、默认值吃掉尺寸） | 「什么时候用自定义控件」的核对三条 |
| 验收假通过（崩溃伪装、旧包、点错节点、抖动） | [android-pitfalls.md](android-pitfalls.md) |
| 设计数据读取（伪影、占位、重复图层） | 「规格读取原则」追加判例 |
| 交互结构保真（页签 / 分页 / 下拉 / 标题栏） | 「先看形态，再定组件」的形态表 |
| 图标还原（形状、切图、复用顶替） | 「自己绘制，还是用图标」 |
| Android 编码陷阱（尺寸塌陷、代码拼布局、写死尺寸） | [android-pitfalls.md](android-pitfalls.md) |
| 验收方法 | 「完成标准」 |
