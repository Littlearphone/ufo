/**
 * 事件日志响应式 store
 */

import { reactive } from 'vue'

/** 日志条目结构（响应式数组，直接导出供模板绑定） */
export const logLines = reactive([])

const MAX_LOG = 80

/**
 * 添加一条日志
 * @param {'create'|'change'|'changed'|'deleted'|'track-add'|'track-del'|'dir'|'axis-mode'|'api'|'gen'} kind
 * @param {string|object} detail
 */
export function addLog(kind, detail) {
  const now = new Date()
  const ts = now.toTimeString().slice(0, 8)
  let msg = ''
  switch (kind) {
    case 'create':
      msg = `创建: ${fmt(detail.start)} – ${fmt(detail.end)}`
      break
    case 'change':
      msg = `拖动中: ${fmt(detail.start)} – ${fmt(detail.end)}`
      break
    case 'changed':
      msg = `拖动完成: ${fmt(detail.start)} – ${fmt(detail.end)}`
      break
    case 'deleted':
      msg = `删除: ${fmt(detail.start)} – ${fmt(detail.end)}`
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
  }
  logLines.push({ ts, kind, msg })
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

function fmt(v) {
  return (typeof v === 'number' ? v.toFixed(2) : v) + 'h'
}
