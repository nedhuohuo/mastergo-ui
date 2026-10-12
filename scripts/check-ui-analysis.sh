#!/usr/bin/env bash
# 校验一份填写好的 UI 分析（templates/android-ui-analysis.md 的实例）是否可用于开工。
# 用法: check-ui-analysis.sh <分析文档>
# 退出码: 0 完整可用 / 1 有缺口 / 2 用法错误
# 判定: 五个分析小节都至少有 1 行填了内容；LayoutSpec 含「行内对齐」行且非空；
# LayoutSpec 含「圆角 / 描边（逐元素）」表（表头含「元素」和「谁画、谁裁」、每行都填了后者），
# 并写下「borderRadius 节点数：N / 本表行数：M」且 N − M = 合并列表的 Σ(倍数 − 1)；全文没有待定标记。
set -uo pipefail

file=${1:-}
if [ -z "$file" ] || [ ! -f "$file" ]; then
  echo "用法: $0 <填写好的分析文档>" >&2
  exit 2
fi

awk -v doc="$file" '
function trim(s) { gsub(/^[ \t]+|[ \t]+$/, "", s); return s }
function issep(r) { return (r ~ /-/) && (r !~ /[^-|: ]/) }   # 只有 -、:、|、空格且有短横
BEGIN {
  split("PageStructure ComponentMap ResourceMap LayoutSpec StateSpec", want, " ")
  for (i in want) need[want[i]] = 1
}
/^## / {
  sec = ""
  for (n in need) {
    # 小节标题形如 "## 2. ComponentMap"
    if ($0 ~ ("^## [0-9]+\\. " n "$")) sec = n
  }
  next
}
sec == "" { next }
{ lines[sec] = lines[sec] $0 "\n" }
END {
  bad = 0
  for (n in need) {
    body = lines[n]
    if (body == "") { print "缺失小节: " n; bad = 1; continue }
    # 表格数据行: 以 | 开头，跳过表头和 |---|---| 分隔行
    cnt = split(body, rows, "\n")
    t = 0
    for (i = 1; i <= cnt; i++) {
      r = trim(rows[i])
      if (r ~ /^\|/) { t++; tbl[t] = r }
    }
    filled = 0
    for (i = 1; i <= t; i++) {
      if (issep(tbl[i])) continue                    # 分隔行
      if (i + 1 <= t && issep(tbl[i + 1])) continue  # 表头行 = 分隔行的上一行
      nc = split(tbl[i], cells, "|")
      for (j = 3; j < nc; j++) {                     # 第 1 列是行标签，从第 2 个数据列起判空
        if (trim(cells[j]) != "") filled = 1
      }
      if (filled) break
    }
    if (!filled) { print "小节无内容: " n; bad = 1 }
  }
  # 圆角/描边必须逐元素列：写成页面级一个值时，嵌在另一块里的第二个圆角不会被列出来（门禁也放它过去）。
  rcnt = split(lines["LayoutSpec"], rrows, "\n")
  header = 0; data = 0; empty = ""; cline = ""
  for (ri = 1; ri <= rcnt; ri++) {
    r = trim(rrows[ri])
    if (r ~ /borderRadius/ && r ~ /节点数/ && r ~ /行数/ && cline == "") cline = r
    if (r !~ /^\|/) continue
    if (r ~ /元素/ && r ~ /(谁画|谁裁)/) { header = 1; continue }
    if (!header || issep(r)) continue
    nc = split(r, rcells, "|")
    label = trim(rcells[2]); lastc = trim(rcells[nc - 1])
    if (label == "" && lastc == "") continue
    data++
    if (lastc == "") empty = empty "「" label "」"
  }
  if (!header) {
    print "LayoutSpec 缺「圆角 / 描边（逐元素）」表：表头要含「元素」和「谁画、谁裁」"
    bad = 1
  } else if (data == 0) {
    print "LayoutSpec 的逐元素圆角表没有数据行（本页确实没有圆角元素就写「无」）"
    bad = 1
  } else if (empty != "") {
    print "逐元素圆角表有行没写「谁画、谁裁」: " empty
    bad = 1
  }
  # 圆角对账：N − M 是“被合并掉的行数”，必须等于合并列表里的 Σ(倍数 − 1)。
  # 外块写了 4px、内块同值 4px 写成纯色时，表里会少一行而 N 不变，这里差值就对不上。
  if (cline == "") {
    print "LayoutSpec 缺圆角对账行：要写「设计稿 borderRadius 节点数：N / 本表行数：M」，先数 DSL 条数再建行"
    bad = 1
  } else {
    N = -1; M = -1
    if (match(cline, /节点数[^0-9]*[0-9]+/)) { seg = substr(cline, RSTART, RLENGTH); if (match(seg, /[0-9]+/)) N = substr(seg, RSTART, RLENGTH) + 0 }
    if (match(cline, /行数[^0-9]*[0-9]+/)) { seg = substr(cline, RSTART, RLENGTH); if (match(seg, /[0-9]+/)) M = substr(seg, RSTART, RLENGTH) + 0 }
    merge = 0; tail = ""
    if (match(cline, /行数[^0-9]*[0-9]+/)) tail = substr(cline, RSTART + RLENGTH)
    while (match(tail, /[0-9]+/)) {   # 合并列表里的倍数（只扫数字，不跟多字节 × 扯上）
      merge += (substr(tail, RSTART, RLENGTH) + 0) - 1
      tail = substr(tail, RSTART + RLENGTH)
    }
    if (N < 0 || M < 0) {
      print "圆角对账行要同时写两个数字：节点数 N / 本表行数 M"
      bad = 1
    } else if (N < M) {
      print "圆角对账不成立：表行数 " M " 多于 borderRadius 节点数 " N
      bad = 1
    } else if (data != M) {
      print "圆角对账不成立：本表实际 " data " 行，对账行写的是 " M " 行"
      bad = 1
    } else if (N - M != merge) {
      print "圆角对账不成立：节点数 " N " − 行数 " M " = " (N - M) "，合并列表只解释了 " merge " 个；对不上的节点既没单独占行也没被合并计数，就是漏行（嵌套在另一块里的圆角最常这样丢）"
      bad = 1
    }
  }
  if (bad) { print "结论: 分析未完成，不要开始写布局或代码"; exit 1 }
  print "结论: 五个小节均有内容，可以开工"
}' "$file" || exit 1

# LayoutSpec 的行内对齐必须按行写（真的没有卡内行就写「无」）。
# 只校验区块高/行距时，卡内文字位置能整片错过去（实例见 SKILL.md 完成标准）。
for label in 行内对齐; do
  if ! grep -qE "^\|[[:space:]]*${label}[^|]*\|[[:space:]]*[^|[:space:]]" "$file"; then
    echo "LayoutSpec 缺行或空值: ${label}（卡内每一行的行内对齐必须写，没有就写「无」）"
    exit 1
  fi
done

# 圆角对账的算术部分在 awk 里（同一个小节范围内取对账行，避免多语言环境下的取数问题）。

if grep -nE '^\|.*(待定|TBD|TODO|\?\?\?|xxx)' "$file" >/dev/null; then
  echo "待定标记出现在表格里:"
  grep -nE '^\|.*(待定|TBD|TODO|\?\?\?|xxx)' "$file"
  exit 1
fi
