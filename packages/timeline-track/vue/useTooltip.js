/**
 * useTooltip.js — 全局 Tooltip 控制器
 *
 * 模块级单例状态，与 lib/tooltip.js 兼容。
 * 全局 tooltip DOM 由 TooltipPortal.vue 渲染（Teleport 到 body）。
 *
 * @module vue/useTooltip
 */

import { reactive } from 'vue'

/** 模块级单例状态 */
const _state = reactive({
  visible: false,
  label: '',
  timeText: '',
  top: 0,
  left: 0,
  posClass: 'top-center',
  arrowStyle: {},
})

let _hideTimer = null

/**
 * 使用全局 Tooltip
 * 返回 show/hide 方法 + 响应式 state
 */
export function useTooltip() {
  /**
   * 显示 tooltip
   * @param {object} opts
   * @param {string} [opts.label]
   * @param {string} opts.timeText
   * @param {DOMRect} opts.rect - 段元素的 getBoundingClientRect
   * @param {string} [opts.pos='top-center']
   */
  function show(opts) {
    const { label, timeText, rect, pos = 'top-center' } = opts
    clearTimeout(_hideTimer)

    if (!rect || (!rect.width && !rect.height)) return

    const parts = pos.split('-')
    const side = parts[0] || 'top'
    const align = parts[1] || 'center'

    _state.label = label || ''
    _state.timeText = timeText

    // 计算位置（直接计算，无需 nextTick 等待 DOM）
    const gap = 6
    const MARGIN = 8
    const vpW = window.innerWidth
    const vpH = window.innerHeight

    // 先假设 tooltip 尺寸为 200×60（实际在显示后修正，但初步定位用）
    // 使用 requestAnimationFrame 二次校正
    let tipW = 200
    let tipH = 60
    let left = 0, top = 0
    const arrowStyle = {}

    // 第一次定位使用估算值
    switch (side) {
      case 'top':
        top = rect.top - tipH - gap
        if (align === 'start') { left = rect.left; arrowStyle['--tlc-arrow-left'] = '12px' }
        else if (align === 'end') { left = rect.right - tipW; arrowStyle['--tlc-arrow-left'] = 'calc(100% - 12px)' }
        else { left = rect.left + rect.width / 2 - tipW / 2 }
        left = clamp(left, MARGIN, vpW - tipW - MARGIN)
        break
      case 'bottom':
        top = rect.bottom + gap
        if (align === 'start') { left = rect.left; arrowStyle['--tlc-arrow-left'] = '12px' }
        else if (align === 'end') { left = rect.right - tipW; arrowStyle['--tlc-arrow-left'] = 'calc(100% - 12px)' }
        else { left = rect.left + rect.width / 2 - tipW / 2 }
        left = clamp(left, MARGIN, vpW - tipW - MARGIN)
        break
      case 'left':
        left = rect.left - tipW - gap
        if (align === 'start') { top = rect.top; arrowStyle['--tlc-arrow-top'] = '12px' }
        else if (align === 'end') { top = rect.bottom - tipH; arrowStyle['--tlc-arrow-top'] = 'calc(100% - 12px)' }
        else { top = rect.top + rect.height / 2 - tipH / 2 }
        top = clamp(top, MARGIN, vpH - tipH - MARGIN)
        break
      case 'right':
        left = rect.right + gap
        if (align === 'start') { top = rect.top; arrowStyle['--tlc-arrow-top'] = '12px' }
        else if (align === 'end') { top = rect.bottom - tipH; arrowStyle['--tlc-arrow-top'] = 'calc(100% - 12px)' }
        else { top = rect.top + rect.height / 2 - tipH / 2 }
        top = clamp(top, MARGIN, vpH - tipH - MARGIN)
        break
    }

    // 设为可见
    _state.visible = true
    _state.posClass = `${side}-${align}`
    _state.arrowStyle = arrowStyle
    _state.top = top
    _state.left = left

    // 二次校正：等 DOM 渲染后用真实尺寸重新定位
    requestAnimationFrame(() => {
      const tipEl = document.querySelector('.tls-global-tip')
      if (!tipEl || !_state.visible) return
      const tr = tipEl.getBoundingClientRect()
      if (tr.width > 0) {
        tipW = tr.width
        tipH = tr.height
        let correctedLeft = left
        let correctedTop = top
        switch (side) {
          case 'top':
            correctedTop = rect.top - tipH - gap
            if (align === 'center') correctedLeft = rect.left + rect.width / 2 - tipW / 2
            else if (align === 'end') correctedLeft = rect.right - tipW
            correctedLeft = clamp(correctedLeft, MARGIN, vpW - tipW - MARGIN)
            break
          case 'bottom':
            correctedTop = rect.bottom + gap
            if (align === 'center') correctedLeft = rect.left + rect.width / 2 - tipW / 2
            else if (align === 'end') correctedLeft = rect.right - tipW
            correctedLeft = clamp(correctedLeft, MARGIN, vpW - tipW - MARGIN)
            break
          case 'left':
            correctedLeft = rect.left - tipW - gap
            if (align === 'center') correctedTop = rect.top + rect.height / 2 - tipH / 2
            else if (align === 'end') correctedTop = rect.bottom - tipH
            correctedTop = clamp(correctedTop, MARGIN, vpH - tipH - MARGIN)
            break
          case 'right':
            correctedLeft = rect.right + gap
            if (align === 'center') correctedTop = rect.top + rect.height / 2 - tipH / 2
            else if (align === 'end') correctedTop = rect.bottom - tipH
            correctedTop = clamp(correctedTop, MARGIN, vpH - tipH - MARGIN)
            break
        }
        _state.top = correctedTop
        _state.left = correctedLeft
      }
    })
  }

  function hide() {
    clearTimeout(_hideTimer)
    _hideTimer = setTimeout(() => {
      _state.visible = false
    }, 120)
  }

  return { state: _state, show, hide }
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}
