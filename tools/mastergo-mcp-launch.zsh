#!/bin/zsh
# MasterGo Magic MCP 的 stdio 启动器。
#
# 为什么需要它：~/Library/Application Support/... 由 launchd 启动的 App 不读 ~/.zshrc，
# 而 MCP 子进程环境又会被清洗掉名字含 TOKEN 的变量。本脚本按需从 ~/.zshrc 取令牌，
# 显式传给 magic-mcp，从而不必依赖 launchctl setenv + 重启 App。
#
# 令牌只在本进程内传递，不打印、不落盘。
set -euo pipefail

if [[ -z "${MG_MCP_TOKEN:-}" ]]; then
  # 只取最后一行赋值（zshrc 里可能有其它输出）
  MG_MCP_TOKEN="$(zsh -ic 'printf %s "${MG_MCP_TOKEN:-}"' 2>/dev/null | tail -1)"
  export MG_MCP_TOKEN
fi

if [[ -z "${MG_MCP_TOKEN:-}" ]]; then
  echo "mastergo-magic-mcp: MG_MCP_TOKEN 为空（~/.zshrc 里没有或未生效）" >&2
  exit 1
fi

exec npx -y @mastergo/magic-mcp@latest --url=https://mastergo.com
