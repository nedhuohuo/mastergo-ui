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
- [ ] 列出复用的组件 / 必须新建的组件
- [ ] 先组件，后页面
- [ ] 核对文案、间距、颜色、设计稿里已有的状态
- [ ] 每块区域先定：自己绘制、用图标，或自定义控件。自定义控件写下效果和传入的数据
- [ ] 知护办：资源名带模块前缀，控件 ID 只带类型前缀，控件按 UniversalComponents → 已接入三方 → 原生选用
- [ ] 知护办：图标先用 UniversalComponents，没有再从 MasterGo 取 webp，按 `{prefix}_ic_` 放进当前模块 `mipmap-xhdpi`
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

## 自己绘制，还是用图标

先分节点，再动手。结构自己画，图形用资源。

自己绘制：容器、卡片、列表、按钮、标签、分割线、文字。纯色、线性渐变、圆角、描边、阴影也写在样式里。这些有宽高和间距，用布局表达。

用图标：设计稿里的 PATH、图标、插画、蒙版装饰。放进和节点一样大的容器，用导出的 svg 或图片，不改形状。人形、爱心、波形、月亮这类象形都算图标。不要用矩形、圆形或 `background-image` 去仿。填充渐变写在 svg 上，不要写到 `img` 的背景上，否则透明轮廓会变成色块。

图标资源本身画不出来时，仍然用图，不要改成手绘。包括：`foreignObject`、`backdrop-filter`、`mask`、`clip-path` 叠在一起；对照截图后变成色块、缺一层、或画出容器外。从设计截图按该图形的像素范围裁一块，贴回原位。裁图只盖这块图形，不盖文字和布局。不要整页换成一张截图。

MasterGo 图片导出经验：当前 `mastergo-magic-mcp` 的 `extractSvg` 只返回 SVG/PATH 字符串，不提供 PNG/WebP 二进制导出。需要像素图片时，要求用户从 MasterGo 客户端导出 PNG；不要把 MCP 返回的 SVG 本地转换后冒充 MasterGo 图片，也不要手写 Vector XML 替代图片。客户端导出的 ZIP 通常按 `mdpi` / `hdpi` / `xhdpi` / `xxhdpi` / `xxxhdpi` 分目录，按需求只接入指定密度；用户要求 xxhdpi 时只接入 `xxhdpi`，再按工程要求转为无损 WebP，放入对应 `mipmap-xxhdpi`，不要无选择地复制全部密度。资源目录和命名按组件引用方式及工程规范选择，代码使用 `ContextCompat.getDrawable` 时可通过 `R.mipmap` 引用 mipmap 图片资源，文件名带模块前缀。

## 什么时候用自定义控件

图标和布局定完之后，看这块要不要成控件。先写它要呈现的效果，以及会不会随数据或状态变化，再选实现。

用已有控件：按钮、输入、列表、Tab、弹层、下拉刷新、空态、轮播，以及只切换开/关颜色的开关。组件库、已接入三方或原生控件能表达该效果，就不新建。

用自定义控件：现有控件只能近似，设计稿要求的效果会丢。

- 数据驱动的非矩形图形。环形进度、多段弧、仪表、波形、点状趋势。数值一变，图形要重画。
- 轨道和滑块的形状、尺寸按设计稿来，不是系统开关换个颜色。
- 裁切、蒙版、重叠热区要能点。一张静态图或普通布局保不住点击和状态。
- 同一块有多套视觉状态，并且状态跟业务数据走，例如正常、偏高、未绑定。

静态装饰用图标或裁图，不做成控件。没有数据、没有交互、只出现一次的结构留在页面里。

处理时记下四件事：效果、现有控件为什么不够、控件负责画什么、外面传进什么数据。会再出现的抽成共享组件。只服务当前页、但效果属于上面几类的，仍然单独成控件，绘制不散在页面里。知护办的选用顺序和命名见 [android-tob.md](android-tob.md)。HTML 把这块抽成独立组件，页面只传数据。

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

- 没有第二套按钮、导航、列表单元。
- 知护办工程的颜色和尺寸来自 TobBaseResource。
- 设计稿中的文案和状态都在。
- 原生界面说明没有在设备上点过的部分。
