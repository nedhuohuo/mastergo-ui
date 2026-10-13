#!/usr/bin/env node
/**
 * 生成「圆角 / 描边（逐元素）」表的骨架：节点是机器数的，人不数。
 *
 * 用法:
 *   node tools/radius-table.mjs --file <fileId> --layer <layerId> [--dump <dir>] [--offline]
 *
 * 做什么:
 *   1. 取该页 section 列表 + 每个 section 的 DSL（本地已有 dump 就直接读，没有才走 MCP）；
 *   2. 遍历所有节点的 borderRadius，按「圆角值 + 高度」分组，打印 markdown 表行（最后一列留空，
 *      由人来填「谁画、谁裁」——这一列是唯一必须人判的东西）；
 *   3. 顺带补齐两类容易漏的：splitContainers（页面级背景）的圆角要按 layer_id 回查该层元数据；
 *      半径 ≥ 短边一半的节点标出「圆形 / 胶囊」语义。
 *   4. 打印对账行「设计稿 borderRadius 节点数：N / 本表行数：M（…×c）」，
 *      N − M 自然等于 Σ(倍数 − 1)，门禁 scripts/check-ui-analysis.sh 会校这个算术。
 *
 * 说明: 表行按「圆角值 + 高」分；同一形状语义的几行可以自己合并成一行，合并后要同步改对账
 * 行的行数与合并列表（门禁会拦下对不上的算术）。
 *
 * 只读调用，写盘只写 dump 缓存（output/design/<layer>/）。
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

function usage(msg) {
  if (msg) console.error(`参数错误: ${msg}`)
  console.error('用法: node tools/radius-table.mjs --file <fileId> --layer <layerId> [--dump <dir>] [--offline]')
  process.exit(2)
}

const argv = process.argv.slice(2)
const opt = { offline: false }
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--file') opt.file = argv[++i]
  else if (a === '--layer') opt.layer = argv[++i]
  else if (a === '--dump') opt.dump = argv[++i]
  else if (a === '--offline') opt.offline = true
  else if (a === '-h' || a === '--help') usage()
  else usage(`未知参数 ${a}`)
}
if (!opt.file || !opt.layer) usage('--file 与 --layer 都是必填')

const DUMP = resolve(ROOT, opt.dump ?? join('output/design', opt.layer.replace(/:/g, '-')))

function callTool(tool, args) {
  const out = join(DUMP, '.tmp-call.txt')
  const r = spawnSync('node', ['tools/mcp-call.mjs', tool, JSON.stringify(args), out], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (r.status !== 0) {
    console.error(`✗ ${tool} 调用失败（dump 目录缺数据且无法取数）`)
    console.error((r.stdout || '').trim())
    console.error((r.stderr || '').trim())
    process.exit(1)
  }
  const data = JSON.parse(readFileSync(out, 'utf8'))
  rmSync(out, { force: true })
  return data
}

/** 本地有缓存就读缓存，没有才调 MCP 并把结果落盘，后续跑离线。 */
function ensure(relPath, tool, args) {
  const file = join(DUMP, relPath)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  if (opt.offline) {
    console.error(`✗ --offline 但缺缓存 ${relPath}；去掉 --offline 让它现取`)
    process.exit(1)
  }
  mkdirSync(DUMP, { recursive: true })
  const data = callTool(tool, args)
  writeFileSync(file, JSON.stringify(data, null, 1))
  return data
}

// ---- 取数 ----------------------------------------------------------------

const list = ensure('sections-list.txt', 'mcp__getDesignSections', {
  fileId: opt.file,
  layerId: opt.layer,
})
const total = list.totalSections ?? list.sections?.length ?? 0
if (!total) {
  console.error('✗ section 列表为空，检查 fileId / layerId')
  process.exit(1)
}

const dumps = []
for (let i = 0; i < total; i++) {
  dumps.push(
    ensure(`section-${i}.txt`, 'mcp__getDesignSections', {
      fileId: opt.file,
      layerId: opt.layer,
      sectionIndex: i,
    }),
  )
}

// ---- 收集节点 --------------------------------------------------------------

/** CSS 顺序展开成四角全写：TL TR BR BL。 */
function fourCorners(v) {
  const parts = String(v).trim().split(/\s+/)
  const [a, b = a, c = a, d = b] = parts
  return [a, b, c, d].join(' ')
}

function isRound(r) {
  const nums = String(r).replace(/px/g, '').trim().split(/\s+/).map(Number)
  return nums.some((n) => n >= 1e4) // 9999px 之类，按圆形处理
}

function radiusKind(r, w, h) {
  const nums = String(r).replace(/px/g, '').trim().split(/\s+/).map(Number).filter((n) => !isNaN(n))
  const short = Math.min(w, h)
  if (!short) return ''
  if (nums.some((n) => n >= short / 2 - 0.01)) {
    return nums.every((n) => n >= short / 2 - 0.01) && Math.abs(w - h) < 0.01 ? '圆形' : '胶囊 / 全圆角'
  }
  return ''
}

const nodes = []
function walk(n, styles) {
  const ls = n.layoutStyle ?? {}
  if (n.borderRadius) {
    const stroke = n.strokeColor
      ? `${n.strokeWidth ?? ''} ${n.strokeAlign ?? ''} ${
          styles?.[n.strokeColor]?.value?.join?.('/') ?? n.strokeColor
        }`.replace(/\s+/g, ' ').trim()
      : ''
    nodes.push({
      id: n.id,
      name: n.name ?? '',
      w: ls.width ?? 0,
      h: ls.height ?? 0,
      radius: fourCorners(n.borderRadius),
      stroke,
      inset: n.flexContainerInfo?.padding ?? '',
      src: 'section',
    })
  }
  for (const c of n.children ?? []) walk(c, styles)
}
for (const d of dumps) {
  const styles = d?.dsl?.styles ?? {}
  for (const n of d?.dsl?.nodes ?? []) walk(n, styles)
}

// 页面级背景（splitContainers）不在 section 节点里，列表项也没有圆角字段：
// 要拿同一个工具（getDesignSections）传 layerId=该层 id 再查一次，读它自己的 rootMetadata.borderRadius。
const splitNotes = []
for (const sc of list.splitContainers ?? []) {
  const meta = ensure(`split-${sc.id.replace(/:/g, '-')}.txt`, 'mcp__getDesignSections', {
    fileId: opt.file,
    layerId: sc.id,
  })
  const r = meta?.rootMetadata?.borderRadius
  if (r) {
    nodes.push({
      id: sc.id,
      name: sc.name ?? '',
      w: sc.width ?? 0,
      h: sc.height ?? 0,
      radius: fourCorners(r),
      stroke: '',
      inset: '',
      src: 'splitContainer',
    })
  } else {
    splitNotes.push(`${sc.id} ${sc.name ?? ''}`)
  }
}

// ---- 分组 + 打印 -----------------------------------------------------------

if (!nodes.length) {
  console.log('### 圆角 / 描边（逐元素，不按页写一个值）\n')
  console.log('| 元素（设计稿 id / name） | 圆角（四角全写） | 描边 / 内边距 | 谁画、谁裁 |')
  console.log('| --- | --- | --- | --- |')
  console.log('| 无 | — | — | 本页没有圆角元素 |\n')
  console.log('设计稿 borderRadius 节点数：0 / 本表行数：0')
  process.exit(0)
}

const groups = new Map()
for (const n of nodes) {
  const key = `${n.radius}|${Math.round(n.h * 10) / 10}`
  const g = groups.get(key) ?? { rows: [], radius: n.radius, h: n.h }
  g.rows.push(n)
  groups.set(key, g)
}
const sorted = [...groups.values()].sort(
  (a, b) => b.rows.length - a.rows.length || a.radius.localeCompare(b.radius) || b.h - a.h,
)

console.log('### 圆角 / 描边（逐元素，不按页写一个值）\n')
console.log('| 元素（设计稿 id / name） | 圆角（四角全写） | 描边 / 内边距 | 谁画、谁裁 |')
console.log('| --- | --- | --- | --- |')
for (const g of sorted) {
  const same = g.rows.every((r) => r.name === g.rows[0].name)
  const ids = [...new Set(g.rows.map((r) => r.id))]
  const names = [...new Set(g.rows.map((r) => r.name))]
  const sizes = [...new Set(g.rows.map((r) => `${round(r.w)}x${round(r.h)}`))]
  const kind = radiusKind(g.radius, g.rows[0].w, g.rows[0].h)
  const count = g.rows.length
  let label
  if (count === 1) {
    label = `${ids[0]} ${names[0]}`
  } else if (same) {
    label = `${ids[0]}…${ids[ids.length - 1]} ${names[0]} ×${count}`
  } else {
    label = `${ids[0]}…${ids[ids.length - 1]} ${names.join(' / ')} ×${count}`
  }
  if (sizes.length > 1) label += `（${sizes.join('、')}）`
  const stroke = g.rows.find((r) => r.stroke)?.stroke ?? '无'
  const inset = g.rows.find((r) => r.inset)?.inset ?? ''
  const note = kind ? `**${kind}**（${g.rows[0].w}×${g.rows[0].h} 上写 ${g.radius.split(' ')[0]}）` : ''
  console.log(
    `| ${label} | ${g.radius}${note ? ` ${note}` : ''} | ${stroke}${inset ? `；内边距 ${inset}` : ''} |  |`,
  )
}

const N = nodes.length
const M = sorted.length
const mergeList = sorted
  .filter((g) => g.rows.length > 1)
  .map((g) => {
    const names = [...new Set(g.rows.map((r) => r.name))]
    return `${names[0].length > 14 ? names[0].slice(0, 14) : names[0]} ×${g.rows.length}`
  })
  .join('、')
console.log(`\n设计稿 borderRadius 节点数：${N} / 本表行数：${M}${mergeList ? `（${mergeList}）` : ''}`)

const fromSection = nodes.filter((n) => n.src === 'section').length
const fromSplit = nodes.filter((n) => n.src === 'splitContainer').length
console.log(
  `\n（${N} = section DSL 里 ${fromSection} 条${fromSplit ? ` + splitContainers 按 layer_id 回查补 ${fromSplit} 条` : ''}）`,
)
if (splitNotes.length) console.log(`（以下 splitContainer 回查不到圆角，按需人工确认：${splitNotes.join('、')}）`)
console.log(
  '（同形状语义的行可自行合并；合并后要改对账行的行数与合并列表，门禁 scripts/check-ui-analysis.sh 会校算术。最后一列「谁画、谁裁」必须人判：背景圆角画在哪个 View 上、里面有没有铺满的子 View、靠什么裁。）',
)

function round(x) {
  return Math.round(x * 10) / 10
}
