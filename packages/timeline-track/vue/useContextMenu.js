/**
 * useContextMenu.js — 右键菜单控制器
 *
 * 模块级单例状态，由 ContextMenuPortal.vue 渲染（Teleport 到 body）。
 * 功能与 lib/contextmenu.js 兼容。
 *
 * @module vue/useContextMenu
 */

import { reactive } from 'vue'

const _state = reactive({
  visible: false,
  items: [],
  top: 0,
  left: 0,
  /** 源元素中心 X（viewport 坐标），用于 transform-origin 计算 */
  originX: 0,
  /** 源元素中心 Y（viewport 坐标） */
  originY: 0,
})

let _closeHandler = null
let _keyHandler = null

export function useContextMenu() {
  /**
   * @param {Array} items - 菜单项
   * @param {number} x - 屏幕 X
   * @param {number} y - 屏幕 Y
   * @param {Element} [originEl] - 源元素，transform-origin 设在该元素中心
   */
  function show(items, x, y, originEl) {
    hide()

    _state.items = items
    _state.left = x
    _state.top = y

    if (originEl) {
      const r = originEl.getBoundingClientRect()
      _state.originX = r.left + r.width / 2
      _state.originY = r.top  + r.height / 2
    } else {
      _state.originX = x
      _state.originY = y
    }

    _state.visible = true

    // 点击外部关闭
    _closeHandler = (e) => {
      const menuEl = document.querySelector('.tlc-context-menu')
      if (menuEl && !menuEl.contains(e.target)) hide()
    }
    requestAnimationFrame(() => {
      document.addEventListener('pointerdown', _closeHandler)
    })
    _keyHandler = (e) => { if (e.key === 'Escape') hide() }
    document.addEventListener('keydown', _keyHandler)
  }

  function hide() {
    const el = document.querySelector('.tlc-context-menu')
    if (el && _state.visible) {
      el.classList.remove('show')
      el.classList.add('closing')
      el.addEventListener('animationend', () => {
        el.classList.remove('closing')
        // 检查菜单是否已被重新展示（快速右键时 show() 可能已添加 .show）
        // 如果有 .show 说明 show() 已接管，不修改 visible 避免覆盖新菜单的状态
        if (!el.classList.contains('show')) {
          _state.visible = false
          _state.originX = 0
          _state.originY = 0
        }
      }, { once: true })
    } else {
      _state.visible = false
      _state.originX = 0
      _state.originY = 0
    }
    if (_closeHandler) {
      document.removeEventListener('pointerdown', _closeHandler)
      _closeHandler = null
    }
    if (_keyHandler) {
      document.removeEventListener('keydown', _keyHandler)
      _keyHandler = null
    }
  }

  return { state: _state, show, hide }
}
