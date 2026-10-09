# MasterGo MCP

MasterGo MCP 不绑定 AI 工具。先查看当前会话已暴露的 MCP 能力，能用就复用；缺少能力时，再按当前客户端支持的方式接入。下面的本地服务通过 stdio 通信，由 AI 客户端或其 MCP 网关启动进程，再向 MasterGo 取数。设计链接只提供文件/图层 ID，本身不建立连接。

| 服务名 | 作用 | 依赖 |
| --- | --- | --- |
| `mastergo-magic-mcp` | 按链接取 DSL | 服务进程收到 `MG_MCP_TOKEN`，团队版席位，文件在团队项目 |
| `mastergo-vibe` | 读当前选中图层、改画布 | MasterGo 客户端已开，文件内 MCP 在线 |

## 按当前 AI 工具接入

MCP 服务按任务选，配置方式按 AI 客户端选。服务名只是配置别名，不要求与表中一致；工具可能带客户端生成的命名空间或前缀，调用前读取实际工具列表和参数 schema，不拼接固定工具名，也不凭 AI 品牌猜测服务能力。

| AI 工具 | 配置入口 | 适配方式 |
| --- | --- | --- |
| Cursor | 项目 `.cursor/mcp.json` 或用户 `~/.cursor/mcp.json` | 使用下面的 `mcpServers` JSON；在 Tools & MCP 重载 |
| Claude Code | 项目 `.mcp.json`，或通过 `claude mcp add` 管理本地/用户配置 | 项目配置使用下面的 JSON；重新连接 MCP，并批准项目配置 |
| Codex | 用户 `~/.codex/config.toml` 或受信任项目 `.codex/config.toml` | 使用下面的 TOML，不直接复制 JSON；重新连接会话 |
| 其他 AI 工具 / MCP 网关 | 当前工具提供的 MCP 配置、安装命令或扩展 | 将相同 `command` / `args` 和环境变量映射到其格式；不默认支持 `mcpServers` JSON |

客户端不明且所需能力未出现时，先问用户使用哪个 AI 工具，再查该工具的 MCP 文档。没有 stdio 接入能力或可用网关时，明确说明限制，不要求用户改用 Cursor。只配置任务需要的服务，不强制两个都安装。

Magic 默认可能暴露 `mcp__getDsl` 这类工具名。客户端因重复命名空间而过滤工具时（如 Grok Build），在 Magic 的 `args` 中追加官方支持的 `--no-prefix`，重连后按实际 schema 调用。其他客户端不必改名；已有服务先验证，不为统一名字重新安装。

### stdio 服务参数（JSON 示例）

此示例适用于上表中支持 `mcpServers` 的客户端，不是所有工具通用的配置文件。Magic 官方包直接读取 `MG_MCP_TOKEN`，无需 Cursor 专属启动脚本。

```json
{
  "mcpServers": {
    "mastergo-magic-mcp": {
      "command": "npx",
      "args": ["-y", "@mastergo/magic-mcp@latest", "--url=https://mastergo.com"]
    },
    "mastergo-vibe": {
      "command": "npx",
      "args": ["-y", "@mastergo/vibe-mcp@latest", "--url=http://127.0.0.1:30678"]
    }
  }
}
```

### Codex（TOML 示例）

```toml
[mcp_servers.mastergo-magic-mcp]
command = "npx"
args = ["-y", "@mastergo/magic-mcp@latest", "--url=https://mastergo.com"]
env_vars = ["MG_MCP_TOKEN"]

[mcp_servers.mastergo-vibe]
command = "npx"
args = ["-y", "@mastergo/vibe-mcp@latest", "--url=http://127.0.0.1:30678"]
```

### 环境、令牌和地址

- 本地启动需 Node.js 18+，`npx` 在 MCP 进程的 PATH 中。找不到时按本机实际安装位置配置，不复制他人的绝对路径；Windows 按客户端要求使用 `npx.cmd` 或 `cmd /c npx`。
- 令牌通过系统环境变量或客户端安全配置注入，不写入共享配置、不进仓库、不在对话或日志中输出。shell 设置了变量不代表从桌面打开的 AI 工具继承了它。
- JSON 示例要求 MCP 子进程继承 `MG_MCP_TOKEN`。需要显式映射时，Cursor 的 `env` 可用 `"MG_MCP_TOKEN": "${env:MG_MCP_TOKEN}"`，Claude Code 可用 `"MG_MCP_TOKEN": "${MG_MCP_TOKEN}"`；不要混用插值语法。Codex 用上面的 `env_vars` 转发启动环境里的变量。变量必须在启动 AI 工具前可用；不要假定配置会自动读取 `~/.zshrc`。
- Vibe 的 `http://127.0.0.1:30678` 仅为示例，以 MasterGo 客户端显示的地址和端口为准。它是 Vibe 进程连接 MasterGo 的地址，不是供 AI 客户端直接安装的远程 MCP URL。`127.0.0.1` 指 MCP 进程所在机器；远程/容器内的进程不能据此访问另一台机器上的客户端。
- 修改配置后在当前 AI 工具中重载或重新连接，确认工具已出现在会话，并通过只读设计接口验证授权。已连接且可读设计数据的服务，不必重复配置或要求本机再次提供令牌。

配置依据：[Magic 官方说明](https://github.com/mastergo-design/mastergo-magic-mcp)、[Cursor MCP](https://cursor.com/docs/context/mcp)、[Claude Code MCP](https://code.claude.com/docs/en/mcp)、[Codex MCP](https://developers.openai.com/codex/mcp)。其他客户端以其当前版本文档为准。

## Magic 工具

以下为能力名称参考，实际名称和参数以当前会话的工具 schema 为准；版本不提供所需能力时说明缺失，不虚构调用。

| 工具 | 何时用 |
| --- | --- |
| `getMeta` | 先看文件和图层 |
| `getDesignSections` | 大页面按区块 |
| `getDsl` | 单区块结构、布局、样式 |
| `getDesignTexts` | 文案逐字一致，`format=json` |
| `getDesignSvgs` / `extractSvg` | 图标和矢量 |

链接：`https://mastergo.com/file/{fileId}?layer_id={layerId}`。`format=tree` 省 token。

## Vibe 工具

| 工具 | 何时用 |
| --- | --- |
| `get_selection_code` | 读选中图层 |
| `get_selection_image` | 对照视觉 |
| `design_page` | 新建页面 |
| `get_library_list` / `get_component_info` | 选定团队库 |
| `agent_update_node` | 改颜色、文案、尺寸 |
| `agent_replace_node` | 替换图标或图片 |
| `agent_sync_design` | 仅当用户明确说同步到画布 |
| `get_design_diff` | 对照 `.mastergo/design/` |

## 排障

| 现象 | 处理 |
| --- | --- |
| 所需能力未出现 | 查看实际工具列表；按当前 AI 工具检查配置格式、权限和连接，本地服务需 Node ≥ 18 |
| Magic 权限不足 | 令牌、团队版席位、文件在团队项目；只读设计接口成功才算授权有效 |
| Magic 读不到令牌 | 检查子进程环境变量传递，不打印令牌，不假定客户端会加载 shell 配置 |
| Vibe 未找到终结点 | 客户端打开，文件内 MCP 在线，地址和端口与配置一致；检查进程是否在同一台机器 |
| 数据过大或 429 | 按区块拉，降低频率 |
