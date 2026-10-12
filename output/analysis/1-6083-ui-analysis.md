# 学员-全部课程 UI 分析（file 145624008977172 / layer 1:6083）

## 0. 设计来源

| 项 | 值 |
| --- | --- |
| fileId | 145624008977172 |
| page_id / 真实 layer_id | URL 的 `page_id=M` 是合成页面 ID，不可用于取数；真实图层 `layer_id=1:6083` |
| 设计稿链接 | https://mastergo.com/file/145624008977172?page_id=M&layer_id=1%3A6083 |
| 页面尺寸 | 375x814（root FRAME「学员-全部课程」） |
| 读取范围 | 全部 13 个 section、135 节点（`format=tree`） |
| 目标工程与模块 | 知护办 Android；页面归属需宿主确认，线索：`zhb/Teaching/ZhyModuleTeach` 已有 `teach_home_share.xml`、`teach_home_arrow.xml`、`teach_home_list_template_tabs_area.xml` |

## 1. PageStructure

```text
页面 375x814  bg #F6F6F6
├── 顶部渐变背景 375x416 @0,0        gradient(171deg #B9DAFF -2% → #EFF1F5 53% → #F6F6F6 95%)
├── 标题栏 375x88 @0,0               固定
│   ├── 状态栏 21 高 @21,14.33       9:41 / wifi / cellular / battery
│   ├── 返回 16x16 @15,58
│   └── 标题「全部课程」72x22 @152,55  18sp Medium #333333 居中
├── 分享图标 24x24 @339,54           与标题栏同区（独立 section）
├── 分类页签 375x50 @0,88            固定
│   ├── 页签组 336x30 @16,14         保姆 / 月嫂 / 育儿嫂 / 厨艺 / 清洁收纳
│   ├── 右侧渐隐遮罩 60x22 @315,102    gradient(90deg 透明 9% → #DCE9F9 100%)
│   └── 展开按钮 16x16 @347,105       蓝色圆 #3A74FC + 箭头
├── 课程卡片列表 ×5 351x114 x=12     滚动 + 重复单元
│   y = 150 / 276 / 402 / 528 / 654
├── 悬浮 AI 入口 52x52 @311,640      悬浮
└── Home Indicator 375x34 @0,780     固定
```

| 区域 | 固定 / 滚动 | 重复单元 | 数据来源 | 备注 |
| --- | --- | --- | --- | --- |
| 顶部渐变背景 | 固定 | — | 静态 | section 0，盖住标题栏与页签区 |
| 标题栏 | 固定 | — | 页面标题 | section 1 |
| 分享入口 | 固定 | — | — | section 2，与标题栏同区 |
| 分类页签 | 固定 | 页签项 ×5 | 课程分类 | sections 3/4/5，右遮罩 + 展开按钮说明整排可横向滚动 |
| 课程卡片列表 | 滚动 | 卡片 ×5 | 课程列表 | sections 6–10，三种状态变体（见 StateSpec） |
| 悬浮 AI 入口 | 悬浮 | — | — | section 12 |
| 底部安全区 | 固定 | — | 系统 | section 11 |

## 2. ComponentMap

| 区块 | 形态 | 组件 | 行为 | 复用来源 | 需要核对的默认值 | 新建理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 标题栏 | 顶部固定高 + 左侧返回 + 居中标题 | `com.yilife.android.widget.component.titlebar.TitleBar` | 返回可点 | 依赖 `implementation Module.titleBar`（`com.yilife.android.widget.component:titleBar:1.0.3`） | 状态栏留白、标题基线 | 不新建 |
| 分类页签 | 一排文字，选中项带下划线 | `UniversalComponents` 的 `UniversalTabLayout`：`setTabStyle(NORMAL)`、`setTabLayoutMode(WRAP_CONTENT)`、`setTabItemSpacingPx(32dp)` | 点击切内容，挂 `setupViewPager2` 真实容器 | `UniversalComponents` | item 高 50、indicator 18x3、默认 item 间距非 0 时要显式覆盖 | 不新建：`WRAP_CONTENT` 枚举注释即「文字宽度即槽位宽度 + item 间距」，与该形态一致 |
| 右侧渐隐遮罩 | 静态渐变块 | 模块 `bg_` drawable | 不可点 | 模块 drawable | — | 一次性装饰留在页面 |
| 展开按钮 | 圆形底 + 箭头，可点 | `ImageView`（模块 drawable + 模块箭头图标） | 点击展开全部分类 | `ZhyModuleTeach` 已有 `teach_home_arrow.xml` | — | 不新建 |
| 课程卡片 | 圆角块 + 左图 + 右文字列 + 按钮 | 列表项布局 + BRVAH `BaseQuickAdapter`，或复用 `teach_home_list_template_*` | 整卡可点进详情 | 工程列表模板 | 模板自带内边距会吃掉 351x114 | 不新建：禁止复制静态行 |
| 标签「免费学习」 | 小圆角块 + 12sp 文字 | `UniversalComponents` 的 `TagComponents` | 不可点 | `UniversalComponents` | 默认圆角/内边距会吃掉 56x16 | 不新建 |
| 主按钮「立即下单 / 继续学习」 | 圆角块 + 14sp 白字 | `com.yilife.android.widget.component.shapetextview.ShapeTextView` | 点击下单 / 继续学习 | 依赖 `implementation Module.shapeTextview`（`com.yilife.android.widget.component:shapeTextview:1.0.1`） | 默认内边距与最小高度会吃掉 72x28 | 不新建；圆角不另写 `bg_` drawable |
| 悬浮 AI 入口 | 渐变描边圆 + 图标 | `ImageView` + 模块 `bg_` drawable（3px 渐变描边） | 点击进 AI 聊天 | 模块 drawable + MasterGo 位图 | — | 一次性悬浮入口 |
| 卡片右上角 22x22 图标 | 小图标 | 模块图标资源 | 点击（收藏/更多） | 工程已有同类图标，取用时核对 | — | 不新建 |
| 状态栏 / Home Indicator | 系统 | 系统 | — | — | — | 不实现 |

## 3. ResourceMap

颜色：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| #3A74FC（页签选中、下划线、主按钮底、展开按钮底） | `color_primary` `#5460FE` | — | 设计稿旧色值，按规则落到语义色；色差写进交付说明 |
| #F53F3F（价格、标签文字） | `color_error` `#FF5A54` | — | 同上 |
| rgba(245,63,63,0.0984)（标签底） | `color_error` 加 10% 透明度 | — | 不新增模块色 |
| #333333（标题） | `text_gy1` | — | 直接引用 |
| #666666（未选中页签） | `text_gy2` | — | 直接引用 |
| #999999（已学章节） | `text_gy3` | — | 直接引用 |
| #FFFFFF（卡片底、按钮文字） | `bg_base` / `text_white` | — | 直接引用 |
| #F6F6F6（页面底） | `bg_page` `#F5F5F7` | — | 差 1 个色阶，按语义色落地 |
| #383C40（AI 入口底） | 无对应项 | 新增 `{prefix}_color_` | 模块内定义 |
| 渐变 #B9DAFF→#EFF1F5→#F6F6F6 | 无 | 新增 `{prefix}_bg_` drawable | 顶部背景 |
| 渐变描边 6 色（#FF7448→#5200FF） | 无 | 新增 `{prefix}_bg_` drawable | AI 入口描边 |
| rgba(220,233,249,0) → #DCE9F9（页签右遮罩） | 无 | 新增 `{prefix}_bg_` drawable | 一次性遮罩 |

尺寸 / 字号 / 圆角：

| 设计值 | TobBaseResource | 模块资源 | 备注 |
| --- | --- | --- | --- |
| 页面左右边距 12、卡片间距 12 | `space_base` 12 | — | 直接引用 |
| 卡片圆角 12 | `radius_larger` 12 | — | 直接引用 |
| 标签圆角 2 | `radius_smaller` 2 | — | 直接引用 |
| 标题 18sp | `font_medium` 18 | — | 直接引用 |
| 页签 16sp | `font_basic_large` 16 | — | 直接引用 |
| 卡片标题 / 按钮 14sp | `font_basic_body` 14 | — | 直接引用 |
| 标签 / 已学章节 / 价格符号 12sp | `font_basic_micro` 12 | — | 直接引用 |
| 卡片高 114、图 90x90、按钮 72x28、页签行高 50 | 语义档无对应 | 新增 `{prefix}_height_` / `_icon_size_` | 语义档和 `dp_*` 都对不上才新增 |
| 主按钮圆角 14（= 高度一半） | — | 用半高圆角 drawable | 全圆角胶囊 |

图标：

| 图标 | 来源（UniversalComponents / MasterGo） | 资源名 | 密度 |
| --- | --- | --- | --- |
| 分享 | 工程已有 `teach_home_share.xml` | 复用 | — |
| 展开箭头 | 工程已有 `teach_home_arrow.xml` | 复用 | — |
| 返回 | UniversalComponents 图标库，无合适再从 MasterGo 取 | `{prefix}_ic_` | — |
| 卡片课程图 ×4 + 默认图、AI 图标 | MasterGo 客户端导出位图 | `{prefix}_ic_` / 课程图 | 只接 xxhdpi，转无损 WebP |

## 4. LayoutSpec

| 项 | 设计值 | 落在哪一层 | 实现方式 |
| --- | --- | --- | --- |
| 页面左右边距 | 12 | 列表容器 | `space_base` |
| 卡片间距 | 12（150→276→402，间距 = 126 - 114） | 列表 item 间距 | `space_base` |
| 卡片内边距 | 图 @12,12；文字列 x=114（图右 102 + 12）；按钮右 12、底 16 | 卡片根布局 | 12 + 90 + 12 = 114 |
| 卡片内竖排间距 | 标题 13..31 → 已学 39..55 → 价格/标签 63..81，间隔 8 | 文字列 | 8dp |
| 标题栏高 | 88（状态栏 21 高 @top 14.33；返回 16x16 @15,58；标题 22 高 @152,55；底部余 11） | 固定头 | 状态栏留白后用测量值对齐 |
| 返回图标 | 16x16 @15,58 | 标题栏 | 左边距 15 |
| 标题基线 | 72x22 @152,55，居中 | 标题栏 | 18sp/22 |
| 页签行高 | 50；内容区 30 @top 14 | 页签容器 | item 高 50 |
| 页签项宽 / 间距 | 32 / 32 / 48 / 32 / 64，间距恒为 32 | `UniversalTabLayout` | `WRAP_CONTENT` + `setTabItemSpacingPx(32dp)` |
| 页签下划线 | 18x3，圆角 2.5，距文字底 4 | indicator | 固定像素宽 + `radius_smaller` |
| 卡片尺寸 | 351x114，圆角 12 | 列表 item | 375 - 12×2 = 351 |
| 课程图 | 90x90，圆角蒙版，原图裁切（位图 150x100 / 118.55x178 / 189x126 / 153.87x151，尺寸不一） | 卡片左侧 | 中心裁切填满 |
| 标签 | 56x16，圆角 2，内边距左右 4 | 卡片 | `TagComponents` |
| 主按钮 | 72x28，圆角 14 | 卡片右下 | `MaterialButton` |
| 字号 / 行高 | 18/22、16/-1、14/18、12/16 | 全局 | 语义字号 |
| 悬浮 AI 入口 | 52x52 @311,640，描边 3px | 页面悬浮层 | 距右 12、距底 122 |

## 5. StateSpec

| 区块 | 状态 | 视觉表现 | 触发条件 | 设计稿出处 |
| --- | --- | --- | --- | --- |
| 页签「保姆」 | 选中 | 16sp Medium `#3A74FC` + 下划线 18x3 圆角 2.5 | 点击 | section 3 |
| 页签「月嫂/育儿嫂/厨艺/清洁收纳」 | 未选中 | 16sp Regular `#666666`，无下划线 | 默认 | section 3 |
| 页签整排 | 可横向滚动 | 右侧 60x22 渐隐遮罩 + 16x16 展开按钮 | 类别超出宽度 | sections 4/5 |
| 卡片-未学习（课程1、课程3） | 免费标签 + 立即下单 | 标签 56x16 `免费学习`；按钮 `立即下单` | 未购买 | sections 6/7 |
| 卡片-学习中带价格（课程2、课程4） | 已学章节 + 价格 + 继续学习 | `已学章节：N` 12sp `#999999` @114,39；`¥99`（¥ 12sp + 99 16sp Medium，`#F53F3F`）@114,63；按钮 `继续学习`；右上角 22x22 图标 | 已购学习中 | sections 8/9/10 |
| 卡片-学习中免费（课程2） | 免费标签 + 继续学习 | 标签 `免费学习` + 按钮 `继续学习` | 免费课学习中 | section 10 |
| 课程图 | 有图 / 默认图 | 默认图为书本插画（`课程默认图` 90x90，书本 83.08x64 @3.62,13） | 课程无封面 | section 9 |
| 卡片 | 无按下/禁用/加载/空/错误态 | — | 设计稿未出现 | 全 13 section |

## 6. 实现清单

- [ ] 基类：列表页用 `BaseWidgetFragment`，列表项走 BRVAH `BaseQuickAdapter`；不复制静态行
- [ ] 依赖：模块 `build.gradle` 已有 `implementation Module.universalComponents`，没有只补这一行
- [ ] 页签：`UniversalTabLayout` + `setTabLayoutMode(WRAP_CONTENT)` + `setTabItemSpacingPx(32dp)` + `NORMAL` 下划线，挂 `ViewPager2`
- [ ] 资源名前缀、layout / drawable / mipmap 命名符合模块规范；ID 用 `tv_` `btn_` `iv_` `tab_`
- [ ] 文案按设计稿直接写在布局里，不抽 `strings.xml`
- [ ] 标题栏用 `TitleBar`（`Module.titleBar`）、圆角按钮用 `ShapeTextView`（`Module.shapeTextview`），缺依赖各补一行
- [ ] 颜色与尺寸按 ResourceMap 落到 `TobBaseResource` 语义色，不在模块新增同义色
- [ ] 关键数值按 LayoutSpec 量实际控件：卡片 351x114、内边距 12、间距 12、页签项宽 32/32/48/32/64、间距 32

## 7. 验收

- [ ] 编译通过
- [ ] `adb install` 输出 `Success`，装的是本次构建包
- [ ] `adb shell uiautomator dump` 能找到：全部课程、保姆、月嫂、育儿嫂、厨艺、清洁收纳、课程1：保姆面试指南、免费学习、立即下单、继续学习、已学章节：18、¥99
- [ ] `adb exec-out screencap -p` 与设计稿逐块比对：标题栏 / 页签下划线 / 5 张卡片 / 悬浮 AI 入口
- [ ] 页签可切换、卡片可点、展开按钮可点、返回可退
- [ ] 未在设备上点过的部分写进交付说明

## 8. 读取时发现的三个坑（交付说明必写）

1. **全部文案被误标为占位符**：13 个 section 的 `rowTexts` 全部带 `_placeholder: true`，包括真实标题「全部课程」、真实分类「保姆/月嫂/育儿嫂/厨艺/清洁收纳」、真实课程名。只有「9:41」是真正的系统占位。按 Magic MCP 的 `_placeholder` 规则直接删除会删掉全部文案；判据是该处不合常理（页面标题等于页面名、页签是分类名、卡片是课程名），不整批删。
2. **文案按设计稿直接写进布局**，不抽 `strings.xml`，不自行判断哪段是动态、哪段是静态。
3. **颜色按 `TobBaseResource` 语义色落地**：`#3A74FC` → `color_primary` `#5460FE`、`#F53F3F` → `color_error` `#FF5A54`、`#F6F6F6` → `bg_page` `#F5F5F7`，不在模块新增同义色；三处色差写进交付说明。
4. **隐藏层不实现**：section 1 里有个 20x20、`opacity=0` 的「编组 9」，不可见，按伪影处理。
5. **标题栏与圆角按钮的依赖**：标题栏用 `TitleBar`（`Module.titleBar`），圆角按钮用 `ShapeTextView`（`Module.shapeTextview`）；相关模块 `build.gradle` 缺依赖时各补一行。
