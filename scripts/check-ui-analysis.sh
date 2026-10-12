#!/usr/bin/env bash
# 校验一份填写好的 UI 分析（templates/android-ui-analysis.md 的实例）是否可用于开工。
# 用法: check-ui-analysis.sh <分析文档>
# 退出码: 0 完整可用 / 1 有缺口 / 2 用法错误
# 判定: 五个分析小节都至少有 1 行填了内容，且全文没有待定标记。
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
  if (bad) { print "结论: 分析未完成，不要开始写布局或代码"; exit 1 }
  print "结论: 五个小节均有内容，可以开工"
}' "$file" || exit 1

if grep -nE '^\|.*(待定|TBD|TODO|\?\?\?|xxx)' "$file" >/dev/null; then
  echo "待定标记出现在表格里:"
  grep -nE '^\|.*(待定|TBD|TODO|\?\?\?|xxx)' "$file"
  exit 1
fi
