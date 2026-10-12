# MasterGo Android UI Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 MasterGo 的组件工作流骨架适配为包含页面结构分析、UniversalComponents/TobBaseResource 优先级和 Yizhi Android 约束的可检查规范。

**Architecture:** 保留 MasterGo Magic MCP 作为设计数据与工作流参考，在本仓库的 `SKILL.md` 增加通用分析流程，在 `android-tob.md` 增加 Android 适配规则，并提供一个轻量分析模板承载五个实现前中间结果。不复制 Web/Vue 生成代码，不新增运行时依赖。

**Tech Stack:** Markdown、MasterGo MCP、Android XML/Java/Kotlin 规范、Yizhi Android conventions。

**Spec:** `docs/superpowers/specs/2026-08-25-mastergo-android-ui-workflow-design.md`

## Global Constraints

- `TobBaseResource` 优先于模块资源；禁止硬编码颜色、尺寸和用户可见文案。
- `UniversalComponents` 优先于已接入三方组件、AndroidX 原生组件和自定义控件。
- Activity 使用 `BaseActivity.afterCreate()`，初始化顺序为 `initView()` → `initListener()` → `initData()`。
- ViewModel 不持有 View、Binding、Context、Adapter、Dialog 或 PopupWindow。
- 先完成 `PageStructure`、`ComponentMap`、`ResourceMap`、`LayoutSpec`、`StateSpec`，再生成 Android 代码。
- 不新增运行时依赖，不复制 Magic MCP 的 Web/Vue 实现。

---

### Task 1: 更新通用 MasterGo 工作流

**Files:**
- Modify: `SKILL.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-08-25-mastergo-android-ui-workflow-design.md`、Magic MCP `component-workflow.md` 的组件分析和检查点。
- Produces: 通用的设计数据读取、页面结构分析、组件决策、间距控制和验证流程。

- [ ] **Step 1: 在开工检查中加入分析前置门禁**

  明确要求先完成页面结构、组件映射、资源映射、布局规格和状态规格，未完成不得写 XML/Java/Kotlin。

- [ ] **Step 2: 增加“页面结构 → 组件 → 行为”流程**

  覆盖页面区域识别、重复结构、交互语义、布局关系和关键间距，保留现有的形态识别规则。

- [ ] **Step 3: 增加五项中间结果说明**

  解释 `PageStructure`、`ComponentMap`、`ResourceMap`、`LayoutSpec`、`StateSpec` 的字段、来源和完成条件。

- [ ] **Step 4: 增加资源/组件/验证工作流引用**

  说明 Magic MCP 只作为流程骨架，平台工程规则由目标工程的专项文档覆盖。

- [ ] **Step 5: 更新 README 的出 UI 流程和文件职责**

  让仓库入口文档与 `SKILL.md` 的门禁、底座来源和 Android 适配边界保持一致。

- [ ] **Step 6: 检查 Markdown 链接和重复规则**

  运行：`grep -nE '\]\([^)]*\)' SKILL.md README.md`

  Expected: 链接均指向仓库内存在的文件或已存在的外部地址；没有新增自相矛盾的入口说明。

### Task 2: 完善 Tob Android 专项规则

**Files:**
- Modify: `android-tob.md`

**Interfaces:**
- Consumes: 当前 `android-tob.md`、本机 Yizhi `yizhi_rules_v2.md`、项目设计规格。
- Produces: 可直接约束 Android UI 生成的资源、组件、基类、跨模块和验收规则。

- [ ] **Step 1: 固化资源优先级**

  明确 `TobBaseResource → 模块语义资源 → 必要时新增资源`，保留资源前缀和禁止硬编码规则。

- [ ] **Step 2: 固化 UniversalComponents 组件优先级**

  增加使用前检索定义、API、默认值和调用示例的要求；记录复用组件，禁止复制公共组件。

- [ ] **Step 3: 补齐页面和控件基类矩阵**

  覆盖 Activity、Fragment、BaseWidgetFragment、Dialog、Popup、Adapter、ViewModel，并写明入口方法、ViewBinding 和生命周期要求。

- [ ] **Step 4: 补齐 Java/Kotlin 与模块 API 约束**

  明确跨模块 API 模块、Route、Manager、`@JvmStatic`、JSONObject 公共数据模型和禁止暴露 Kotlin 合成 API 的规则。

- [ ] **Step 5: 增加自定义控件准入和设计值验收**

  自定义控件必须说明现有组件为何不足、绘制内容、输入数据和状态；关键尺寸必须可量化核对。

- [ ] **Step 6: 统一冲突规则的优先级**

  明确当前工程实际代码/依赖优先于最新 Yizhi 规范，最新规范优先于旧版文档，避免旧颜色命名或错误基类包名覆盖项目事实。

### Task 3: 新增 Android UI 分析模板

**Files:**
- Create: `templates/android-ui-analysis.md`

**Interfaces:**
- Consumes: `SKILL.md` 的通用流程、`android-tob.md` 的专项约束。
- Produces: 可在代码实现前填写的设计分析文档。

- [ ] **Step 1: 创建页面信息区**

  包含 MasterGo `fileId`、真实 `layer_id`、页面尺寸、数据来源和设计稿链接。

- [ ] **Step 2: 创建 PageStructure 区**

  用树形结构记录页面、区域、容器、重复单元和布局关系。

- [ ] **Step 3: 创建 ComponentMap 区**

  使用表格记录形态、组件、行为、复用来源、默认值风险和新建理由。

- [ ] **Step 4: 创建 ResourceMap 区**

  使用表格记录设计值、TobBaseResource、模块资源、UniversalComponents 图标或 MasterGo 资源来源。

- [ ] **Step 5: 创建 LayoutSpec 与 StateSpec 区**

  记录页面间距、区块间距、Item 间距、尺寸、字号、圆角、状态和交互。

- [ ] **Step 6: 创建实现和验收清单**

  包含基类、依赖、资源前缀、文案、编译、安装包、UIAutomator、截图和未验证项。

### Task 4: 一致性验证

**Files:**
- Verify: `SKILL.md`
- Verify: `android-tob.md`
- Verify: `README.md`
- Verify: `templates/android-ui-analysis.md`
- Verify: `docs/superpowers/specs/2026-08-25-mastergo-android-ui-workflow-design.md`

**Interfaces:**
- Consumes: Tasks 1–3 的文档。
- Produces: 无链接断裂、无明显冲突、可执行检查项的规范集合。

- [ ] **Step 1: 检查关键规则是否存在且没有旧规则覆盖**

  运行：`grep -nE 'TobBaseResource|UniversalComponents|BaseActivity|afterCreate|@JvmStatic|PageStructure|ComponentMap|ResourceMap|LayoutSpec|StateSpec' SKILL.md android-tob.md README.md templates/android-ui-analysis.md`

  Expected: 每个关键规则至少在职责正确的文件中出现，且入口文档能指向专项文档。

- [ ] **Step 2: 检查模板字段完整性**

  运行：`grep -nE 'PageStructure|ComponentMap|ResourceMap|LayoutSpec|StateSpec|验收|fileId|layer_id' templates/android-ui-analysis.md`

  Expected: 五项中间结果、设计来源和验收字段全部存在。

- [ ] **Step 3: 检查 Git diff 和状态**

  运行：`git diff --check && git status --short`

  Expected: 无空白错误；修改范围仅限规范、模板和设计/计划文档。

- [ ] **Step 4: 进行最终人工审阅**

  核对：没有新增依赖、没有要求直接复用 HTML、没有第二套资源或组件体系、没有把“必须先分析”写成可跳过建议。
