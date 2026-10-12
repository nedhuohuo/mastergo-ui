#!/usr/bin/env node
/**
 * 通用只读调用器：直接经 Magic MCP stdio 调一个工具，把结果写到文件。
 * 用途：在 DSH 会话尚未注册 mcp__mastergo__* 工具时，仍能按 SKILL.md 取设计数据。
 *
 * 用法: node tools/mcp-call.mjs <工具名> '<JSON参数>' [输出文件]
 * 例:   node tools/mcp-call.mjs mcp__getMeta '{"fileId":"180767492624044","layerId":"2:74595"}' out.json
 *
 * 只做只读调用；applyDesign / getD2c / C2d 写盘类工具不要用它跑。
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const [, , toolName, argsJson = '{}', outFile] = process.argv
if (!toolName) {
  console.error("用法: node tools/mcp-call.mjs <工具名> '<JSON参数>' [输出文件]")
  process.exit(2)
}
let toolArgs
try {
  toolArgs = JSON.parse(argsJson)
} catch (e) {
  console.error(`参数不是合法 JSON: ${e.message}`)
  process.exit(2)
}

const child = spawn('./tools/mastergo-mcp-launch.zsh', [], { env: process.env, stdio: ['pipe', 'pipe', 'pipe'] })

let buf = ''
let settled = false
const done = (code, msg) => {
  if (settled) return
  settled = true
  if (msg) console.log(msg)
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
      send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })
      send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: toolName, arguments: toolArgs } })
    }
    if (m.id === 1 && m.error) done(1, `initialize 被拒: ${JSON.stringify(m.error).slice(0, 300)}`)
    if (m.id === 2) {
      if (m.error) return done(1, `调用出错: ${JSON.stringify(m.error).slice(0, 800)}`)
      const text = (m.result?.content ?? []).map((c) => c.text ?? '').join('\n')
      if (outFile) {
        writeFileSync(outFile, text)
        console.log(`✅ ${toolName} → ${outFile}（${text.length} 字符）${m.result?.isError ? ' [服务端标记 isError]' : ''}`)
      } else {
        console.log(text)
      }
      if (m.result?.isError) return done(1, '服务端返回 isError=true')
      return done(0, null)
    }
  }
})
child.stderr.on('data', (d) => { const s = d.toString().trim(); if (s) console.log('[stderr]', s.slice(0, 400)) })
child.on('error', (e) => done(1, `无法启动启动器: ${e.message}`))
child.on('exit', (c) => done(1, `进程退出 code=${c}`))

send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2026-07-28', capabilities: {}, clientInfo: { name: 'dsh-mcp-call', version: '1.0.0' } } })
setTimeout(() => done(1, '180s 无应答'), 180000)
