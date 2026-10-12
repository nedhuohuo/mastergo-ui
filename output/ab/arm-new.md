# 护理评估单 · 开工前准备（arm-new）

输入只有 `output/ab/fixture-84-079220.md`（MasterGo `fileId 153149080980227` / `layer_id 84:079220`，
17 个 section 中的 **5 个节选**：section 0 / 1 / 2 / 3 / 10）。
没有访问 MCP、浏览器或截图，也没有把 fixture 之外的数据补进来。

**开工判定（先说结论）**

| 范围 | 判定 | 依据 |
| --- | --- | --- |
| fixture 覆盖的 5 个 section（导航 / 识别工具条 / 页签 / 单选评分行 / 多选评估行） | 可开工，五项分析已闭环 | 见 §1–§5，每个数值都能指到 fixture 节点 |
| 全页 17 个 section | 不可开工 | 12 个 section 的结构数据不在 fixture 里，几何值不可得，见 §6 |
| 工程侧 | 有 1 个待宿主确认项 | 目标模块与 `resourcePrefix`（业务模块在 `zhb/` 下没有护理/评估类模块），见 §6 |

下文所有数值都来自 fixture 的节点坐标与尺寸；凡不是 fixture 直接给出、而是推算出来的，都在单元格里写明推算过程。

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 153149080980227 |
| page_id / 真实 layer_id | 只有 `layer_id 84:079220`（真实内容图层）；fixture 未给 `page_id` |
| 设计稿链接 | fixture 未给链接，按 fileId + layer_id 记录 |
| 页面尺寸 | 375 x 1550，root FRAME 名称「护理评估单」，fill #FFFFFF |
| 读取范围 | 5 / 17 个 section：`0` 导航(84:079237)、`1` 识别工具条(455:044573)、`2` 页签(84:079652)、`3` 单选评分行(84:079344)、`10` 多选评估行(225:001138) |
| 数据格式 | 等价 `getDesignSections(format=tree)`，带 `allTexts` / `rowTexts` / `placeholderTexts` / `splitContainers` |
| 目标工程 | 知护办 Android，`/Users/huohuo/AndroidStudioProjects/artigence`；公共组件 `common/`，业务模块 `zhb/` |
| 目标模块 | 未定，见 §6（组件、资源、基类核对在 `common/` 与 `zhb/` 现有模块上完成） |

## 1. PageStructure

页面层三层拆解，`[n]` 是 fixture 里的 section 序号。

```text
页面 375x1550  fill #FFFFFF（fixture 只覆盖 5/17 section）
├── [0] 导航 375x88 @0,0 白底 固定
│   ├── 状态栏图形 339.66x21 @21,14.33（iOS 状态栏，Android 用系统状态栏）
│   ├── 返回 GROUP back_currency 25x25 @12,53（内含 PATH 10x10 @9.41,8）
│   └── 标题「护理评估单」90x22 @143,55，18sp/22 Medium #333333 居中
├── [1] 识别工具条 351x40 @12,100（胶囊 radius 89，底 rgba(58,116,252,.15)，1px 描边 #3A74FC，padding 8/12）
│   ├── 容器 3179 327x24 @12,8（row，justify space-between，两块各 150x24，间距 27）
│   │   ├── 图片识别块 150x24：图标 18x18 + 6 + 文本 73x24(18sp #3A74FC) + 6 + 图标 16x16
│   │   ├── 竖线 直线52 12x? fill rgba(58,116,252,.5)
│   │   └── 语音录入块 150x24：同结构
├── [2] 页签 351x30 @12,152
│   ├── 页签行 H2 351x29：3 项内容宽 80 / 80 / 112，x=0 / 119.5 / 239（项间距 39.5，右端正好 351）
│   │   ├── 选中项容器 80x29：「压疮评估表」16sp/24 Medium #3A74FC + 下划线 18x3 @31,26（圆角 101）
│   │   └── 未选中项：「跌倒评估表」/「导管脱落评估表」16sp/24 Medium #666666，无下划线
│   └── 底部分割线 直线56 348x? @0,30 fill #D8D8D8
├── [3] 单选评分行 351x100 @12,198（重复单元 A）
│   ├── 行标题「感知能力」56x20 @0,0 14sp/20 Medium #333333
│   └── 评分卡 351x76 @0,24 fill #F9F9F9 radius 12，padding 12
│       └── 选项网格 327x52 @12,12（2 列，列间距 27、行间距 12）
│           └── 选项 150x20：圆点 16x16(@0,2,radius 264,stroke #999999 1px) + 8 + 标签 14sp #333333 + 16 + 分值 14sp #999999
└── [10] 多选评估行 351x132 @12,918（重复单元 B）
    ├── 行标题「I类导管」46x20 @0,0 14sp/20 Medium #333333
    └── 评分卡 351x108 @0,24 fill #F9F9F9 radius 12，padding 12
        └── 选项网格 327x84 @12,12（2 列 x3 行，列间距 27、行间距 12）
            └── 选项 150x20：方框 16x16(@0,2,radius 2) + 8 + 标签 14sp #333333 + 16 + 分值 14sp #999999
```

`splitContainers`（fixture 给出，能提供 fixture 未展开部分的容器边界）：

```text
容器 3236 (84:079271) 375x1438 @0,100   → 主体容器，100..1538
DIV      (84:079272) 375x1386 @0,152    → 内容白底，152..1538
DIV      (84:079273) 351x742  @12,152   → 页签 + 单选组，152..894
容器 3315(84:079274) 351x680  @12,198   → 单选组：680 = 6x100 + 5x16（6 个单选行，行间距 16）
容器 3315(225:001078)351x596  @12,918   → 多选组：596 > 132，说明该组不止 fixture 里的 1 行
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 导航栏 | 固定（内容从 y=100 起，导航占 0..88） | 无 | 页面标题 | section 0；88 = 44 状态栏区 + 44 标题行 |
| 识别工具条 | 随页首 | 2 个结构相同的操作块 | 功能入口 | section 1；两块各带跳转目标 |
| 页签 | 随页首（在内容区顶部） | 页签项 x3 | 评估单类型 | section 2；切 3 张评估单 |
| 单选评估行 | 滚动 | 选项 x4 / 行 | 评估项 + 选项 + 分值 | section 3；同型共 6 行（由 84:079274 高 680 反推） |
| 多选评估行 | 滚动 | 选项 x6 / 行 | 评估项 + 选项 + 分值 | section 10；同型行数 > 1（由 225:001078 高 596 反推） |
| 底部区 | fixture 未覆盖 | 未覆盖 | 等级汇总 + 提交 | `allTexts` 有「压疮等级：15分 跌倒等级：24分 导管等级：20分 确定」，但无几何值 |

**页面文案闭集**：fixture 的 `allTexts` 是整页文字，可直接当文案核对表（结构数据缺失不等于文案缺失）。整页共 11 行评估项：
感知能力 / 潮湿程度 / 活动能力 / 移动能力 / 营养摄取能力 / 摩擦力和剪切力（单选侧）+ I类导管 / II类导管 / III类导管 / 意识 / 护理措施（多选侧），
选项文案与「压疮等级：15分 / 跌倒等级：24分 / 导管等级：20分 / 确定」都在 `allTexts` 里。

## 2. ComponentMap

形态按 SKILL.md「先看形态，再定组件」判；复用来源写清是 `UniversalComponents` / 已接入三方 / 原生。

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 导航栏 | 顶部固定高 + 左侧返回 + 居中标题 | `com.yilife.android.widget.component.titlebar.TitleBar` | 返回可退 | 依赖 `implementation Module.titleBar`（aar 实测 1.0.3，`initializeHeader` / `setLeftOne`） | 内置高度写死 48dp（设计标题行 44dp）、返回图标用自带 `widget_svg_back`、标题走 `@color/normal_text` | 不新建 |
| 识别工具条 | 胶囊容器里两个「图标 + 文案 + 尾图标」可点块 | `RoundedLinearLayout`（承包胶囊底/描边/圆角）+ 2 个可点区域 | 图片识别、语音录入各自跳转 | `UniversalComponents`（`roundSolidColor` / `roundBorderWidth` / `roundBorderColor` / `roundCornerRadius` 实测存在） | 无内边距默认值；padding 8/12 必须显式写 | 不新建控件（无数据驱动绘制，静态装饰） |
| 页签 | 一排 3 个文字项，选中项带下划线 | `UniversalTabLayout`（`NORMAL` 样式 + `WRAP_CONTENT`/`EQUAL`） | 点击切 3 张评估单，要真实内容容器 | `UniversalComponents`（`usage/UniversalTabLayout.md`） | 默认 itemHeight 48dp、textSize 14sp、contentHorizontalPadding 12dp、itemSpacing 0、indicator 16x3 圆角 99dp；选框默认 false | 不新建 |
| 单选评分行 | 灰底圆角卡内 2 列网格，圆点单选 | `RadioButtonComponents` 置于 `RadioGroup`（项目已有同款用法：`StaffServiceUsesAdapter`） | 选中互斥，回填分值 | `UniversalComponents` | 默认图标是 `component_cb_invoice_*`（invoice 形状），必须覆盖为圆形；默认 `radio_iconSize` = `dp_18`、`radio_iconPadding` = `dp_8`；设计是 16 / 8 | 不新建 |
| 多选评估行 | 同结构，方形勾选 | `CheckboxComponents` | 多选，回填分值 | `UniversalComponents` | 默认图标是圆形 `component_checkbox_circle_*`，与设计的 2dp 圆角方框不符，必须覆盖 `checkbox_checkedIcon` / `checkbox_uncheckedIcon`；默认 `checkbox_iconSize` 同样是 `dp_18` | 不新建 |
| 选项行（图标 + 标签 + 分值） | 间距一致、结构相同的重复行 | `FlexboxLayout` 承载网格 + 选项布局（或 RecyclerView + FlexboxLayoutManager） | 整块可点 | 已接入三方 `com.google.android.flexbox:flexbox:3.0.0`（`Dept.kt` 实测；`StaffServiceUsesAdapter` 已用） | flexbox 3.0.0 **没有 gap 属性**，27/12 要用 divider drawable 或 margin 表达 | 不新建：禁止复制静态行 |
| 页签底分割线 / 表单分割线 | 1px 细线 | `DividerComponents` | 无 | `UniversalComponents`（`dividerColor` / `dividerThickness` 实测存在） | 需要显式给颜色和线宽 | 不新建 |
| 页面容器 / 卡片 | 白底页 + 灰底圆角卡 | 原生 `ConstraintLayout` + `RoundedLinearLayout`（`roundSolidColor` + `roundCornerRadius`） | 无 | 原生 + `UniversalComponents` | `RoundedLinearLayout` 复用 `RoundedConstraintLayout` 的 styleable 名，不要按类名找属性 | 不新建 |

形态判定要点：页签是**页签**不是装饰（选中态换色 + 下划线，必须能切内容）；工具条里带 `interactive` 跳转的目标是**可跳转结构**；
选项行的圆点/方框是**单/多选控件**，不是静态图形。fixture 里没有出现「带 `▾` 的下拉」「底部导航」「时间线」形态。

## 3. ResourceMap

颜色（先查 `common/TOBBaseResource/src/main/res/values/colors.xml`，实测色值见右注）：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| #3A74FC（工具条文字与描边、页签选中与下划线、多选选中底） | `color_primary`（实测 #5460FE） | — | 设计稿旧主题色，按规范落语义色，色差不回改设计侧 |
| rgba(58,116,252,0.15)（工具条底） | 无 | `{prefix}_color_primary_15`（#265460FE） | 透明叠加色，TobBaseResource 无对应项 |
| rgba(58,116,252,0.5)（工具条竖线） | 无 | `{prefix}_color_primary_50`（#805460FE） | 同上 |
| #333333（标题、行标题、选项标签） | `text_gy1`（实测 #333333） | — | 直接引用 |
| #666666（未选中页签） | `text_gy2`（实测 #666666） | — | 直接引用 |
| #999999（分值文本、未选中圆点/方框描边） | `text_gy3`（实测 #999999） | — | 直接引用 |
| #FFFFFF（页面底、页签底、标题行底） | `bg_base` / `text_white` | — | 直接引用 |
| #F9F9F9（评分卡底） | 无（最近的是 `fill_light` #F5F5FA、`bg_page` #F5F5F7，均不等值） | `{prefix}_color_card_bg` | 语义色阶里没有中性灰卡底，按规范不拿近似色硬套 |
| #D8D8D8（页签底分割线） | 无（border 系列为 #CECED6 起的偏蓝灰） | `{prefix}_color_divider` | 同值资源不存在，模块内定义 |
| #111827（页签文本节点级 `fill`） | 不使用 | — | 与逐字 `textColor` 冲突；选中/未选中属于状态色，按 `textColor` 取 #3A74FC / #666666 |

尺寸 / 字号 / 圆角 / 线宽：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| 页面左右边距 12 | `space_base` | — | 375-24 = 351 = fixture 内容宽 |
| 单选组行间距 16 | `space_small` | — | 由 `84:079274` 高 680 = 6x100 + 5x16 反推 |
| 评分卡内边距 12、卡片内 gap 12、行标题到卡片 4、图标到标签 8、标签到分值 16 | `space_base` / `space_micro` / `space_mini` / `space_small` | — | 全部命中语义档 |
| 评分卡圆角 12 | `radius_larger` | — | 直接引用 |
| 选项方框圆角 2、圆点 radius 264 | `radius_smaller`（方框） | — | 圆点是圆形图标，由图标资源承担 |
| 字号 18 / 16 / 14 | `font_medium` / `font_basic_large` / `font_basic_body` | — | 导航 18、页签 16、其余 14 |
| 导航 88、工具条 40、页签行 29/容器 30、单选行 100、卡片 76、多选行 132、卡片 108、选项 150x20、图标 25/18/16 | `dp_88` / `dp_40` / `dp_29`+`dp_30` / `dp_100` / `dp_76` / `dp_132` / `dp_108` / `dp_150`+`dp_20` / `dp_25`+`dp_18`+`dp_16` | — | 实测 `common/TOBBaseResource/.../dimens.xml` 有 `dp_0`–`dp_600` 全档；语义档对不上时用同库 `dp_*`，**不要**在业务模块新建同值尺寸 |
| 工具条胶囊 radius 89、页签下划线 radius 101 | 无对应圆角档（最大 `radius_round` 16） | — | 两者都是全圆角：工具条按半高 `dp_20`，下划线直接用组件默认 `universal_tab_indicator_radius` 99dp |
| 分割线 1px | `divider_thickness_default` | — | 页签下 348 宽、表单 351 宽 |
| 文本行高 24 / 20 / 22 | 无对应语义档 | `dp_24` / `dp_20` / `dp_22` | 用同库 dp 档 |

图标：

| 图标 | 来源（UniversalComponents / MasterGo） | 资源名 | 密度 |
| --- | --- | --- | --- |
| 返回箭头 25x25 | `TitleBar` 自带 `widget_svg_back`（aar 内实测，各密度位图 + anydpi v24 矢量）；如需独立图标，`UniversalComponents` 有 `universal_customer_detail_ic_back.xml` | 不新增 | — |
| 图片识别 18x18 | `UniversalComponents` 无可对上图标（只有 `universal_icon_translate`、`universal_customer_detail_ic_*` 等）→ 从 MasterGo 导出 | `{prefix}_ic_ai_image` | `mipmap-xhdpi`，无损 WebP |
| 语音录入 18x18 | 同上 → MasterGo | `{prefix}_ic_voice_input` | `mipmap-xhdpi`，无损 WebP |
| 工具条右侧 16x16 x2（两块各一个，带跳转） | MasterGo | `{prefix}_ic_arrow_forward` | `mipmap-xhdpi`，无损 WebP |
| 单选圆点 16x16（未选中描边圆 / 选中） | `UniversalComponents` 默认 `component_checkbox_circle_unselect` / `component_checkbox_circle_select`（放在组件自身的高密度 `mipmap` 目录）与设计同为圆形 | 不复制，直接引用；`radio_iconSize` 覆盖为 `dp_16` | — |
| 多选方框 16x16（未选中 1px #999999 圆角 2 / 选中 #3A74FC 底 + 白色勾） | `UniversalComponents` **没有**方框图标（只有圆形 `component_checkbox_circle_*` 与 invoice 形状 `component_cb_invoice_*`）→ MasterGo | `{prefix}_ic_checkbox_off` / `{prefix}_ic_checkbox_on` | `mipmap-xhdpi`，无损 WebP |

MasterGo 出图的路径按规范执行：`mastergo-magic-mcp` 的 `extractSvg` 只给 SVG/PATH 字符串，不给位图；需要 WebP 时由用户从 MasterGo 客户端导出 PNG，只接入所需密度后转无损 WebP 放进 `mipmap-xhdpi`，不要手写 Vector XML 顶替。

## 4. LayoutSpec

四个间距层级分开写，不共用一个数值。

| 项 | 设计值 | 落在哪一层 | 实现方式 |
| --- | --- | --- | --- |
| 页面左右边距 | 12（`space_base`） | 内容根容器 | `layout_marginStart/End`；内容宽 375-24 = 351 |
| 页签区到首个评估行 | 16（页签行落到 y=182，首个评分行 y=198） | 滚动内容容器 | 与行间距同值 |
| 评估行之间的间距（Item 间距） | 16（`space_small`） | 列表/容器 | 由 `84:079274` 680 = 6x100 + 5x16 反推；RecyclerView 用 `ItemDecoration` 或 item 底部 margin |
| 行标题到评分卡 | 4（标题 20 高，卡片 y=24） | 评估行根布局 | `space_micro` |
| 评分卡内边距 | 12（`space_base`），卡片自身 gap 12 | 卡片容器 | `padding` 12；卡内只有网格时 gap 不生效 |
| 选项网格 | 列间距 27、行间距 12；列 x=0 / 177（150+27） | 卡片内网格 | `FlexboxLayout` 3.0.0 无 gap：用 `dividerDrawableVertical`(27x1) + `showDividerVertical="middle"`、`dividerDrawableHorizontal`(1x12) + `showDividerHorizontal="middle"`；横向宽度用权重/百分比，**不要**写死 150 |
| 选项行内结构 | 图标 16 + 8 + 标签 + 16 + 分值 | 选项行 | 图标到标签 8（`space_mini`），标签到分值 16（`space_small`）；分值紧跟标签，不推到最右 |
| 组件尺寸（宽 x 高） | 导航 375x88（内容行 44）；工具条 351x40；页签 351x30（行 29）；单选行 351x100（卡 351x76）；多选行 351x132（卡 351x108）；选项 150x20 | 各自容器 | 纵向高度写死是对得上的；横向 351 用 `match_parent` + 12 边距，不写死 351 |
| 字号 / 行高 | 标题 18sp/22；工具条文字 18sp/24；页签 16sp/24；行标题 14sp/20；选项标签与分值 14sp/20 | 各文本 | 字体档命中 `font_*`；行高用 `dp_*` |
| 圆角 | 卡片 12；选项方框 2；工具条胶囊 = 半高（89px on 40）；页签下划线 = pill（101px） | 各容器 | `radius_larger` / `radius_smaller` / `dp_20` / 组件默认 indicator 圆角 99dp |
| 对齐关系 | 标题在导航行内居中（143 = (375-90)/2）；工具条两块各 150x24 且 `justify-content: space-between`（间距 27）；块内图标+文案+图标居中，gap 6；页签三项靠左、项间距 39.5、右端正好 351；选项图标与文字垂直居中 | 各容器 | 工具条用 `LinearLayout` + `weight`/`space-between`；页签见下方能力说明 |
| 页签项间距 | 39.5（80/80/112 + 39.5x2 = 351） | 页签容器 | **能力缺失**：`UniversalTabLayout` 的间距是子项 margin，首尾各留一份，n=3 时总宽 = 内容 + 4x间距；要落进 351 则间距必须 ≤ 19.75dp，39.5 会溢出被裁。按规范「能力缺失时先把偏差写进交付说明」：本次用 `EQUAL`（默认）铺满 351、文案居中，偏差记 §8；需要精确还原时由宿主决定是否给公共组件加「内容宽 + 均分剩余」能力（公共 API 变更需先确认） |
| 导航状态栏 | 设计 88 里上面 44 是 iOS 状态栏图形 | 窗口 | 按项目现有写法 `statusBar { immersive(darkMode = true); fixedViewMarginTop(binding.titleBar) }`，状态栏高度差属平台差异，不为对齐撑高标题栏 |

## 5. StateSpec

只列 fixture 里真实出现的状态。

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 页签「压疮评估表」 | 选中 | 16sp Medium `color_primary` + 下划线 18x3（圆角 101） | 默认 | section 2，`84:079660` + `84:079664` |
| 页签「跌倒评估表」「导管脱落评估表」 | 未选中 | 16sp Medium `text_gy2`，无下划线 | 默认 | section 2，`84:079665` / `84:079655` |
| 单选选项 | 未选中 | 圆点 16x16 透明底 + 1px `text_gy3` 描边；标签 `text_gy1`；分值 `text_gy3` | 默认 | section 3，4 项全为未选中 |
| 单选选项 | 选中 | fixture 未提供（同一设计里 6 个单选行都没有选中态） | 不在数据内 | 无出处 |
| 多选选项 | 未选中 | 方框 16x16 透明底 + 1px `text_gy3` 描边 + 圆角 2；标签 `text_gy1`；分值 `text_gy3` | 默认 | section 10，「气切套管 / 气管插管 / 动静脉插管 / 脑室引流管」 |
| 多选选项 | 选中 | 方框 16x16 填 `color_primary` + 圆角 2 + 白色内部图形 13x12 | 点击 | section 10，「胸管」「三腔管」同时选中（可多选） |
| 选项分值 | 常规 | 14sp `text_gy3`，位于标签右侧 16 | — | section 3 与 section 10 全部选项 |
| 识别工具条 | 常规 | 胶囊底主题色 15%、1px 主题色描边、文字与图标 `color_primary` | — | section 1 |
| 识别工具条 | 可跳转 | 文本节点带 `interactive.navigation` | 点击 | 见下表 |
| 导航栏 | 常规 | 白底，返回可点，标题居中 | — | section 0 |
| 禁用 / 按下 / 加载 / 空 / 错误 | fixture 未出现 | — | — | 无出处，不凭空实现 |

跳转目标（fixture `interactive` 原值）：

| 触发 | 目标 layer_id |
| --- | --- |
| 「图片识别」文本 | 84:082915 |
| 「图片识别」右侧 16x16 图标 | 84:081370 |
| 「语音录入」文本 | 84:090864 |
| 「语音录入」右侧 16x16 图标 | 84:097978 |

## 6. 开工结论与缺口清单

**可以在 fixture 覆盖范围内开写的部分**：导航栏、识别工具条、页签行、单选评分行、多选评估行的布局与样式（§1–§5 的数值都能指到节点）。

**开工前必须先拿到的数据（12 个 section 缺失，编号来自 fixture「17 个中的 5 个」）**：
section `4`–`9`、`11`–`16`。其中 `4`–`8` 是余下 5 个单选评分行，`11`–`13` 是 II类/III类导管与意识，`14` 是护理措施，`9` 是表单分割线，`15`/`16` 是底部等级汇总与提交按钮。
这些 section 的**几何值（尺寸、间距、颜色、状态、行数）fixture 完全没给**，只能用 `allTexts` 推文案、用 `splitContainers` 推行组高度：
不要用别的来源或估算值把它们补齐，也不要照抄其它分析文档里的数字。

**唯一的工程侧待确认项**：目标模块与 `resourcePrefix`。
`zhb/` 下现有模块（`ZhbModuleWorkbench`、`ZhbModuleMain`、`ZhbModuleInterview`、`ZhbModuleCrm`、`SchedulingModule`、`ZhbPhysicalExamination` 等）都没有护理评估类功能，全仓库 `grep 评估表|压疮|跌倒评估|导管脱落` 在业务源码里 0 命中，说明这是新页面。
建议二选一，由宿主定：新建 `zhb/ModuleNursingAssessment/NursingAssessment`（`resourcePrefix 'nursing_assessment_'`），或并入既有模块并沿用其 `resourcePrefix`。
在模块定了之前，本文所有模块资源名写成 `{prefix}_...`，layout / drawable / mipmap 名同样按 `{prefix}_` 拼接；ID 不受影响（ID 只带类型前缀）。

## 7. 实现清单

- [ ] 基类：页面用 `com.yilife.android.arch.page.page.BaseActivity`（aar 实测 1.0.23 只有 `afterCreate(Bundle)` 抽象方法，`initView()` / `initListener()` / `initData()` 是自建方法，在 `afterCreate` 里按序调用）；`afterCreate` 内先 `statusBar { immersive(darkMode = true); fixedViewMarginTop(binding.titleBar) }` 再 `binding.titleBar.initializeHeader("护理评估单")`，写法对齐 `ZhbModuleMain/SettingActivity`
- [ ] ViewBinding：`private val binding by bindings<XxxBinding>()`（`com.yilife.android.arch.toolkit.ktx.bindings`，项目实测）
- [ ] 依赖：目标模块 `build.gradle` 确认有 `Module.tobBaseResource`、`Module.universalComponents`、`Module.titleBar`、`Module.basePage`、`ThirdDependence.Flexbox.flexbox`；缺哪行只补哪行，不写死版本、不新增其它依赖
- [ ] 页签：`UniversalTabLayout` 用 `NORMAL` + 真实内容容器；覆盖 itemHeight 29dp、textSize 16sp、contentHorizontalPadding 0、默认文字色 `text_gy2`（选中色组件默认已是 `color_primary`）；选中态和 indicator 交给组件，布局里不放 indicator View
- [ ] 选项：单选用 `RadioButtonComponents`（`RadioGroup` 互斥，覆盖 `radio_iconSize` 为 `dp_16`、`radio_iconPadding` 为 `dp_8`）；多选用 `CheckboxComponents`（覆盖 `checkbox_checkedIcon` / `checkbox_uncheckedIcon` / `checkbox_iconSize`）
- [ ] 网格：`FlexboxLayout` 承载选项，间距用 divider drawable 表达 27/12；横向尺寸用权重/百分比，不写死 150
- [ ] 行容器：单选组 6 行、多选组多行走列表容器 + item 布局，不复制静态行；固定高度的区块写 XML，不在代码里现拼
- [ ] 文案按设计稿直接写在布局里，不抽 `strings.xml`；颜色、尺寸不硬编码
- [ ] 图标：先引用 `UniversalComponents` 已有图标；方框勾选图标与工具条 3 个图标从 MasterGo 导出，接 `mipmap-xhdpi`

## 8. 验收

- [ ] 编译通过
- [ ] 安装的是本次构建的包（`adb install` 输出 `Success`、`lastUpdateTime` 已更新）
- [ ] `adb shell uiautomator dump` 能找到 fixture 覆盖范围的每段文案：护理评估单、图片识别、语音录入、压疮评估表、跌倒评估表、导管脱落评估表、感知能力、完全受限/大部分受限/轻度受限/无损害、1分/2分/3分/4分、I类导管、胸管/气切套管/气管插管/动静脉插管/脑室引流管/三腔管、8分
- [ ] 截图逐块比对：导航栏、识别工具条胶囊、页签下划线、评分卡网格、多选选中态
- [ ] 交互真跑一遍：返回能退、页签能切且内容真的换、单选互斥、多选可多选、工具条两个入口能跳转
- [ ] 关键数值量实际控件：评分卡 351 宽、卡内边距 12、选项行 150x20（或权重等分后的实测值）、列间距 27、行间距 12、页签行高 29
- [ ] 未在设备上点过的部分、以及 §9 的偏差，写进交付说明

## 9. 读取时发现的坑（交付说明必写）

1. **输入只是节选，不能当整页**。fixture 明说 17 个 section 里的 5 个；`allTexts` 给了整页文案闭集，但 section `4`–`9`、`11`–`16` 的几何值不在数据里。任何按整页交付的结论都要先补这 12 个 section。
2. **`_placeholder: true` 不能整批删**：section 0 的「9:41」「护理评估单」、section 1 的「图片识别」「语音录入」、section 10 的 6 组「8分」都被标了占位。逐条看语义：标题、入口文案、分值都是真实内容；只有 iOS 状态栏的「9:41」属于系统绘制。判据是语义，不是这个字段。
3. **文本颜色三处来源会打架，状态色不算冲突**：section 2 三个页签节点级 `fill` 都是 `#111827`，逐字 `textColor` 才是 `#3A74FC` / `#666666` / `#666666`。选中/未选中属于状态色，按 `textColor` 取；照 `fill` 或 `_color` 会把选中态抹平。section 3 与 section 10 的 `fill` 与 `textColor` 一致（#333333 / #999999），没有冲突。
4. **节点名大量过期，不能当业务语义**：页签项节点名是「联系信息」，实际文案是压疮评估表/跌倒评估表/导管脱落评估表；单选行标题节点名是「性别 」；多选行标题节点名也是「性别 」。文案以 `rowTexts` / `allTexts` 为准。
5. **`gap` 的语义要和 CSS 反着读**：section 3/10 的 `"gap":"27px 12px"` 实测是**列间距 27、行间距 12**（150 + 27 + 150 = 327，20 + 12 + 20 = 52）。按 CSS 直觉写成行 27、列 12 会直接错位。flexbox 3.0.0 也没有 gap 属性，得用 divider drawable 或 margin 表达。
6. **工具条竖线的高度字段在 fixture 里是 `?`**（`PATH 直线52 12x?`）。按 1px 宽、12 高、主题色 50% 处理；这条是 fixture 未解析出的字段，交付时一并说明。
7. **页签项间距是 `space-between` 而不是固定间距**：三个项 80/80/112 + 39.5 x2 正好 351，flex 声明里同时写了 `justify-content: space-between` 和 `gap: 50px`，实际渲染取了 space-between。`UniversalTabLayout` 三种 mode 里没有「内容宽 + 均分剩余」，属能力缺失；本次用 `EQUAL` 近似，槽位从 80/80/112 变成 117/117/117、文案居中，偏差要在交付说明里写清楚。
8. **高度档位不要新建模块尺寸**：导航 88、工具条 40、卡片 76/108、行 100/132 等，`common/TOBBaseResource/src/main/res/values/dimens.xml` 里 `dp_0`–`dp_600` 全档都有，直接用 `dp_*`；在业务模块另建同值尺寸等于重复定义。
9. **卡片底色 #F9F9F9 和分割线 #D8D8D8 在 TobBaseResource 里没有同值项**（最近的 `fill_light` #F5F5FA、`border_*` 系列都不同值），按规范在模块内以 `{prefix}_color_card_bg` / `{prefix}_color_divider` 定义，不用近似色阶硬套。
10. **`TitleBar` 的标题行是固定 48dp，设计是 44dp**，返回图标用自带的 `widget_svg_back`（设计是 25x25 的自绘 path）、标题走 `@color/normal_text`。这属于组件既有形态，不为对齐去改高度；偏差写交付说明。
11. **设计里没有的状态不要造**：全部 5 个 section 都没有禁用 / 按下 / 加载 / 空 / 错误态，单选选中态也没有出现，不凭空实现。

## 10. 已核对的目标工程事实（本文件所有工程结论的出处）

| 结论 | 核对命令 / 文件 | 结果 |
| --- | --- | --- |
| Activity 基类 | `grep -rhoE 'import .*\.Base(Activity\|Fragment\|ViewModel)' zhb --include=*.kt` | `com.yilife.android.arch.page.page.BaseActivity` 264 处、`BaseViewModel` 330 处、`com.yishou.android.lib.base.arch.fragment.BaseFragment` 246 处，与 `android-tob.md` 一致 |
| `BaseActivity` 能力 | javap `base-page-1.0.23.aar` | 只有 `onCreate` + 抽象 `afterCreate(Bundle)`；`initView/initListener/initData` 不是基类方法 |
| `BaseWidgetFragment` 能力 | 同上 | `initData`、`registerData2View`、`dv`、`addData`、`showEmptyView`、`showErrorView` 存在 |
| 依赖常量 | `zhb/AppShell/buildSrc/.../Dept.kt` | `basePage` 1.0.23、`titleBar` 1.0.3、`shapeTextview` 1.0.1、`tobBaseResource` 1.0.0-SNAPSHOT、`universalComponents` 1.0.7-redesign-9-SNAPSHOT |
| `TitleBar` 形态 | `titleBar-1.0.3.aar` | `widget_title_bar.xml` 48dp，`initializeHeader` / `setLeftOne` / `setRightOne` / `immersive` |
| `ShapeTextView` 属性 | `shapeTextview-1.0.1.aar` | `solidColor` / `solidColorPressed` / `solidColorEnable` / `strokeColor` / `strokeWidth` / `radius` 等 |
| 语义色 | `common/TOBBaseResource/.../colors.xml` | `color_primary` #5460FE、`text_gy1/2/3` #333333/#666666/#999999、`bg_base` #FFFFFF、`border_*`、`fill_*` |
| 语义尺寸 | `common/TOBBaseResource/.../dimens_semantic.xml` + `dimens.xml` | `radius_*`、`space_*`、`font_*`；另含 `dp_0`–`dp_600`、`sp_0`–`sp_99` |
| 页签组件 | `common/UniversalComponents/.../universaltablayout/UniversalTabLayoutMode.kt` + `usage/UniversalTabLayout.md` | 只有 `EQUAL` / `FIXED` / `WRAP_CONTENT`；itemSpacing 由子项 margin 实现，首尾各留一份 |
| 页签默认值 | `common/UniversalComponents/.../dimens_universal_tab_layout.xml` + `attrs_universal_tab_layout.xml` | itemHeight 48dp、textSize 14sp、contentHorizontalPadding 12dp、indicator 16x3 圆角 99dp |
| 单选 / 多选组件 | `RadioButtonComponents.kt` / `CheckboxComponents.kt` + `attrs_radio.xml` / `attrs_checkbox.xml` | `radio_*` / `checkbox_*` 属性齐全；默认图标分别为 invoice 圆形与圆形，与设计方框不符 |
| 组件真实用法 | `zhb/ModuleServiceStaffPhysical/.../StaffServiceUsesAdapter.kt` | 已有 `RadioButtonComponents` + `FlexboxLayout` 的表单用法可参照 |
| flexbox 能力 | `flexbox-3.0.0.aar` 的 `res/values/values.xml` | 只有 `dividerDrawable*` / `showDivider*`，**没有** gap 属性 |
| 圆角容器 | `RoundedLinearLayout.kt` + `attrs_round_constraint_layout.xml` | `roundSolidColor` / `roundCornerRadius` / `roundBorderWidth` / `roundBorderColor` |
| 分割线组件 | `DividerComponents.kt` + `attrs_tob_divider.xml` | `dividerColor` / `dividerThickness` / `dividerOrientation` |
| 列表适配器 | `common/CommonWidget/.../BaseRecyclerViewAdapter.kt`、`com.chad.library.adapter.base.BaseQuickAdapter` 已在 `Workbench` 使用 | 两条路线都在工程里可复用 |
| 目标模块 | 全仓 `grep -rln '评估表\|压疮\|跌倒\|导管脱落' --include=*.kt --include=*.xml`（排除 build） | 业务源码 0 命中，需要新建模块或由宿主指定模块 |
