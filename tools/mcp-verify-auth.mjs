#!/usr/bin/env node
/**
 * 一次性只读验证：确认 MasterGo 令牌授权有效、且 file 180767492624044 可见。
 * 只调 getMeta（只读），不改画布、不读取页面设计内容。
 *
 * 用法: node tools/mcp-verify-auth.mjs [fileId] [layerId]
 * 退出码: 0 授权与文件可见 / 1 未通过 / 2 用法错误
 *
 * 注：服务端 v0.2.9 起 getMeta 必填 [fileId, layerId]（只传 fileId 会 -32602），
 *     参数 schema 见 tools/mastergo-mcp-tools.json，变了就跑 mcp-tools-dump.mjs 重导。
 */
import { spawn } from 'node:child_process'

const fileId = process.argv[2] ?? '180767492624044'
const layerId = process.argv[3] ?? '2:74595'
const cmd = './tools/mastergo-mcp-launch.zsh'

const child = spawn(cmd, [], { env: process.env, stdio: ['pipe', 'pipe', 'pipe'] })

let buf = ''
let settled = false
const done = (code, msg) => {
  if (settled) return
  settled = true
  console.log(msg)
  try { child.kill('SIGKILL') } catch {}
  process.exit(code)
}
const send = (o) => child.stdin.write(JSON.stringify(o) + '\n')

child.stdout.on('data', (d) => {
  buf += d.toString()
  let i
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim()
    buf = buf.slice(i + 1)
    if (!line) continue
    let m
    try { m = JSON.parse(line) } catch { continue }

    if (m.id === 1 && m.result) {
      const names = (m.result.serverInfo ?? {})
      console.log(`[verify] 握手 OK: ${names.name}@${names.version}`)
      send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    }
    if (m.id === 2 && m.result) {
      const tools = (m.result.tools ?? []).map((t) => t.name)
      const meta = tools.find((n) => /getMeta$/i.test(n))
      if (!meta) return done(1, `[verify] 工具面里没有 getMeta，无法验证：${tools.join(', ')}`)
      console.log(`[verify] 工具面 ${tools.length} 个，用 ${meta} 验证 fileId=${fileId} layerId=${layerId}`)
      send({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: meta, arguments: { fileId, layerId } },
      })
    }
    if (m.id === 3) {
      if (m.error) return done(1, `[verify] getMeta 调用出错: ${JSON.stringify(m.error).slice(0, 400)}`)
      const text = (m.result?.content ?? []).map((c) => c.text ?? '').join('\n')
      if (/-32602|Input validation error/i.test(text)) {
        console.log(text.slice(0, 600))
        return done(1, '[verify] 参数 schema 与服务端对不上（不是令牌问题）：跑 node tools/mcp-tools-dump.mjs 重导 schema，按新的必填项改本脚本')
      }
      const isErr = m.result?.isError
      console.log('[verify] getMeta 返回' + (isErr ? '（标记为错误）' : '') + ':')
      console.log(text.slice(0, 1200))
      if (isErr) return done(1, '[verify] 授权或文件可见性未通过（见上面返回）')
      if (/401|10002|invalid.*token|expired|无权限|not.*authoriz/i.test(text)) {
        return done(1, '[verify] 返回内容提示令牌或席位问题')
      }
      return done(0, '[verify] ✅ 授权有效，文件可见')
    }
    if (m.id === 1 && m.error) return done(1, `[verify] initialize 被拒: ${JSON.stringify(m.error).slice(0, 300)}`)
  }
})

child.stderr.on('data', (d) => {
  const s = d.toString().trim()
  if (s) console.log('[verify stderr]', s.slice(0, 300))
})
child.on('error', (e) => done(1, `[verify] 无法启动启动器: ${e.message}`))
child.on('exit', (c) => done(1, `[verify] 进程退出 code=${c}`))

send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2026-07-28',
    capabilities: {},
    clientInfo: { name: 'dsh-mcp-verify', version: '1.0.0' },
  },
})
setTimeout(() => done(1, '[verify] 90s 内无应答'), 90000)
