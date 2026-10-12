#!/usr/bin/env node
/**
 * 一次性诊断：验证 MasterGo Magic MCP 的 stdio 链路是否可用。
 * 只做协议层探测，不打印令牌，不落盘任何设计数据。
 *
 * 用法: node mcp-probe.mjs [超时秒数] [命令] [参数...]
 *   默认命令: npx  -y  @mastergo/magic-mcp@latest  --url=https://mastergo.com
 * 退出码: 0 握手成功 / 1 起不来或未应答 / 2 用法错误
 */
import { spawn } from 'node:child_process'

const timeoutSec = Number(process.argv[2] ?? 90)
const cmd = process.argv[3] ?? 'npx'
const args = process.argv.length > 4
  ? process.argv.slice(4)
  : ['-y', '@mastergo/magic-mcp@latest', '--url=https://mastergo.com']

if (!Number.isFinite(timeoutSec) || timeoutSec <= 0) {
  console.error('用法: node mcp-probe.mjs [超时秒数] [命令] [参数...]')
  process.exit(2)
}

const hasToken = Boolean(process.env.MG_MCP_TOKEN)
if (!hasToken) {
  console.error('[probe] 本进程无 MG_MCP_TOKEN；若命令是启动器脚本，它会自行从 ~/.zshrc 取')
}

console.log(`[probe] spawn: ${cmd} ${args.join(' ')}`)
const child = spawn(cmd, args, { env: process.env, stdio: ['pipe', 'pipe', 'pipe'] })

let buf = ''
let settled = false
const done = (code, msg) => {
  if (settled) return
  settled = true
  console.log(msg)
  try { child.kill('SIGKILL') } catch {}
  process.exit(code)
}

child.stdout.on('data', (d) => {
  buf += d.toString()
  let idx
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim()
    buf = buf.slice(idx + 1)
    if (!line) continue
    let msg
    try { msg = JSON.parse(line) } catch { console.log('[probe] 非 JSON 行:', line.slice(0, 200)); continue }
    if (msg.id === 1 && msg.result) {
      const info = msg.result.serverInfo ?? {}
      const caps = Object.keys(msg.result.capabilities ?? {}).join(',') || '(none)'
      console.log(`[probe] 握手 OK server=${info.name}@${info.version} capabilities=[${caps}]`)
      // 握手成功后列出工具，确认授权与工具面（不读取任何设计数据）
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    }
    if (msg.id === 2 && msg.result) {
      const names = (msg.result.tools ?? []).map((t) => t.name)
      done(0, `[probe] 工具 ${names.length} 个: ${names.join(', ')}`)
    }
    if (msg.id === 2 && msg.error) {
      done(1, `[probe] tools/list 被拒: ${JSON.stringify(msg.error).slice(0, 300)}`)
    }
    if (msg.id === 1 && msg.error) {
      done(1, `[probe] initialize 被拒: ${JSON.stringify(msg.error).slice(0, 300)}`)
    }
  }
})

child.stderr.on('data', (d) => {
  const s = d.toString().trim()
  if (s) console.log('[probe stderr]', s.slice(0, 400))
})

child.on('error', (e) => done(1, `[probe] 无法启动: ${e.message}`))
child.on('exit', (c) => done(1, `[probe] 进程提前退出，code=${c}`))

const send = (obj) => child.stdin.write(JSON.stringify(obj) + '\n')
send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2026-07-28',
    capabilities: {},
    clientInfo: { name: 'dsh-mcp-probe', version: '1.0.0' },
  },
})

setTimeout(() => done(1, `[probe] ${timeoutSec}s 内无应答：服务未启动或握手超时`), timeoutSec * 1000)
