/**
 * 事件日志响应式 store
 */

import { reactive } from 'vue'

/** 日志条目结构（响应式数组，直接导出供模板绑定） */
export const logLines = reactive([])

const MAX_LOG = 80

/**
 * 添加一条日志
 * @param {'create'|'change'|'changed'|'deleted'|'track-add'|'track-del'|'dir'|'axis-mode'|'api'|'gen'|'limit'} kind
 * @param {string|object} detail
 * @param {string} [result] - 可选的操作结果/返回值（仅 API 类使用）
 */
export function addLog(kind, detail, result) {
  const now = new Date()
  const ts = now.toTimeString().slice(0, 8)
  let msg = ''
  switch (kind) {
    case 'create':
      msg = `创建: ${rangeStr(detail)}`
      break
    case 'change':
      msg = `拖动中: ${rangeStr(detail)}`
      break
    case 'changed':
      msg = `拖动完成: ${rangeStr(detail)}`
      break
    case 'deleted':
      msg = `删除: ${rangeStr(detail)}`
      break
    case 'track-add':
      msg = `添加轨道: ${detail}`
      break
    case 'track-del':
      msg = `删除轨道: ${detail}`
      break
    case 'dir':
      msg = `切换方向: ${detail}`
      break
    case 'axis-mode':
      msg = `轴模式: ${detail === 'shared' ? '共享轴' : '独立轴'}`
      break
    case 'api':
      msg = `API: ${detail}`
      break
    case 'gen':
      msg = `生成数据: ${detail}`
      break
    case 'limit':
      msg = `⚠ 达上限: ${typeof detail === 'string' ? detail : '轨道已达 ' + detail.current + '/' + detail.max + ' 段'}`
      break
  }
  logLines.push({ ts, kind, msg, result })
  if (logLines.length > MAX_LOG) logLines.shift()
}

/** 清空日志 */
export function clearLog() {
  logLines.splice(0)
}

/** 获取日志（响应式） */
export function useLog() {
  return { logLines, addLog, clearLog }
}

/** 格式化段的时间范围显示 —— 优先使用事件 detail 中的 formatter 字段，否则回退到数值 */
function rangeStr(detail) {
  if (detail.startFormatted != null && detail.endFormatted != null) {
    return detail.startFormatted + ' – ' + detail.endFormatted
  }
  // detail 可能是 segment DOM 元素（create 事件），使用其 start/end getter
  const s = detail.start ?? detail.startSeconds
  const e = detail.end ?? detail.endSeconds
  return (typeof s === 'number' ? String(Math.round(s)) : s) + ' – ' + (typeof e === 'number' ? String(Math.round(e)) : e)
}
