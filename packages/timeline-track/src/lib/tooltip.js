/**
 * 全局 Tooltip Portal
 * 将 tooltip DOM 追加到 document.body 并使用 position:fixed，避免祖先 overflow 裁剪
 * @module tooltip
 */

import { clamp, esc, fmtTime } from './utils.js'

let _globalTip = null

/** 获取/创建全局 tooltip 元素 */
function _getGlobalTip() {
  if (_globalTip) return _globalTip
  _globalTip = document.createElement('div')
  _globalTip.className = 'tls-global-tip'
  document.body.appendChild(_globalTip)
  return _globalTip
}

let _tipHideTimer = 0

/**
 * 显示 tooltip（根据段的位置和配置自动定位）
 * @param {HTMLElement} seg - time-line-segment 元素
 */
export function showGlobalTip(seg) {
  clearTimeout(_tipHideTimer)
  const tip = _getGlobalTip()
  const segRect = seg.getBoundingClientRect()

  // 读取 tooltip 位置配置：段自身的 tooltip-pos 属性优先，否则取容器配置
  let side = 'top', align = 'center'
  const segPos = seg.getAttribute('tooltip-pos')
  if (segPos) {
    const parts = segPos.split('-')
    if (['top', 'bottom', 'left', 'right'].includes(parts[0])) side = parts[0]
    if (['start', 'center', 'end'].includes(parts[1])) align = parts[1]
  } else {
    const c = seg.closest('time-line-container')
    if (c) {
      const pos = (c.tooltipPos || 'top-center').split('-')
      side = pos[0] || 'top'
      align = pos[1] || 'center'
    }
  }

  tip.innerHTML =
    `<div class="tls-global-tip-label">${esc(seg.label) || '未命名'}</div>
     <div class="tls-global-tip-time">${fmtTime(seg.start)} – ${fmtTime(seg.end)}</div>`

  // 重置样式和类
  tip.className = 'tls-global-tip'
  tip.classList.add(side, align)
  tip.style.removeProperty('--tlc-arrow-left')
  tip.style.removeProperty('--tlc-arrow-top')

  // 先放到屏幕外测量 tooltip 尺寸
  tip.style.left = '-9999px'
  tip.style.top = '-9999px'
  const tipRect = tip.getBoundingClientRect()
  const tipW = tipRect.width
  const tipH = tipRect.height

  const gap = 6
  const MARGIN = 8
  const vpW = window.innerWidth
  const vpH = window.innerHeight

  let left, top

  switch (side) {
    case 'top':
      top = segRect.top - tipH - gap
      if (align === 'start') {
        left = segRect.left
        tip.style.setProperty('--tlc-arrow-left', '12px')
      } else if (align === 'end') {
        left = segRect.right - tipW
        tip.style.setProperty('--tlc-arrow-left', 'calc(100% - 12px)')
      } else {
        left = segRect.left + segRect.width / 2 - tipW / 2
      }
      left = clamp(left, MARGIN, vpW - tipW - MARGIN)
      break
    case 'bottom':
      top = segRect.bottom + gap
      if (align === 'start') {
        left = segRect.left
        tip.style.setProperty('--tlc-arrow-left', '12px')
      } else if (align === 'end') {
        left = segRect.right - tipW
        tip.style.setProperty('--tlc-arrow-left', 'calc(100% - 12px)')
      } else {
        left = segRect.left + segRect.width / 2 - tipW / 2
      }
      left = clamp(left, MARGIN, vpW - tipW - MARGIN)
      break
    case 'left':
      left = segRect.left - tipW - gap
      if (align === 'start') {
        top = segRect.top
        tip.style.setProperty('--tlc-arrow-top', '12px')
      } else if (align === 'end') {
        top = segRect.bottom - tipH
        tip.style.setProperty('--tlc-arrow-top', 'calc(100% - 12px)')
      } else {
        top = segRect.top + segRect.height / 2 - tipH / 2
      }
      top = clamp(top, MARGIN, vpH - tipH - MARGIN)
      break
    case 'right':
      left = segRect.right + gap
      if (align === 'start') {
        top = segRect.top
        tip.style.setProperty('--tlc-arrow-top', '12px')
      } else if (align === 'end') {
        top = segRect.bottom - tipH
        tip.style.setProperty('--tlc-arrow-top', 'calc(100% - 12px)')
      } else {
        top = segRect.top + segRect.height / 2 - tipH / 2
      }
      top = clamp(top, MARGIN, vpH - tipH - MARGIN)
      break
  }

  tip.style.left = left + 'px'
  tip.style.top = top + 'px'
  tip.classList.add('show')
}

/** 隐藏 tooltip（带延迟防抖） */
export function hideGlobalTip() {
  _tipHideTimer = setTimeout(() => {
    const tip = _getGlobalTip()
    tip.classList.remove('show')
  }, 120)
}
