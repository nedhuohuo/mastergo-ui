# 我要护工（下单页）UI 分析（MasterGo file 180767492624044 / layer 2:77272）

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 180767492624044 |
| page_id / 真实 layer_id | URL `?page_id=M` 是合成页 ID；`?layer_id=2%3A77272` 才是内容图层，直接用 `2:77272` 取数 |
| 设计稿链接 | https://mastergo.com/file/180767492624044?pageId=M&layer_id=2%3A77272 |
| 页面尺寸 | 375 × 980（`rootContainer.minHeight` 980，`name=我要护工`，底 `#F6F6F6`） |
| 读取范围 | 全部 10 个 section / 226 节点；另回查 `splitContainers` 的 2:77335 |
| 目标工程与模块 | `zhb/ModuleNursingAssessment/NursingAssessment`（`resourcePrefix nursing_`，namespace `com.yilife.android.zhb.module.nursingassessment`） |
| 数据来源 | MasterGo Magic MCP（`getMeta` → `getDesignSections` 列表 → 逐 section `sectionIndex=0..9`） |

## 1. PageStructure

```text
页面（375×980，底色 #F6F6F6）
├── 顶部渐变层 375×196 @0,0（装饰，在标题栏与内容下面）
├── 标题栏 375×88 @0,0（状态栏 + 返回 16×16 @15,58 + 居中标题「居家照护」18sp）
├── 滚动内容区 351×994 @12,100（transparent，透出页面灰）
│   ├── 客户信息行 246×22 @12,100
│   ├── 时段分段页签 351×36 @12,134（短期 / 长期 / 陪诊 / 钟点工）
│   ├── 服务地点卡 351×140 @12,182（医院行 + 地址行，均可点跳转）
│   ├── 被照护人卡 351×132 @12,334（姓名输入 + 性别单选）
│   ├── 服务套餐卡 351×250 @12,478（套餐行 + 开始/结束时间 + 服务天数）
│   ├── 联系人卡 351×168 @12,740（新增联系人 / 从通讯录添加 + 姓名 + 联系方式）
│   └── 阿姨推荐卡 351×174 @12,920（头像 + 资料 + 标签流 + 三个按钮）
└── 底部固定条 375×96 @0,883.57（62 内容 + 34 home indicator；总计 ￥2100.00 + 下一步）
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 顶部渐变层 | 固定 | 无 | 静态 | 与客户详情页同一渐变，复用 `nursing_bg_customer_header` |
| 标题栏 | 固定 | 无 | 静态文案「居家照护」 | `TitleBar`，标题栏自带白底会截断渐变，代码里置透明 |
| 客户信息行 | 滚动 | 无 | 静态 | 设计稿文案「客户信息：马小跳  13966657899」 |
| 时段分段页签 | 滚动 | 4 项（等宽） | 静态 | 选中项实色块，未选中白底胶囊，gap 12、圆角 4 |
| 服务地点卡 | 滚动 | 2 行 | 静态 | 每行左 label（带红色 `*`）+ 右值 + 12×12 箭头 |
| 被照护人卡 | 滚动 | 2 行 | 静态 | 姓名行为占位文案；性别行为单选（女选中） |
| 服务套餐卡 | 滚动 | 内块 4 行 | 静态 | 内块 `rgba(58,116,252,0.08)` 圆角 12；第 1 行带选中勾选 |
| 联系人卡 | 滚动 | 2 行 + 2 按钮 | 静态 | 两个主题色胶囊按钮；两行为占位文案 |
| 阿姨推荐卡 | 滚动 | 标签 chip × 7 | 静态 | 左侧头像 + 勋章；右侧资料、状态 chip、按钮、标签流 |
| 底部固定条 | 固定 | 无 | 静态 | 上方向阴影 + 白底；下一步按钮 |

**背景分区表**（任何一段都指到具体图层，不用根底色兼顶）：

| 区段（设计绝对 y） | 设计稿哪一层负责 | 颜色 / 圆角 | 实现里哪个 view 负责 |
| --- | --- | --- | --- |
| 状态栏 + 标题栏 0..88 | 渐变层 `6:04383`（375×196 @0,0，`linear-gradient(171deg,#E2E4FF -2%,rgba(255,255,255,0) 111%)`）铺在导航栏组 `6:04385` 下面 | 渐变起色 `#E2E4FF`，无圆角 | `v_order_header_gradient`（固定 196dp）+ `title_bar_order`（背景显式置透明） |
| 标题栏下到页面底 88..980 | `rootContainer.fill` = `#F6F6F6` | 页面灰 `#F6F6F6` | `fl_root` 根容器铺页面灰（渐变层只覆盖前 196dp） |
| 内容底 100..1094 | `splitContainers` 容器 5326（`2:77335`，351×994 @12,100） | 回查 `rootContainer.background=transparent`、无 `borderRadius` → 透出上一段页面灰 | `nsv_order` 滚动容器，不设底色 |
| 底部固定条 883.57..980 | `2:77642` 容器 4165（375×96）：编组 4 的白色路径 375×62.43 + Home Indicator 375×34 白底 | 白 `#FFFFFF`，顶边圆角由路径给出 | `ll_order_bottom`（白底 + 上方向阴影）+ 34dp 由导航栏 inset 消费 |

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 标题栏 | 顶部固定高 + 左返回 + 居中标题 | `com.yilife.android.widget.component.titlebar.TitleBar` | `initializeHeader("居家照护")`、`setLeftOne()` 点击 `finish()` | `Module.titleBar`（模块已有） | 组件构造自带白底，需 `setBackgroundColor(TRANSPARENT)`，且在 `initializeHeader` 之后调用 | 不新建 |
| 时段分段页签 | 一排连体按钮，选中项是实色块 | `UniversalTabLayout`（`UniversalTabStyle.TAG` + EQUAL 等分） | 点击切换选中项并回填时段；设计稿未给各时段的内容差异，不编造内容容器 | `UniversalComponents`（`Module.universalComponents`） | TAG 默认胶囊内边距 16dp、胶囊高度受 item 高度截断；间距默认 4dp | 不新建 |
| 服务地点 / 被照护人 / 服务套餐 / 联系人 / 阿姨推荐 | 圆角块 + 标题 + 行 | `LinearLayout` + `TextView` + 模块 `{prefix}_bg_` drawable | 卡片本身无交互；可点行由外层容器承担 | AndroidX 原生 | 无 | 不新建 |
| 可跳转行（医院 / 地址 / 开始时间 / 结束时间） | 整行右侧带 `>` 且可点 | `LinearLayout`（可点）+ `ImageView`（`universal_icon_arrow_right`） | 点击留空实现（设计稿给的是 `navigation` 目标，未提供目标页） | `UniversalComponents` 图标 | 图标固有尺寸需用 12dp 约束 | 不新建 |
| 姓名 / 联系方式 / 联系人 | 输入框 | `EditText` | 聚焦输入；设计稿只有占位态 | AndroidX 原生 | 需关掉默认内边距对齐 22dp 行高 | 不新建 |
| 性别单选 | 圆形 radio + 文字 | 可点行（`LinearLayout`）+ `ImageView`（模块 `nursing_bg_order_radio_selected` / `_unselected`）+ `TextView` | 单选互斥，选中回填 | AndroidX 原生 | 不用 `RadioButton`：`ShapeDrawable` 无固有尺寸，作 `android:button` 会被量成 0，表达不了 14dp 圆环 | 不新建 |
| 套餐勾选（ico-选中） | 圆形勾选块 | `ImageView` + 模块 `nursing_bg_checkbox_selected` / `nursing_ic_checkbox_white` | 设计稿只给了选中态，点击留空 | 原生 | 无 | 不新建 |
| 新增联系人 / 从手机通讯录添加 / 发送简历 / 更换阿姨 / 查看简历 / 下一步 | 圆角块 + 文字 | `com.yilife.android.widget.component.shapetextview.ShapeTextView` | 点击留空实现 | `Module.shapeTextview`（模块已有） | `radius` 用 170px 设计值是胶囊，按高度折算 | 圆角+描边+按下态都由控件属性表达，不写 `bg_` drawable |
| 阿姨标签 chip（照顾孩子 / 做家务 / …） | 间距一致、结构相同的重复项 | `FlexboxLayout` + `nursing_item_order_staff_tag.xml` | 无交互（展示） | `ThirdDependence.Flexbox.flexbox`（模块已加） | 无 | 不新建 |
| 底部固定条 | 底部一排：汇总 + 主按钮 | `LinearLayout` + `TextView` + `ShapeTextView` | 「下一步」点击留空 | `Module.shapeTextview` + 原生 | 上方向阴影不能用 `elevation`，用 `layer-list` 画在下层背景顶部 | 不新建 |
| 阿姨头像 | 图片位 | `ImageView`（`nursing_ic_order_avatar.webp`） | 无 | MasterGo 客户端导出 | 无 | 不新建 |

形态判定备注：时段页签是「一排连体按钮、选中项是实色块」，对应 SKILL.md 形态表的**分段页签**，是同一套页签组件的另一种样式；本页只有这一排页签，没有第二排。

## 3. ResourceMap

颜色：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| `#333333` | `@color/text_gy1` | — | 标题、label、正文 |
| `#666666` | `@color/text_gy2` | — | 阿姨标签文字 |
| `#999999` | `@color/text_gy3` | — | 「（联系方式为必填）」 |
| `#CCCCCC` | `@color/text_gy4` | — | 占位文案、未选中 radio 描边 |
| `#FFFFFF` | `@color/bg_base` / `@color/text_white` | — | 卡片底 / 反白文字 |
| `#5460FE` | `@color/color_primary` | — | 选中块、按钮、可点值文字 |
| `#DDDFFF` | `@color/color_primary_v5` | — | 「查看简历」按钮底 |
| `#CCEED4` / `#00AB28` | `@color/color_success_v5` / `@color/color_success` | — | 「等单中」chip 底 / 文字（设计 fill `#00B42A` 为旧色） |
| `#FF5A54`、`#F53F3F`、`#F54A44` | `@color/color_error` | — | 必填 `*`、金额；三处旧色取同一语义色 |
| `#F6F6F6` | 无同值 | `@color/nursing_color_page_bg` | 模块已有（客户详情页同值） |
| `#E2E4FF` 渐变 | 无同值 | `@color/nursing_color_header_gradient` | 模块已有 |
| `#E4E4ED` | 无同值 | `@color/nursing_color_card_divider` | 新增：卡片内行分割线 0.5dp（与已有 `nursing_color_form_divider` 的 `rgba(0,0,0,0.06)` 不同值） |
| `#E6E6EB` | 无同值 | `@color/nursing_color_avatar_bg` | 新增：头像占位底（设计 token `PC-填充/Fill- darker`） |
| `rgba(58,116,252,0.08)` | 无同值 | `@color/nursing_color_primary_soft` | 新增：套餐内块底（`color_primary` 8%） |
| `#813C08`、渐变 `#F2D8A1`→`#FBE3C0` | 无同值 | `@color/nursing_color_gold_text` / `@color/nursing_color_gold_start` / `@color/nursing_color_gold_end` | 新增：勋章底渐变与文字 |

尺寸 / 字号 / 圆角：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| 页面左右边距 12 | `@dimen/space_base` | `@dimen/nursing_page_margin` | 模块已有同值，直接复用 |
| 卡片间距 / 卡内 gap 12 | `@dimen/space_base` | `@dimen/nursing_card_padding` | 模块已有 |
| 卡片圆角 12 | `@dimen/radius_larger` | — | — |
| 胶囊圆角 170（高 24）/ 100（高 46） | `@dimen/radius_larger` / `@dimen/radius_round` | `@dimen/nursing_order_submit_radius` | 24 高按 12、46 高按 23 |
| chip 圆角 6 | `@dimen/radius_medium` | — | — |
| 时段页签高 36 / 间距 12 | 无同值 | `@dimen/nursing_order_tab_height` / `nursing_order_tab_spacing` | 新增 |
| 行高 36（含 12dp 下内边距） | 无同值 | `@dimen/nursing_order_row_height` | 新增 |
| 套餐内块行距 16 / 左右内边距 8 | `@dimen/space_small` / `@dimen/space_mini` | — | — |
| 箭头 12 / radio 14 / 勾选 18 | 无同值 | `@dimen/nursing_order_chevron` / `_radio` / `_checkbox` | 新增 |
| 头像 72×84 / 勋章高 15 | 无同值 | `@dimen/nursing_order_avatar` / `_avatar_height` / `_badge_height` | 新增 |
| 底部条 62 + 安全区 34 | 无同值 | `@dimen/nursing_order_bottom_bar_height` / `@dimen/nursing_bottom_inset` | 安全区模块已有 |
| 下一步 116×46 | 无同值 | `@dimen/nursing_order_submit_width` | 新增 |
| 字号 18 / 16 / 14 / 12 / 20 / 10 / 8 | `@dimen/font_medium` / `font_basic_large` / `font_basic_body` / `font_basic_micro` / `font_large` | — | 10sp、8sp 无对应档，用 `nursing_order_text_micro` / `_nano` 新增 |

图标：

| 图标 | 来源 | 资源名 | 密度 |
| --- | --- | --- | --- |
| 可跳转行右侧箭头 12×12 | `UniversalComponents` | `@drawable/universal_icon_arrow_right` | 矢量 |
| 圆形勾选（选中）18×18 | 模块新增 | `nursing_bg_checkbox_selected` + `nursing_ic_checkbox_white` | 矢量 |
| 性别 radio 14×14（选中 / 未选中） | 模块新增 | `nursing_bg_radio_selected` / `nursing_bg_radio_unselected` | 矢量 |
| 返回箭头 16×16 | MasterGo 客户端导出 | `nursing_ic_order_back.webp` | `mipmap-xhdpi`（2x） |
| 阿姨头像 72×96 | MasterGo 客户端导出 | `nursing_ic_order_avatar.webp` | `mipmap-xhdpi`（2x） |
| 勋章图标 8×8 | MasterGo 客户端导出 | `nursing_ic_order_medal.webp` | `mipmap-xhdpi`（2x） |
| 姓名后 2 个 18×18 徽标 | MasterGo 客户端导出 | `nursing_ic_order_staff_badge1/2.webp` | `mipmap-xhdpi`（2x） |
| 标签流展开 16×16 | MasterGo 客户端导出 | `nursing_ic_order_expand.webp` | `mipmap-xhdpi`（2x） |
| 底部条设置图标 16×18.4 | MasterGo 客户端导出 | `nursing_ic_order_summary.webp` | `mipmap-xhdpi`（2x） |

图标策略说明：`UniversalComponents` 全库只有 9 个图标（`universal_icon_arrow_right`、`universal_icon_blue_check` 等），本页除箭头外无同类可复用项，因此其余按 SKILL.md「图标来源」第 2 档从 MasterGo 取；位图由 MasterGo 客户端导出后转无损 WebP，不使用 MCP 返回的 SVG 本地转换冒充。

## 4. LayoutSpec

| 项 | 设计值 | 落在哪一层 | 实现方式 |
| --- | --- | --- | --- |
| 页面左右边距 | 12 | 滚动内容容器 `ll_order_body` 的 `paddingStart/End` | 只此一层，卡片自身不再吃左右边距 |
| 区块间距 | 12 | 每个卡片自己的 `layout_marginTop` | 与页面边距不重复吃；内容顶 100 = 88 + 12 |
| Item 间距（时段页签） | 12 | `UniversalTabLayout.setTabItemSpacingPx` | 4 项等分：(351 − 3×12) ÷ 4 = 78.75 |
| Item 间距（阿姨标签） | 横向 8 / 纵向 6 | `FlexboxLayout` 子项 margin | 设计 `flexWrap` gap `8px 6px` |
| Item 间距（套餐内块行） | 16 | 内块容器子项 `marginTop` | 与内块 padding 分开 |
| 卡片尺寸（宽 × 高） | 351 × 140 / 132 / 250 / 168 / 174 | 卡片容器 | `match_parent` × 固定高；横向不写死宽度 |
| 时段页签 | 351 × 36，4 项各 78.75 | `UniversalTabLayout` | `layout_height=36dp` + EQUAL 等分 |
| 行结构（label + value） | label 42（`*` 9 + 文字 33）、value 右侧 | 行容器 | `LinearLayout`，label 固定宽 42、value `layout_weight=1` + 右对齐 |
| 套餐内块 | 327 × 190，padding 12/8/0，圆角 12 | 内块容器 | `LinearLayout` + `nursing_bg_order_package` |
| 阿姨卡横向两栏 | 左 72、右 243（gap 12） | 内层横排容器 | 左固定 72dp、右 `layout_weight=1` |
| 头像 | 72 × 84（圆角 8） | `ImageView` 容器 | 固定尺寸（与宽度无关） |
| 底部固定条 | 375 × 62 + 34 安全区 | `ll_order_bottom` | `wrap_content` 高 + 代码里加导航栏 `paddingBottom` |
| 下一步按钮 | 116 × 46 | `ShapeTextView` | 固定宽高，`layout_gravity=end` |
| 字号 / 行高 | 18/22、16/22、14/17、12、20/23、10、8 | 各 `TextView` | `textSize` 走语义档，行高用 `lineHeight` 并给容器高兜底 |
| 圆角 | 卡片 12、页签 4、chip 6、内块 12、胶囊 12/23 | drawable / `ShapeTextView` | 见 ResourceMap |
| 对齐关系 | 卡片内标题左对齐；label 左、value 右；金额右对齐 | 各行容器 | 行容器 `gravity=center_vertical` |

**绝对 y 对账表**（实现后逐块核；`AutoSize` 下设计 dp ≠ 实测 dp，按第 8 节折算计）：

| 块 | 设计 y（顶） | 说明 |
| --- | --- | --- |
| 标题栏底 / 页面灰起点 | 88 | 渐变层 196 覆盖其上，不改底色 |
| 客户信息行顶 | 100 | = 标题栏 88 + 12 |
| 时段页签顶 | 134 | = 122 + 12 |
| 服务地点卡顶 | 182 | = 170 + 12 |
| 被照护人卡顶 | 334 | = 322 + 12 |
| 服务套餐卡顶 | 478 | = 466 + 12 |
| 联系人卡顶 | 740 | = 728 + 12 |
| 阿姨推荐卡顶 | 920 | = 908 + 12 |
| 内容底 | 1094 | 卡片底 1094 = 920 + 174 |
| 底部条顶 | 883.57 | 固定，压住滚动内容上沿 |

## 5. StateSpec

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 时段页签 | 选中 | 底 `#5460FE`、文字 `#FFFFFF` | 点击该项 | `2:77344`（长期，设计稿选中项） |
| 时段页签 | 未选中 | 底 `#FFFFFF`、文字 `#333333` | 默认 | `2:77340 / 2:77348 / 2:77352` |
| 性别 | 选中 | 14×14 圆环 4px `#5460FE` + 文字 `#5460FE` | 点击该项 | `2:77426`（女） |
| 性别 | 未选中 | 14×14 圆环 1.5px `#CCCCCC` + 文字 `#333333` | 默认 | `2:77431`（男） |
| 套餐勾选 | 选中 | 18×18 圆 `#5460FE` + 白色勾 | 默认 | `2:77449` |
| 输入行 | 占位 | 文字 `#CCCCCC`（请输入姓名 / 请输入） | 无输入 | `2:77414 / 2:77531 / 2:77543` |
| 阿姨状态 chip | 等单中 | 底 `#CCEED4`、文字 `#00AB28`、圆角 12 | 默认 | `2:77583` |
| 勋章 | 金牌保姆 | 金渐变底 + `#813C08` 文字 8sp | 默认 | `2:77551` |
| 可点按钮 | 默认 | 主色实心 / 浅紫底两种 | 默认 | `2:77514 / 2:77638` |
| 未出现 | 按下 / 禁用 / 加载 / 错误 / 空 | 设计稿未给，不实现 | — | — |

## 6. 实现清单

- [x] 基类：`OrderActivity : BaseActivity`，入口 `afterCreate(Bundle?)`，顺序 `initView()` → `initListener()` → `initData()`；ViewBinding `private val binding by bindings<NursingActivityOrderBinding>()`
- [x] 依赖：`Module.universalComponents`、`Module.titleBar`、`Module.shapeTextview`、`Module.tobBaseResource`、`ThirdDependence.Flexbox.flexbox` 模块 `build.gradle` 均已有，只补不改
- [x] 资源名前缀 `nursing_`；ID 只用类型前缀（`tv_` / `btn_` / `et_` / `rb_` / `iv_` / `ll_` / `fl_` / `nsv_` / `tab_` / `v_`）
- [x] 文案按设计稿直接写在布局里，不抽 `strings.xml`；颜色、尺寸不硬编码
- [x] 重复单元：阿姨标签用 `FlexboxLayout` + `nursing_item_order_staff_tag.xml` 逐项 inflate，不复制静态行
- [x] 关键数值按 LayoutSpec 量实际控件

## 7. 验收

- [x] 编译通过
- [x] 安装的是本次构建的包（`adb install` 输出 `Success`）
- [x] `adb shell uiautomator dump` 能找到设计稿的每段文案
- [x] 截图与设计稿逐块比对标题栏、渐变层、时段页签、四张卡片、阿姨卡、底部条
- [x] 未验证的交互和无法完全还原的偏差写进交付说明

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 标题文案 | section 名 `医院陪护`、图层名 `医院陪护` | 标题取文本节点 `居家照护` | 图层名是复制组件库元素时残留的名字，文本节点才是页面真实文案 |
| 金额色 | `￥` 逐字 `#FF5A54`、`2100.00` 逐字 `#FF5A54`，节点 fill `#F53F3F` | 统一 `@color/color_error` | 同一语义组三方不一致，取工程语义色，不新增旧色 |
| 「等单中」文字 | 节点 fill `#00B42A`（旧 APP 绿），逐字 `#00AB28` | `@color/color_success` | 同组冲突，选有 token 的一档 |
| 性别文字 | 女：节点 fill `#3A74FC`（旧主题色），逐字 `#5460FE` | 两处都用 `@color/color_primary` | 同一控件两个近似蓝，取工程语义主色 |
| 阿姨标签重复项 | 标签流第 5/6/7 项都是「热情开朗」 | 逐项渲染，保留设计稿给的重复 | 设计稿确实排了三个同文案 chip，不是占位文本 |
| 阿姨卡右上两个 18×18 容器 | 无名字、无可见图形内容 | 按图标位占位，导出后替换 | 节点无文本，属图形徽标位 |
| 底部条背景 | 白色路径 375×62.43（含顶边圆角） | 白底 + 左上/右上圆角 12 + 上方向阴影 | 路径由 SVG 给出，圆角按同类底部条取值，真机再核 |

## 待办（不阻塞结构，交付说明里跟踪）

- 图标与头像导出：返回、头像、勋章、姓名后 2 个徽标、标签流展开、底部条汇总图标（MasterGo 客户端导出 → 无损 WebP → `mipmap-xhdpi`）
- 可点目标的跳转页：医院 / 地址 / 开始时间 / 结束时间、新增联系人、从手机通讯录添加、更换阿姨、发送简历、查看简历、下一步
- 各时段（短期 / 长期 / 陪诊 / 钟点工）的内容差异设计稿未给，只还原选中态切换
- 输入框与单选的真实数据回填、校验规则未给

## 实现后结论（同族页面一起核过）

阿姨推荐卡（layer `2:77546`，351×174）在真机上也踩到同类问题：右侧列设计 `44 = 24(姓名行) + 4 + 16(资料行)`、标签流 54，实现里资料行误用 `nursing_line_height_16`（22dp）撑成 48，导致标签流被挤出定高 110 的横排块、第二行只剩 18 高。已按设计改成 16dp + `includeFontPadding="false"`，标签流改为容器 `alignContent="space_between"` 分配行距（子项不再带 `bottomMargin`）。修后实测：标签流 54.0、两行各 23.9、行距 30.1，相对卡顶 +68.2（设计 +68）。
