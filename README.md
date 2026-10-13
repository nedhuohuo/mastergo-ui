# mastergo-ui

把 MasterGo 设计稿落到客户端界面的通用 AI 技能，不限定 Cursor 或其他 AI 工具。按设计链接取数，或读当前选中图层，再映射到工程里已有的组件和资源，不另起一套视觉体系。

## 什么时候用

对话里出现 MasterGo、设计稿、设计链接、`layer_id`、DSL、D2C、还原界面、出 UI，或要求按 MasterGo 文件实现某个界面时，由 Agent 加载本技能。

两条入口：

| 场景 | 服务 | 说明 |
| --- | --- | --- |
| 手里有设计链接 | Magic MCP（`mastergo-magic-mcp`） | 用 `fileId` 和 `layer_id` 取 DSL |
| 改当前画布，或读选中图层 | Vibe MCP（`mastergo-vibe`） | 依赖本机已打开的 MasterGo 客户端 |

优先复用当前 AI 会话中已连接的 MasterGo MCP，按实际暴露的能力和参数调用，不要求固定服务名或工具名前缀。缺少所需能力时，按 [reference.md](reference.md) 为当前 AI 工具接入对应服务。不要在没有设计数据的情况下编一版界面。

## 文件

| 文件 | 读者 | 内容 |
| --- | --- | --- |
| [SKILL.md](SKILL.md) | Agent | 开工检查、页面分析与组件判定、两条出 UI 路径、完成标准 |
| [reference.md](reference.md) | Agent | MCP 配置、工具对照、排障 |
| [android-tob.md](android-tob.md) | Agent | 知护办 Android：基类、TobBaseResource、命名、控件选用 |
| [android-pitfalls.md](android-pitfalls.md) | Agent | Android 落地陷阱：尺寸塌陷、代码拼静态布局、圆角裁切、ROM 忽略行高、模块不新建 dp / 颜色、tools 预览属性 |
| [project-contract.md](project-contract.md) | Agent | 非 Android 工程如何找设计约定 |
| [templates/android-ui-analysis.md](templates/android-ui-analysis.md) | Agent | 实现前填写的五项分析：页面结构、组件、资源、布局、状态 |
| [scripts/check-ui-analysis.sh](scripts/check-ui-analysis.sh) | Agent | 门禁检查：五项分析未填完或含待定项时拒绝开工 |
| [scripts/check-radius-impl.py](scripts/check-radius-impl.py) | Agent | 自检：找出「背景圆角 + 铺满子 View 却没裁切」（✗，必须清零）与「裁了但背景不是圆角」（⚠）；`--self-test` 验判据 |
| [tools/](tools/) | 人 | 取数小工具：MCP 只读调用器（`mcp-call.mjs`）、圆角表生成器（`radius-table.mjs`，节点机器数 + splitContainers 回查 + 对账行）、连通与授权探针、DSL 转结构、SVG 转 Vector、[投喂单模板](tools/design-intake.md) |
| [docs/mastergo-mcp-setup.md](docs/mastergo-mcp-setup.md) | 人 | MCP 接入步骤（环境变量注入、客户端差异、排障） |
| [output/analysis/](output/analysis/) | 人 | **一份新格式样板**：客户详情（layer 22:9203）的五项分析，逐元素圆角表 + 对账行，过门禁 `exit 0` |
| [output/ab/](output/ab/) | 人 | 新旧规范 A/B 对照：为什么要加五项分析门禁 |
| [LICENSE](LICENSE) | — | MIT |

`.mastergo/` 是画布缓存，不是业务源码。仓库里只保留技能本身、工具和案例结论：

- `output/design/`（设计稿原始落盘，可由 MCP 按 `fileId` + `layer_id` 重新拉取）、`output/asset/`、`stage/`、`.mcp-bundles/`、`.workbuddy/` 都在 `.gitignore` 里，属于本地工作区，不进仓库。

样板怎么用：`templates/android-ui-analysis.md` 是空白模板，`output/analysis/22-9203-ui-analysis.md` 是**填完长什么样**的参照（含逐元素圆角表与 `N − M = Σ(倍数−1)` 对账行，门禁可过）。其余页面的分析 / 交付说明属于具体项目的落地记录（含设计稿链接、内部工程路径与业务文案），不入库；`android-pitfalls.md` 的每条规则都是从那些记录里提炼出来的，提炼完就只留规则，不附原文。

## 使用前准备

已有可用 MCP 时无需重复安装；只配置任务需要的服务。首次接入本地服务：

1. Node.js 18 及以上，当前 AI 工具或其 MCP 网关支持启动 stdio 服务。
2. 使用 Magic 时，在 mastergo.com 的「个人设置 → 安全设置」生成令牌，通过当前系统的环境变量或客户端安全配置注入 `MG_MCP_TOKEN`。令牌不进仓库、不写进共享 MCP 配置；不要让 AI 读取或输出令牌值。
3. 设计文件放在团队项目里，账号有团队版席位。Magic 按链接取数依赖这两项。
4. 按当前 AI 工具的配置格式接入 Magic 或 Vibe，示例见 [reference.md](reference.md)。MCP 服务相同，客户端的配置位置、格式和环境变量传递方式可以不同。
5. Vibe 需要 MasterGo 客户端已打开，且文件内 MCP 在线。地址和端口以客户端显示为准；变更后同步更新 MCP 配置。
6. 在当前 AI 工具中重载 MCP 或重新连接会话。确认所需工具已出现，并通过只读设计接口验证访问，不以进程启动成功代替授权验证。

## 出 UI

先拿到设计数据，再按目标工程已有基类和资源落代码。会再出现的结构抽成共享组件；只出现一次的装饰留在页面里。只实现设计稿里已经有的状态。

拿到数据不等于可以写代码，按这个顺序走，前一步没完不进下一步：

```text
设计数据 → 页面结构 → 组件映射 → 资源映射 → 布局规格 → 状态规格 → 代码 → 验证
```

五项分析按 [templates/android-ui-analysis.md](templates/android-ui-analysis.md) 写下来；流程、形态判定和验收标准见 [SKILL.md](SKILL.md)，Android 工程规则见 [android-tob.md](android-tob.md)。流程骨架参考 [MasterGo Magic MCP](https://github.com/mastergo-design/mastergo-magic-mcp) 的组件工作流，平台规则由各工程专项文档覆盖。

### 链接还原（Magic）

链接要带 `fileId` 和 `layer_id`，或使用短链 `/goto/...`。

1. `getMeta`，先看文件和图层。
2. 大页面用 `getDesignSections` 按区块拉；小区块再用 `getDsl`。重复样式用 `format=tree`，逐字文案用 `format=json`。
3. 超时、数据过大或返回 429 时，按区块链接分开拉，并降低请求频率。
4. 映射到已有组件，核对文案、间距、颜色和设计稿里已有的状态。

链接形式：`https://mastergo.com/file/{fileId}?layer_id={layerId}`。

### 画布（Vibe）

客户端开着，文件内 MCP 在线，地址和端口与当前 AI 工具的 MCP 配置一致。操作画布时不要换页。

1. 先在客户端选中图层，再 `get_selection_code`。对照视觉用 `get_selection_image`。
2. 改颜色、文案、尺寸用 `agent_update_node`。换图标或图片用 `agent_replace_node`。改父节点时保留全部子节点。
3. 用团队库时：`get_library_list` → 选定库 → `get_component_info` → `design_page`，来源为 `component-library`。规范页用 `full-components`。
4. 只有明确说「同步到画布」才调用 `agent_sync_design`。只传静态 HTML 和根节点 id。`.kt`、`.xml`、`.vue`、`.tsx` 不能当同步文件。

## 落到哪个工程

**知护办 Android** 先读 [android-tob.md](android-tob.md)。颜色和尺寸来自 `TobBaseResource`（`com.yilife.android.bu.module:TobBaseResource`）。`GlobalSharedResource` 已废弃，新界面不要引用 `color_3a74fc`、`text_small`、`spacing_*` 这套旧名字。

资源名带模块 `resourcePrefix`，控件 ID 只带类型前缀（如 `tv_`、`btn_`），不要把模块前缀拼到 ID 上。控件按这个顺序选：`UniversalComponents` → 工程里已经接入的三方库 → Google / AndroidX 原生。图标先在 `UniversalComponents` 里找；没有再从 MasterGo 取 webp，按 `{prefix}_ic_` 放进当前模块 `drawable`。

**其他客户端** 如果仓库里已有 `design-system/mastergo.md`，出 UI 前先读它。没有就沿用仓库现有组件，不要为了本技能另起一套令牌文件。知护办 Android 不建这份契约，规则在 [android-tob.md](android-tob.md)。

## 完成标准

- 实现前先完成页面结构、组件、资源、布局、状态五项分析。
- 没有第二套按钮、导航、列表单元。
- 知护办工程的颜色和尺寸来自 TobBaseResource。
- 设计稿中的文案和状态都在。
- 原生界面说明哪些部分没有在设备上点过。

## 排障

| 现象 | 处理 |
| --- | --- |
| 所需 MCP 能力未出现 | 按当前 AI 工具检查配置、工具权限和连接状态；本地服务需 Node.js ≥ 18 |
| Magic 权限不足 | 检查令牌、团队版席位，以及文件是否在团队项目 |
| Magic 读不到令牌 | 确认 MCP 子进程收到 `MG_MCP_TOKEN`，按当前客户端的方式传递环境变量，不输出令牌 |
| Vibe 未找到终结点 | 客户端打开，文件内 MCP 在线，地址和端口与配置一致 |
| 数据过大或 429 | 按区块拉取，降低请求频率 |

更细的工具对照见 [reference.md](reference.md)。
