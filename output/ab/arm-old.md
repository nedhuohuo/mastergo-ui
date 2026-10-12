# 护理评估单 — 开工前准备（arm-old，按 /tmp 规范快照）

> 依据规范：`/tmp/mastergo-ui-skill-backup-20261011195346/{SKILL.md, android-tob.md, android-pitfalls.md, reference.md, project-contract.md}`。
> 输入数据：`output/ab/fixture-84-079220.md`（`getDesignSections(format=tree)` 的 5/17 个 section 节选 + 全量文案 `allTexts` + `splitContainers`）。
> 目标工程：知护办 Android，`/Users/huohuo/AndroidStudioProjects/artigence`（公共组件 `common/`，业务模块 `zhb/`）。
> 本文件只做准备：不写 XML / Kotlin / Java / HTML。

## 0. 设计来源与本次数据边界

| 项 | 值 |
| --- | --- |
| fileId | 153149080980227 |
| 真实 layer_id | `84:079220`（URL 内容图层，可直接取 section） |
| 页面 | FRAME「护理评估单」375x1550 `#FFFFFF` |
| 内容宽 | 375 − 12×2 = 351 |
| 本次可用 | section 0/1/2/3/10 的完整树 + `allTexts` 全文案 + `splitContainers` 5 个容器几何 |
| 本次缺 | 其余 12 个 section 的几何与 DSL；任何图标/图片的像素资源；除「感知能力」行外的分值 |
| 读取范围 | 节选读取（不是全量 17 section） |

**结论：这 5 个 section 足以把「结构骨架 + 组件 + 资源 + 布局规则 + 状态」定死；但整页还不能开工。**
缺的是重复行的**数量与逐行选项分值**，以及底部汇总条/提交区的几何。第 8 节列了必须补的数据。

---

## 1. 页面结构（页面 → 区域 → 容器 → 重复单元）

```text
护理评估单 375x1550（内容宽 351，左右边距 12）
├── 导航 FRAME 84:079237 375x88 @0,0        固定；白底
│   ├── 状态栏 84:079240 21 高 @21,14.33      系统，不实现
│   ├── 返回 84:079267 25x25 @12,53           交给 TitleBar
│   └── 标题「护理评估单」90x22 @143,55        18sp/22 Medium #333333 居中
├── 识别工具条 455:044573 351x40 @12,100     固定；胶囊 radius 89、主题色 15% 底、1px 主题色描边
│   ├── 左块 455:044593 150x24  图标18 + 文本「图片识别」+ 右侧图标16
│   ├── 竖线 455:044575 12 高 rgba(主题色,0.5)
│   └── 右块 455:044576 150x24  图标18 + 文本「语音录入」+ 右侧图标16
├── 页签 84:079652 351x30 @12,152            固定；3 项，选中项带下划线
│   └── 底分割线 84:079653 348x1 #D8D8D8
└── 表单区（滚动）
    ├── 评估行 ×N（重复单元，fixture 只给了 2 行样例）
    │   ├── 单选评分行 84:079344 351x100 @12,198   标签 + 灰底卡（圆点单选，2 列）
    │   └── 多选评估行 225:001138 351x132 @12,918  标签 + 灰底卡（方框多选，2 列 × 3 行）
    └── （未在节选中）底部汇总条 + 提交按钮，见 `allTexts`：`压疮等级：15分 / 跌倒等级：24分 / 导管等级：20分`、`确定`
```

`allTexts` 反推出的量表清单（这是**唯一**能拿到的行数依据）：

| 类型 | 分组标题 | 选项（按 allTexts 顺序） |
| --- | --- | --- |
| 单选 | 感知能力 | 完全受限 1分 / 大部分受限 2分 / 轻度受限 3分 / 无损害 4分 |
| 单选 | 潮湿程度 | 持续潮湿 / 常常潮湿 / 偶尔潮湿 / 罕见潮湿 |
| 单选 | 活动能力 | 卧床 / 坐椅子 / 偶尔步行 / 经常步行 |
| 单选 | 移动能力 | 非常受限 / 轻微受限 / 不受限 |
| 单选 | 营养摄取能力 | 非常差 / 可能不足 / 充足 / 丰富 |
| 单选 | 摩擦力和剪切力 | 存在问题 / 潜在问题 / 不存在问题 |
| 多选 | I类导管 | 胸管 / 气切套管 / 气管插管 / 动静脉插管 / 脑室引流管 / 三腔管 |
| 多选 | II类导管 | 双套管 / 负压球 / 深静脉导管 / T管 / 造瘘管 / 胃肠减压 |
| 多选 | III类导管 | 导尿管 / 鼻饲管 |
| 多选 | 意识 | 烦躁 / 意识不清 / 不配合 |
| 多选 | 护理措施 | 加强固定 / 使用约束带 / 警示标识 / 安全教育 / 导管观察 |

- 重复单元共 **11 行**：单选 6 行 + 多选 5 行。单选行与多选行是**同一套行结构**（标签 20 + 4 + 灰底卡），只换选项图形与是否互斥。
- **选项与分值不是静态文案**：节点名大量是「女」「性别」「6分」，说明这页是数据驱动的量表渲染；选项名、分值必须来自 ViewModel 的数据，不抽 `strings.xml`、不写死布局。`strings.xml` 只放页面固定 chrome（标题、工具条两个入口、确定）。

### 节选里已知的几何

| section | 区域 | 尺寸 / 位置 | 关键 flex |
| --- | --- | --- | --- |
| 0 | 导航 | 375x88 | 状态栏 21 + 标题栏 44（iOS 量法） |
| 1 | 识别工具条 | 351x40 @12,100 | row / space-between / padding 8,12；radius 89 |
| 2 | 页签 | 351x30 @12,152 | column gap 1；H2 351x29 |
| 3 | 单选评分行 | 351x100 @12,198 | column gap 4；卡片 351x76 padding 12 gap 12 |
| 10 | 多选评估行 | 351x132 @12,918 | column gap 4；卡片 351x108 padding 12 gap 12 |

---

## 2. 形态 → 组件 → 行为

| 区块 | 形态（按「先看形态，再定组件」判） | 组件 | 行为 | 复用来源 | 是否新建 | 必须核对的默认值 |
| --- | --- | --- | --- | --- | --- | --- |
| 导航 | 顶部固定高 + 左返回 + 居中标题 | `com.yilife.android.widget.component.titlebar.TitleBar` | 返回可退 | `Module.titleBar`（Dept.kt 已有 `1.0.3`；工程多处 layout 在用） | 不新建 | 状态栏留白高度、标题字号/基线；设计 88 高含 21 状态栏 |
| 识别工具条 | 胶囊容器里两段「图标+文字+图标」，每段两个独立跳转热区 | 模块内布局 + 4 个可点区域 | 图片识别文本→`84:082915`、左图标→`84:081370`；语音录入文本→`84:090864`、右图标→`84:097978` | 无通用组件；纯静态结构，留在页面里（不做自定义 View） | 不新建 | 胶囊 radius 89（组件无此档）、竖线 12 高 |
| 页签 | 一排 3 段文字，**段宽=文字宽**，间距相等，选中项下划线 | `UniversalTabLayout`（`UniversalTabStyle.NORMAL`） | 点了换内容，必须有真实内容容器 | `UniversalComponents`（`common/UniversalComponents/.../universaltablayout/`） | 不新建 | **能力缺口**：组件只有 `EQUAL / FIXED / WRAP_CONTENT`，没有设计稿的 space-between；详见 §7-1 |
| 单选评分行 | 灰底圆角卡 + 2 列圆点单选项 + 右侧分值 | `android.widget.RadioGroup` + `RadioButtonComponents` | 点选中，回填分值、重算等级 | `UniversalComponents` | 不新建 | 默认图标是 `component_cb_invoice_select/unselect`（发票样式），**与设计圆点不符，必须覆盖** |
| 多选评估行 | 同结构，选项为圆角 2px 方框 + 白勾 | `CheckboxComponents` | 可多选，回填分值 | `UniversalComponents` | 不新建 | 默认图标是 `component_checkbox_circle_select/unselect`（圆点），**与设计方框不符，必须覆盖** |
| 选项行（图形 + 标签 + 分值） | 间距一致的重复行 | 列表项布局 + `RecyclerView`（BRVAH `BaseQuickAdapter`，`Dept.BRVAH` 3.0.10 已接入） | 整行/选项可点 | 工程列表模式 | 不新建：禁止复制 11 份静态行 | 卡片内 2 列网格用权重，不写死 150 |
| 提交按钮 / 汇总条 | 圆角实色块 + 文字；一行三段文本 | 工程已有 `ShapeTextView`（`Module.shapeTextview`，多处在用）或模块 `bg_` drawable + TextView | 点提交；汇总随分值与选实时变化 | 工程已接入 | 不新建（**几何不在本次数据内**，见 §8） | 默认内边距/最小高会吃掉 46 高 |

### 页面跳转一览（来自 DSL `interactive`）

| 触发 | 目标 layer_id |
| --- | --- |
| 图片识别（文本） | 84:082915 |
| 图片识别右侧 16x16 图标 | 84:081370 |
| 语音录入（文本） | 84:090864 |
| 语音录入右侧 16x16 图标 | 84:097978 |

> 注意：文本和它右边的 16 图标是**两个独立跳转**，不能把整段当一个可点区。

---

## 3. 资源核对（已在目标工程 grep 过）

### 3.1 组件 / 基类是否真的存在（实测）

```bash
# 全部命中
common/UniversalComponents/.../widget/universaltablayout/UniversalTabLayout.kt
common/UniversalComponents/.../widget/RadioButtonComponents.kt
common/UniversalComponents/.../widget/CheckboxComponents.kt
common/UniversalComponents/.../widget/basepopup/CustomBottomPopupWindow.kt
ability/ShapeTextview/.../shapetextview/ShapeTextView.kt
grep -rn 'com.yilife.android.widget.component.titlebar.TitleBar' zhb/*/*/src/main/res/layout   # 多处
grep -rhoE 'import .*Base(Activity|Fragment|WidgetFragment|ViewModel)' zhb common                # BaseActivity 92 次
zhb/AppShell/buildSrc/.../Dept.kt: Module.titleBar / Module.shapeTextview / Module.tobBaseResource / Module.basePage / Module.universalComponents
```

- 基类：普通页用 `com.yilife.android.arch.page.page.BaseActivity`（`afterCreate` + `initView/initListener/initData`）。本页是「固定头 + 列表 + 固定底」的表单页，也可以用列表拼装页 `BaseWidgetFragment`（`initData/registerData2View/dv/addData`）承载 11 行。**二选一由宿主定**（见 §8）。
- `SingleItemWidget` / `ItemWidget` 在 `zhb` 下未找到；`zhdj` 下有使用。知护办本页若走 `BaseWidgetFragment`，`dv(...)` 的 ItemWidget 形态需要宿主确认是否可用。
- 依赖：目标模块需有 `implementation Module.universalComponents`、`Module.tobBaseResource`、`Module.titleBar`、`Module.shapeTextview`、`Module.basePage`。缺哪个只补哪一行，不写死 groupId/version。

### 3.2 颜色（优先级：设计值 → TobBaseResource → 模块语义别名 → 新增）

| 设计值 | 用途（section） | TobBaseResource | 决策 |
| --- | --- | --- | --- |
| `#3A74FC` | 工具条文字/描边、页签选中+下划线、多选选中底 | `color_primary` `#5460FE` | 用 `color_primary`（设计稿是旧主题色，色差记交付说明） |
| `rgba(58,116,252,0.15)` | 工具条胶囊底 | 无 15% 透明档 | 新增 `{prefix}_color_scan_bg`（= 15% 主题色，#265460FE） |
| `rgba(58,116,252,0.5)` | 工具条竖线 | 无 | 新增 `{prefix}_color_scan_divider`（= 50% 主题色，#805460FE） |
| `#333333` | 标题、分组标签、选项文字 | `text_gy1` | 直接引用 |
| `#666666` | 未选中页签 | `text_gy2` | 直接引用 |
| `#999999` | 分值文字、未选中选项描边 | `text_gy3` | 直接引用 |
| `#FFFFFF` | 页面底、卡内、勾 | `bg_base` / `text_white` | 直接引用 |
| `#F9F9F9` | 评分卡底 | 无（`fill_light` `#F5F5FA` 不等值） | 新增 `{prefix}_color_card_bg` |
| `#D8D8D8` | 页签底分割线 | 无（`border_base` `#DCDDE5` 不等值） | 新增 `{prefix}_color_divider_tab` |
| `#111827` | 页签节点级 `fill` | — | **丢弃**：被逐字 `textColor` 覆盖，是组件基底带下来的过期值 |

### 3.3 尺寸 / 字号 / 圆角

| 设计值 | 用途 | 落点 |
| --- | --- | --- |
| 12 | 页面左右边距、卡内边距、网格行间距 | `space_base` |
| 16 | 评估行与行间距、标签↔分值 | `space_small` |
| 4 | 分组标签 ↔ 卡片 | `space_micro` |
| 8 | 选项图形 ↔ 标签文字 | `space_mini` |
| 27 | 网格列间距（**不是** TobBaseResource 档位，也不是 24/32） | 新增 `{prefix}_space_option_column` 27dp（同值有 `dp_27`，两者取一，避免重复定义） |
| 12 | 卡片圆角 | `radius_larger` |
| 2 | 多选框圆角 | `radius_smaller` |
| 89 / 101 / 264 | 胶囊 / 下划线 / 圆形 | 胶囊用 `{prefix}_radius_pill`=高度一半(20dp)；下划线用组件默认 99dp；圆形用 oval shape（互不共用） |
| 18 / 16 / 14 | 字号 | `font_medium` / `font_basic_large` / `font_basic_body` |
| 40 / 30 / 29 / 20 / 25 / 18 / 16 | 工具条高 / 页签区高 / 页签项高 / 选项行高 / 返回 / 工具条图标 / 选项图形 | 语义档无对应 → `dp_40`、`dp_20` 等已有 `dp_*` 直接引用；29 用 `dp_29` |
| 351 / 150 / 76 / 108 | 内容宽 / 选项宽 / 卡片高 | **高度由内容决定**，不要写死；宽度用 `match_parent` + 权重 |

### 3.4 图标

| 图标 | 来源 | 资源名 / 密度 |
| --- | --- | --- |
| 返回 25x25 | `TitleBar` 内置返回，不单独取图 | — |
| 图片识别 18x18 | UniversalComponents 无对应项 → MasterGo 导出 | `{prefix}_ic_scan_image.webp`，`mipmap-xhdpi`（只接需求密度，转无损 WebP） |
| 语音录入 18x18 | 同上 | `{prefix}_ic_scan_voice.webp` |
| 右侧 16x16（两块图形一致，两个跳转） | 同上；语义（历史/记录？）需确认 | `{prefix}_ic_scan_record.webp` |
| 单选未选/选中圆点 | 组件默认不符，可覆盖为库内 `component_checkbox_circle_unselect/_select`，或按设计稿导出 | `radio_uncheckedIcon` / `radio_checkedIcon` |
| 多选未选/选中方框 | 库内无方形图标 → MasterGo 导出 | `{prefix}_ic_cb_square_unselect.webp` / `{prefix}_ic_cb_square_select.webp` |

> `extractSvg` 只回 SVG 字符串，webp 需用户在 MasterGo 客户端按所需密度导出；不要把 SVG 本地转换冒充导出图。图标像素资源本次不在 fixture 内，属 §8 阻塞项。

---

## 4. 布局规格（LayoutSpec）

| 项 | 设计值 | 落在哪一层 | 实现方式 |
| --- | --- | --- | --- |
| 页面左右边距 | 12 | 页面内容容器 | `space_base`，内容宽 = 375−24（不要写 351） |
| 工具条 ↔ 页签 | 40 → 12（100→152 之间隔 12） | 区块间距 | `space_base` |
| 页签 ↔ 首个评估行 | 152+30=182 → 198，间隔 16 | 区块间距 | `space_small` |
| 评估行间距 | 16 | 列表 item 间距 | `space_small` |
| 行内：分组标签 ↔ 卡片 | 4 | 行根布局 gap | `space_micro` |
| 卡内边距 | 12 | 卡片容器 | `space_base` |
| 卡内网格列间距 | 27 | 网格 | `{prefix}_space_option_column` |
| 卡内网格行间距 | 12 | 网格 | `space_base` |
| 选项内：图形 ↔ 标签文字 | 8 | 选项 | `space_mini` |
| 选项内：标签 ↔ 分值 | 16 | 选项 | `space_small` |
| 工具条内：图标 ↔ 文本 | 6 | 工具条块 | `space_micro`+2 → 用 `dp_6` |
| 工具条块宽 | 150 × 2 + 27 中缝 | 工具条 | 两块 `0dp` + `weight=1`，中缝固定；不写死 150 |
| 选项宽度 | 150 | 网格单元 | 列宽 `0dp` + `weight=1`；设计 2 列 = (327−27)/2 = 150 |
| 卡片高度 | 76（4 项）/ 108（6 项） | 卡片 | 由内容撑开：24 padding + 20×行数 + 12×(行数−1)，不写死 |
| 选项图形 | 16x16 | 选项 | `dp_16` |
| 页签项高 | 29（+1 分割线 = 30） | 页签 | `UniversalTabLayout.setTabItemHeightPx`（默认 48dp，必须改） |
| 页签下划线 | 18x3 radius 99 | 页签 indicator | `setTabIndicatorSizePx(18dp, 3dp)`（默认 16x3，需覆盖） |
| 页签文字 | 16sp/24 Medium | 页签 | `setTabTextSizePx(16sp)`（默认 14sp） |
| 状态栏 | 设计 21（iOS 44 量法） | 系统 | Android 常见 24–38，不撑高标题栏对齐，偏差记交付说明 |

---

## 5. 状态规格（StateSpec，只列设计稿里真有的状态）

| 区块 | 状态 | 视觉表现 | 触发 | 出处 |
| --- | --- | --- | --- | --- |
| 页签项 1 | 选中 | 16sp Medium `color_primary` + 下划线 18x3 | 默认 | section 2 `textColor` 0–5 |
| 页签项 2/3 | 未选中 | 16sp Medium `text_gy2`，无下划线 | 默认 | section 2 `textColor` |
| 单选选项 | 未选中 | 16x16 圆形描边 `text_gy3` 1px、透明底、文字 `text_gy1` | 默认 | section 3 全部 |
| 单选选项 | 选中 | **设计稿里不存在** | — | 6 个单选行全未选；只能按工程规范推导（描边换 `color_primary` 或填充），偏差写交付说明 |
| 多选选项 | 未选中 | 16x16 方框 radius 2、`text_gy3` 1px 描边 | 默认 | section 10 大部分 |
| 多选选项 | 选中 | 方框填充 `color_primary` + 白色内部勾 | 点击 | section 10「胸管」「三腔管」 |
| 分值文字 | 常规 | 14sp `text_gy3`，紧跟标签右侧 16 | — | section 3「1分/2分/3分/4分」 |
| 分值文字 | 占位/待定 | section 10 的「8分」被标 `_placeholder:true` 且被 `allTexts` 排除 | — | 见 §6-5，按数据传，不写死 |
| 提交按钮 / 汇总 | — | 几何不在本次数据内 | — | `allTexts` 有文案「确定」「压疮等级：15分…」 |
| 禁用 / 错误 / 加载 / 空 | 未出现 | — | — | 设计稿没有，不凭空实现 |

---

## 6. 读数据时发现的伪影与冲突（照抄会出错）

1. **页签 flex 说 `gap:50px`，实测间距是 39.5**：三项在 351 宽里 `justifyContent:space-between`，80/80/112 + 39.5 + 39.5 = 351。`gap:50px` 是失效残留，按 space-between 理解（这条直接决定 §7-1 的组件缺口）。
2. **网格 `gap:"27px 12px"` 的方向与 CSS 相反**：实测第一列 27、行 12；照 CSS 写成 `row 27 / column 12` 会整块错位。
3. **同一文本三处颜色来源打架**：页签节点级 `fill=#111827`、逐字 `textColor=#3A74FC/#666666`。取 `textColor`（状态色），丢弃 `#111827`。
4. **节点名大面积过期**：页签项名「联系信息」、选项名「女」、分组名「性别」、分值名「6分」而文案是「1分」。不能拿 `name` 当业务语义。
5. **`_placeholder:true` 在同一份设计里不自洽**：section 3 的「1分/2分/3分/4分」没标，section 10 的「8分」全标；`allTexts` 恰好**排除了所有 placeholder 文本**（所以 `8分` 不在 `allTexts` 里，而 `1分…4分` 在）。判据只能是「它在页面上是不是真实内容」：标题「护理评估单」、工具条「图片识别/语音录入」虽标 placeholder，但它们是真实文案，保留；section 10 的「8分」按占位处理，分值随数据传入。
6. **`allTexts` 不是完整闭集**：它不含导航标题「护理评估单」、工具条「图片识别/语音录入」（因为被标了 placeholder），但 section 里有。核对文案时以 section 为准，`allTexts` 只当补集参考。
7. **状态栏「9:41」是系统占位**，不实现；返回图标交给 `TitleBar`，不单独切图。
8. **选中态缺失、几何缺失**：单选选中态、底部两条、其余 12 个 section 在本次数据里都没有，不能编。

---

## 7. 组件能力核对（选定组件后必须做的三件事）

1. **`UniversalTabLayout` 表达不了设计的 space-between。**
   组件模式只有 `EQUAL`（等宽撑满）/ `FIXED` / `WRAP_CONTENT`（内容宽 + 固定 Item 间距，整排靠左）。设计是「内容宽 + 两端对齐、中间等缝」。
   - 用 `WRAP_CONTENT` + `setTabItemSpacingPx(39.5dp)`：375 宽上像素级吻合，但机床可用宽 < 375 时（如 361 机型内容宽 337 < 351）会挤/裁字。
   - 用 `EQUAL`：能自适应，但项宽 117≠80/80/112，下划线居中位也偏（49.5 vs 31）。
   - 按规范顺序：先用现有配置表达 → 需要真正 space-between 时**扩展公共组件（公共 API 变更要先征得确认）** → 只能近似还原就把偏差写进交付说明。**建议交宿主确认，不要私自改 UniversalComponents。**
2. **页签默认值会改写设计值**：默认项高 48dp（设计 29）、默认文字 14sp（设计 16）、默认内容内边距 12dp（设计项宽=文字宽，必须归零，否则 `压疮评估表` 会被省略号吃掉）、indicator 默认 16x3（设计 18x3）。全部要用 setter 覆盖。
3. **`RadioButtonComponents` / `CheckboxComponents` 默认图标都对不上**：Radio 默认是发票图 `component_cb_invoice_*`；Checkbox 默认是**圆点** `component_checkbox_circle_*`。单选要圆点、多选要方框，两者都要显式设 `radio_*Icon` / `checkbox_*Icon`。多选方框库内没有，需导出。
4. **提交按钮**：工程已有 `ShapeTextView`（radius/solidColor/pressed 都在属性里），优先用它；若宿主按旧规范走 drawable，则用 `{prefix}_bg_btn_submit.xml` + TextView。两条路都不硬编码颜色。

---

## 8. 还不确定 / 阻塞项（写代码前必须解决）

| # | 阻塞项 | 影响 | 需要什么 |
| --- | --- | --- | --- |
| 1 | **其余 12 个 section 的 DSL 缺失** | 整页 layout、行高、底部两条、滚动区高度都定不了 | 补拉 section 4–9、11–16（或整页 17 section） |
| 2 | **逐行选项与分值缺失** | 只有「感知能力」有 1–4 分；section 10 的 8 分是占位 | 量表分值来源（服务端字段 or 设计稿其余行） |
| 3 | **host 模块与 `{prefix}` 未定** | 资源名、layout 名、`mipmap` 目录、依赖加哪都依赖它 | 宿主指定业务模块（zhb 现无「护理评估」模块，`ZhbPhysicalExamination` 是阿姨体检，不吻合） |
| 4 | **图标像素资源没有** | 4 个工具条图标 + 多选方框图标取不到 | MasterGo 客户端按 `{prefix}_ic_` 导出 WebP，放 `mipmap-xhdpi` |
| 5 | **页签 space-between 能力缺口** | 影响页签像素还原 | 宿主决策：接受 `WRAP_CONTENT`+39.5dp 的窄屏风险，或批准扩展公共组件 |
| 6 | **`dv`/`ItemWidget` 是否适用于本页** | 决定走 `BaseActivity`+RecyclerView 还是 `BaseWidgetFragment` | 宿主/模块负责人确认 |
| 7 | **多选选中图标内部图形歧义** | section 10 选中态同时有白色 `13x12` 椭圆和 `20x20` 主题色 PATH@(-2,-2) | 看导出图确认是「白勾」还是别的形状 |
| 8 | **页签切换语义** | 三张评估单是同布局换数据，还是三个独立页 | 数据接口/产品确认；若换数据用一个列表重载即可，语义上仍是真实内容切换 |

---

## 9. 开工清单（对照规范的「开工检查」）

- [x] 设计数据来源已记录（fileId / layer_id / 5 个 section ID）
- [x] 复用组件已列，工程实测存在（UniversalTabLayout / RadioButtonComponents / CheckboxComponents / TitleBar / ShapeTextView / BRVAH）
- [x] 每块写了「形态 → 组件 → 行为」，含 4 个跳转目标
- [x] 每块定了自己绘制 / 图标 / 自定义控件：结构自绘；4 个工具条图标 + 2 个选项图形用资源；本页**不新建自定义控件**（无数据驱动图形）
- [x] 颜色/尺寸查过 `TobBaseResource`（`colors.xml`、`dimens_semantic.xml`、`dimens.xml` 实测），缺项已列新增名
- [x] 已读 `android-pitfalls.md`：本页要防「固定行高写死」「横向写死 150/351」「ViewPager2 页面不铺满」「indicator 只挂单个容器」
- [x] 文案处理已定：固定 chrome 入 `strings.xml`，量表选项/分值是数据
- [ ] **未完成**：补全 12 个 section、分值来源、host 模块、图标像素资源 —— 见 §8
- [ ] 未完成前**不写布局和代码**

**最终判断：本轮数据下不能开工。结构骨架已就绪，但 §8 的 1–4 项是硬阻塞。**

---

## 附录 A：全文案闭集（`allTexts`，原样）

```
压疮评估表 跌倒评估表 导管脱落评估表 感知能力 完全受限 1分 大部分受限 2分 轻度受限 3分 无损害 4分
潮湿程度 持续潮湿 常常潮湿 偶尔潮湿 罕见潮湿 活动能力 卧床 坐椅子 偶尔步行 经常步行 移动能力 非常受限
轻微受限 不受限 营养摄取能力 非常差 可能不足 充足 丰富 摩擦力和剪切力 存在问题 潜在问题 不存在问题
I类导管 胸管 气切套管 气管插管 动静脉插管 脑室引流管 三腔管 II类导管 双套管 负压球 深静脉导管 T管
造瘘管 胃肠减压 III类导管 导尿管 鼻饲管 意识 烦躁 意识不清 不配合 护理措施 加强固定 使用约束带
警示标识 安全教育 导管观察 压疮等级：15分 跌倒等级：24分 导管等级：20分 确定
```

> `allTexts` 不含「护理评估单 / 图片识别 / 语音录入」（被标 placeholder），核对时以 section 为准。

## 附录 B：`strings.xml` 键建议（固定 chrome）

| key | 文案 |
| --- | --- |
| `{prefix}_assessment_title` | 护理评估单 |
| `{prefix}_assessment_entry_image` | 图片识别 |
| `{prefix}_assessment_entry_voice` | 语音录入 |
| `{prefix}_assessment_submit` | 确定 |
| `{prefix}_assessment_summary_pressure` | 压疮等级：%s分 |
| `{prefix}_assessment_summary_fall` | 跌倒等级：%s分 |
| `{prefix}_assessment_summary_catheter` | 导管等级：%s分 |

量表标题、选项名、分值不入 `strings.xml`（数据驱动）。
