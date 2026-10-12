# 微信列表 UI 分析（MasterGo file 180767492624044 / layer 2:74595）

- 来源：https://mastergo.com/file/180767492624044?page_id=M&layer_id=2%3A74595
- 真实 layer_id：`2:74595`（图层名「微信列表」；URL 里的 `page_id=M` 是合成页 ID）
- 画布：375×833；`rootContainer.background` = `#F7FAFC`；共 **11 个 section / 137 节点**，已按站点规则分 4 批拉全（0–10，无缺）
- 读取范围：全部 11 个 section
- 落地模块：`zhb/ModuleNursingAssessment/NursingAssessment`（用户指定；`resourcePrefix nursing_`，namespace `com.yilife.android.zhb.module.nursingassessment`）
- 数据：静态，按设计稿写死；文案直接写在布局里，不抽 `strings.xml`
- 形态判定：顶部固定标题栏（状态栏 + 居中标题 + 左返回）+ 搜索栏（输入框 + 胶囊按钮）+ 6 张同形态联系人卡（重复单元）+ 底部 Home Indicator（系统绘制）

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 180767492624044 |
| page_id / 真实 layer_id | page_id=M / 真实内容图层 `2:74595` |
| 设计稿链接 | https://mastergo.com/file/180767492624044?layer_id=2%3A74595 |
| 页面尺寸 | 375 × 833 |
| 读取范围 | 全部 section（0–10） |
| 目标工程与模块 | artigence/zhb/AppShell → `:NursingAssessment` |

## 1. PageStructure

```text
页面 FRAME 2:74595 微信列表 375x833 @0,0  background=#F7FAFC
├── 标题栏 FRAME 2:74596 编组备份 2 375x88 @0,0
│   ├── 白底 LAYER 2:74597 矩形 375x88（stroke 2:2417/1px，颜色为空）
│   ├── 状态栏 FRAME 2:74600 339.66x21 @21,14.33（iOS 状态栏，系统绘制）
│   │   └── Time Style 2:74616 / Battery 2:74601 / Wifi 2:74605 / Cellular 2:74610
│   ├── 导航底色 LAYER 2:74621 Rectangle 375x44 @0,44 opacity=0
│   ├── 标题 TEXT 2:74622 「微信列表」 72x22 @152,55  18sp/22
│   └── 返回 GROUP 2:74626 back_currency 25x25 @7,54（PATH 2:74628 10x10 @9.41,8）
├── 内容区 FRAME 2:74629 容器 3158 351x576 @12,159   ← splitContainers 同名层
│   └── 联系人卡 ×6（重复单元，351x72，节距 84）
│       ├── 2:74630 容器 920   @0,0    陈婉璇 / ngs7@126.com / 关联
│       ├── 2:74656 容器 3140  @0,84   方兆玉 / jahburlnthsmo@sina.com / 关联
│       ├── 2:74682 容器 3141  @0,168  黄文旺 / d1467765405@56.com / 关联
│       ├── 2:74708 容器 3142  @0,252  刘姿婷 / m4566@etang.com / 关联
│       ├── 2:74734 容器 3143  @0,336  王依婷 / wfpp3@21cn.com / 关联
│       └── 2:74760 容器 3144  @0,420  郑伊雯 / ulffuf@email.com.cn / 关联
│       （另有 2:74786 容器 3145 @0,504，见「伪影」表）
├── 搜索栏 FRAME 2:74813 SearchBar 351x40 @12,96
│   ├── 图标 INSTANCE 2:74815 Search 20x20 @0,1（PATH 16.18x16.18）
│   ├── 占位 TEXT 2:74817 「请输入昵称或者ID」 128x22 @28,0  16sp/22  #999999
│   └── 按钮 FRAME 2:74821 容器 417 62x32 @285,4  圆角 353 → 胶囊
│       └── TEXT 2:74822 「搜索」 30x22 @16,5  15sp/22 白色
└── Home Indicator FRAME 2:74825 编组 3 375x34 @0,799（系统绘制，不实现）
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 标题栏 | 固定 | 无 | 静态 | 白底铺到 y=0，顶部与状态栏连成一块 |
| 搜索栏 | 固定 | 无 | 静态 | 圆角 128 描边输入框 + 主色胶囊按钮 |
| 内容区 | 固定（6 项一屏放得下） | 联系人卡 ×6 | 静态 | 左对齐 12；卡与卡间隔 12 |
| Home Indicator | 由系统绘制 | 无 | — | 34 高，Android 侧由导航栏区域承担，不画 |

### 背景分区表（每段指到图层，任何一段都写明归属）

| 区段 | y 范围 | 设计稿哪一层负责 | 颜色 / 圆角 | 实现里哪个 view 负责 |
| --- | --- | --- | --- | --- |
| 状态栏 + 标题栏 | 0–88 | 矩形 `2:74597`（375x88）+ `编组备份 2` | `#FFFFFF`，无圆角 | 根布局 `background=@color/bg_base` + 标题栏白色容器 |
| 搜索栏 | 96–136 | `SearchBar 2:74813` | 自身无底（fill 为空），描边 `#999999` 1px，圆角 128 | 搜索栏容器 `background=@drawable/nursing_bg_wechat_search`（实心白 + 描边 + 胶囊） |
| 内容区 | 159–735 | 容器 `2:74629` 自身无底 → **透出页面底色** | 透出 `#F7FAFC` | 根布局底色（`nursing_color_wechat_page_bg`） |
| 状态栏与搜索栏之间 | 88–96 | 无独立层 | 透出页面底色 | 根布局底色 |
| 每张卡片 | 各自 72 高 | 容器 `2:74630` 等 | `#FFFFFF`，圆角 12 | 卡片布局 `background=@drawable/nursing_bg_wechat_card` |
| Home Indicator 区 | 799–833 | `编组 3 2:74825` | 透明，系统绘条 | 不实现（`fitsSystemWindows` 后由导航栏区域承担） |

**没有任何一段是「没写、跟根底色」**：根底色只承担页面灰，白色区段各有自己的 view。

### 绝对 y 对账（设计稿绝对值，验收逐块对照）

| 区块 | 设计绝对 y | 高度 | 来源 |
| --- | --- | --- | --- |
| 标题栏 | 0 | 88 | `2:74596` @0,0 |
| 搜索栏 | 96 | 40 | `2:74813` @12,96 |
| 内容区顶 | 159 | — | `2:74629` @12,159 |
| 卡片 1 顶 | 159 | 72 | 内容区 +0 |
| 卡片 2 顶 | 243 | 72 | 内容区 +84 |
| 卡片 3 顶 | 327 | 72 | 内容区 +168 |
| 卡片 4 顶 | 411 | 72 | 内容区 +252 |
| 卡片 5 顶 | 495 | 72 | 内容区 +336 |
| 卡片 6 顶 | 579 | 72 | 内容区 +420 |
| 内容区底 | 735 | — | 159 + 576 |
| Home Indicator | 799 | 34 | `2:74825` @0,799 |

纵向链条：`88 + 8 = 96(搜索栏)`；`96 + 40 + 23 = 159(内容区)`；`159 + 420 + 72 = 651(末卡底)`；内容区块高 **576** = 6×84 − 12（6 项节距 84、末项不带间隔）；`735 + 64 = 799(Home Indicator)`。**节距 84 = 卡高 72 + 间隔 12**，6 张卡连续无缺位。

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 标题栏 | 顶部固定高 + 左返回 + 居中标题 | `com.yilife.android.widget.component.titlebar.TitleBar` | 返回可点（关闭页面） | `Module.titleBar`（模块已依赖） | 组件自带白色底与固定内边距 → 按实测微调，不改设计值 | 不新建；模块既有页面同款 |
| 返回图标 | PATH 图标 | `ImageView` + 矢量图 | 跟随点击 | 自绘矢量（见资源） | — | 设计稿 9.07×16.14，工程/组件库无同款 |
| 搜索栏 | 圆角描边输入框 + 右端胶囊按钮 | `EditText` + `ShapeTextView`（胶囊） | 可输入；点「搜索」触发（设计稿未给结果页） | 原生 + `Module.shapeTextview`（模块已依赖） | `ShapeTextView` 默认内边距会吃掉槽位 → 显式置 0 | 不新建 |
| 搜索图标 | PATH 图标 | `ImageView` + 矢量图 | 装饰 | 自绘矢量 | — | 组件库无同款 16.92 放大镜 |
| 联系人卡 | 6 张同形态圆角卡：头像 + 姓名 + 邮箱 + 按钮 | 同一份 `layout` 用 `<include>` ×6 | 整行可点（设计稿未给目标） | 原生 | — | 6 项静态、一屏放得下；复用同一份 item 布局，不复制 6 份 XML |
| 头像 | 圆形位图 | `ImageView`（`centerCrop`，圆形由 `nursing_bg_wechat_avatar` 遮罩） | — | 本地 `mipmap-xhdpi` WebP | 原图非正方形（1080×1620 等）→ 必须 `centerCrop` | 图源来自设计稿 image-resource |
| 关联按钮 | 主色圆角块 + 白字 | `ShapeTextView` | 可点（设计稿未给目标） | `Module.shapeTextview` | 背景/圆角/按下态写在控件属性里 | 不新建，不写 `bg_`+`sel_` |

**为什么用 `<include>` 而不是 `RecyclerView`**：与本模块「选择下单类型」页同款判据——6 项是设计稿写死的静态内容、一屏可见、无滚动与复用需求；引入 `RecyclerView` + Adapter 只为 6 个常量条目，属于为静态内容加动态结构。会随数据变化的列表才用 `RecyclerView`。

## 3. ResourceMap

颜色（对照 `TobBaseResource` 1.0.0-SNAPSHOT 实测值）：

| 设计值 | 用途 | 落地资源 | 出处 |
| --- | --- | --- | --- |
| `#5460FE` | 搜索按钮底 | `@color/color_primary` | TobBaseResource（实测 `#5460FE`） |
| `#333333` | 姓名、标题、返回图标 | `@color/text_gy1` | TobBaseResource（实测 `#333333`） |
| `#FFFFFF` | 卡片底、标题栏底、搜索按钮文字、头像底 | `@color/bg_base` / `@color/text_white` | TobBaseResource |
| `#999999` | 邮箱、占位文案、搜索图标、搜索栏描边 | `@color/nursing_color_wechat_muted` | 模块新增（`text_gy1`–`gy6` 为 `#333/#CCC/#E5E5E5/#EEE`，无 `#999999`） |
| `#F7FAFC` | 页面底 | `@color/nursing_color_wechat_page_bg` | 模块新增（`bg_page`=`#F5F5F7`、`fill_base`=`#F0F0F5` 均不等值；与客户详情页已同值落地的 `nursing_color_page_bg` **同值**，可直接复用后者） |

尺寸 / 字号 / 圆角：

| 设计值 | 落地资源 | 出处 | 备注 |
| --- | --- | --- | --- |
| 卡片圆角 12 / 搜索栏圆角 128 | `@dimen/radius_larger`(12) / `@dimen/radius_wechat_search`(胶囊) | TobBaseResource / 模块新增 | 128 是胶囊语义 |
| 卡片内边距 12 | `@dimen/space_base` | TobBaseResource | 语义档 |
| 卡片节距 12（间隔） | `@dimen/space_base` | TobBaseResource | 唯一来源：卡片 `marginTop` |
| 标题栏高 88 | `@dimen/nursing_wechat_header_height` | 模块新增 | 语义档无 88 |
| 搜索栏高 40 | `@dimen/nursing_wechat_search_height` | 模块新增 | |
| 搜索栏上距 8 | `@dimen/space_mini` | TobBaseResource | `96 − 88` |
| 内容区上距 23 | `@dimen/nursing_wechat_content_top` | 模块新增 | `159 − 136`，语义档无 23 |
| 头像 48 | `@dimen/nursing_wechat_avatar` | 模块新增 | |
| 头像与文字间距 12 | `@dimen/space_base` | TobBaseResource | |
| 关联按钮 45×45 | `@dimen/nursing_wechat_link_button` | 模块新增 | 统一 `8dp/16dp` 内边距，设计为 `8px 16px` |
| 关联按钮圆角 8 | `@dimen/radius_large` | TobBaseResource | |
| 搜索按钮 62×32、圆角 353 | `@dimen/nursing_wechat_search_button_w/h` / `@dimen/nursing_wechat_search_button_radius` | 模块新增 | |
| 姓名 16sp / 行高 22（Medium） | `@dimen/font_basic_large` / `@dimen/nursing_line_height_16` | TobBaseResource / 模块已有 | 语义档 16sp；行高 22 模块已有 |
| 邮箱 14sp / 行高 20（Regular） | `@dimen/font_basic_body` / `@dimen/nursing_line_height_14` | TobBaseResource / 模块已有 | |
| 标题 18sp / 行高 22（Medium） | `@dimen/font_medium` / `@dimen/nursing_wechat_title_line_height` | TobBaseResource / 模块新增 | 语义档 18sp；行高 22 |
| 占位 16sp / 行高 22（Regular） | `@dimen/font_basic_large` / `@dimen/nursing_line_height_16` | TobBaseResource / 模块已有 | |
| 搜索按钮文字 15sp / 行高 22（Medium） | `@dimen/nursing_wechat_search_button_text` / `@dimen/nursing_line_height_16` | 模块新增 / 模块已有 | 字号档无 15 |

图标：

| 图标 | 来源 | 资源名 | 密度 / 规格 |
| --- | --- | --- | --- |
| 返回箭头 | MasterGo PATH `2:74628`（SVG transform 已数值应用） | `@drawable/nursing_ic_wechat_back` | 矢量 9.071×16.142dp，`#333333` |
| 搜索图标 | MasterGo PATH `2:74815/2:8086` | `@drawable/nursing_ic_wechat_search` | 矢量 16.924×16.914dp，`#999999` |
| 头像 ×6 | MasterGo image-resource | `@mipmap/nursing_ic_wechat_avatar_1..6` | 96×96 无损 WebP，`mipmap-xhdpi` |

## 4. LayoutSpec

| 项 | 设计值 | 落地值 | 说明 |
| --- | --- | --- | --- |
| 页面左右边距 | 12 | `@dimen/nursing_page_margin` | 搜索栏与内容区共用，各自只由一个 view 承担 |
| 标题栏高 | 88（状态栏 44 + 导航 44） | 88 | 根布局 `fitsSystemWindows` 消费状态栏，标题栏容器自带 44 标题行 |
| 搜索栏 → 内容区 | 23 | `@dimen/nursing_wechat_content_top` | 唯一来源：内容区 `marginTop`；搜索栏不再带 `marginBottom` |
| 卡片节距 | 84（72 + 12） | 卡高 72 + `marginTop 12` | 唯一来源；**禁止**容器再加 `padding` 或 `itemSpacing` |
| 卡片内边距 | 12 | `@dimen/space_base` | 唯一来源 |
| 卡片内容行高 | 48 | 48 | 头像 48 与右侧 `space-between` 同行 |
| 姓名 → 邮箱 | 4 | `@dimen/space_micro` | 文字列 `gap 4` |
| 头像 → 文字列 | 12 | `@dimen/space_base` | |
| 关联按钮 | 45×45，圆角 8 | `@dimen/nursing_wechat_link_button` | 内边距 `8dp` 竖 / `16dp` 横 |
| 搜索栏内边距 | 左 12、右 4、竖居中 | 同上 | 设计 `padding: 0px 4px 0px 12px` |
| 搜索图标 → 占位文字 | 8 | `@dimen/space_mini` | |
| 搜索按钮 | 62×32 | `@dimen/nursing_wechat_search_button_w/h` | 文本居中 |
| 占位文字与邮箱 | 单行，超长省略 | `singleLine` + `ellipsize=end` | 邮箱最长 22 字符 |

## 5. StateSpec

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 搜索栏 | 默认 | 白底 + `#999999` 1px 描边 + 胶囊 | — | `2:74813` |
| 搜索栏 | 聚焦 / 输入 | 设计稿未给 | — | 不实现额外样式 |
| 关联按钮 | 默认 | `#5460FE` 底 + 圆角 8 + 白字 15sp | — | `2:74652` 等 |
| 关联按钮 | 按下 | 设计稿未给 | — | 不实现；沿用 `ShapeTextView` 默认按压反馈 |
| 联系人卡 | 默认 | 白底 + 圆角 12 | — | 6 张均默认态 |
| 返回 | 默认 | `#333333` 箭头 | — | `2:74626` |
| 其它 | 禁用 / 加载 / 空 / 错误态 | 设计稿均未给 | — | 不实现 |

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 第 7 张卡 `容器 3145 2:74786` @0,504 | 内容区里存在第 7 个 351×72 卡片（陈文婷 / pgks08@netease.com） | 实现 6 张 | 内容区块高 **576** 恰好容纳 6 张（6×84−12=492，余量）；若放 7 张需 588 > 576。且页面 833 高、内容区到 735 结束，第 7 张会落到 663–735 与 Home Indicator 区冲突。判为**重复图层**，取 6 |
| 返回箭头节点 `_color="#101010"` vs 主文本 token `#333333` | 两个来源不同 | `@color/text_gy1` `#333333` | 同语义组（主文本）冲突，按 token 与页面其它 `#333333` 统一；`#101010` 是组件基底传下来的过期值 |
| 返回箭头容器 25×25 vs 路径 9.07×16.14 | 容器留白远大于图形 | 按矢量固有尺寸 9.07×16.14 渲染 | 25×25 是组件实例留白；照抄会在标题栏里撑出多余高度 |
| 标题栏 `2:74621 Rectangle` opacity=0 | 透明层 375×44 | 不实现 | 透明且无内容 |
| 搜索栏 `fill` 为空 | `paint_2:1406` 值为 `[]` | 实心白底 | 页面底是 `#F7FAFC`，若也用透明会与设计稿（白搜索框）不符；描边 `#999999` 1px 保留 |
| `编组 3 2:74825` Home Indicator | 375×34 @0,799 | 不实现 | Android 由导航栏区域承担；`fitsSystemWindows` 已消费 |
| 状态栏图标（Battery/Wifi/Cellular/Time 9:41） | iOS 状态栏组件 | 不实现 | 系统状态栏绘制；`_placeholder=true` |

**`_placeholder: true` 的处理**：`rowTexts` 里「陈婉璇」「ngs7@126.com」「方兆玉」等 12 条联系人文案虽标了 `_placeholder`，但它们是页面上真实渲染的内容（每张卡片的姓名/邮箱），**不删**，按逐字文案写进布局。标题「微信列表」同理。

## 6. 实现清单

- [ ] 基类：`WechatListActivity : BaseActivity()`，入口 `afterCreate(Bundle?)`，顺序 `initView()` → `initListener()` → `initData()`；ViewBinding 用 `bindings<T>()`
- [ ] 依赖：模块已有 `Module.tobBaseResource`、`Module.titleBar`、`Module.shapeTextview`、`Module.universalComponents`，**不新增依赖**
- [ ] 资源名前缀：layout `nursing_activity_wechat_list` / `nursing_item_wechat_contact`，drawable `nursing_bg_wechat_*`、`nursing_ic_wechat_*`，color `nursing_color_wechat_*`，dimen `nursing_wechat_*`
- [ ] 文案按设计稿直接写在布局里，不抽 `strings.xml`；颜色、尺寸不硬编码
- [ ] 头像 6 张无损 WebP 放 `mipmap-xhdpi`，命名 `nursing_ic_wechat_avatar_1..6`
- [ ] `AndroidManifest.xml` 加 activity（`exported=true` 供 adb 启动，与既有 4 个测试页一致）
- [ ] 关键数值按 LayoutSpec 在设备上量过实际控件（见交付说明）

## 7. 验收

- [ ] 编译通过
- [ ] 安装的是本次构建的包（`adb install` 输出 `Success`）
- [ ] `adb shell uiautomator dump` 能找到「微信列表 / 请输入昵称或者ID / 搜索 / 6 个姓名 / 6 个邮箱 / 关联」
- [ ] 截图逐块比对绝对 y：标题栏 0–88、搜索栏 96–136、内容区顶 159、卡片顶 159/243/327/411/495/579（±2dp）
- [ ] 底色断言：页面灰 `#F7FAFC`、卡片白 `#FFFFFF`、卡片圆角 12
- [ ] 未验证的交互和无法完全还原的偏差写进交付说明
