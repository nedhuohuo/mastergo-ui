# 设计数据投喂单（MCP 不可用时的备用路径）

MCP 接不通时走这里。目标：把 `2:74595` 的设计数据交给我，**不用把 MasterGo 令牌给任何人**。

## 怎么导出

在 MasterGo 客户端里打开该文件、选中 `2:74595`，任选一种：

| 方式 | 得到什么 | 备注 |
| --- | --- | --- |
| 右键图层 →「复制为代码 / Copy as code」 | 该图层的 DSL 结构 | 最省事；选中的是内容图层就够 |
| Magic MCP 手工调一次 `getDsl` | 同上 | 需要令牌 |
| 客户端「导出」→ 选 PNG | 像素图 | 只用于对照视觉，**不能**替代 DSL 数值 |

大页面分区块多次导出也行，只要能覆盖下面「必须有的字段」。

## 必须有的字段（缺哪个我会明确标出来，不会猜）

页面与图层级：

- [ ] `fileId`、真实 `layer_id`、图层名
- [ ] 画布尺寸（宽 × 高）
- [ ] 页面级背景层：铺在内容下面的整块底色（`splitContainers` 或等效信息），每层的 `name / type / id / 宽高 / x / y / background / fill`
- [ ] 每层的 **圆角、描边、内边距**（在层自己的元数据里，不在摘要里）

节点级：

- [ ] 层级树：页面 → 区域 → 容器 → 重复单元
- [ ] 每个节点的 `type`、绝对 `x / y`、`宽 × 高`
- [ ] 文字节点：逐字文案、字号、行高、颜色、字重、对齐
- [ ] 容器：`fill` / `stroke`、圆角、`gap`、`padding`
- [ ] 图标 / 图片节点：是否 PATH、尺寸、是否可导出矢量

状态：

- [ ] 设计稿里真实出现的状态（默认 / 选中 / 按下 / 禁用 / 空 / 错误），以及各状态的色值差异

## 贴之前

- **不要把 `MG_MCP_TOKEN` 贴进来**，我不需要它。
- 粘贴格式随意（JSON、导出的 DSL 文本、甚至分几段），我会归位。
- 数据不全没关系 —— 我会先把能填的填进 [templates/android-ui-analysis.md](../templates/android-ui-analysis.md)，
  再把缺口列成一张清单问你要，不编数值。

## 我会怎么处理

1. 按 [SKILL.md](../SKILL.md)「规格读取原则」核对：三层颜色冲突、`_placeholder`、重复图层、伪影
2. 填五项分析（PageStructure / ComponentMap / ResourceMap / LayoutSpec / StateSpec）+ 背景分区表 + 绝对 y 对账
3. 跑 `scripts/check-ui-analysis.sh <文档>` 到 `exit 0`
4. 落 Android 布局与代码，真机验收，偏差写进交付说明
