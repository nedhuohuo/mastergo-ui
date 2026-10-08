# MasterGo MCP

Cursor 按 `~/.cursor/mcp.json` 拉起本地进程，经标准输入输出通信。进程再向 MasterGo 取数。设计链接只提供 `fileId` 和 `layer_id`，本身不建立连接。

| 服务名 | 作用 | 依赖 |
| --- | --- | --- |
| `mastergo-magic-mcp` | 按链接取 DSL | `~/.zshrc` 里的 `MG_MCP_TOKEN`，团队版席位，文件在团队项目 |
| `mastergo-vibe` | 读当前选中图层、改画布 | MasterGo 客户端已开，文件内 MCP 在线 |

当前可用配置（令牌不写在这个文件里）：

```json
{
  "mcpServers": {
    "mastergo-magic-mcp": {
      "command": "/Users/huohuo/.cursor/bin/mastergo-magic-mcp.sh",
      "args": []
    },
    "mastergo-vibe": {
      "command": "/opt/homebrew/bin/npx",
      "args": ["-y", "@mastergo/vibe-mcp@latest", "--url=http://127.0.0.1:30678"]
    }
  }
}
```

`mastergo-magic-mcp.sh` 在启动时从登录 shell 读取 `MG_MCP_TOKEN`。从 Dock 打开的 Cursor 若读不到该变量，用终端执行 `cursor` 再开。端口以客户端为准；占用时会换端口，`mcp.json` 要跟着改。

从 0 重做：Node.js 18+；mastergo.com → 个人设置 → 安全设置生成令牌，写入 `~/.zshrc` 的 `export MG_MCP_TOKEN=...`；打开客户端确认 MCP 在线；写入上面的 `mcp.json`；在 Settings → Tools & MCP 重载，直到两个服务已连接。

## Magic 工具

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
| 工具列表里没有 | 重载 MCP，确认 `mcp.json` 合法，Node ≥ 18 |
| Magic 权限不足 | 令牌、团队版席位、文件在团队项目 |
| Magic 读不到令牌 | 确认 `~/.zshrc` 有 `MG_MCP_TOKEN`，从终端启动 Cursor |
| Vibe 未找到终结点 | 客户端打开，文件内 MCP 在线，端口与配置一致 |
| 数据过大或 429 | 按区块拉，降低频率 |
