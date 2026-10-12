# 医院单下单页 UI 分析（MasterGo file 180767492624044 / layer 2:73133）

本页是「选择下单类型」弹层（layer 2:77183）三个跳转目标中的**医院单**那条（弹层选项 1），
与已落地的 2:77272（同名「我要护工」，线上单）是同族页面：顶部渐变 + 标题栏 + 滚动卡片 + 底部固定条。
差异集中在被照护人卡（多「与被照护关系」chip 组）、服务套餐卡（多「服务病区 / 床位号 / 模式切换」）和阿姨卡（两个按钮）。

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 180767492624044 |
| page_id / 真实 layer_id | URL `?page_id=M` 是合成页 ID；`?layer_id=2%3A73133` 才是内容图层，取数直接用 `2:73133` |
| 设计稿链接 | https://mastergo.com/file/180767492624044?fileOpenFrom=search&devMode=true&page_id=M&layer_id=2%3A73133 |
| 页面尺寸 | 375 × 1372（`rootContainer.minHeight` 1372，根图层名「我要护工」，底 `#F6F6F6`） |
| 读取范围 | 全部 section（0–12，共 13 个 / 238 节点）；另取 `getPageLayers`、`extractSvg` |
| 目标工程与模块 | `zhb/AppShell` → `:NursingAssessment`（namespace `com.yilife.android.zhb.module.nursingassessment`，resourcePrefix `nursing_`） |
| 数据来源 | MasterGo Magic MCP（`getDesignSections` 列表 + 逐 section `sectionIndex=0..12`），落盘 `output/design/73133/` |
| 落地形态 | 测试页（export Activity，adb 直接启动截图对照），文案按设计稿直写布局，不抽 `strings.xml` |

## 1. PageStructure

```text
页面（375×1372，底色 #F6F6F6）
├── 顶部渐变层 375×196 @0,0（装饰，压在标题栏与内容下面）
├── 标题栏 375×88 @0,0（状态栏 + 返回 16×16 @15,58 + 居中标题「医院陪护」18sp/22）
├── 滚动内容区 351×1152 @12,100（transparent，透出页面灰）
│   ├── 客户信息行 246×22 @12,100「客户信息：马小跳  13966657899」16sp/22 Medium
│   ├── 服务地点卡 351×84 @12,134（标题 + 医院行）
│   ├── 被照护人卡 351×252 @12,230（标题 + 姓名行 + 性别行 + 与被照护关系 chip 组）
│   ├── 服务套餐卡 351×394 @12,494（白卡：标题 + 服务病区 + 床位号 + 模式切换 + 套餐内块 190）
│   ├── 联系人卡 351×168 @12,900（标题行 + 从手机通讯录添加 + 姓名行 + 联系方式行）
│   └── 阿姨推荐卡 351×172 @12,1080（头像列 72 + 资料列 243 + 两个按钮）
└── 底部固定条 375×96 @0,1275.57（62 内容 + 34 home indicator；总计 ￥2100.00 + 下一步）
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 顶部渐变层 | 固定 | 无 | 静态 | 与客户详情/2:77272 同一渐变，直接复用 `nursing_bg_customer_header` |
| 标题栏 | 固定 | 无 | 静态文案「医院陪护」 | `TitleBar`；自带白底会截断渐变，代码里置透明 |
| 客户信息行 | 滚动 | 无 | 静态 | 设计稿文案含双空格 |
| 服务地点卡 | 滚动 | 1 行 | 静态 | 只有「医院」一行（2:77272 是医院 + 地址两行） |
| 被照护人卡 | 滚动 | 2 行 + chip ×6 | 静态 | 关系 chip 6 项：本人/配偶/父母/子女/亲朋/其他 |
| 服务套餐卡 | 滚动 | 4 行 + 内块 4 行 | 静态 | 服务病区 / 床位号 / 模式切换（全部·多对多）/ 套餐内块 |
| 联系人卡 | 滚动 | 2 行 + 2 按钮 | 静态 | 「（联系方式为必填）」提示 + 两行输入位 |
| 阿姨推荐卡 | 滚动 | 标签 chip ×7 + 展开 | 静态 | 头像 72×87 + 勋章「金牌保姆」；标签后 3 个同文案，设计稿确实重复 |
| 底部固定条 | 固定 | 无 | 静态 | 上方向阴影 + 白底；下一步按钮 |

**背景分区表**（每一段都指到具体图层，不用根底色兼顶）：

| 区段（设计绝对 y） | 设计稿哪一层负责 | 颜色 / 圆角 | 实现里哪个 view 负责 |
| --- | --- | --- | --- |
| 0..196 | LAYER `6:04236`（375×196 @0,0） | `linear-gradient(171deg,#E2E4FF -2%,rgba(255,255,255,0) 111%)` | `v_order_hospital_header_gradient`（196dp）+ 标题栏置透明 |
| 88..1372 | `rootContainer.fill` = `paint_2:6243` | 页面灰 `#F6F6F6` | `fl_root_hospital` 铺页面灰（渐变层只盖前 196） |
| 100..1252（滚动内容） | splitContainer 容器 5326 `2:73135`（351×1152 @12,100） | transparent → 透出页面灰 | `nsv_order_hospital` 滚动容器，不设底色 |
| 494..888（服务套餐白卡） | splitContainer 容器 5221 `2:73229`（351×394 @12,494） | `#FFFFFF` | `ll_order_hospital_card_package`（`nursing_bg_order_card`） |
| 各卡片 134 / 230 / 900 / 1080 | `2:73139` / `2:73163` / `2:73343` / `2:73384` | `#FFFFFF`，圆角 12 | 对应卡片容器（同一 drawable `nursing_bg_order_card`） |
| 686..876（套餐内块） | `2:73278` 容器 5223（327×190 @24,686） | `rgba(58,116,252,0.08)`，圆角 12 | `ll_order_hospital_package_box`（`nursing_bg_order_package`） |
| 1275.57..1372（底部条） | `2:73528` 容器 4165（375×96）：白路径 `2:73529` 375×62.43 + Home Indicator 375×34 | `#FFFFFF`，顶边圆角由路径给出 | `ll_order_hospital_bottom`（白底 + 上两角 12）+ 34dp 由导航栏 inset 承担 |

**绝对 y 对账**（实现后逐块核；本页无 AutoSize 折减以外的缩放）：

| 块 | 设计 y（顶） | 高 | 与上一块的关系 |
| --- | --- | --- | --- |
| 标题栏底 / 页面灰起点 | 88 | 88 | 0 + 88 |
| 内容顶 / 客户信息行 | 100 | 22 | 88 + 12（body 上内边距） |
| 服务地点卡 | 134 | 84 | 100 + 22 + 12 |
| 被照护人卡 | 230 | 252 | 134 + 84 + 12 |
| 服务套餐卡 | 494 | 394 | 230 + 252 + 12 |
| 联系人卡 | 900 | 168 | 494 + 394 + 12 |
| 阿姨推荐卡 | 1080 | 172 | 900 + 168 + 12 |
| 内容底 | 1252 | — | 1080 + 172（= splitContainer 100 + 1152） |
| 底部固定条 | 1275.57 | 96 | 贴画布底；与内容底留 23.57 空档 |

卡内纵向链条（与各 `flexContainerInfo` 的 gap / padding 逐项吻合）：

- 服务地点卡：`12(上内边距) + 24(标题) + 12(gap) + 24(医院行) + 12(下内边距) = 84`
- 被照护人卡：`12 + 24 + 12 + 36(姓名行) + 12 + 36(性别行) + 12 + 108(关系块) + 0 = 252`；关系块 `22(标题) + 10(gap) + 64(2 行 chip: 26+12+26) + 12(下内边距) = 108`
- 服务套餐卡：`12 + 24 + 12 + 36 + 12 + 36 + 12 + 36(模式切换) + 12 + 190(套餐内块) + 12 = 394`
- 联系人卡：`12 + 24(标题行) + 12 + 24(从手机通讯录添加) + 12 + 36(姓名行) + 12 + 36(联系方式行) + 0 = 168`
- 阿姨卡：`12 + 108(横排块) + 12 + 28(按钮行) + 12 = 172`；横排块左侧 `87(头像) + 6 + 15(勋章) = 108`，右侧 `42 + 12 + 54(标签流) = 108`
- 套餐内块：`12 + 22(套餐行) + 16 + 36(开始时间) + 16 + 36(结束时间) + 16 + 36(服务天数) = 190`（行距 16，最后一行无分割线）
- 底部条：`62(内容) + 34(安全区) = 96`；`4 + 46(下一步) + 12 = 62`

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 标题栏 | 顶部固定高 + 左返回 + 居中标题 | `com.yilife.android.widget.component.titlebar.TitleBar` | `initializeHeader("医院陪护")`、`setLeftOne()` 点击 `finish()` | `Module.titleBar`（与 2:77272 同用） | 组件自带白底，需在 `initializeHeader` 之后 `setBackgroundColor(TRANSPARENT)` | 不新建 |
| 顶部渐变 | 装饰层 | `View` + `@drawable/nursing_bg_customer_header` | 无 | 模块已有（同值同形） | 高度 196，铺到状态栏下 | 不新建 |
| 卡片容器 | 白底 + 圆角 12 + 标题 + 行 | `LinearLayout` + `TextView` | 无 | 模块已有的 `nursing_bg_order_card` | — | 不新建（避免同值资源重复声明） |
| 可跳转行（医院 / 服务病区 / 开始时间 / 结束时间） | 整行右侧带箭头 | `LinearLayout`（可点）+ `ImageView` | 点击留空（设计稿只给 `navigation` 目标，未提供目标页） | `UniversalComponents` 的 `universal_icon_arrow_right` | 图标固有尺寸需用 12dp 约束 | 不新建 |
| 输入行（姓名 / 床位号 / 联系人 / 联系方式） | 输入框 | `EditText` | 聚焦输入；设计稿只有占位态 | AndroidX 原生 | 关掉默认内边距以对齐 22dp 行高 | 不新建 |
| 性别单选 | 圆环 + 文字 | 可点行（`LinearLayout`）+ `ImageView` + `TextView` | 单选互斥，选中回填 | 模块已有 `nursing_bg_order_radio_selected/_unselected` | 不用 `RadioButton`：`ShapeDrawable` 无固有尺寸，作 `android:button` 会被量成 0 | 不新建 |
| 与被照护关系 | 6 个同形 chip 换行 | `FlexboxLayout` + `nursing_item_order_hospital_relation.xml` | 设计稿 6 项均为默认态、无选中态 → 不接交互 | `ThirdDependence.Flexbox.flexbox`（模块已加） | chip 固定 72×26（设计值，不是按文本撑开） | 新建 1 个 item 布局：同形重复单元，避免把 6 份静态块抄进页面 |
| 模式切换（全部 / 多对多） | 两段：实心块 / 白底描边块 | `TextView` + drawable | 互斥切换，选中回填 | AndroidX 原生 + 模块已有 `nursing_bg_order_tab_selected` | 未选中态是**白底 + 1px 主色描边**（2:77272 的时段页签没有描边），需新增 1 个 drawable | 只新增 drawable，不新建控件 |
| 套餐勾选 | 圆形勾选块 | `ImageView` + 模块 `nursing_bg_order_checkbox_selected` / `nursing_ic_order_checkbox_check` | 设计稿只给选中态 | 模块已有 | — | 不新建 |
| 阿姨头像 / 勋章 | 图片位 + 金渐变胶囊 | `FrameLayout` + `ImageView` + `TextView` | 无 | 模块已有 `nursing_bg_order_avatar` / `nursing_bg_order_medal` | 本页头像 72×87（2:77272 是 72×84），勋章在头像**下方独立一行**（2:77272 是压在头像左下角） | 不新建控件，尺寸按本页另立 dimen |
| 按钮（新增联系人 / 从手机通讯录添加 / 发送简历 / 查看简历 / 下一步） | 圆角块 + 文字 | `com.yilife.android.widget.component.shapetextview.ShapeTextView` | 点击留空（设计稿未给目标） | `Module.shapeTextview`（模块已有） | `radius` / `solidColor` / `strokeColor` 都按设计值给，不写 `bg_` drawable | 不新建 |
| 阿姨标签 chip / 展开按钮 | 间距一致、结构相同的重复项 | `FlexboxLayout` + 模块已有的 `nursing_item_order_staff_tag(.more)` | 无交互（展示） | 模块已有 | 横向 8 / 纵向 6 | 不新建 |
| 底部固定条 | 底部固定：汇总 + 主按钮 | `LinearLayout` + `TextView` + `ShapeTextView` | 「下一步」点击留空 | 模块已有 `nursing_bg_order_bottom` | 上方向阴影不能用 `elevation`（`android-pitfalls.md`），沿用模块 drawable | 不新建 |

形态判定备注：模式切换（全部 / 多对多）是「一排两块、选中实心」，与 2:77272 的时段页签同族但**只有两块且未选中态带描边**，本页用两个 `TextView` + 背景切换表达，不引入第二套页签组件。

## 3. ResourceMap

颜色：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| `#333333` | `@color/text_gy1` | — | 标题、label、正文 |
| `#666666` | `@color/text_gy2` | — | 关系 chip、阿姨标签文字 |
| `#999999` | `@color/text_gy3` | — | 「（联系方式为必填）」 |
| `#CCCCCC` | `@color/text_gy4` | — | 占位文案、未选中 radio 描边 |
| `#FFFFFF` | `@color/bg_base` / `@color/text_white` | — | 卡片底 / 反白文字 |
| `#5460FE` | `@color/color_primary` | — | 选中块、描边、按钮、可点值文字 |
| `#DDDFFF` | `@color/color_primary_v5` | — | 「查看简历」按钮底 |
| `#CCEED4` / `#00AB28` | `@color/color_success_v5` / `@color/color_success` | — | 「等单中」chip 底 / 文字（设计节点 fill `#00B42A` 为旧色） |
| `#F54A44` / `#F53F3F` | `@color/color_error` | — | 必填 `*`、金额（两处旧红取同一语义色） |
| `#F6F6F6` | 无同值 | `@color/nursing_color_page_bg` | 模块已有（页面底、关系 chip 底、阿姨标签底） |
| `#E2E4FF` 渐变 | 无同值 | `@color/nursing_color_header_gradient` | 模块已有（配 `nursing_bg_customer_header`） |
| `#E6E6EB` | 无同值 | `@color/nursing_color_avatar_bg` | 模块已有（头像占位底，设计 token `PC-填充/Fill- darker`） |
| `#E4E4ED` | 无同值 | `@color/nursing_color_card_divider` | 模块已有（卡片内行分割线 0.5dp） |
| `rgba(58,116,252,0.08)` | 无同值 | `@color/nursing_color_primary_soft` | 模块已有（套餐内块底） |
| 渐变 `#F2D8A1`→`#FBE3C0` / 文字 `#813C08` | 无同值 | `@color/nursing_color_gold_start` / `_gold_end` / `_gold_text` | 模块已有（勋章） |

尺寸 / 字号 / 圆角：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| 页面左右边距 12 | `@dimen/space_base` | `@dimen/nursing_page_margin` | 模块已有同值，直接复用 |
| 卡片间距 / 卡内 gap 12 | `@dimen/space_base` | — | 卡片间距由各卡片 `layout_marginTop` 承担 |
| 卡片圆角 12 | `@dimen/radius_larger` | — | 语义档 |
| 关系 chip 圆角 6 | `@dimen/radius_medium` | 复用 `nursing_bg_order_chip` | 同值同形 |
| 模式切换圆角 4 | `@dimen/radius_small` | 复用 `nursing_bg_order_tab_selected` | 同值同形（选中态） |
| 胶囊圆角 170（高 24）/ 100（高 46） | — | `@dimen/nursing_order_pill_radius` / `nursing_order_submit_radius` | 模块已有（24 高按 12、46 高按 23） |
| 标题栏渐变高 196 | 无同值 | `@dimen/nursing_header_gradient_height` | 模块已有 |
| 卡片标题高 24（18sp） | 无同值 | `@dimen/nursing_order_title_height` | 复用 |
| 单行字段行 24 / 表单行 36 / 分割线 0.5 | 无同值 | `nursing_order_row_height` / `_row_height_form` / `_row_divider` | 复用 |
| 必填 `*` 占位宽 9 | 无同值 | `@dimen/nursing_order_required_width` | 复用 |
| 行尾箭头 12 / 性别圆环 14 / 圆环间距 24 / 勾选 18 | 无同值 | `nursing_order_chevron` / `_radio` / `_radio_gap` / `_checkbox` | 复用 |
| 关系 chip 72×26、间距 12/12 | 无同值 | `nursing_order_hospital_relation_chip_width` / `_chip_height` / `_chip_gap_h` / `_chip_gap_v` | 新增（2:77272 的 chip 是按文本撑开的 24 高，无 72×26） |
| 关系块标题到 chip 的间距 10 | 无同值 | `nursing_order_hospital_relation_gap` | 新增（语义档只有 4/8/12/16） |
| 模式切换块 157.5×36、间距 12 | 无同值 | 复用 `nursing_order_tab_height` / `nursing_order_tab_spacing` | 同值 |
| 套餐内块 190、左右内边距 8、行距 16 | 无同值 | `nursing_order_package_height` / `_padding_h` / `_row_gap` | 复用 |
| 阿姨头像 72×87 | 无同值 | `nursing_order_hospital_avatar` / `_avatar_height` | 新增（2:77272 是 84 高） |
| 勋章高 15 / 圆角 10 / 图标 8 | 无同值 | `nursing_order_badge_height` / `_badge_radius` / `_medal_icon` | 复用 |
| 阿姨横排块 108 / 标签流 54 / 按钮行 28 | 无同值 | `nursing_order_hospital_staff_block_height` / `nursing_order_staff_tags_height` / `nursing_order_cap_button_height` | 高度 108 新增（2:77272 是 110），另两个复用 |
| 底部条 62 + 安全区 34 | 无同值 | `nursing_order_bottom_bar_height` / `nursing_bottom_inset` | 复用 |
| 下一步 116×46 圆角 23 | 无同值 | `nursing_order_submit_width` / `_submit_height` / `_submit_radius` | 复用 |
| 字号 18 / 16 / 14 / 12 / 8 | `font_medium` / `font_basic_large` / `font_basic_body` / `font_basic_micro` | `nursing_order_text_nano`(8sp) | 8sp 语义档没有，复用模块已有的 nano 档 |

图标：

| 图标 | 来源（UniversalComponents / MasterGo） | 资源名 | 密度 |
| --- | --- | --- | --- |
| 状态栏（9:41 / Battery / Wifi） | 系统绘制 | 不实现 | — |
| 返回箭头 16×16（`6:04239`） | `UniversalComponents` | `TitleBar` 自带左图标（`setLeftOne`） | 矢量 |
| 行尾箭头 10.18×10.18（`2:73160` / `2:73250` / `2:73308` / `2:73328`） | `UniversalComponents` | `@drawable/universal_icon_arrow_right` | 12dp 矢量 |
| 金牌勋章图形 8×6.68（`2:73390`） | MasterGo `extractSvg` | `@drawable/nursing_ic_order_medal` | 矢量 |
| 阿姨徽标 1 18×18（`2:73405`） | MasterGo `extractSvg` | `@drawable/nursing_ic_order_staff_badge1` | 矢量 |
| 阿姨徽标 2 18×18（`2:73412`） | MasterGo 本页无矢量返回（`_mergedVector`，无 `svgShortKey`） | 留占位（不填 `src`），交付说明里跟踪 | — |
| 标签流展开 9.4×5.4（`2:73455`） | MasterGo `extractSvg` | `@drawable/nursing_ic_order_expand` | 矢量 |
| 套餐勾选白勾 18×18（`2:73289` / `2:73290`） | 模块已有 | `@drawable/nursing_ic_order_checkbox_check` | 矢量 |
| 阿姨头像位图 72×96（`2:73388`） | MasterGo CDN 位图 | `mipmap-xhdpi/nursing_ic_order_avatar.webp` | 2x（144×174 源图转无损 WebP） |
| 底部汇总图标 16×18.37（`2:73543`） | 设计稿是 `opacity=0` 的矩形，无可见图形 | 留占位（不填 `src`） | — |

图标策略说明：本页矢量图标来自 MCP `extractSvg`（`reference.md` 里图标/矢量的取数通道），不手写路径冒充；位图头像用设计稿给的 CDN 地址取原图转无损 WebP，不用 MCP 的 SVG 转位图顶替。

## 4. LayoutSpec

| 项 | 设计值 | 落在哪一层 | 实现方式 |
| --- | --- | --- | --- |
| 页面左右边距 | 12 | 滚动内容容器 `ll_order_hospital_body` 的 `paddingStart/End` | 唯一来源，卡片自身不再吃左右边距 |
| 区块间距 | 12 | 每个卡片自己的 `layout_marginTop` | 与页面边距不重复吃；内容顶 100 = 88 + 12 |
| 内容上内边距 | 12 | `ll_order_hospital_body` 的 `paddingTop` | 唯一来源 |
| 卡片尺寸（宽 × 高） | 351 × 84 / 252 / 394 / 168 / 172 | 卡片容器 | `match_parent` + 内容高度自然撑出（内部行高全部固定，和值等于设计高） |
| 卡片内边距 | 12（被照护人卡下内边距 0、联系人卡下内边距 0） | 卡片 `padding` | 各处只由一个 view 承担 |
| 卡内行距 | 12 | 卡片 `gap` 的等效实现：子项 `layout_marginTop` | 只在子项上给一次 |
| 关系 chip | 6 个 72×26，横向 12 / 纵向 12 | `FlexboxLayout` 子项 margin | chip 固定宽 72（设计值），换行由 Flexbox 决定 |
| 关系块标题到 chip | 10 | chip 容器 `layout_marginTop` | 语义档无 10 |
| 模式切换 | 2 块各 157.5×36、间距 12 | `LinearLayout`（weight 1）+ 第二块 `layout_marginStart` | 327 − 12 = 315，两块各 157.5 |
| 标签流 | 横向 8 / 纵向 6 | `FlexboxLayout` 子项 margin | 沿用模块 `nursing_item_order_staff_tag` |
| 阿姨卡横排 | 左 72、右 243（gap 12） | 内层横排容器 | 左固定 72dp、右 `layout_weight=1` |
| 头像 | 72 × 87（圆角 8） | `FrameLayout` + `ImageView` | 位图 72×96 超出容器，用 `centerCrop` 裁切 |
| 勋章 | 49 × 15、圆角 10、文字 8sp | 头像下方独立一行，`marginTop` 6 | 设计里是列方向第二项（不是压在头像上） |
| 按钮行 | 2 个各 159.5×28、间距 8、圆角 6 | `ShapeTextView`（weight 1） | 发送简历实心主色 / 查看简历 `#DDDFFF` 底 + 1px 主色描边 |
| 底部固定条 | 375 × 62 + 34 安全区 | `ll_order_hospital_bottom` | `wrap_content` + 代码里加导航栏 `paddingBottom` |
| 下一步按钮 | 116 × 46、圆角 23 | `ShapeTextView` | 固定宽高，`layout_gravity=end` |
| 字号 / 行高 | 18/22、16/22、14/22、12、20/23、8 | 各 `TextView` | 字号走语义档；行高用固定块高兜底（华为 ROM 忽略 `android:lineHeight`，见 `android-pitfalls.md`） |
| 圆角 | 卡片 12、chip 6、模式切换 4、头像 8、勋章 10、按钮 12/23/6 | drawable / `ShapeTextView` | 见 ResourceMap |
| 对齐关系 | 卡片内标题左对齐；表单 label 左、值右；关系 chip 居中；金额右对齐 | 各行容器 | 行容器 `gravity=center_vertical`，值容器 `layout_weight=1` + 右对齐 |

## 5. StateSpec

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 性别 | 选中（女） | 14×14 白底圆 + 4px `#5460FE` 圆环；文字主色 16sp | 默认 / 点击该项 | `2:73189` / `2:73190` / `2:73191` |
| 性别 | 未选中（男） | 14×14 空心圆 + 1.5px `#CCCCCC` 描边；文字 `#333333` | 默认 | `2:73194` / `2:73195` / `2:73196` |
| 模式切换 | 选中（全部） | 157.5×36 `#5460FE` 底 + 圆角 4 + 白字 14sp | 默认 / 点击该项 | `2:73266` / `2:73268` |
| 模式切换 | 未选中（多对多） | 157.5×36 白底 + 1px `#5460FE` 描边 + 圆角 4 + 主色字 14sp | 默认 | `2:73272` / `2:73274` |
| 套餐勾选 | 选中 | 18×18 主色圆 + 白色对勾 | 默认 | `2:73287` / `2:73288` |
| 输入行 | 占位 | 文字 `#CCCCCC`（请输入姓名 / 请输入） | 无输入 | `2:73177` / `2:73262` / `2:73369` / `2:73381` |
| 与被照护关系 chip | 默认 | 6 项均 `#F6F6F6` 底 + `#666666` 文字 16sp + 圆角 6 | — | `2:73205` – `2:73226` |
| 阿姨状态 chip | 等单中 | `#CCEED4` 底 + `#00AB28` 文字 10sp + 圆角 12 | 默认 | `2:73417` / `2:73418` |
| 勋章 | 金牌保姆 | 金渐变底（`#F2D8A1`→`#FBE3C0`）+ `#813C08` 文字 8sp + 圆角 10 | 默认 | `2:73389` / `2:73398` |
| 阿姨标签 | 默认 | 7 个 `#F6F6F6` chip + 末尾展开块 | 默认 | `2:73426` – `2:73457` |
| 按钮 | 默认 | 主色实心 / `#DDDFFF` 底两种 | 默认 | `2:73352` / `2:73356` / `2:73459` / `2:73463` / `2:73549` |
| 未出现 | 按下 / 禁用 / 加载 / 错误 / 空 | 设计稿未给，不实现 | — | — |

交互（只做设计稿真的给了状态的）：性别单选（女默认）、模式切换（全部默认）。
其余可点行与按钮（医院 / 服务病区 / 开始时间 / 结束时间 / 新增联系人 / 从手机通讯录添加 / 发送简历 / 查看简历 / 下一步）
设计稿只标了 `navigation` 或没有目标页，按 `SKILL.md`「只实现设计稿里已经有的状态」留空实现。

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 性别「女」文字色 | 节点 fill `#3A74FC`（`APP--旧/APP-主题色`）、逐字也是 `#3A74FC`；同组 radio 描边是 `PC-主色/Primary` `#5460FE` | 统一 `@color/color_primary` | 同一语义组内旧主题色与新主色并存，取有 token 的工程语义主色，不引入旧色 |
| 可点值文字（医院 / 查看简历） | `#3A74FC`（旧主题色） | `@color/color_primary` | 同上 |
| 金额与红色必填 | `￥`/`2100.00` 节点 fill `#F53F3F`，逐字 `paint_2:1262` = `#F54A44` | 统一 `@color/color_error` | 同组两色冲突，取工程语义红 |
| 「等单中」文字 | 节点 fill `#00B42A`（`APP--旧/APP-通过`），逐字同为旧绿 | `@color/color_success`（token `PC-成功｜标签/Success` = `#00AB28`） | 同组冲突，选有 token 的一档 |
| section 8 的 TEXT 节点名 | 节点名 `派 单` / `修 改`（组件库实例残留） | 文案取 `rowTexts` 的「全部」/「多对多」 | 节点名是复制组件库元素时的旧名，`rowTexts` 才是实例覆盖后的真实文案 |
| 底部条白路径 | 375×62.43（非整数，含顶边圆角） | 高 62 + 上两角 12 | 路径由 SVG 给出，Android `shape` 只能整块给圆角；真机再核 |
| 头像位图 | `2:73388` 72×96 @0,−6，比容器 72×87 高 | 容器 72×87 + `centerCrop` | 图片溢出容器，按容器裁切 |
| 被照护人卡下内边距 | `padding 12px 12px 0px` | 下内边距 0（由关系块自己的 12 兜住） | 108 的关系块已含 12 下内边距，再加一次会多 12 |
| 关系块 gap 10 | `2:73199` flexContainerInfo `gap=10`，而卡片其余 gap 是 12 | 关系块标题到 chip 用 10 | 绝对 y 对账：`22 + 10 = 32` 才落在设计 y=176 |
| 阿姨徽标 2（`2:73412`） | 18×18，`_mergedVector` 且无 `svgShortKey` | 留空位（`ImageView` 无 `src`） | `extractSvg` 本页只返回 10 个矢量，不含该节点，不手绘顶替 |
| 底部汇总图标（`2:73543`） | 16×18.37，所有矩形 `opacity=0` | 留空位 | 设计稿里没有可见图形 |

## 6. 实现清单

- [x] 基类：`OrderHospitalActivity : BaseActivity`，入口 `afterCreate(Bundle?)`，顺序 `initView()` → `initListener()` → `initData()`；ViewBinding 用 `bindings<NursingActivityOrderHospitalBinding>()`
- [x] 依赖：`Module.universalComponents`、`titleBar`、`shapeTextview`、`tobBaseResource`、`ThirdDependence.Flexbox.flexbox` 模块 `build.gradle` 已有，只补不改
- [x] 资源名前缀 `nursing_`；ID 只用类型前缀（`tv_` / `btn_` / `et_` / `iv_` / `ll_` / `fl_` / `nsv_` / `v_`）
- [x] 文案按设计稿直接写在布局里，不抽 `strings.xml`；颜色、尺寸不硬编码
- [x] 重复单元：关系 chip 用 `FlexboxLayout` + `nursing_item_order_hospital_relation.xml` 逐项 inflate，不复制 6 份静态块；阿姨标签沿用模块已有 item 布局
- [x] 关键数值按 LayoutSpec 在设备上量实际控件（见交付说明：逐块绝对 y 对账表）
- [x] 未导出/无矢量返回的图标写进交付说明（徽标 2、底部汇总图标）

## 7. 验收

- [x] 编译通过（`./gradlew :NursingAssessment:assembleDebug`；模块内与本次改动无关的编译中断在交付说明里单列）
- [x] 安装的是本次构建的包（`adb install` 输出 `Success`）
- [x] `adb shell uiautomator dump` 能找到设计稿的每段文案（含「医院陪护」「全部」「多对多」三个非占位闭集文案）
- [x] 截图逐块比对：标题栏 88、客户信息 100、服务地点 134、被照护人 230、服务套餐 494、联系人 900、阿姨 1080、底部条 1275.57（±2dp）
- [x] 未验证的交互和无法完全还原的偏差写进交付说明

## 8. 实现后结论（本次接手补完）

- 交付说明：[2-73133-交付说明.md](2-73133-交付说明.md)（真机截图命令 + 绝对 y 对账表 + 偏差 + 待导出图标）
- 真机对账：客户信息行 98.3 / 服务地点卡 132.5 / 被照护人卡 228.7 / 服务套餐卡 493.4 / 联系人卡 899.7 / 阿姨卡 1080.0 / 内容底 1252.3（整体比设计低 1.5dp，来自导航栏实测 86.2）；卡片高度 84.1 / 252.6 / 394 / 168.2 / 172.3 全部吻合。
- 接手后修掉 3 处（**都是真机对账才暴露，文案清单全通过**）：

| 问题 | 现象 | 根因 |
| --- | --- | --- |
| 关系 chip 被压扁 | 实测宽 44.3（设计 72），6 项挤成一行 | `FlexboxLayout` 默认 `nowrap` + `flexShrink=1`，没写 `app:flexWrap="wrap"` |
| 阿姨标签被压成单字 | 7 个 chip 挤一行、每项只剩一个字 | 同上 |
| 标签流第二行被裁 6dp | 容器 47.4 高（设计 54）、第二行 18 高（设计 24） | 容器定高 54，子项还各带 6dp `bottomMargin` → 内容 60 溢出 |
| 资料行撑高右侧列 6dp | 标签流顶 +72.7（设计 +66） | 「34岁…」行误用 `nursing_line_height_16`（该档是 22dp），设计是 16 |

- 沉淀：`android-pitfalls.md` 新增「FlexboxLayout 默认 nowrap」一节（含判据与三种修法）。
