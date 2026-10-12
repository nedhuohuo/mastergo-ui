# 选择下单类型（底部弹层）UI 分析（MasterGo file 180767492624044 / layer 2:77183）

- 来源：https://mastergo.com/file/180767492624044?page_id=M&layer_id=2%3A77183
- 真实 layer_id：`2:77183`（图层名「容器 7616」；URL 里的 `page_id=M` 是合成页 ID，`layer_id` 才是内容图层）；共 5 个 section、62 节点
- 画布：375×833；`rootContainer.background` = #FFFFFF
- 读取范围：全部 5 个 section（sectionIndex 0–4）
- 落地模块：`zhb/ModuleNursingAssessment/NursingAssessment`（用户指定：使用测试模块 NursingAssessment）
- 工程根：`artigence/zhb/AppShell`（settings.gradle 里 `includeModule("NursingAssessment", "nursingAssessment")`）
- 数据：静态，按设计稿写死；文案直接写在布局里，不抽 `strings.xml`
- 形态判定：全屏 60% 黑遮罩 + 底部白色圆角面板 → **底部弹层**（同一个 MasterGo 文件里 2:7562 客户详情「下单」按钮的下一跳）。面板头部是「左返回 + 居中标题」的导航头，不是对话框头。

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 180767492624044 |
| page_id / 真实 layer_id | page_id=M / 真实内容图层 `2:77183` |
| 设计稿链接 | https://mastergo.com/file/180767492624044?layer_id=2%3A77183 |
| 页面尺寸 | 375 × 833 |
| 读取范围 | 全部 section（0–4） |
| 目标工程与模块 | artigence/zhb/AppShell → `:NursingAssessment`（namespace `com.yilife.android.zhb.module.nursingassessment`，resourcePrefix `nursing_`） |

## 1. PageStructure

```text
弹层（375x833）
├── 遮罩（页面级背景层）
│   └── Rectangle 2:77184 375x804 @0,0 rgba(0,0,0,0.6)
├── 面板 容器 1409 2:77186 375x218 @0,615（= splitContainer 容器 354 2:77185）
│   ├── 面板底 蒙版 2:77187 375x328 @0,0 白底，上两角 12
│   ├── 头部 容器 384 2:77241 351x26 @12,631
│   │   ├── 左：容器 383 2:77242（返回箭头 PATH 2:77244 6.25x12.5 + 文字「返回」2:77245）
│   │   ├── 中：标题「选择下单类型」2:77248 108x26 @121.5,0
│   │   └── 右：容器 388 2:77251 84x20 @267,3（opacity=0，不可见）
│   ├── 选项行 容器 4988 2:77188 354x64 @12,58（flex row，gap 8）
│   │   └── div.btn-item × 3（各 112.67x64，#F0F5FF，圆角 8）
│   │       ├── 图标 24x24（PATH 组成）
│   │       └── 文字 14sp（医院单 / 线上单 / 非自营医院单）
│   └── 保存区 编组 7 2:77228 375x88 @0,573
│       ├── 保存条 编组 6 2:77232 375x54（主按钮 351x46 @12,4）
│       └── Home 区 编组 2 2:77229 375x34
└── 系统手势区 编组 6备份 2:77263 375x34 @0,799（与上一条重复，取一）
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 遮罩 | 固定 | 无 | 静态 | 页面级背景层，section 0；盖住整个屏幕 |
| 面板 | 固定，贴底 | 无 | 静态 | section 1 根；上两角 12，下角贴底 |
| 头部 | 固定 | 无 | 静态 | section 2；左返回 + 居中标题；右侧 opacity=0 不实现 |
| 选项行 | 固定 | 3 个同形态卡片 | 静态 | section 1；横向等分，gap 8；各自 navigation 到不同页 |
| 保存区 | 固定 | 无 | 静态 | section 1 的「编组 7」与 section 4 是同一块的两个图层，只实现一次 |
| 系统手势区 | 由系统绘制 | 无 | — | 34 高，落在面板自身的 `paddingBottom`（`@dimen/nursing_bottom_inset` 34dp）里：面板白底照样铺到屏幕底边，只有内容停在 799 |

### 背景分区表（每段指到图层，任何一段都写明归属）

| 区段 | y 范围 | 设计稿哪一层负责 | 颜色 / 圆角 | 实现里哪个 view 负责 |
| --- | --- | --- | --- | --- |
| 遮罩区 | 0–615 | Rectangle `2:77184` | rgba(0,0,0,0.6) | 弹层窗口的 dim（`R.style.BottomDialog` 的 `backgroundDimEnabled`，系统默认 0.6；遮罩色是系统黑） |
| 面板区 | 615–799 | 容器 1409 `2:77186` / 面板底 蒙版 `2:77187` | #FFFFFF，上两角 12、下角 0 | 弹层内容布局根 `nursing_dialog_fragment_order_type`（`@drawable/nursing_bg_customer_panel`） |
| 系统手势区 | 799–833 | 编组 2 `2:77229` / Rectangle 24 | 面板白底延续 | 弹层内容根的 `paddingBottom` = `@dimen/nursing_bottom_inset`（34dp，与 2:7562 同一档），面板白底铺到屏幕底边 |

### 绝对 y 对账（设计稿绝对值，验收逐块对照）

| 区块 | 设计绝对 y | 高度 | 来源 |
| --- | --- | --- | --- |
| 面板顶 | 615 | 218（含手势区 34，内容 184） | splitContainer 容器 354 @0,615 |
| 头部 | 631 | 26 | section 2 容器 384 @12,631 |
| 选项行 | 673 | 64 | 容器 4988 @12,58（615+58） |
| 保存条 | 745 | 54 | 容器 1677 @0,745（section 4） |
| 系统手势区 | 799 | 34 | section 3 / 4 |

纵向链条：`615 + 16(上内边距) + 26(头部) + 16 = 673(选项行)`；`673 + 64 + 8 = 745(保存条)`；`745 + 54 = 799`；`799 + 34 = 833`。四段与 section 2 / 容器 4988 / 容器 1677 / section 3 的绝对 y 全部吻合。

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 弹层容器 | 贴底弹出 + 遮罩 + 外部点击关闭 | `OrderTypeDialogFragment` 继承工程基类 `BaseDialogFragment`（`com.yishou.android.lib.base.arch.fragment`，`Module.base`） | 下探进出场、点遮罩关闭、点返回关闭 | 工程基类（与其它弹层一致） | 基类已给 `setStyle(R.style.BottomDialog, 0)`、`gravity=BOTTOM`、`setLayout(MATCH_PARENT, WRAP_CONTENT)`、`BottomDialog.Animation` | 新建子类。**不能用**两档组件：`CustomPositionPopupWindow` / `CustomBottomPopupWindow` 继承 razerdp `BasePopupWindow`，而 `UniversalComponents` 用 `implementation`（非 `api`）引入 BasePopup，业务模块解析不到基类（编译报 unresolved supertypes）；`BottomSheetDialogFragment` 会套自己的圆角 / 阴影 / 拖拽 / peek 行为，扰动尺寸链 |
| 面板底 | 白底 + 上两角圆角 | `@drawable/nursing_bg_customer_panel` | 无 | 模块已有（同值同形：白底、上两角 12、下角 0） | — | 不新建，避免同值资源重复声明 |
| 弹层窗口 | 贴底、遮罩、按压外部关闭 | `@style/BottomDialog` + `@style/BottomDialog.Animation` | 进场 / 出场 translate 100%→0，300ms | 工程基类库自带（`Module.base`） | `backgroundDimEnabled=true`（系统 dim 默认 0.6，正好是设计值） | 不新建：自写的窗口主题与动效已删除，改用工程统一档 |
| 头部 | 顶部固定高 + 左侧返回 + 居中标题 | `FrameLayout` + `ImageView` + `TextView` | 返回可点（关闭弹层） | 原生 | — | 头部是导航头；`CustomBottomPopupWindow` 的模板头是「取消/确定 + 关闭图标」的对话框头，且强制上 16 / 下 8 边距与 16dp 横向内边距，表达不了本设计，故不用它的模板头 |
| 返回箭头 | 图标 | `@drawable/universal_customer_detail_ic_back`（tint 主色） | 跟随父容器点击 | `Module.universalComponents`（组件库已有图标） | 图标 16dp、fillColor #333333 → 代码 tint 成 `color_primary` | 不新建 |
| 选项卡片 | 一排 3 个同形态圆角块 + 图标 + 文字 | `LinearLayout`（weight 1）+ `ImageView` + `TextView` | 各自可点，navigation 到 2:73133 / 2:77272 / 2:77672 | 原生 | — | 3 个是静态固定项，沿用本模块「三按钮行」的写法（静态块 + weight 1），不引入 RecyclerView |
| 选项图标 | 图标 | 待 MasterGo 客户端导出 webp → `mipmap-xhdpi` | 跟随父容器点击 | MasterGo（UniversalComponents 图标库里没有对应的单据 / 线上 / 自营单据图标） | — | 按 `nursing_ic_` 前缀放模块 `mipmap-xhdpi`，不在代码里手绘 |
| 保存按钮 | 圆角块 + 文字 | `TextView` + `@drawable/nursing_bg_order_type_save` | 可点（设计稿无目标，留空实现） | 原生 | — | 模块现有按钮 drawable 是浅色底（#EEEFFF + 描边），没有实心主色 24 圆角，需新增 1 个 drawable |

## 3. ResourceMap

颜色：

| 设计值 | 用途 | 落地资源 | 出处 |
| --- | --- | --- | --- |
| #5460FE | 返回文字、返回箭头、保存按钮底 | `@color/color_primary` | TobBaseResource |
| #333333 | 标题、选项文字 | `@color/text_gy1` | TobBaseResource |
| #FFFFFF | 面板底、保存按钮文字 | `@color/bg_base` / `@color/text_white` | TobBaseResource |
| #F0F5FF | 选项卡片底 | `@color/nursing_color_option_bg` | 模块新增（TobBaseResource 无同值；`color_primary_v6` 是 #EEEFFF，不等值） |
| rgba(0,0,0,0.6) | 弹层遮罩 | 窗口 dim（`nursing_bottom_dialog_theme`），不用颜色资源 | 系统遮罩色即黑；TobBaseResource 的 overlay 只有 50% / 70% / 80%，没有 60% |
| #3A74FC（返回节点级 fill） | 返回文字 | 取 `@color/color_primary` | 与逐字 `textColor` #5460FE 冲突：同一语义组取工程主色，不引入旧主题色 |

尺寸 / 字号 / 圆角：

| 设计值 | 落地资源 | 出处 | 备注 |
| --- | --- | --- | --- |
| 面板上两角圆角 12 | `@dimen/radius_larger` | TobBaseResource | 语义档 |
| 选项圆角 8 | `@dimen/radius_large` | TobBaseResource | 语义档 |
| 保存按钮圆角 24 | `@dimen/nursing_submit_radius` | 模块已有 | 与上一页主按钮同值 |
| 保存按钮高 46 | `@dimen/nursing_submit_height` | 模块已有 | 同上 |
| 左右页边距 12 | `@dimen/nursing_page_margin` | 模块已有 | 头部、选项行、保存条共用 |
| 面板上内边距 16 / 头部与选项行间距 16 | `@dimen/space_small` | TobBaseResource | 语义档 |
| 选项间距 8 / 保存条上间距 8 | `@dimen/space_mini` | TobBaseResource | 语义档（选项 gap、保存条 marginTop 各一处） |
| 头部高 26 | `@dimen/nursing_order_type_header_height` | 模块新增 | 语义档无 26 |
| 选项高 64 | `@dimen/nursing_order_type_option_height` | 模块新增 | |
| 选项图标 24 | `@dimen/nursing_order_type_option_icon` | 模块新增 | |
| 选项文字框宽 60 | `@dimen/nursing_order_type_option_label_width` | 模块新增 | 约束「非自营医院单」换两行 |
| 保存条高 54 | `@dimen/nursing_order_type_save_bar_height` | 模块新增 | |
| 标题 18sp / 行高 26 | `@dimen/font_medium` / `@dimen/nursing_order_type_line_height_18` | TobBaseResource / 模块新增 | 字号档有 18sp |
| 返回 15sp / 行高 22 | `@dimen/nursing_order_type_back_text_size` / `@dimen/nursing_order_type_back_line_height` | 模块新增 | 字号档只有 14 / 16，无 15 |
| 选项文字 14sp / 行高 20 | `@dimen/font_basic_body` / `@dimen/nursing_line_height_14` | TobBaseResource / 模块已有 | |
| 保存文字 18sp / 行高 26 | `@dimen/font_medium` / `@dimen/nursing_order_type_line_height_18` | TobBaseResource / 模块新增 | 与标题同值，共用一个 |

图标：

| 图标 | 来源（UniversalComponents / MasterGo） | 资源名 | 密度 |
| --- | --- | --- | --- |
| 返回箭头 | UniversalComponents | `@drawable/universal_customer_detail_ic_back`（代码 tint `color_primary`） | 16dp 矢量 |
| 选项 1 图标（医院单） | MasterGo | `nursing_ic_order_type_hospital` | 待客户端导出 webp 放 `mipmap-xhdpi` |
| 选项 2 图标（线上单） | MasterGo | `nursing_ic_order_type_online` | 待客户端导出 webp 放 `mipmap-xhdpi` |
| 选项 3 图标（非自营医院单） | MasterGo | `nursing_ic_order_type_self` | 待客户端导出 webp 放 `mipmap-xhdpi` |

## 4. LayoutSpec

| 项 | 设计值 | 落地值 | 说明 |
| --- | --- | --- | --- |
| 面板高度 | 218（含手势区 34） | 内容 184（531px）+ `paddingBottom` 34（`@dimen/nursing_bottom_inset` = 98px） | 面板白底铺到屏幕底边，`799~833` 由这段 padding 承担；本机实测面板顶 1783px（设计 615 → 1781，Δ2px） |
| 页面左右边距 | 12 | `@dimen/nursing_page_margin` | 头部、选项行、保存条三处共用，每处只由一个 view 的 padding / margin 承担 |
| 面板上内边距 | 16 | 根布局 `paddingTop` `space_small` | 唯一来源 |
| 头部高 | 26 | 固定 26dp | 标题行高 26；块高写死，不依赖行高属性（部分 ROM 忽略 `android:lineHeight`） |
| 头部到选项行间距 | 16 | 选项行 `layout_marginTop` `space_small` | 唯一来源（头部不再带 marginBottom） |
| 选项行 | 354×64、gap 8 | weight 1 ×64、项间 `layout_marginStart` `space_mini` | 设计 354（12..366）右侧留 9，按左右各 12 取 351，三项各 (351−16)/3 = 111.67 |
| 选项内容 | 图标 24 + 4 + 文字框 | `ImageView` 24 + `TextView` 宽 60、marginStart 4 | 设计图标左距：第 1 项 20.83、第 2/3 项 12；按内容居中（=12）统一，第 1 项差约 9dp，见伪影表 |
| 选项文字 | 14sp / 行高 20，最多 2 行 | 同上 | 「非自营医院单」6 字在 60 宽内换 2 行 = 设计块高 40 |
| 选项行到保存条间距 | 8 | 保存区 `layout_marginTop` `space_mini` | 唯一来源 |
| 保存条 | 375×54，按钮 351×46 @12,4 | 高 54，`paddingTop/Bottom` `space_micro`(4) + 按钮 46 | 4+46+4 = 54 |
| 保存按钮 | 351×46、圆角 24 | match_parent × 46 | 文字 18sp 居中 |
| 遮罩 | rgba(0,0,0,0.6) | 弹层窗口 dim（`R.style.BottomDialog` 的 `backgroundDimEnabled`，系统 dim 默认 0.6） | 系统遮罩色是黑；实测遮罩后页面底色 98 = 245×0.4，与 0.6 吻合 |

## 5. StateSpec

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 选项卡片 | 默认 | #F0F5FF 底 + 圆角 8 + 主文本色文字 | — | 容器 4988 三项均为默认态 |
| 选项卡片 | 按下 | 设计稿未给 | — | 不实现；沿用组件 / 原生默认按压反馈 |
| 保存按钮 | 默认 | #5460FE 底 + 圆角 24 + 白字 | — | 主按钮 2:77234 |
| 保存按钮 | 按下 | 设计稿未给 | — | 不实现 |
| 返回 | 默认 | 主色箭头 + 主色「返回」15sp | — | 容器 383 |
| 面板 | 弹出 / 关闭 | 自下而上平移 + 遮罩淡入；点遮罩、点返回、点选项关闭 | 打开 / 关闭弹层 | 设计稿只给静态终态，动效取工程统一档 `BottomDialog.Animation`（translate 100%→0，300ms） |
| 其它 | 禁用 / 加载 / 空 / 错误态 | 设计稿均未给 | — | 不实现 |

## 判定为伪影 / 冲突的项

| 项 | 设计稿 | 落地 | 判据 |
| --- | --- | --- | --- |
| 面板底 蒙版 高度 328 vs 容器 1409 高度 218 | 蒙版 375×328 @0,0，比所在容器（218）高 | 面板内容取 184（+手势区 34 = 218） | 蒙版底 615+328=943 超出画布 833；四段绝对 y（631 / 673 / 745 / 799）与 218 的链条完全吻合，328 是组件实例残留 |
| section 4 与「编组 7」重复 | 容器 1677 @0,745 与 编组 7 @0,573 都是 375×88 的底部区 | 只实现一次（保存条 + 手势区） | 两块同尺寸同内容，属同一区域的重复图层 |
| 编组 7 的 relativeY 573 | 573 + 容器顶 615 = 1188，超出画布 | 按绝对 y 745 落地 | 容器高 218 装不下 573；容器 1677 同样内容给的是 745，两者取有绝对 y 支撑的 745 |
| 容器 388（头部右侧） | 84×20 @267,3，opacity=0 | 不实现 | 透明且无内容 |
| 选项 1 图标左距 20.83 | 第 1 项图标 @20.83，第 2/3 项 @12 | 三项统一按内容居中（≈12） | 同形态三项的图标位应一致；20.83 = (112.67−71)/2，是把文字框按实际字宽算的居中值，非独立设计值 |
| 选项行宽 354 @12 | 右侧留 9，与左右 12 不对称 | 左右各 12（351） | 12 + 354 = 366 ≠ 375−12，右侧多 9；按页面边距取对称 12 |
| 保存文字 x 偏移 | 编组 11 @143 使文字中心在 175（非页面中心 187.5） | 按钮内居中 | 主按钮文案居中，偏 12.5 属组件实例残留 |
| 返回文字颜色 | 节点 fill #3A74FC（旧主题色）与逐字 #5460FE 冲突 | 取 `color_primary` | 同语义组冲突，取工程语义主色，不引入旧色 |
| 选项文字颜色 | 节点 fill `rgba(0,0,0,0.85)`（≈#262626）、逐字 `paint_2:1278` | `@color/text_gy1` (#333333) | TobBaseResource 无 rgba(0,0,0,0.85) 对应项，取最近的文本档；两者差 5% 透明度（#262626 vs #333333），已记入交付说明 |
| 保存按钮 1px 描边 | `2:77236.strokeWidth="1px"`，但 stroke 的 paint（`paint_2:02197`）值为空 | 不实现 | 描边色为空 = 组件实例残留，实现会凭空多一条边 |
| 保存条背景 矩形 `2:77233` | `paint_2:21005`，且带 `strokeWidth=1px` | 不实现（面板白底即它的底） | 与面板同色、描边色为空 |

## 6. 实现清单

- [x] 基类：`OrderTypeActivity` 继承 `BaseActivity`，入口 `afterCreate(Bundle?)`，顺序 `initView()` → `initListener()` → `initData()`；ViewBinding 用 `bindings<T>()`
- [x] 弹层：`OrderTypeDialogFragment` 继承工程基类 `BaseDialogFragment`（`Module.base`），窗口沿用工程 `R.style.BottomDialog` / `BottomDialog.Animation`
- [x] 依赖：模块 `build.gradle` 未新增依赖（`Module.base` 已在；自写的 `nursing_styles.xml` 与两个 anim 文件已删除）
- [x] 资源名前缀：layout `nursing_dialog_fragment_order_type` / `nursing_activity_order_type` / drawable `nursing_bg_order_type_*` / color `nursing_color_*` / dimen `nursing_order_type_*`
- [x] 文案按设计稿直接写在布局里，不抽 `strings.xml`；颜色、尺寸不硬编码
- [x] 关键数值按 LayoutSpec 在设备上量过实际控件（见交付说明与第 7 节）

## 7. 验收

- [ ] 编译通过
- [ ] 安装的是本次构建的包（`adb install` 输出 `Success`）
- [ ] `adb shell uiautomator dump` 能找到「选择下单类型 / 返回 / 医院单 / 线上单 / 非自营医院单 / 保存」
- [ ] 截图逐块比对：面板顶 615、头部 631、选项行 673、保存条 745（±2dp）
- [ ] 未验证的交互和无法完全还原的偏差写进交付说明
