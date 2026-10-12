#!/usr/bin/env node
/**
 * 只读：dump MasterGo MCP 的工具名与参数 schema。
 * 用于避免盲调（实测 getMeta 必填 layerId 而非 fileId）。
 *
 * 用法: node tools/mcp-tools-dump.mjs [输出文件]
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const out = process.argv[2] ?? 'tools/mastergo-mcp-tools.json'
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
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    }
    if (m.id === 2 && m.result) {
      const tools = (m.result.tools ?? []).map((t) => ({
        name: t.name,
        description: (t.description ?? '').split('\n')[0].slice(0, 160),
        required: t.inputSchema?.required ?? [],
        properties: Object.keys(t.inputSchema?.properties ?? {}),
      }))
      writeFileSync(out, JSON.stringify(tools, null, 2))
      const lines = tools.map((t) => `${t.name}\n    必填: [${t.required.join(', ')}]\n    参数: [${t.properties.join(', ')}]`)
      done(0, `共 ${tools.length} 个工具 → ${out}\n\n${lines.join('\n')}`)
    }
    if (m.id === 1 && m.error) done(1, `initialize 被拒: ${JSON.stringify(m.error).slice(0, 300)}`)
  }
})
child.stderr.on('data', (d) => { const s = d.toString().trim(); if (s) console.log('[stderr]', s.slice(0, 300)) })
child.on('error', (e) => done(1, `无法启动: ${e.message}`))
child.on('exit', (c) => done(1, `退出 code=${c}`))

send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2026-07-28', capabilities: {}, clientInfo: { name: 'dsh-tools-dump', version: '1.0.0' } } })
setTimeout(() => done(1, '90s 无应答'), 90000)
