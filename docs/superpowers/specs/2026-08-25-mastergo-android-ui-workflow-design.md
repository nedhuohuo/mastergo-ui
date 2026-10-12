# MasterGo Android UI 工作流设计

## 背景

当前 `mastergo-ui` 已能指导 Agent 从 MasterGo 读取设计数据并落地 UI，但页面结构识别、组件选择、间距控制和 Android 工程约束仍容易被跳过，导致拿到 DSL 后直接生成一次性页面代码。

本设计以 `mastergo-design/mastergo-magic-mcp` 的组件工作流为流程参考，不复制其 Web/Vue 实现。Magic MCP 当前提供了页面分层读取、组件架构文档、资源清单、用户确认、测试和验证等检查点；其 `getComponentGenerator` 会将设计组件数据与工作流文件落到 `.mastergo/`。这些机制适合复用，但目标工程需要增加 Tob Android 专项规则。

## 目标

建立一条可检查的 MasterGo → Android UI 工作流：

```text
MasterGo DSL
→ 页面结构分析
→ 组件映射
→ 资源映射
→ 布局规格
→ 状态与交互规格
→ Android 实现计划
→ 代码实现
→ 构建、真机和视觉验证
```

生成 Android 代码前必须完成以下中间结果：

- `PageStructure`：页面、区域、容器、重复结构的层级树。
- `ComponentMap`：设计形态到组件、行为、复用或新建决策的映射。
- `ResourceMap`：设计值到 `TobBaseResource`、模块资源和图标资源的映射。
- `LayoutSpec`：页面边距、区块间距、Item 间距、尺寸、对齐和布局方式。
- `StateSpec`：默认、选中、按下、禁用、加载、空态、错误态和交互行为。

## 非目标

- 不引入新的运行时 UI 框架。
- 不引入新的 Android 第三方依赖。
- 不把 Magic MCP 的 HTML/D2C 代码直接转成 Android XML 或 Java/Kotlin。
- 第一阶段不实现自动布局推理算法、视觉差异引擎或完整组件注册中心。
- 不创建第二套按钮、Tab、列表或资源 Token 体系。

## 架构

### 1. 数据入口层

继续使用 MasterGo Magic MCP：

- `page_id` 先调用 `getPageLayers` 枚举真实图层。
- 页面还原先调用 `getDesignSections` 获取布局概览。
- 再逐 section 获取 DSL，不跳过 section。
- SVG、文本和资源保持来源可追溯。

Magic MCP 的 section 工作流、结构哈希、重复数量、文本闭集、SVG placeholder、页面 bbox 和反幻觉规则作为通用设计数据规则继续采用。

### 2. 设计分析层

在写布局或代码前先生成五项分析结果：

1. 页面结构树：识别标题栏、Tab、筛选区、卡片、列表、空态、弹层和底部操作区。
2. 组件映射：按“形态 → 组件 → 行为”判断，不根据节点名称直接猜组件。
3. 资源映射：先查 `TobBaseResource` 和 `UniversalComponents`，记录复用结果。
4. 布局规格：记录边距、间距、尺寸、圆角、字号、对齐和布局方向。
5. 状态规格：记录设计稿中真实存在的视觉状态和交互。

页面区块只有在结构和组件映射完成后才能进入实现阶段。

### 3. Android 适配层

Android 规则以当前工程实际基类和依赖为最高优先级，其次是最新 Yizhi 规范，最后才使用 Agent 默认经验。

组件优先级：

```text
UniversalComponents
→ 当前工程已接入的三方组件
→ Google / AndroidX 原生组件
→ 自定义控件
```

资源优先级：

```text
TobBaseResource
→ 当前模块已有语义资源
→ 必要时新增模块资源
→ 禁止硬编码颜色、尺寸和用户可见文案
```

自定义控件必须记录：现有组件为什么无法表达、控件负责绘制什么、外部传入什么数据和状态。

页面基类和生命周期必须遵循 `android-tob.md`；Activity 使用 `BaseActivity.afterCreate()`，并按 `initView()` → `initListener()` → `initData()` 初始化。ViewModel 不持有 View、Binding、Context、Adapter、Dialog 或 PopupWindow。

### 4. 验证层

验证顺序：

1. 文档和资源静态检查。
2. Gradle 编译检查。
3. 确认安装的是本次构建包。
4. 真机或模拟器检查关键文案和交互。
5. 截图按区块对照设计稿。
6. 记录未验证的交互和无法完全还原的偏差。

## 组件决策规则

组件复用顺序采用 Magic MCP 工作流中的四级决策：

1. 直接复用：现有组件完整满足形态、属性和行为。
2. 组件组合：由多个现有组件组合满足设计。
3. 扩展公共组件：只有公共能力缺失且需求可复用时才考虑，需确认公共 API 影响。
4. 重新实现：前三种方式无法表达，并记录原因。

有交互语义的结构必须有真实行为：页签能切换、下拉能选择并回填、列表项能点击、返回能返回。静态装饰不创建自定义控件。

## 可追溯性要求

每个实现结论都应能追溯到以下之一：

- MasterGo 的 layer/section/node 数据。
- 当前工程已有组件定义和调用示例。
- `TobBaseResource` 或模块已有资源。
- Yizhi/Android 工程约束。
- 明确记录的设计稿偏差或能力缺失。

不能从设计稿文本闭集之外生成文案、数据、状态或品牌内容。

## 文件职责

- `SKILL.md`：通用 MasterGo 数据读取、页面分析、组件决策和验收流程。
- `android-tob.md`：Tob Android 资源、组件、基类、Java/Kotlin、命名和工程约束。
- `templates/android-ui-analysis.md`：实现前填写的五项中间结果模板。
- `README.md`：说明底座来源、适用范围和文件职责。

## 验收标准

- 规范明确要求先分析页面结构，再实现组件。
- 规范明确 `TobBaseResource` 和 `UniversalComponents` 的优先级。
- 规范明确 Activity、Fragment、ViewModel、Dialog、Popup、Adapter 的基类和生命周期要求。
- 规范明确 Java/Kotlin 跨模块入口、`@JvmStatic` 和 API 模块约束。
- 规范明确资源命名、硬编码限制和自定义控件准入条件。
- 规范提供可直接填写的 `PageStructure`、`ComponentMap`、`ResourceMap`、`LayoutSpec`、`StateSpec` 模板。
- 文档不引入新的运行时依赖，不要求复制 Magic MCP 的 Web 实现。
