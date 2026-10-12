# 客户详情（跟进沟通记录页签）UI 分析（MasterGo file 180767492624044 / layer 22:9203）

- 来源：https://mastergo.com/file/180767492624044?page_id=M&layer_id=22%3A9203
- 真实 layer_id：`22:9203`（图层名「客户详情」；URL 里的 `page_id=M` 是合成页 ID，`layer_id` 才是内容图层）；共 8 个 section、197 节点
- 画布：375×833；`rootContainer.background` = #F6F6F6
- 读取范围：全部 8 个 section（sectionIndex 0–7），DSL 落在 `output/design/22-9203/`
- 落地模块：`zhb/ModuleNursingAssessment/NursingAssessment`（用户指定：直接写入工程）
- 工程根：`artigence/zhb/AppShell`（settings.gradle 里 `includeModule("NursingAssessment", "nursingAssessment")`）
- 数据：静态，按设计稿写死；文案直接写在布局里，不抽 `strings.xml`
- 形态判定：标题栏 + 页签行 + 滚动内容（筛选行 + 跟进卡片列表）。设计稿页签选中项是「跟进沟通记录」（第 3 项），内容是这一页签的跟进列表。**本版设计稿没有底部操作栏**（上一版 2:7562 有 5 项底栏，本版整页重做后已去掉，见「判定为伪影 / 冲突的项」）。

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 180767492624044 |
| page_id / 真实 layer_id | page_id=M / 真实内容图层 `22:9203` |
| 设计稿链接 | https://mastergo.com/file/180767492624044?layer_id=22%3A9203 |
| 页面尺寸 | 375 × 833（内容底 947，可滚动） |
| 读取范围 | 全部 section（0–7） |
| 目标工程与模块 | artigence/zhb/AppShell → `:NursingAssessment`（namespace `com.yilife.android.zhb.module.nursingassessment`，resourcePrefix `nursing_`） |
| 上一版对照 | 同文件 2:7562（375×1346，含底部操作栏）；本页为其重做版，重新生成时整体覆盖 |

## 1. PageStructure

```text
页面（375x833）
├── 顶部渐变 22:9205 375x196 @0,0（页面级装饰，section 0）
├── 标题栏 22:9207 375x88 @0,0（section 1：状态栏 + 返回 16x16 @15,58 + 标题「客户详情」@152,55）
├── 白色内容底 22:9308 375x947 @1,100（splitContainer，上两角 12）
│   ├── 页签行 H2 22:9309 351x27 @13,112（4 项，右对齐，选中「跟进沟通记录」带 18x3 下划线）
│   └── 跟进信息 22:9327 351x674 @13,151（splitContainer，白底）
│       ├── 筛选行 22:9328 351x26 @13,151
│       │   ├── 左：分段控件 22:9330 200x26（全部 60 / 沟通记录 70 / 跟进记录 70，末项选中实色）
│       │   └── 右：div.right 22:9343 110x26（「筛选：」42 + 下拉框 68x26「全部 ▾」）
│       └── 跟进卡片 × 3（重复单元）
│           ├── 容器 6266 22:00121 351x192 @13,185（收起：正文 4 行 + 展开）
│           ├── 容器 6268 22:00005 351x224 @13,385（展开：正文 6 行 + 收起）
│           └── 容器 6269 22:00388 351x208 @13,617（正文位换成 80x80 图片）
└── 编组 13备份 22:9306 24x24 @28,1379（section 2，页面外、opacity=0）
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 顶部渐变 | 固定 | 无 | 静态 | section 0；196 高，铺到状态栏底下，标题栏压在它上面 |
| 标题栏 | 固定 | 无 | 静态 | section 1；左返回 + 居中标题，导航栏 88（含状态栏） |
| 白色内容底 | 固定 | 无 | 静态 | splitContainer「容器 4972」；上两角 12，下角 0（回查该层 `rootMetadata` 得 `12px 12px 0px 0px`） |
| 页签行 | 固定 | 4 项 | 静态 | section 3；选中项带下划线；内容容器由 ViewPager2 承载 |
| 筛选行 | 固定（列表头） | 无 | 静态 | section 4；分段控件 + 「筛选：」+ 下拉框 |
| 跟进卡片 | 滚动 | 3 张同形态卡 | 静态 | section 5/6/7；卡间距 8、卡内底边 1px 分割线 |

### 背景分区表（每段指到图层，任何一段都写明归属）

| 区段 | y 范围 | 设计稿哪一层负责 | 颜色 / 圆角 | 实现里哪个 view 负责 |
| --- | --- | --- | --- | --- |
| 状态栏 + 导航栏 | 0–88 | 渐变 22:9205（196 高，压在标题栏下） | 渐变 `linear-gradient(171deg,#E2E4FF -2%,transparent 111%)` | 根 FrameLayout 里固定的 `v_header_gradient`（196），标题栏自身置透明，透出渐变 |
| 导航栏底 → 内容底顶 | 88–100 | 页面根底 `22:9203` | #F6F6F6 | 白色内容底 `ll_panel` 的 `marginTop` 12，中间露出根布局的 `nursing_color_page_bg` |
| 内容底 | 100–内容结束 | 容器 4972 `22:9308` | #FFFFFF，上两角 12、下角 0 | `ll_panel`（`@drawable/nursing_bg_customer_panel`） |
| 页签行到卡片区 | 112–825 | 跟进信息 `22:9327` | #FFFFFF（与内容底同色，视觉上无分界） | 不再单独起一层：内容 Fragment 直接落在 `ll_panel` 白底上（同色层不叠加） |
| 内容底以下 | 825–1047 | 容器 4972 多出的 222 高 | #FFFFFF | 不实现：设计稿内容只到 825，222 是上一版 1153 高的残留（见伪影表） |

### 绝对 y 对账（设计稿绝对值，验收逐块对照）

| 区块 | 设计 y（顶/底） | 实现落在哪一层 | 实测 y（真机） |
| --- | --- | --- | --- |
| 标题栏 | 0 / 88 | `title_bar`（状态栏 insets + 44） | 38.1 / 86.1（状态栏 38.1 + 标题栏 48.1，见交付说明的系统差） |
| 白色内容底 | 100 / — | `ll_panel`（`marginTop` 12） | 98.2（Δ-1.8，同上） |
| 页签行 | 112 / 139 | `tab_customer`（`paddingTop` 12 + 高 26） | 110.4 / 136.3（行高 26，Δ-2.7） |
| 筛选行 | 151 / 177 | 内容根 `paddingTop` 12 + 高 26 | 148.4 / 174.4（Δ-2.6） |
| 卡片 1 | 185 / 377 | 筛选行下 8（列表 item 的 `marginTop`） | 182.3 / 374.6（高 192.3 ✓） |
| 卡片 2 | 385 / 609 | 卡片间距 8 | 382.6 / 607.1（高 224.5 ✓） |
| 卡片 3 | 617 / 825 | 卡片间距 8 | 615.1 / 823.5（高 208.4 ✓） |

间距只有一个来源：`ll_panel` 只吃 `marginTop`（12），页签只吃自己的 `paddingTop`（12，由容器 padding 承担），页签到筛选行的 12 由内容根 `paddingTop` 承担，筛选行到卡片、卡片之间只吃 item 的 `marginTop`（8），左右边距只吃内容根的 `paddingStart/End`（12）。

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 标题栏 | 顶部固定高 + 左返回 + 居中标题 | `TitleBar` | `initializeHeader("客户详情")`、`setLeftOne()` 点击 finish | `Module.titleBar`（同工程其它页同款） | 自带白色底挡住渐变 → 代码置透明；自带返回图标（不在本次图标占位范围内） | 不新建 |
| 页签行 | 一排文字 + 选中下划线 | `UniversalTabLayout`（NORMAL） | `setTabs` + `setupViewPager2` 与内容容器双向同步 | `Module.universalComponents`（上一版同款，参数沿用） | WRAP_CONTENT 下首项前留白占一个 itemSpacing，故 `marginStart` 5 抵消；默认不加粗，选中项要 `setTabSelectedTextBold(true)` | 不新建 |
| 页签内容容器 | 翻页 | `ViewPager2` + `FragmentStateAdapter` | 4 页；设计稿只给第 3 页（跟进沟通记录）内容 | `ThirdDependence.AndroidX.viewPager2` + `Module.base`（`BaseFragment`） | 默认页要落在第 3 页（设计稿选中项），不是第 1 页 | 不新建 |
| 筛选行分段控件 | 一排连体按钮，选中项实色块 | `UniversalTabLayout`（TAG） | 点击切换选中块 | `Module.universalComponents`（2:77272 时段页签同款用法：`setTabDefaultBackground` + `setTabIndicatorResource`） | TAG 的「选中」是 indicator 背景；组件按项给背景，做不出「只在组外圈有 1px 边框、内相邻边只有 1px」的连体边框，内相邻处会有 2 条边与圆角（见伪影表） | 不新建 |
| 下拉框「全部 ▾」 | 输入框右端带 ▾ | `TextView` + `ImageView` 的静态块 | 设计稿没给弹层，点击留空 | 原生 | — | 新建：只是静态展示块，弹层与回填设计稿未给，不引入下拉组件 |
| 跟进卡片列表 | 间距一致、结构相同的重复行 | `RecyclerView` + BRVAH `BaseQuickAdapter` | 3 条静态数据滚动 | `ThirdDependence.BRVAH.BRVAH`（模块已有适配器用法） | — | 新建 item 布局；卡片是重复单元，不复制三份静态布局 |
| 卡片头像位 | 圆形图片位 | `FrameLayout`（圆底）+ `ImageView` | 无 | 原生（同 2:77272 头像位写法） | 圆角靠 `clipToOutline`，否则 `centerCrop` 会画出直角 | 新建 1 个 circle drawable |
| 卡片标签 | 流式 chips（8 个、两行） | `FlexboxLayout` + `TextView` | 无 | `ThirdDependence.Flexbox.flexbox`（本模块用户标签同款） | 横向 gap 10 / 纵向 gap 6（DSL 的 `gap:"10px 6px"` 字面顺序与实际相反，实测行距 6、列距 10） | 新建 3 个 chip 底（绿/蓝/橙，同值不同名的按模块前缀新建） |
| 卡片正文 + 展开/收起 | 多行文本 + 右下角文字链 | `FrameLayout`（文本 + 右下角 `LinearLayout`） | 设计稿给了「收起 4 行 + 展开」「展开 6 行 + 收起」两个终态，点击切换的中间态未给 → 两个终态静态还原，点击留空 | 原生 | 文本块高写死（4 行 64 / 6 行 96），不依赖 `android:lineHeight`（本机 ROM 忽略该属性） | 新建 |
| 卡片图片位 | 圆角图片位 | `ImageView` | 无 | 原生 | 80x80、圆角 6，`clipToOutline` 才能裁角 | 新建 1 个圆角 drawable |
| 卡片评论行 | 图标 + 文字 | `ImageView` + `TextView` | 无 | 原生 | 图标 12dp（设计稿是 PATH，无图标资源 → 占位图，见 ResourceMap） | 新建 |

## 3. ResourceMap

### 颜色

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| #F6F6F6 页面底 | 无同值（`bg_page` 是 #F5F5F7） | `@color/nursing_color_page_bg`（已有） | 沿用 2:7562 新增项 |
| #E2E4FF 渐端起色 | 无（`color_primary_v6` 是 #EEEFFF） | `@color/nursing_color_header_gradient`（已有） | 沿用 |
| #FFFFFF 内容底 / 卡片底 | `@color/bg_base` | — | 语义色 |
| #333333 姓名 / 正文 / 「筛选：」 | `@color/text_gy1` | — | 语义色 |
| #666666 卡片元信息 / 未选中页签 / 未选中分段 | `@color/text_gy2` | — | 语义色 |
| #999999 展开/收起文字 | `@color/text_gy3` | — | 语义色 |
| #9E9E9E 评论（0） | 无同值（`text_gy3` 是 #999999） | `@color/nursing_color_summary_text`（已有 #9E9E9E） | 复用模块已有同值项，不新增 |
| #3A74FC 跟进人姓名（旧主题色） | 无（`color_primary` 是 #5460FE） | 直接用 `@color/color_primary`（XML）/ `@color/nursing_color_follow_tag_blue_text` 别名（Kotlin） | 设计稿是旧主题色 #3A74FC，同一行里蓝色语义只有一处，取工程语义主色，不引入旧色 |
| #DDDFE6 元信息分隔符「｜」 | 无同值（`border_base` 是 #DCDDE5） | `@color/nursing_color_follow_separator`（新增 #DDDFE6） | 1 个色号的独立色，语义是分隔符，不进主/次文本档 |
| #5460FE 选中页签 / 下划线 / 选中分段块底 | `@color/color_primary` | — | 语义色 |
| #DCDDE5 分段未选中描边、下拉框内描边 | `@color/border_base` | — | 设计稿下拉框是 #DCDFE6，与 `border_base` 差 1 个色号，取语义档 |
| rgba(0,0,0,0.06) 卡片底分割线 | 无同值 | `@color/nursing_color_form_divider`（已有 #0F000000） | 复用模块已有同值项 |
| #F1FCF3 / rgba(0,180,42,0.08) 绿 chip 底 / 描边 | 无同值（`color_success_v6` 是 #E6F7EA） | `@color/nursing_color_follow_tag_green_bg` / `_stroke`（新增） | 本版 chip 是浅一档的绿底 + 8% 绿描边，与 2:7562 的档位不同值，不能复用 |
| #00B42A 绿 chip 文字 | 无同值（`color_success` 是 #00AB28） | 直接用 `@color/color_success` | 同语义组取工程已有语义色 |
| #ECF5FF / rgba(58,116,252,0.08) 蓝 chip 底 / 描边 | 无同值（`color_primary_v6` 是 #EEEFFF） | `@color/nursing_color_follow_tag_blue_bg`（新增）；描边复用已有的 `@color/nursing_color_primary_soft`（同值 #143A74FC） | 同上，不同值；描边与 2:77272 的 8% 主色同值，不重复声明 |
| #FFF6F0 / rgba(247,134,42,0.08) 橙 chip 底 / 描边 | 无同值（`color_warning_v6` 是 #FFF4EB） | `@color/nursing_color_follow_tag_orange_bg` / `_stroke`（新增） | 同上，不同值 |
| #F7862A 橙 chip 文字 | 无同值（`color_warning` 是 #FF8F33） | 直接用 `@color/color_warning` | 同语义组取工程已有语义色 |

### 尺寸 / 字号 / 圆角

规则（[SKILL.md](../../SKILL.md)「Android 资源核对」）：设计值 → **TobBaseResource 已有资源 → 用它**；确实没有时才在模块新建，并在备注里写明「TobBaseResource 无此值」。TobBaseResource 有 `dp_*`（1201 档，含 `.5`）与 `sp_*`（100 档）两套标尺，本页 30 个尺寸值**全部命中**——所以本页**一个模块 dimen 都没建**（原先建的 26 个别名 + 同块 4 个已随 `nursing_dimens.xml` 一起删除，布局里直接引用 TobBaseResource）。

| 设计值 | TobBaseResource | 落地位置 | 备注 |
| --- | --- | --- | --- |
| 页面左右边距 13（右侧余 11，不对称） | `dp_12` | 内容根 `paddingStart/End` | 取对称 12，见伪影表；`space_base` 同值可换用 |
| 渐变块高 196 | `dp_196` | 布局 `layout_height` | — |
| 内容底上圆角 12 | `radius_larger` | `@drawable/nursing_bg_customer_panel` | 复用模块已有 drawable |
| 页签行高 27（文本 22 + 下划线 3 + 2） | `dp_26` | `app:universalTabItemHeight` | 组件行高 26，与上一版一致 |
| 页签间距 18（合计 384 > 351 溢出） | `dp_7` | `app:universalTabItemSpacing` | 按 4 项文本合计 330 反算 |
| 页签首项前留白抵消 | `dp_5` | 布局 `layout_marginStart` | 组件 WRAP_CONTENT 下首项前会占一个 itemSpacing |
| 页签文案 16sp / 选中加粗 / 下划线 18x3 | `font_basic_large` / `dp_18` / `dp_3` | `app:universalTabTextSize` / `SelectedTextBold` / `IndicatorWidth` / `IndicatorHeight` / `IndicatorDrawable` | 下划线 drawable 是模块已有的 `nursing_bg_tab_indicator` |
| 分段控件 200x26、项高 26 | `dp_200` / `dp_26` | 布局宽高 + `app:universalTabItemHeight` + `app:universalTabBackgroundHeight` | 选中块与未选中块同高 |
| 分段文案 12sp / 选中白字 / 未选中次文本 | `font_basic_micro` / `text_white` / `text_gy2` | `app:universalTabTextSize` / `SelectedTextColor` / `DefaultTextColor` / `DisabledTextColor` | 不再由 Kotlin 查颜色 |
| 分段圆角 4 | `radius_small` | `@drawable/nursing_bg_follow_outline` / `_segment_selected` | 两个 drawable 都是模块新增（设计稿专有色 + 描边形状） |
| 「筛选：」14sp | `font_basic_body` | 布局 `textSize` | — |
| 下拉框 68x26、内边距 1/11、圆角 4 | `dp_68` / `dp_26` / `dp_11` / `radius_small` | 布局宽高 + `paddingStart/End` | — |
| 「全部」12sp | `font_basic_micro` | 布局 `textSize` | — |
| 卡片宽 351 | — | match_parent（页面边距 12 决定） | 不写死宽 |
| 卡片高 192 / 224 / 208 | 由内容撑开 | — | 头 40 + 8 + 标签 40 + 4 + 正文 64/96（或图片 80）+ 8 + 评论 16 + 11 + 分割线 1 |
| 卡片底分割线 1px | `dp_1` | item 布局里的 `View` + `nursing_color_form_divider` | 颜色是模块已有的 6% 黑 |
| 卡片底内边距 12（11 空白 + 1 线） | `dp_11` | 分割线 View 的 `layout_marginTop` | — |
| 卡片块间距 8 | `space_mini` | item 布局的 `layout_marginTop` / `layout_marginBottom` | 用语义档 |
| 卡片头高 40 / 头像 36 / 姓名行 20 / 元信息行 16 | `dp_40` / `dp_36` / `dp_20` / `dp_16` | item 布局 `layout_height` | — |
| 元信息项间距 2 | `dp_2` | item 布局 `layout_marginStart` | — |
| 标签流块高 40（两行 17 + 6） | `dp_40` | `FlexboxLayout` 的 `layout_height` | 末行 chip 自带的 6dp 下边距被块高裁掉，不顶高卡片 |
| 标签高 17、内边距 2/4、圆角 4 | `dp_17` / `space_micro` / `radius_small` | chip 布局（三个色系各一份） | — |
| 标签 gap 横向 10 / 纵向 6 | `dp_10` / `dp_6` | chip 布局的 `layout_marginEnd` / `layout_marginBottom` | DSL 的 `gap:"10px 6px"` 字面顺序与实际相反 |
| 标签 / 分隔符 10sp | `sp_10` | chip 布局与元信息分隔符的 `textSize` | TobBaseResource 有 `sp_*` 档 |
| 正文 12sp、行距 16、块高 64 / 96 | `font_basic_micro` / `dp_2.5` | `android:lineSpacingExtra` + 代码切 `maxLines`（4 / 6） | 本机忽略 `lineHeight`，但认 `lineSpacingExtra`：12sp 文字 + 2.5dp = 16dp 行距，块高自然落在 64 / 96，不需要写死高度 |
| 展开/收起 12sp + 箭头 8 | `font_basic_micro` / `space_mini` | item 布局 | 箭头是占位图（见图标表） |
| 评论图标 12、间距 6、文案 12sp | `dp_12` / `dp_6` / `font_basic_micro` | item 布局 | — |
| 图片位 80x80 圆角 6 | `dp_80` / `dp_6` | item 布局 + `nursing_bg_follow_image` | 圆角 drawable 是模块新增（6dp 这个形状档 TobBaseResource 没有对应 drawable） |

### 图标

| 图标 | 来源（TobBaseResource / 其他） | 资源名 | 密度 |
| --- | --- | --- | --- |
| 返回箭头 | 标题栏组件自带（`TitleBar` 内置图标） | — | — |
| 下拉框箭头（设计 22:9353，10.24x5.43） | TobBaseResource 无图标（AAR 里只有 `logo` / `base_ic_no_data` 两个 mipmap） | `@mipmap/nursing_ic_placeholder` | xhdpi |
| 展开/收起箭头（设计 22:00178，4.8x4.8） | 同上 | `@mipmap/nursing_ic_placeholder` | xhdpi |
| 评论图标（设计 22:00237，10x8.8） | 同上 | `@mipmap/nursing_ic_placeholder` | xhdpi |
| 头像 × 2（卡片 1 / 卡片 2、3） | MasterGo 设计图（image-resource 资源，原图 1919×1919 JPEG / 96×144 WebP） | `@mipmap/nursing_ic_follow_avatar_first` / `@mipmap/nursing_ic_follow_avatar` | xhdpi |
| 卡片 3 图片（80x80，原图 90×160 JPEG） | MasterGo 设计图 | `@mipmap/nursing_img_follow_photo` | xhdpi |

占位说明：按用户规则「缺失的 icon 图片优先从 TobBaseResource 获取，依旧缺失的使用默认的 ic_launcher 占位图」——TobBaseResource 的 AAR 内只有 `mipmap/logo.png` 与 `mipmap/base_ic_no_data`，没有任何图标，故三个设计图标（下拉箭头、展开/收起箭头、评论图标）统一用 ic_launcher 占位图（复制进模块 `mipmap-xhdpi/nursing_ic_placeholder.webp`，因为 library 模块引用不到 app 模块的 `@mipmap/ic_launcher`）。真图标到位后按同名替换即可。

## 4. LayoutSpec

| 项 | 设计值 | 落在哪一层 | 实现方式 |
| --- | --- | --- | --- |
| 页面左右边距 | 13（右 11） | 内容根 `paddingStart/End` | 12（`nursing_page_margin`），唯一来源 |
| 区块间距 | 12 | 内容根 `paddingTop` | `space_base`；页签到内容也是 12 |
| Item 间距 | 8 | 筛选行 / 卡片 item 的 `marginTop` | `space_mini`；卡片之间也走 item `marginTop`，不叠加列表间距 |
| 组件尺寸（宽 × 高） | 分段控件 200×26；下拉框 68×26；卡片 351×192/224/208；头像 36×36；标签 49/59×17；图片 80×80 | 各自 item 布局 | 卡片高由内容撑开（正文块 64 / 96、图片 80），不写死卡片高 |
| 字号 / 行高 | 标题 18sp；页签 16sp；姓名 14sp；元信息/正文/评论/展开 12sp；标签 10sp | 各 TextView | 语义档 `font_medium` / `font_basic_large` / `font_basic_body` / `font_basic_micro` + `nursing_follow_tag_text_size` |
| 行内对齐（卡内每一行） | 卡片头：40 高、头像 36 顶部偏移 2（= 行内居中）、右列贴顶（姓名 20 + 4 + 元信息 16）；标签行：贴顶、两行 17 高、行距 6、列距 10；正文：贴顶、行距 16；展开/收起：贴正文底、右对齐（设计 x=292 = 351−59）；评论行：16 高、图标顶部偏移 2、文字 12sp 贴顶 | 卡片 item 各行 | 卡片头 `gravity=center_vertical`（40 与 36 差 4，居中后顶部偏移正好 2）；标签用 FlexboxLayout `flex_wrap=wrap` + 自身 margin；正文块高写死、文本 `gravity=top`；展开/收起用 FrameLayout 的 `layout_gravity=bottom|end`；评论行 `gravity=center_vertical` |
| 对齐关系 | 页签行右对齐（末项右边缘 = 内容右边缘）；筛选行两端对齐（分段在左、筛选组在右）；元信息行左起、项间距 2；展开/收起右对齐 | 页签容器 / 筛选行 / 元信息行 / 正文块 | 页签沿用组件右对齐；筛选行 `gravity=center_vertical` + 分段固定 200 + 右侧组 wrap + `space-between`；元信息行内 7 个 TextView 依次排列 |

### 圆角 / 描边（逐元素，不按页写一个值）

| 元素（设计稿 id / name） | 圆角（四角全写） | 描边 / 内边距 | 谁画、谁裁 |
| --- | --- | --- | --- |
| 容器 4972 白色内容底（splitContainer，按 layer_id 回查该层元数据） | 12px 12px 0px 0px | 无 | `@drawable/nursing_bg_customer_panel` 画在 `ll_panel` 上；页签 / 筛选行 / 卡片全在它上面、无铺满子 View，不需要裁切 |
| 22:9331 分段控件左端「全部」块 | 4px 0px 0px 4px | 1px `#DCDDE5` 内描边 | `nursing_bg_follow_outline`（四角都 4，与设计的两角不同，见伪影表）；纯 shape 背景，无子 View |
| 22:9339 分段控件右端「跟进记录」选中块 | 0px 4px 4px 0px | 无 | `nursing_bg_follow_segment_selected`（四角都 4，同上） |
| 22:9348 筛选下拉框 | 4px 4px 4px 4px | 1px `#DCDDE5` 内描边（设计是 inset 盒阴影） | 复用 `nursing_bg_follow_outline`；内部「全部」与箭头都不铺满 |
| 22:9322 页签选中下划线 | 101px（胶囊） | 无 | `@drawable/nursing_bg_tab_indicator`：18x3 的 shape + `radius 1.5dp`（等高的一半 = 胶囊） |
| 22:00123 / 22:00019 / 22:00420 卡片头像 ×3 | 185px（圆形） | 无 | `nursing_bg_follow_avatar`（oval）画在 36dp `FrameLayout` 上 + **`clipToOutline`**：`ImageView` 铺满，不裁就是直角 |
| 22:00196…22:00455 标签 chip ×24 | 4px 4px 4px 4px | 1px 同色 8% 描边 | 三个色系各一份 chip 布局，shape 直接当 `TextView` 背景（`nursing_bg_follow_tag_*`），无子 View |
| 22:00509 / 22:00516 卡片 3 图片位 ×2 | 6px 6px 6px 6px | 无 | `nursing_bg_follow_image` 画在 80dp `ImageView` 上 + **`clipToOutline`**：背景圆角不裁子 View 时 `centerCrop` 的图会把四角盖掉 |
| 22:9217 / 22:9280 / 22:9282 状态栏示意 ×3 | 3px / 2.67px / 1.33px | 1px 描边 | 不实现（状态栏由系统绘制，设计稿里是 iOS 示意件） |

设计稿 borderRadius 节点数：37 / 本表行数：9（头像 ×3、标签 ×24、图片位 ×2、状态栏示意 ×3）

（37 = 8 个 section 的 DSL 里 `grep -o '"borderRadius"'` 数到 36 条，再加 splitContainer「容器 4972」——它的圆角不在 section DSL 里，按 layer_id 回查该层元数据得 `12px 12px 0px 0px`）

对账：(3−1) + (24−1) + (2−1) + (3−1) = 28 = 37 − 9。嵌套在卡片里的图片位和头像是最容易只写外层、把它写成纯色的两个——真机复量时两处都做了 `clipToOutline`，四角采样为白（见交付说明）。

## 5. StateSpec

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 页签 | 选中 | 文案 #5460FE + Medium + 18×3 下划线 | 页签选中项（设计稿是「跟进沟通记录」） | H2 `22:9309` |
| 页签 | 未选中 | 文案 #666666 + Regular，无下划线 | 其余三项 | H2 `22:9310` / `22:9314` / `22:9323` |
| 分段控件 | 选中 | 实色块 #5460FE + 白字 | 「跟进记录」（末项） | `22:9339` |
| 分段控件 | 未选中 | 白底 + 1px #DCDDE5 描边 + #666666 文案 | 「全部」「沟通记录」 | `22:9331` / `22:9335` |
| 卡片正文 | 收起 | 4 行、右下角「——展开」+ 箭头 | 卡片 1 | `22:00182` / `22:00170` |
| 卡片正文 | 展开 | 6 行、右下角「——收起」+ 箭头 | 卡片 2 | `22:00065` / `22:00109` |
| 标签色 | 绿 / 蓝 / 橙三色 chip | 底 + 8% 描边 + 文字成套 | 标签语义 | `22:00196` 等 8 个 |
| 其它 | 按下 / 禁用 / 加载 / 空 / 错误态 | 设计稿均未给 | — | 不实现 |
| 展开/收起切换 | 设计稿只给了两个终态，中间态与切换后行数未给 | — | — | 点击留空实现，两个终态静态还原 |

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 页签横向溢出 | 4 项 gap 18、合计 384 > 351，首项被画到 x=-20（容器外） | gap 7，四项落在 351 内 | `flex-end` + 溢出把首项裁到容器外，是组件库伪影；按文本合计 330 反算 |
| 页面左右边距 | 左 13、宽 351（右余 11） | 左右各 12 | 13/11 不对称，取页面边距 12（上一版即 12） |
| 内容底高度 | 375×947 @1,100（内容只到 825，多出 222） | 白底随内容结束 | 上一版内容底是 1153 高，222 是残留；内容实际到 825 |
| 筛选行与白块重叠 | 跟进信息白块 151..825 与筛选行 151..177 同起点 | 不再单独起白块层 | 与内容底同色，叠一层白无视觉差；省掉一层 |
| 卡片正文文案 | 卡片 1 是 111 字、末尾「表示将里」重复；卡片 2 是 184 字，后半段是卡片 1 内容的复制（「表示将里」+ 整段重复） | 按设计稿原文写入（不删减） | 末段重复是设计稿的复制痕迹，确认后再删；本页先保真，行数按 4 / 6 行裁切 |
| 头像填充 | 卡片 1 是 JPEG 占位、卡片 2/3 是 WebP，均非 1:1（96×144） | 居中等比裁成方形后使用（144×144 px @xhdpi） | 设计里头像位是 36×36 + `borderRadius:185px`（圆形），图片按 cover 填充 |
| 分段控件连体边框 | 三项连体，外圈 1px、内相邻边只 1 条、只有组外圈圆角 | 每项各自白底 + 1px 描边 + 圆角 4 | `UniversalTabLayout` 按项给背景，做不出连体边框；内相邻处会出现 2 条边与内圆角，偏差记交付说明 |
| 分段项宽 | 60 / 70 / 70 | 200 等分 = 66.67 × 3 | 组件 EQUAL 模式等分；总宽 200 与设计一致，单项差 ≤6.67 |
| 绿 / 橙 chip 文字色 | #00B42A / #F7862A（旧 APP 色） | `color_success` / `color_warning` | 同语义组取工程已有语义色 |
| 跟进人姓名色 | #3A74FC（旧主题色） | `color_primary` | 同上 |
| section 2 | 24×24 灰块 @28,1379、opacity=0、在页面外 | 不实现 | 透明且落在内容外 |
| 底部操作栏 | 本版设计稿没有（上一版 2:7562 有 5 项底栏） | 不实现，连同上一版首屏内容一起删除 | 整页重做以本版设计稿为准 |

## 6. 实现清单

- [ ] 基类：`CustomerDetailActivity` 继承 `BaseActivity`，入口 `afterCreate(Bundle?)`，顺序 `initView()` → `initListener()` → `initData()`；ViewBinding 用 `bindings<T>()`；内容用 `CustomerFollowFragment` 继承 `BaseFragment`（`bindRootView()` / `initData()`）
- [ ] 依赖：`UniversalComponents`(project)、`TobBaseResource`、`titleBar`、`flexbox`、`BRVAH` 均已在，不新增依赖
- [ ] 资源名前缀：layout `nursing_activity_customer_detail` / `nursing_fragment_customer_follow` / `nursing_item_customer_follow`；drawable `nursing_bg_customer_*` / `nursing_bg_follow_*`；mipmap `nursing_ic_follow_*` / `nursing_img_follow_photo`；color `nursing_color_follow_*`；dimen `nursing_follow_*`
- [ ] 删除上一版首屏内容：`nursing_fragment_customer_main.xml`、`CustomerMainFragment.kt` 及只被它引用的 drawable / dimen / 底栏（逐项 grep 确认无其它引用）
- [ ] 文案按设计稿直接写在布局/代码里，不抽 `strings.xml`；颜色、尺寸不硬编码
- [ ] 关键数值已按 LayoutSpec 量过实际控件（卡片高、头像 36、标签 17、图片 80、段控 200×26）
- [ ] 卡内每一行按设计稿的行内对齐写（顶部偏移 2、正文贴顶、展开贴底右对齐），不是 `center_vertical` 一把梭
- [ ] 头像位与图片位写了裁切机制（`clipToOutline` + 圆角 drawable）
- [ ] 上面逐元素圆角表每一行都有真机角点断言（合并行要写明它代表设计稿哪几个节点）

## 7. 验收

- [ ] 编译通过
- [ ] 安装的是本次构建的包（`adb install` 输出 `Success`）
- [ ] `adb shell uiautomator dump` 能找到设计稿的每段文案（客户详情 / 4 个页签 / 全部 / 沟通记录 / 跟进记录 / 筛选： / 马小跳 / 电话沟通 / 张月悦 / 沟通时长：23分钟 / 12-27 11:13 / 8 个标签 / 正文 / 展开 / 收起 / 评论（0））
- [ ] 截图与设计稿逐块比对标题栏、页签、筛选行、3 张卡片
- [ ] 卡内逐行取 y 与设计稿相对 y 对过（±2dp），同一块至少两行
- [ ] 圆角子元素的角点像素验证过（头像圆形、图片 80 圆角 6，四个角都看），逐元素圆角表每一行都量过
- [ ] 未验证的交互和无法完全还原的偏差写进交付说明
