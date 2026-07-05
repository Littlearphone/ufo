/**
 * 右键菜单与编辑弹窗系统
 * 提供 ContextMenu（右键菜单）、编辑属性模态框、删除确认框
 * @module contextmenu
 */

import { esc } from './utils.js'
import { resolveLocale } from './locale.js'

/* ============================ CSS ============================ */

const POPUP_CSS = /* css */ `
/* ── Context Menu ── */
.tlc-context-menu {
  position: fixed;
  z-index: 100000;
  background: #fff;
  border: 1px solid #dfe3e8;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0,0,0,.14);
  padding: 4px 0;
  min-width: 148px;
  opacity: 0;
  transform-origin: top left;
  transform: scale(0.92);
  transition: opacity .1s ease, transform .1s ease;
  pointer-events: none;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size: 12px;
  user-select: none;
}
.tlc-context-menu.show {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.tlc-context-item {
  padding: 7px 14px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background .09s;
  white-space: nowrap;
}
.tlc-context-item:hover {
  background: #f0f2f5;
}
.tlc-context-item:active {
  background: #e5e8ec;
}
.tlc-context-item-danger {
  color: #e53935;
}
.tlc-context-item-danger:hover {
  background: #fbe9e7;
}
.tlc-context-item-danger:active {
  background: #f5d0cc;
}
.tlc-context-divider {
  height: 1px;
  background: #e8eaed;
  margin: 4px 0;
}

/* ── Modal Overlay ── */
.tlc-modal-overlay {
  position: fixed;
  z-index: 100001;
  inset: 0;
  background: rgba(0,0,0,.32);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .18s ease;
  pointer-events: none;
}
.tlc-modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* ── Modal Card ── */
.tlc-modal {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  min-width: 300px;
  max-width: 420px;
  width: 90vw;
  transform: scale(0.94) translateY(8px);
  transition: transform .18s ease;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size: 13px;
  color: #333;
}
.tlc-modal-overlay.show .tlc-modal {
  transform: scale(1) translateY(0);
}
.tlc-modal-header {
  padding: 14px 18px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
.tlc-modal-body {
  padding: 8px 18px 14px;
}
.tlc-modal-body label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #555;
}
.tlc-modal-body label > span {
  min-width: 56px;
  flex-shrink: 0;
  text-align: right;
  color: #666;
}
.tlc-modal-body input {
  flex: 1;
  padding: 5px 9px;
  border: 1px solid #d0d4da;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
}
.tlc-modal-body input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-modal-body input[type="color"] {
  min-height: 30px;
  padding: 2px 3px;
  cursor: pointer;
  flex: 0 0 48px;
}
.tlc-modal-body p {
  margin: 4px 0;
  font-size: 13px;
  color: #444;
  line-height: 1.5;
}
.tlc-modal-body .tlc-modal-hint {
  font-size: 11px;
  color: #999;
  margin-top: -4px;
  margin-bottom: 8px;
}
.tlc-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 18px 14px;
}
.tlc-btn {
  padding: 6px 18px;
  border: 1px solid #d0d4da;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background .09s, border-color .09s;
  color: #444;
}
.tlc-btn:hover {
  background: #f5f6f8;
  border-color: #c0c5cc;
}
.tlc-btn:active {
  background: #e8eaed;
}
.tlc-btn-primary {
  background: #4285f4;
  color: #fff;
  border-color: #4285f4;
}
.tlc-btn-primary:hover {
  background: #3b78e7;
  border-color: #3b78e7;
}
.tlc-btn-primary:active {
  background: #3367d6;
}
.tlc-btn-danger {
  background: #e53935;
  color: #fff;
  border-color: #e53935;
}
.tlc-btn-danger:hover {
  background: #d32f2f;
  border-color: #d32f2f;
}
.tlc-btn-danger:active {
  background: #c62828;
}
`

/* ============================ STATE ============================ */

let _cssDone = false
let _menuEl = null
let _overlay = null
let _modalEl = null
let _closeHandler = null
let _keyHandler = null

/* ============================ CSS INJECTION ============================ */

function injectCSS() {
  if (_cssDone) return
  const s = document.createElement('style')
  s.textContent = POPUP_CSS
  document.head.appendChild(s)
  _cssDone = true
}

/* ============================ CLOSE ALL ============================ */

/**
 * 关闭所有弹出层（右键菜单 + 模态框）
 */
export function closeAll() {
  hideContextMenu()
  closeModal()
}

/* ============================ CONTEXT MENU ============================ */

/**
 * 显示右键菜单
 * @param {Array<{label?:string, type?:string, danger?:boolean, action?:Function}>} items - 菜单项
 * @param {number} x - 屏幕 X 坐标
 * @param {number} y - 屏幕 Y 坐标
 */
export function showContextMenu(items, x, y) {
  closeAll()
  injectCSS()

  if (!_menuEl) {
    _menuEl = document.createElement('div')
    _menuEl.className = 'tlc-context-menu'
    document.body.appendChild(_menuEl)
  }

  // 渲染菜单项
  _menuEl.innerHTML = items.map((item, i) => {
    if (item.type === 'divider') return '<div class="tlc-context-divider"></div>'
    const cls = ['tlc-context-item']
    if (item.danger) cls.push('tlc-context-item-danger')
    return `<div class="${cls.join(' ')}" data-idx="${i}">${esc(item.label)}</div>`
  }).join('')

  // 菜单项点击处理
  _menuEl.addEventListener('click', (e) => {
    const itemEl = e.target.closest('.tlc-context-item')
    if (!itemEl) return
    const idx = parseInt(itemEl.dataset.idx, 10)
    const item = items[idx]
    if (item && item.action) item.action()
    hideContextMenu()
  })

  // 布局后再定位，确保获取正确尺寸
  requestAnimationFrame(() => {
    const mw = _menuEl.offsetWidth || 160
    const mh = _menuEl.offsetHeight || 40
    const vw = window.innerWidth
    const vh = window.innerHeight
    // 尽可能保持在视口内
    const left = Math.max(8, Math.min(x, vw - mw - 8))
    const top  = Math.max(8, Math.min(y, vh - mh - 8))
    _menuEl.style.left = left + 'px'
    _menuEl.style.top  = top  + 'px'
    _menuEl.classList.add('show')
  })

  // 点击外部关闭
  _closeHandler = (e) => {
    if (_menuEl && !_menuEl.contains(e.target)) {
      hideContextMenu()
    }
  }
  // 延迟添加避免本次右键直接触发关闭
  requestAnimationFrame(() => {
    document.addEventListener('pointerdown', _closeHandler)
  })

  // Escape 键关闭
  _keyHandler = (e) => {
    if (e.key === 'Escape') hideContextMenu()
  }
  document.addEventListener('keydown', _keyHandler)
}

/**
 * 隐藏右键菜单
 */
export function hideContextMenu() {
  if (_menuEl) {
    _menuEl.classList.remove('show')
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

/* ============================ MODAL ============================ */

/** 获取/创建模态框遮罩层 */
function _getOverlay() {
  if (!_overlay) {
    _overlay = document.createElement('div')
    _overlay.className = 'tlc-modal-overlay'
    document.body.appendChild(_overlay)
    // 点击遮罩背景关闭
    _overlay.addEventListener('click', (e) => {
      if (e.target === _overlay) closeModal()
    })
  }
  return _overlay
}

/** 获取模态框主体元素 */
function _getModal() {
  if (!_modalEl) {
    _modalEl = document.createElement('div')
    _modalEl.className = 'tlc-modal'
    // 模态框内部键盘事件
    _modalEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const confirmBtn = _modalEl.querySelector('[data-action="confirm"]')
        if (confirmBtn) confirmBtn.click()
      }
    })
  }
  return _modalEl
}

/** 显示模态框 */
function _showModal() {
  hideContextMenu()
  const overlay = _getOverlay()
  const modal = _getModal()
  overlay.appendChild(modal)
  // 触发过渡动画
  requestAnimationFrame(() => {
    overlay.classList.add('show')
  })
  // 自动聚焦第一个输入框
  const firstInput = modal.querySelector('input:not([type="color"])')
  if (firstInput) setTimeout(() => firstInput.focus(), 120)
}

/**
 * 关闭模态框
 */
export function closeModal() {
  if (_overlay) {
    _overlay.classList.remove('show')
    if (_modalEl && _modalEl.parentNode === _overlay) {
      _overlay.removeChild(_modalEl)
    }
  }
}

/* ============================ SEGMENT EDIT DIALOG ============================ */

/**
 * 显示时间段属性编辑框
 * @param {import('./TimeSegment.js').TimeSegment} segment
 */
export function showSegmentEditDialog(segment) {
  injectCSS()
  const loc = resolveLocale(segment)
  const fmt = segment._formatter
  const modal = _getModal()
  const sAttrs = fmt.inputAttrs(segment.start)
  const eAttrs = fmt.inputAttrs(segment.end)
  modal.innerHTML = `
    <div class="tlc-modal-header">${esc(loc.segmentEditTitle)}</div>
    <div class="tlc-modal-body">
      <label><span>${esc(loc.labelField)}</span><input name="label" type="text" value="${esc(segment.label)}"></label>
      <label><span>${esc(loc.startTime)}</span><input name="start" type="${sAttrs.type}"${sAttrs.step ? ` step="${sAttrs.step}"` : ''} value="${esc(sAttrs.value)}"></label>
      <label><span>${esc(loc.endTime)}</span><input name="end" type="${eAttrs.type}"${eAttrs.step ? ` step="${eAttrs.step}"` : ''} value="${esc(eAttrs.value)}"></label>
      <label><span>${esc(loc.color)}</span><input name="color" type="color" value="${segment.color}"></label>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${esc(loc.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${esc(loc.confirm)}</button>
    </div>`

  _showModal()

  // 取消
  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal)
  // 确定
  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    const inputs = modal.querySelectorAll('input[name]')
    const vals = {}
    inputs.forEach(inp => { vals[inp.name] = inp.value })

    const start = fmt.parse(vals.start)
    const end   = fmt.parse(vals.end)
    if (isNaN(start) || isNaN(end) || start >= end) return // 不合法则不处理

    segment.label = vals.label
    segment.start = start
    segment.end   = end
    segment.color = vals.color

    closeModal()
  })
}

/* ============================ TRACK EDIT DIALOG ============================ */

/**
 * 显示轨道属性编辑框
 * @param {import('./TimeTrack.js').TimeTrack} track
 */
export function showTrackEditDialog(track) {
  injectCSS()
  const loc = resolveLocale(track)
  const fmt = track._formatter
  const modal = _getModal()
  const sAttrs = fmt.inputAttrs(track.tStart)
  const eAttrs = fmt.inputAttrs(track.tEnd)
  modal.innerHTML = `
    <div class="tlc-modal-header">${esc(loc.trackEditTitle)}</div>
    <div class="tlc-modal-body">
      <label><span>${esc(loc.name)}</span><input name="label" type="text" value="${esc(track.label)}"></label>
      <label><span>${esc(loc.startTime)}</span><input name="start" type="${sAttrs.type}"${sAttrs.step ? ` step="${sAttrs.step}"` : ''} value="${esc(sAttrs.value)}"></label>
      <label><span>${esc(loc.endTime)}</span><input name="end" type="${eAttrs.type}"${eAttrs.step ? ` step="${eAttrs.step}"` : ''} value="${esc(eAttrs.value)}"></label>
      <label><span>${esc(loc.step)}</span><input name="step" type="text" value="${track.step}"></label>
      <label><span>${esc(loc.maxSegmentsField)}</span><input name="maxSegments" type="number" step="1" min="0" placeholder="${esc(loc.zeroUnlimited)}" value="${track.maxSegments || ''}"></label>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${esc(loc.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${esc(loc.confirm)}</button>
    </div>`

  _showModal()

  // 取消
  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal)
  // 确定
  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    const inputs = modal.querySelectorAll('input[name]')
    const vals = {}
    inputs.forEach(inp => { vals[inp.name] = inp.value })

    const start  = fmt.parse(vals.start)
    const end    = fmt.parse(vals.end)
    const step   = fmt.parse(vals.step)
    const maxSeg = parseInt(vals.maxSegments, 10)

    if (isNaN(start) || isNaN(end) || start >= end) return

    track.label = vals.label
    track.setAttribute('start', String(start))
    track.setAttribute('end',   String(end))
    track.step = (!isNaN(step) && step > 0) ? step : 0

    if (!isNaN(maxSeg) && maxSeg > 0) {
      track.maxSegments = maxSeg
    } else {
      track.removeAttribute('max-segments')
    }

    closeModal()
  })
}

/* ============================ DELETE CONFIRMATION ============================ */

/**
 * 显示删除确认框
 * @param {string} message - 确认提示文字
 * @param {Function} [onConfirm] - 确认后的回调
 * @param {Element} [refEl] - 参考元素（用于解析 locale，可选）
 */
export function showDeleteConfirm(message, onConfirm, refEl) {
  injectCSS()
  const loc = resolveLocale(refEl)
  const modal = _getModal()
  modal.innerHTML = `
    <div class="tlc-modal-header">${esc(loc.confirmDeleteTitle)}</div>
    <div class="tlc-modal-body">
      <p>${esc(message)}</p>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${esc(loc.cancel)}</button>
      <button class="tlc-btn tlc-btn-danger" data-action="confirm">${esc(loc.confirmDelete)}</button>
    </div>`

  _showModal()

  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal)
  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    closeModal()
    if (onConfirm) onConfirm()
  })
}
