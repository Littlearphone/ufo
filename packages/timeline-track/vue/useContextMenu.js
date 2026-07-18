/**
 * useContextMenu.js — 右键菜单控制器
 *
 * 模块级单例状态，由 ContextMenuPortal.vue 渲染（Teleport 到 body）。
 * 功能与 lib/contextmenu.js 兼容。
 *
 * @module vue/useContextMenu
 */

import { reactive } from 'vue'

/**
 * @typedef {object} ContextMenuItem
 * @property {string} [label] - 显示文字
 * @property {'header'|'divider'} [type] - 特殊类型
 * @property {boolean} [danger] - 是否危险操作
 * @property {Function} [action] - 点击回调
 */

const _state = reactive({
  visible: false,
  items: [],
  top: 0,
  left: 0,
})

let _closeHandler = null
let _keyHandler = null

/**
 * 使用右键菜单
 */
export function useContextMenu() {
  function show(items, x, y) {
    // 关闭已有的
    hide()

    _state.items = items
    _state.visible = true

    // 定位（由 portal 在 nextTick 后修正边界）
    _state.left = x
    _state.top = y

    // 点击外部关闭
    _closeHandler = (e) => {
      const menuEl = document.querySelector('.tlc-context-menu')
      if (menuEl && !menuEl.contains(e.target)) {
        hide()
      }
    }
    requestAnimationFrame(() => {
      document.addEventListener('pointerdown', _closeHandler)
    })

    // Escape 关闭
    _keyHandler = (e) => {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', _keyHandler)
  }

  function hide() {
    _state.visible = false
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
