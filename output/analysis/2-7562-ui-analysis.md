# 客户详情 UI 分析（MasterGo file 180767492624044 / layer 2:7562）

- 来源：https://mastergo.com/file/180767492624044?page_id=M&layer_id=2%3A7562
- 真实 layer_id：`2:7562`（URL 里的 `page_id=M` 是合成页 ID，`layer_id` 才是内容图层）；共 13 个 section、286 节点
- 画布：375×1346，底色 #F6F6F6
- 落地模块：`zhb/ModuleNursingAssessment/NursingAssessment`（用户指定：写进护理评估模块）
- 数据：静态，按设计稿写死

## 1. PageStructure

| 层 | 区块 | 位置/尺寸 | 说明 |
| --- | --- | --- | --- |
| 页面 | 顶部渐变底 | 375×196 @0,0 | 装饰，固定；`linear-gradient(171deg,#E2E4FF -2%,transparent 111%)` |
| 页面 | 标题栏 | 375×88 @0,0 | 固定；返回 16×16 @15,58、标题「客户详情」18sp Medium 居中 |
| 页面 | 页签行 | 351×26 @12,112 | 固定；4 项，选中项带 18×3 下划线 |
| 页面 | 底部操作栏 | 375×98 @0,1248 | 固定；64 白底 + 5 个操作项 + 34 底部安全区 |
| 页面 | 滚动区 | 351 宽，y=150..1241 | 6 个区块，区块间距 12dp，左右边距 12dp |
| 区域 | 客户卡片 | 348×136 @12,150 | 白底 radius12、padding12；头像+姓名+负责人/创建人/协同人/客资电话+无效线索斜条 |
| 区域 | 未成单反馈卡片 | 351×98 @12,298 | #FFEFEE radius12、padding 8/12；标题+人名时间+内白块（标签+文案） |
| 区域 | 双按钮行 | 351×56 @12,408 | 下单 / 未成单反馈，各 171.5，gap 8 |
| 区域 | 三按钮行 | 351×56 @12,476 | 加协同人 / 转跟进人 / 退回线索，各 111.67，gap 8 |
| 区域 | 灰卡 | 351×385 @12,544 | #F5F5FA，含基本信息(256)+分割线+用户标签(89) |
| 区域 | 需求信息 | 351×300 @12,941 | 无卡片底，直接落在页面底色上；空态插画+文案+主按钮 |
| 内容 | 底部操作项 | 24 图标 + 14sp 文字 | 5 个：打电话/发短信/发微信/写跟进/更多，space-between |
| 内容 | 标签 chip | 高 24、padding 4/6 | 6 个，wrap：沟通能力/责任心强/尊重隐私/职业道德/家属协作/沟通能力 |
| 内容 | 字段行 | label 70 + value | 11 条，两列（各 158，gap 14）或整行 |

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 |
| --- | --- | --- | --- | --- |
| 标题栏 | 顶部固定高 + 左返回 + 居中标题 | `TitleBar` | `initializeHeader("客户详情")`、`setLeftOne()` 点击 finish | `Module.titleBar`（上个页面同款） |
| 页签行 | 一排文字 + 选中下划线 | `UniversalTabLayout`（NORMAL） | `setTabs` + `OnTabSelectedListener` 切换内容容器 | `Module.universalComponents` |
| 页签内容容器 | 翻页 | `ViewPager2` | 4 页，页 0 = 设计稿内容，页 1-3 设计稿未给 | `ThirdDependence.AndroidX.viewPager2` |
| 客户卡片 | 卡片 + 字段 + 图标位 | `LinearLayout` + `TextView` + `ImageView` | 图标按钮可点（目标未定，留空实现） | 原生 |
| 无效线索斜条 | 旋转色块 + 文字 | `TextView` + `android:rotation` | 无交互（装饰） | 原生 |
| 未成单反馈卡片 | 卡片 + 标签 + 文案 | `LinearLayout` + 带底 `TextView` | 无交互 | 原生 |
| 下单 / 未成单反馈 | 圆角块 + 文字 + 右下装饰图标 | `FrameLayout` 可点 | 点击留空实现 | 原生 |
| 加协同人 / 转跟进人 / 退回线索 | 同上（紫色底） | `FrameLayout` 可点 | 点击留空实现 | 原生 |
| 基本信息 | 标题 + 编辑按钮 + 字段网格 | `LinearLayout` + `ShapeTextView` | 编辑按钮可点（留空） | `Module.shapeTextview` |
| 用户标签 | 标题 + 新增按钮 + chip 流式布局 | `FlexboxLayout` + `TextView` | 新增按钮可点（留空） | `ThirdDependence.flexbox` |
| 需求信息空态 | 插画 + 文案 + 主按钮 | `ImageView` + `TextView` + `ShapeTextView` | 主按钮可点（留空） | `Module.shapeTextview` |
| 底部操作栏 | 一排图标 + 文字 | `LinearLayout` + `ImageView` + `TextView` | 5 项可点（留空） | 原生 |

## 3. ResourceMap

| 设计值 | 用途 | 落地资源 | 出处 |
| --- | --- | --- | --- |
| #5460FE | 主色：页签选中、编辑按钮、主按钮、标签蓝字、复制/电话图标 | `@color/color_primary` | TobBaseResource |
| #333333 | 主文本（标题、字段、按钮文字） | `@color/text_gy1` | TobBaseResource |
| #666666 | 次文本（未选中页签、人名时间、标签新增按钮） | `@color/text_gy2` | TobBaseResource |
| #999999 | 辅助文本（暂无需求信息） | `@color/text_gy3` | TobBaseResource |
| #CCCCCC | 无效线索条底、姓名后图标 | `@color/text_gy4` | TobBaseResource |
| #FFFFFF | 卡片底、底部操作栏底、未成单内块底 | `@color/bg_base` | TobBaseResource |
| #FF5A54 / #FFEFEE | 未成单标签底、反馈卡片底 | `@color/color_error` / `@color/color_error_v6` | TobBaseResource |
| #E6F7EA / #CCEED4 | 绿 chip 底 / 描边 | `@color/color_success_v6` / `@color/color_success_v5` | TobBaseResource |
| #00AB28 | 绿 chip 文字（设计 fill 为旧色 #00B42A，与逐字 #00AB28 冲突，取资源里有的语义色） | `@color/color_success` | TobBaseResource |
| #FFF4EB / #FFE9D6 | 橙 chip 底 / 描边 | `@color/color_warning_v6` / `@color/color_warning_v5` | TobBaseResource |
| #FF8F33 | 橙 chip 文字（设计 fill 旧色 #F7862A，同上取语义色） | `@color/color_warning` | TobBaseResource |
| #EEEFFF | 下单/未成单反馈按钮底、蓝 chip 底 | `@color/color_primary_v6` | TobBaseResource |
| #F4EEFF | 三个紫按钮底 | `@color/color_purple_v6` | TobBaseResource |
| #F5F5FA | 灰卡底 | `@color/fill_light` | TobBaseResource |
| #EBECF5 / #DCDDE5 | 按钮描边 / 标签新增按钮描边 | `@color/border_lighter` / `@color/border_base` | TobBaseResource |
| rgba(0,0,0,0.06) | 灰卡内分割线 | `@color/nursing_color_form_divider` | 模块已有（上个页面同值） |
| #F6F6F6 | 页面底色 | `@color/nursing_color_page_bg` | 模块新增（TobBaseResource 无同值） |
| #E2E4FF | 顶部渐变起色 | `@color/nursing_color_header_gradient` | 模块新增 |
| rgba(0,0,0,0.04) | 底部操作栏顶部 1px 线 | `@color/nursing_color_bottom_divider` | 模块新增 |
| rgba(0,0,0,0.85) | 底部操作项文字 | `@color/nursing_color_action_text` | 模块新增 |
| 全部 PATH/图片节点 | 返回、性别、编辑/复制/电话、5 个底栏图标、3+1 装饰图标、空态插画、头像 | 待 MasterGo 客户端导出后放 `mipmap-xhdpi` | 见交付说明清单 |

## 4. LayoutSpec

| 项 | 设计值 | 落地值 | 说明 |
| --- | --- | --- | --- |
| 页面边距 | 12 | `@dimen/nursing_page_margin` | 左右各 12 |
| 区块间距 | 12 | `@dimen/space_base` | 卡片之间统一 12 |
| 卡片圆角 / 内边距 | 12 / 12 | `@dimen/radius_larger` / `nursing_card_padding` | 客户卡片、反馈卡片、灰卡 |
| 客户卡片 | 348×136 | match_parent×136 | 设计 348 与其它卡片 351 不一致，按页面边距取 351 |
| 头像 / 姓名 | 30×30 / 18sp | `nursing_avatar` / `@dimen/font_medium` | 姓名后图标位 18×18 |
| 页签 | 4 项、高 26、gap 18 | 高 26、gap 7dp | 设计 4 项合计 384 > 可用 351（溢出 33，末项被画到页面外）；文本合计 330，落地 gap=(351-330)/3≈7 |
| 页签指示器 | 18×3 radius 101 | `nursing_bg_tab_indicator` | 复用上个页面 drawable |
| 底部操作栏 | 375×64 + 安全区 | 64 + insets | 5 项 67/67/67/67/53，图标 24，文字 14sp，padding 0 12 |
| 双按钮 | 171.5×56 gap 8 | weight 1 ×56 | 圆角 8，文字 16sp Medium 距左 10，装饰图标 36×36 距右 20 |
| 三按钮 | 111.67×56 gap 8 | weight 1 ×56 | 圆角 8，文字距左 10，装饰图标 30×30 贴右下角 |
| 字段 | label 70、两列 158、gap 14、行距 11 | 同名模块 dimen | 字号 14sp，超长省略 |
| chip | 高 24、padding 4/6、gap 6、圆角 4 | 同名模块 dimen | 6 个，wrap 成两行 |
| 空态 | 插画 120、gap 32、padding 24 | 同名模块 dimen | 文案 14sp #999999 |
| 主按钮 | 279×46 radius 24 | match_parent + 24 内边距 | 327-2×24=279 |

## 5. StateSpec

| 状态 | 出现在 | 表现 |
| --- | --- | --- |
| 页签选中 | 页签行 | 文字 #5460FE + 18×3 下划线 |
| 页签未选中 | 页签行 | 文字 #666666，无下划线 |
| 空态 | 需求信息 | 插画 + 暂无需求信息 |
| 客户状态标签 | 客户卡片 | 「无效线索」灰底斜条，旋转 30.27° |
| 标签色 | 用户标签 | 蓝 / 绿 / 橙三色 chip，底色+描边+文字成套 |
| 未成单标签 | 未成单反馈卡片 | 红底白字 #FF5A54 |
| 默认态 | 全部可点区块 | 仅设计稿出现的这一态 |
| 未出现 | — | 按下、禁用、加载、错误态设计稿均未给，不实现 |

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 页签横向溢出 | 4 项 gap 18、合计 384 > 351，末项画到页面外 | gap 7，四项落在 351 内 | 末项超出页面宽度，属组件库溢出伪影 |
| 页签选中文字 | #3A74FC（旧主题色），指示器 #5460FE | 两处都用 `color_primary` | 同一控件两个近似蓝，取工程语义主色，不新增旧色 |
| 绿/橙 chip 文字 | fill #00B42A/#F7862A（旧 APP 色）与逐字 #00AB28/#FF8F33 打架 | 取资源里有的 `color_success`/`color_warning` | 语义组冲突，选有 token 且工程已有的一档 |
| 标签文案 | 沟通能力能能力力 / 责任心强心强 / 尊重隐私隐私 | 沟通能力 / 责任心强 / 尊重隐私 | 后缀重复是组件库占位文本被拉长的痕迹，同组最后一个 chip 就是「沟通能力」 |
| section 2 | 24×24 灰块 @28,1379，opacity=0 | 不实现 | 透明且落在页面外 |
| 灰卡圆角 | 容器 1 的圆角不在 section DSL 内 | 12 | 同类卡片一致取值，真机再核 |

## 待办（不阻塞结构，交付说明里跟踪）

- 图标与插画导出：返回、性别、姓名后 18×18、电话行 3 图标、下单/未成单反馈装饰、三个紫按钮装饰、底栏 5 图标、空态插画、头像
- 页签 1-3（阿姨简历 / 跟进沟通记录 / 客资订单）设计稿未提供内容
- 各按钮跳转目标：设计稿只给了「新增需求信息」的 navigation 2:4442
