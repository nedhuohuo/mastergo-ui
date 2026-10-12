# 接通 MasterGo Magic MCP（DSH 桌面端）

[SKILL.md](../SKILL.md) 要求「有设计数据才出 UI」。DSH 的 MCP 由
`@deepseek-ai/dsh-mcp-client` 承载；本仓库已把**令牌注入**这一步做成启动器脚本，
所以不需要 `launchctl`，也不需要为令牌重启 App。

## 现状（2026-10-12 实测）

| 项 | 结果 |
| --- | --- |
| `npx -y @mastergo/magic-mcp@latest` | ✅ 能起 |
| 未带令牌握手 | ✅ `server=MasterGoMcpServer@0.2.9`，`capabilities=[tools]` |
| 经启动器取令牌后握手 | ✅ 授权通过，`tools/list` 返回 **12 个工具**（含 `getPageLayers` / `getDsl` / `getMeta` / `getDesignSections` / `extractSvg` 等） |
| bundle 是否装进 profile | ❌ 还没装（`bundles` 里没有，patch 里没有 mastergo 条目） |
| DSH 会话内 MCP 工具 | ❌ 无 `mcp__mastergo__*` |

诊断命令（不打印令牌、不落盘设计数据）：

```bash
NPM_CONFIG_CACHE=/tmp/npmcache-dsh node tools/mcp-probe.mjs 120 \
  ./tools/mastergo-mcp-launch.zsh
```

## 令牌是怎么进去的

三条限制叠加，导致 `npx` 不能直接吃令牌：

1. MCP 子进程环境 = **DSH 进程环境经清洗** + 配置里的 `env`；
2. 清洗规则丢掉名字匹配 `/KEY|PASSWORD|SECRET|TOKEN/i` 的变量 —— `MG_MCP_TOKEN` 正中；
3. 桌面 App 由 launchd 启动，**不继承 `~/.zshrc`**；而 `command` + `args` 是直接 spawn、
   **不经过 shell**，所以配置里也无法用 `sh -c` 取值。

解法：[`tools/mastergo-mcp-launch.zsh`](../tools/mastergo-mcp-launch.zsh) ——
`MG_MCP_TOKEN` 为空时从 `~/.zshrc` 取一次，再 `exec npx -y @mastergo/magic-mcp@latest`。
令牌只在该进程内传递，不打印、不落盘。因此令牌放在 `~/.zshrc`（第 153 行 `export MG_MCP_TOKEN=…`）即可生效。

## 安装（一步）

DSH 侧栏 **Plugins** 页 → 安装，spec 填绝对路径：

```
/Users/huohuo/AISpace/mastergo-ui/.mcp-bundles/mastergo-magic-mcp
```

备选（手改配置，二者任选其一）：

- 把 [`.mcp-bundles/mastergo-magic-mcp/cordis.patch.yml`](../.mcp-bundles/mastergo-magic-mcp/cordis.patch.yml)
  里那段 `insert` 条目合并进 `~/.dsh/profiles/desktop/cordis.patch.yml`
- 或把该 bundle 目录加进 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles`

装完后 `mcp__mastergo__*` 会出现在会话工具列表里。

## 自检（不要跳过）

令牌存在 ≠ 授权成功。工具出现后，先调一个**只读设计接口**确认能返回图层数据，
再开始读 DSL。`401` 或错误码 `10002` = 令牌无效/过期，或账号没有 MasterGo 团队版席位。

## 排障

| 现象 | 处理 |
| --- | --- |
| 会话里没有 `mcp__mastergo__*` | profile 的 `bundles` 里没有该 bundle，或配置改动未生效 |
| 启动即失败、日志报令牌为空 | 在本项目目录跑一次 `./tools/mastergo-mcp-launch.zsh`，看是否报「MG_MCP_TOKEN 为空」 |
| `401` / `10002` | 令牌、团队版席位、文件是否在团队项目 |
| 取数超时 / 429 | 按区块分开拉，降低请求频率；`toolCallTimeoutMs` 已放到 120s |
