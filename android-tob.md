# 知护办 Android

资源只用 `TobBaseResource`（`com.yilife.android.bu.module:TobBaseResource`，源码 `common/TOBBaseResource`）。`GlobalSharedResource` 已废弃，新界面不要引用 `color_3a74fc`、`text_small`、`spacing_*` 这套旧名字。

## 页面基类

| 形态 | 基类 |
| --- | --- |
| 普通 Activity | `com.yilife.android.arch.page.page.BaseActivity` |
| 普通 Fragment | `com.yishou.android.lib.base.arch.fragment.BaseFragment`（实现 `bindRootView`、`initData`） |
| 列表拼装页 | `com.yilife.android.arch.page.page.BaseWidgetFragment`（`initData`、`registerData2View`、`dv`、`addData`） |
| 单条列表项 | `SingleItemWidget` / `ItemWidget` |
| 底部弹层 | `CustomBottomPopupWindow` 或 `BottomSheetPopup`（`common/UniversalComponents`） |

空态、错误态用 `BaseWidgetFragment` 的 `showEmptyView()` / `showErrorView()`。标题栏用已有 `TitleBar`。

Activity 不重写 `onCreate`，使用 `afterCreate(Bundle?)`，初始化顺序固定为 `initView()` → `initListener()` → `initData()`。Fragment 默认实现 `bindRootView()`、`initData()`；ViewBinding 使用 `_binding` 可空模式，并在 `onDestroyView()` 置空。

ViewModel 只负责页面状态编排、请求入口和用户意图处理，不直接持有或操作 View、Binding、Context、Adapter、Dialog、PopupWindow；跳转、Toast、弹窗和 View 绑定由 Activity / Fragment 宿主负责。`UiState` 只封装同一块 UI 的强关联展示结果，一次性事件、输入值和不同消费方状态独立传递。

UI 复杂度按 ViewModel → Processor → Mapper → Policy → Resolver → `ui/controller` / `ui/view` 的职责顺序拆分，不为减少文件行数泛化 `Helper`、`CommonUtils`、`DataUtils` 或 `ViewUtils`。Kotlin 属性 setter 只做赋值，需要副作用时使用显式 `setXxx()` 方法。

## 颜色

主色 `color_primary` `#5460FE`，按下 `color_primary_dark`，浅阶 `color_primary_v1`–`v7`。成功 / 警告 / 错误 / 紫用 `color_success`、`color_warning`、`color_error`、`color_purple` 及对应 `_dark`、`_v1`–`_v7`。

文字 `text_gy1` `#333333` 到 `text_gy6`，白字 `text_white`。边框 `border_*`，填充 `fill_*`，页面底 `bg_page`，卡片底 `bg_base`。

## 尺寸

优先 `dimens_semantic.xml`：

- 圆角：`radius_no` 0、`radius_smaller` 2、`radius_small` 4、`radius_medium` 6、`radius_large` 8、`radius_larger` 12、`radius_round` 16
- 间距：`space_micro` 4、`space_mini` 8、`space_base` 12、`space_small` 16、`space_medium` 24、`space_large` 32
- 字号：`font_basic_micro` 12、`font_basic_body` 14、`font_basic_large` 16、`font_medium` 18、`font_large` 20、`font_xlarge` 24

语义档对不上时再用同模块的 `dp_*`、`sp_*`。

## 模块资源命名

业务资源以该模块 `resourcePrefix` 的 `{prefix}_` 开头。落新文件前先看该模块 `build.gradle` 的 `resourcePrefix` 和已有 layout 文件名，按已有前缀写，不要另起一套。

能引用 `TobBaseResource` 的颜色、字号、间距、圆角时直接引用，不要在业务模块再声明一份同值资源。禁止在 XML / Kotlin 中硬编码颜色、尺寸和用户可见文案；文案放入 `strings.xml`，颜色和尺寸先查语义 token，确无对应项才新增模块资源。

| 类型 | 格式 | 示例 |
| --- | --- | --- |
| 文案 | `{prefix}_{feature}_{desc}` | 放 `strings.xml`，用户可见文案不写死在布局或代码里 |
| 模块自有颜色 | `{prefix}_color_{semantic}` | `{prefix}_color_text_`、`_bg_`、`_divider`、`_status_`、`_primary` |
| 模块自有尺寸 | `{prefix}_radius_` / `_height_` / `_icon_size_` / `_padding_` | 语义档和 `dp_*` / `sp_*` 都对不上时才新建 |

颜色名用语义，不用色值本身（不要 `color_e8e8e8`）。

### layout

放 `res/layout/`，文件名 `{prefix}_{页面类型}_{功能描述}.xml`。

| 页面类型 | 前缀 | 示例 |
| --- | --- | --- |
| Activity | `activity_` | `{prefix}_activity_interview_meeting` |
| Fragment | `fragment_` | `{prefix}_fragment_interview_room` |
| DialogFragment | `dialog_fragment_` | `{prefix}_dialog_fragment_member_manager` |
| 列表项 | `item_` | `{prefix}_item_chat_message` |
| PopupWindow | `pop_` | `{prefix}_pop_invite` |
| 自定义 View | `view_` | `{prefix}_view_top_bar` |

### drawable

放 `res/drawable/`，文件名 `{prefix}_{类型}_{描述}`。按这个资源在界面里扮演的角色分类，一个文件只归一类：

| 类型 | 前缀 | 归到这里的条件 |
| --- | --- | --- |
| 背景 | `bg_` | 铺在内容后面，作为一块区域的底。卡片、气泡、按钮底、圆角矩形、渐变都算。 |
| 图标 | `ic_` | 表达动作、状态或对象的符号。位图不放这里，见 mipmap。这里只放必须用矢量 XML 的图标。 |
| 选择器 | `sel_` | 本身不画最终样子，只按状态切换到别的 drawable。按下、选中、禁用这类 state list 用它。 |
| 分割线 | `divider_` | 用来隔开内容的线，例如列表分割线、发丝线。 |
| 形状 | `shape_` | 没有业务含义的几何图形，例如圆点、色块。已经能归进背景、图标、分割线或选择器的，不要放这里。 |

判断顺序：会随状态切换就用 `sel_`；是分隔线就用 `divider_`；铺在内容后面就用 `bg_`；是有含义的符号就用 `ic_`；剩下的几何图形用 `shape_`。

### mipmap

图标位图放 `res/mipmap-xhdpi/`，这是 2x（xhdpi，320dpi）。文件名 `{prefix}_ic_{描述}.webp`。启动图标同样放这里，命名 `{prefix}_ic_launcher`；模块里已有启动图名字就沿用。

## 图标来源

1. 先在 `UniversalComponents` 的 `res/drawable` 里找已有图标，名字多是 `universal_icon_`、`universal_ic_`。能对上就直接引用，不复制到业务模块。
2. 没有合适的，再从 MasterGo 取出，按当前模块 `{prefix}_ic_{描述}.webp` 重命名，放进当前模块 `res/mipmap-xhdpi/`。

## 控件 ID

ViewBinding ID 与资源文件前缀是两套规则。ID 格式 `{typePrefix}{semanticName}`，类型前缀必须在最前面，不要把模块 `{prefix}_` 拼到 ID 上。

| 控件 | 前缀 |
| --- | --- |
| 文本 | `tv_` |
| 按钮 | `btn_` |
| 输入 | `et_` |
| 图片 | `iv_` |
| ImageButton | `ib_` |
| CheckBox / Radio / Switch | `cb_` / `rb_` / `sw_` |
| ProgressBar / SeekBar | `pb_` / `sb_` |
| Frame / Linear / Relative / Constraint | `fl_` / `ll_` / `rl_` / `cl_` |
| CoordinatorLayout | `coordinator_` |
| RecyclerView / ScrollView / NestedScrollView | `rv_` / `sv_` / `nsv_` |
| ViewPager / ViewPager2 | `vp_` / `vp2_` |
| WebView / ViewStub / Space / Lottie / TabLayout | `wv_` / `stub_` / `space_` / `lav_` / `tab_` |

按 XML 里的实际控件选前缀。继承标准控件的兼容类跟标准控件走，例如 `MaterialButton` 用 `btn_`。`layout_` 只给无法归到具体容器的兜底，不代替 `fl_`、`ll_`、`rl_`、`cl_`。表里没有的自定义或三方控件用 `view_`，不要临时造缩写。

## 控件选用

生成或还原 UI 前，必须先在当前工程和 `UniversalComponents` 中检索组件定义、公共 API、资源和调用示例，并记录复用项。按这个顺序，前一档能满足就不要往下走：

1. `UniversalComponents` 里已有的 `*Components`（按钮、输入、选择、弹层、空布局、Tab、日历等）。
2. 工程里已经接入的三方控件。常见的有 DialogX、BasePopup、BRVAH、Lottie、SmartRefresh、Banner、DslTabLayout。以当前模块 `build.gradle` 和 `Dept.kt` 里实际依赖为准。
3. Google / AndroidX 原生控件。

两档都对不上时：结构简单的控件在模块内实现；结构复杂的先找有没有合适的三方库，把库名和用途交给宿主决定，不要自行加入依赖。不得复制 UniversalComponents 组件或新建第二套按钮、导航、列表单元。

### UniversalComponents 依赖接入

`UniversalComponents` 不做本地工程依赖，走远端 maven。常量定义在当前 AppShell 的 buildSrc（`com/yishou/android/arch/version/plugin/Dept.kt`，`object Module`）：

```kotlin
const val universalComponents = "com.yilife.android.bu.module:UniversalComponents:<version>"
```

业务模块引用方式：`build.gradle` 顶部 `import com.yishou.android.arch.version.plugin.*`，`dependencies` 里写 `implementation Module.universalComponents`。

- 用组件前先看当前模块 `build.gradle` 是否已有这一行；没有就只补这一行，不写死 groupId / artifactId / version，不新增其他依赖。
- 看到 `// implementation project(":UniversalComponents")` 是迁移前的本地依赖，保持注释，改用 `Module.universalComponents`。
- 版本由 AppShell 的 `Dept.kt` 统一维护；需要升版时说明原因交宿主决定，不擅自改 SNAPSHOT 版本。

新建自定义 View 只在这三档实现不了设计效果时发生。环形或多段进度、波形和趋势、按设计稿定制的轨道滑块、必须响应点击的蒙版热区、随业务状态整块重画的图形，才新建。静态装饰用图标，不新建 View。布局文件 `{prefix}_view_`，ID 用 `view_`。
