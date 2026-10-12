# 报告详情-AI分析 UI 分析（MasterGo file 180767492624044 / layer 2:05452）

- 来源：https://mastergo.com/file/180767492624044?page_id=M&layer_id=2%3A05452
- 真实 layer_id：`2:05452`（页面级 `page_id=M` 是合成页 ID）；4 个 section、99 节点，画布 375×868，底色 #F6F6F6
- 页面级背景层（`splitContainers`）：`容器 5042`(2:05453) 349×719.8 @12,100 —— **按 layer_id 回查过它自己的元数据**：`background: transparent`、**无 borderRadius**，因此不需要画底；它只是页签 + 内容的父容器
- 落地模块：`zhb/ModuleNursingAssessment/NursingAssessment`（与上一页同模块）
- 数据：静态，按设计稿写死

## 1. PageStructure

| 层 | 区块 | 位置/尺寸 | 说明 |
| --- | --- | --- | --- |
| 页面 | 导航栏 | 375×88 @0,0 | 固定；这一版导航栏**自带白底**（FRAME `fill=#FFFFFF`），与上一页的透明导航栏不同；返回 20×20 @12,56，标题「报告详情」18sp Medium #333 @y=55 || 页面 | 页签行 | 349×27 @12,100 | 固定；3 项，`justifyContent: space-between`：时间轴 49 / 通话记录 65 / AI分析 48，选中项 #5460FE + 18×3 下划线 |
| 页面 | 内容面板 | 349×719.8 @12,100 | `容器 5042`，透明底、无圆角（回查元数据确认），承载页签与内容 |
| 区域 | 白色卡片 ai-summary | 351×680.8 @12,139 | 白底、radius 12、padding 12、wrap 间距 10/14；含标签区与 AI 分析区 |
| 区域 | 标签区 | 327×202.4 | 标题（3×16 主题色竖条 + 「标签」14sp SemiBold）+ 分类标签 6 个 + 具体标签 11 个 |
| 区域 | AI 分析区 | 322.7×440.4 | 标题（竖条 + 「AI分析总结」14sp Medium rgba(0,0,0,0.85)）+ 灰底摘要块 |
| 区域 | 摘要内容块 | 322.7×410 | #F5F5FA、radius 8、padding 12、间距 8；3 段通话文本 + 「分析：」+ 长文 |
| 内容 | 分类标签 | 高 24、radius 16、padding 2/8 | 全部（选中）/客户痛点(2)/客户异议(1)/客户问题(2)/客户基本信息(4)/客户健康状态(2)，均带 5×5 圆点（选中的「全部」无圆点、有 1px 描边） |
| 内容 | 具体标签 | 高 24、radius 4、padding 2/8 | 11 个，蓝 / 橙 / 绿三色成套 |
| 页面 | 底部安全区 | 375×34 @0,834 | 设计稿画的是系统 home indicator，不自己绘制，只消费导航栏 inset |

## 1.5 背景分区表（纵向逐段指到图层，实现里每段都要有一层）

| 区段（设计稿 y） | 设计稿图层 | 颜色/圆角 | 实现对应 |
| --- | --- | --- | --- |
| 0..88 | 编组备份 2（2:05605，FRAME 自带 fill） | #FFFFFF | 根布局白底（配合 `fitsSystemWindows` 一起盖住状态栏）+ `TitleBar` |
| 88..868 | rootContainer | #F6F6F6 | `ll_report_body`（注意：**不能**靠根白底兼顶，否则页签整段变白） |
| 100..819.8 | 容器 5042（2:05453） | transparent，无圆角（已回查该层元数据） | 无独立 view，透出上一段的页面灰 |
| 139..819.8 | ai-summary 卡片（2:05454） | #FFFFFF、radius 12、无描边 | `nursing_bg_report_card` |
| 397.8..807.8 | summary-content（2:05561） | #F5F5FA、radius 8 | `nursing_bg_report_summary` |

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 |
| --- | --- | --- | --- | --- |
| 导航栏 | 顶部固定高 + 左返回 + 居中标题 | `TitleBar` | `initializeHeader("报告详情")`、`setLeftOne()` → finish | `Module.titleBar`（上一页同款） |
| 页签行 | 一排文字 + 选中下划线 | `UniversalTabLayout`（EQUAL） | `setupViewPager2` 双向同步切换内容 | `Module.universalComponents` |
| 页签内容容器 | 翻页 | `ViewPager2` | 3 页；第 2 页（AI分析）是设计稿内容，前两页设计稿未给 → 空白页 | `ThirdDependence.AndroidX.viewPager2` |
| 白色卡片 / 灰底摘要块 / 竖条 | 圆角块 | shape drawable + `LinearLayout` | 无交互 | 原生 |
| 分类标签 | 胶囊 + 圆点 + 文字 | `FlexboxLayout` + 逐项 inflate 的 `LinearLayout` | 「全部」选中态；点选切换留空实现 | `ThirdDependence.Flexbox.flexbox` |
| 具体标签 | 圆角小标签 | `FlexboxLayout` + `TextView` | 无交互 | 同上 |
| 摘要文本 | 多段正文 | `TextView` ×4 | 无交互 | 原生 |

页签用的是「内容宽 + 等间距」模型（组件内 `createItemLayoutParams`：首尾各留一个完整 `itemSpacing`），**没有 space-between**，属组件能力缺失，落地取 EQUAL 等分并把偏差写进交付说明。

## 3. ResourceMap

| 设计值 | 用途 | 落地资源 | 出处 |
| --- | --- | --- | --- |
| #5460FE | 主题色：页签选中、竖条、标签蓝字、分类标签选中描边、圆点 | `@color/color_primary` | TobBaseResource |
| #F0F0F5 | 分类标签底 | `@color/fill_base` | TobBaseResource |
| #EEEFFF / #DDDFFF | 具体标签（蓝）底 / 描边 | `@color/color_primary_v6` / `@color/color_primary_v5` | TobBaseResource |
| #E6F7EA / #CCEED4 / #00AB28 | 具体标签（绿）底 / 描边 / 文字 | `@color/color_success_v6` / `_v5` / `@color/color_success` | TobBaseResource |
| #FFF4EB / #FFE9D6 / #FF8F33 | 具体标签（橙）底 / 描边 / 文字 | `@color/color_warning_v6` / `_v5` / `@color/color_warning` | TobBaseResource |
| #F5F5FA | 摘要内容块底 | `@color/fill_light` | TobBaseResource |
| #FFFFFF | 导航栏底、卡片底 | `@color/bg_base` | TobBaseResource |
| #F6F6F6 | 页面底色 | `@color/nursing_color_page_bg` | 模块已有 |
| #333333 | 正文、摘要文本 | `@color/text_gy1` | TobBaseResource |
| #666666 | 未选中页签、分类标签文字 | `@color/text_gy2` | TobBaseResource |
| rgba(0,0,0,0.85) | 「AI分析总结」标题 | `@color/nursing_color_action_text` | 模块已有（同值） |
| #1A1A1A / #1890FF / #FF6342 / #3A74FC / #00B42A #F7862A | 标签标题文字 / 选中标签文字 / 两个橙标签文字 / 三个旧色 | 全取逐字 `textColor` 的有 token 值：`text_gy1` / `color_primary` / `color_warning` / `color_success` | 三源冲突按有 token 的一档取值，不新增颜色 |
| 返回箭头（PATH 2:05616） | 导航栏返回 | 待 MasterGo 导出，`mipmap-xhdpi/nursing_ic_report_back` | 唯一需要导出的图标（状态栏 wifi/电池是系统图标，不实现） |

## 4. LayoutSpec

| 项 | 设计值 | 落地值 | 说明 |
| --- | --- | --- | --- |
| 页面边距 | 12 | `@dimen/nursing_page_margin` | 卡片、页签行左边缘均 12 |
| 导航栏 | 高 88（44 状态栏 + 44 标题） | `TitleBar` + statusBar inset | 与上一页同构 |
| 页签行 | 高 27、3 项 space-between（间距 93.5） | 高 27、EQUAL 等分（每格 116.3、文字居中） | 组件无 space-between；中间项位置与设计稿一致，首末项各内缩约 34dp |
| 页签下划线 | 18×3、radius 101、居中 | `nursing_bg_tab_indicator` | 复用上一页 drawable |
| 卡片 | 351×680.8、radius 12、padding 12 | match_parent、radius 12、padding 12 | 设计稿写 346.7 宽（右边距 16.3），与页签行 349、标签区 327 不自洽，按页面边距 12 取 351，内层正好 327 = 设计稿标签区宽 |
| 标题条 + 文字 | 3×16 竖条（radius 2）+ 文字左边距 9.1 | 3×16 + `space_mini`(8) | 9.1 与 8 差 1.1dp，取语义间距 |
| 分类标签 | 高 24、radius 16、padding 2/8、圆点 5×5、间距 横向 4 / 纵向 8 | 同名模块 dimen | 设计稿 4 个一行（41+91+91+91+3×4 = 326 ≤ 327） |
| 具体标签 | 高 24、radius 4、padding 2/8、间距 4/4 | 同名模块 dimen | 换行点随字体宽度变化，不写死行 |
| 摘要块 | radius 8、padding 12、块间距 8 | `radius_large` / `space_base` / `space_mini` | 「分析：」与长文之间 2dp |

## 5. StateSpec

| 状态 | 出现在 | 表现 |
| --- | --- | --- |
| 页签选中 | 页签行 | 「AI分析」文字 #5460FE + 18×3 下划线 |
| 页签未选中 | 页签行 | 时间轴 / 通话记录，文字 #666666 |
| 分类标签选中 | 标签区 | 「全部」：#F0F0F5 底 + 1px #5460FE 描边 + 文字 #5460FE |
| 分类标签未选中 | 标签区 | #F0F0F5 底、无描边、文字 #666666、左侧 5×5 圆点标色 |
| 具体标签三色 | 标签区 | 蓝（#EEEFFF/#DDDFFF/#5460FE）、绿（#E6F7EA/#CCEED4/#00AB28）、橙（#FFF4EB/#FFE9D6/#FF8F33） |
| 未出现 | — | 按下、禁用、加载、空态、错误态设计稿均未给，不实现 |

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 卡片宽度 | 346.72（右边距 16.28） | 351（左右各 12） | 同页页签行 349、标签区 327 都按 12 边距，卡片宽度是小数且不自洽 |
| 标签文字色多源打架 | fill 用旧色（#3A74FC/#1890FF/#00B42A/#F7862A/#FF6342），逐字 textColor 是有 token 的新色 | 全取 textColor 的有 token 值 | 三源冲突按有 token 一档 |
| 分类标签圆点颜色 | 4 种（#5460FE/#00AB28/#FF8F33） | 与文字/状态色同源取值 | 同组语义 |
| 摘要块内两个文本节点 | 设计稿把长文按行拆成多段 TEXT | 按 4 段文本 + 自然换行实现 | 行拆分是 flex 换行的产物 |
| 底部 34dp | home indicator | 不绘制，只消费导航栏 inset | 系统 UI |
