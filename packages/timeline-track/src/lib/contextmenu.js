/**
 * 右键菜单与编辑弹窗系统
 * 提供 ContextMenu（右键菜单）、编辑属性模态框、删除确认框
 * @module contextmenu
 */

import { esc } from './utils.js'
import { formatLocale, resolveLocale } from './locale.js'

/* ============================ CSS ============================ */

const POPUP_CSS = /* css */ `
/* ── Context Menu ── */
.tlc-context-menu {
  position: fixed;
  z-index: 100000;
  background: #fff;
  border: 1px solid #dfe3e8;
  border-radius: 4px;
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
.tlc-context-header {
  padding: 7px 14px 5px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  cursor: default;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
  white-space: nowrap;
  line-height: 1.4;
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
  border-radius: 6px;
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
  border-radius: 3px;
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
  border-radius: 3px;
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

/* ── Stepper Buttons ── */
.tlc-step-btns {
  display: flex;
  flex-direction: column;
  border: 1px solid #d0d4da;
  border-radius: 3px;
  flex-shrink: 0;
  overflow: hidden;
}
.tlc-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex: 1;
  min-height: 15px;
  border: none;
  border-radius: 0;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 7px;
  line-height: 1;
  padding: 0;
  color: #555;
  transition: background .09s;
  user-select: none;
  outline: none;
}
.tlc-step-btn:hover {
  background: #e8eaed;
}
.tlc-step-btn:active {
  background: #d0d4da;
}
.tlc-step-btn + .tlc-step-btn {
  border-top: 1px solid #e0e3e8;
}

/* ── Stacked Form Fields ── */
.tlc-field {
  margin-bottom: 10px;
}
.tlc-field-label {
  display: block;
  margin-bottom: 3px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}
.tlc-field-input {
  display: block;
  width: 100%;
  padding: 5px 9px;
  border: 1px solid #d0d4da;
  border-radius: 3px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
  box-sizing: border-box;
}
.tlc-field-input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-field-hint {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #999;
}
.tlc-field-error {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #e53935;
  line-height: 1.3;
  min-height: 0;
}
.tlc-field-error:empty {
  display: none;
}

/* ── Time Field Columns (per-unit, independent stepper) ── */
.tlc-tf-row {
  display: flex;
  align-items: stretch;
  gap: 3px;
  width: 100%;
}
.tlc-tf-col {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  position: relative;
}

/* ── Time Control: 各列统一外边框 ── */
.tlc-time-control .tlc-tf-col {
  border: 1px solid #d0d4da;
  border-radius: 3px;
  overflow: hidden;
}
.tlc-time-control .tlc-tf-input {
  border: none;
  padding: 5px 9px;
  border-radius: 0;
}
.tlc-time-control .tlc-tf-steps {
  border: none;
  border-radius: 0;
}
.tlc-time-control .tlc-tf-col:focus-within {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-time-control .tlc-tf-input:focus {
  box-shadow: none;
}
.tlc-time-control .tlc-tf-col.tlc-input-error {
  border-color: #e53935;
  box-shadow: 0 0 0 2px rgba(229,57,53,.15);
}

.tlc-tf-input {
  width: 100%;
  min-width: 0;
  text-align: center;
  padding: 4px 22px 4px 2px;
  border: 1px solid #d0d4da;
  border-right: none;
  border-radius: 3px 0 0 3px;
  font-size: 15px;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  outline: none;
  box-sizing: border-box;
  -moz-appearance: textfield;
  transition: border-color .12s, box-shadow .12s;
  background: #fff;
}
.tlc-tf-input::-webkit-inner-spin-button,
.tlc-tf-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.tlc-tf-input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
  z-index: 1;
  position: relative;
}
.tlc-tf-suffix {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  color: #999;
  user-select: none;
  pointer-events: none;
  line-height: 1;
  padding: 0 4px 0 4px;
}
.tlc-tf-colon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 600;
  color: #555;
  user-select: none;
  padding: 0 1px;
}
.tlc-tf-steps {
  display: flex;
  flex-direction: column;
  border: 1px solid #d0d4da;
  border-radius: 0 3px 3px 0;
  overflow: hidden;
  flex-shrink: 0;
}
.tlc-tf-step {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 6px;
  line-height: 1;
  padding: 0 4px;
  min-height: 13px;
  color: #555;
  transition: background .09s;
  user-select: none;
  outline: none;
}
.tlc-tf-step:hover { background: #e8eaed; }
.tlc-tf-step:active { background: #d0d4da; }
.tlc-tf-step + .tlc-tf-step { border-top: 1px solid #e0e3e8; }
.tlc-time-control .tlc-field-error { margin-top: 4px; }
.tlc-number-control .tlc-tf-steps { margin-left: 4px; }

/* ── Number Control: 输入框与步进统一外边框 ── */
.tlc-number-control .tlc-tf-row {
  border: 1px solid #d0d4da;
  border-radius: 3px;
  overflow: hidden;
  gap: 0;
}
.tlc-number-control .tlc-tf-col {
  border: none;
  overflow: visible;
}
.tlc-number-control .tlc-field-input {
  border: none;
  border-radius: 0;
}
.tlc-number-control .tlc-tf-steps {
  border: none;
  border-radius: 0;
  margin-left: 0;
}
.tlc-number-control .tlc-tf-row:focus-within {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-number-control .tlc-field-input:focus {
  box-shadow: none;
}
.tlc-number-control.tlc-input-error .tlc-tf-row,
.tlc-number-control .tlc-tf-row.tlc-input-error {
  border-color: #e53935;
  box-shadow: 0 0 0 2px rgba(229,57,53,.15);
}

/* ── Color Picker with Presets ── */
.tlc-color-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tlc-color-control input[type="color"] {
  width: 36px;
  height: 26px;
  padding: 2px;
  border: 1px solid #d0d4da;
  border-radius: 3px;
  cursor: pointer;
  box-sizing: border-box;
  flex-shrink: 0;
}
.tlc-color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}
.tlc-color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  border: 1.5px solid rgba(0,0,0,.10);
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: transform .1s, box-shadow .1s;
  box-sizing: border-box;
}
.tlc-color-swatch:hover {
  transform: scale(1.25);
  box-shadow: 0 1px 5px rgba(0,0,0,.25);
  border-color: rgba(0,0,0,.2);
}
.tlc-color-swatch:active {
  transform: scale(1.08);
}
  /* ── 输入框文字对齐切换（父元素添加 tlc-text-left / tlc-text-center）── */
  .tlc-text-left .tlc-tf-input,
  .tlc-text-left .tlc-field-input {
    text-align: left !important;
  }
  .tlc-text-center .tlc-tf-input,
  .tlc-text-center .tlc-field-input {
    text-align: center !important;
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
  let headerHtml = ''
  _menuEl.innerHTML = items.map((item, i) => {
    if (item.type === 'divider') return '<div class="tlc-context-divider"></div>'
    if (item.type === 'header') {
      headerHtml = `<div class="tlc-context-header">${esc(item.label)}</div>`
      return null
    }
    const cls = ['tlc-context-item']
    if (item.danger) cls.push('tlc-context-item-danger')
    return `<div class="${cls.join(' ')}" data-idx="${i}">${esc(item.label)}</div>`
  }).filter(Boolean).join('')
  if (headerHtml) _menuEl.innerHTML = headerHtml + _menuEl.innerHTML

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
    // 点击遮罩背景关闭（pointerdown 而非 click，避免拖拽选中文本释放出窗口时误触）
    _overlay.addEventListener('pointerdown', (e) => {
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

/* ============================ FORM CONTROLS ============================ */

/** 预设快速选择颜色 */
const PRESET_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
  '#3498db','#2980b9','#9b59b6','#8e44ad','#34495e',
  '#7f8c8d','#95a5a6'
]

/**
 * 渲染独占一行的表单字段
 * @param {string} labelText - 已转义
 * @param {string} controlHtml
 * @param {string} [hint] - 已转义
 * @returns {string}
 */
function _renderField(labelText, controlHtml, hint) {
  return `
    <div class="tlc-field">
      <label class="tlc-field-label">${labelText}</label>
      ${controlHtml}
      ${hint ? `<span class="tlc-field-hint">${hint}</span>` : ''}
    </div>`
}

/**
 * 判断 formatter 是否为时间模式（含冒号的格式）
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @returns {boolean}
 */
function _isTimeFormatter(fmt) {
  return fmt.format(0, 'editor').includes(':')
}

/**
 * 渲染颜色选择器 + 预设色板
 * @param {string} name
 * @param {string} currentColor
 * @returns {string}
 */
function _renderColorPicker(name, currentColor) {
  return `
    <div class="tlc-color-control">
      <div class="tlc-color-presets">
        ${PRESET_COLORS.map(c =>
          `<button type="button" class="tlc-color-swatch" data-color="${c}" style="background:${c}" tabindex="-1"></button>`
        ).join('')}
      </div>
      <input name="${name}" type="color" value="${currentColor}">
    </div>`
}

/**
 * 渲染时间分栏独立输入（每列有自己的 +/- 按钮，suffix 标注单位）
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} value
 * @param {string} name
 * @param {object} loc - locale 对象
 * @returns {string}
 */
function _renderTimeControl(fmt, value, name, loc) {
  const formatted = fmt.format(value, 'editor')
  const parts = formatted.split(':')
  const labels = { h: loc.hourUnit, m: loc.minuteUnit, s: loc.secondUnit }

  /** 渲染单列：带 suffix 的输入框 + 独立步进按钮 */
  const _col = (partVal, partKey) => `
    <div class="tlc-tf-col" data-part="${partKey}">
      <input type="text" inputmode="numeric" class="tlc-tf-input" name="${name}_${partKey}" value="${partVal}" data-part="${partKey}" maxlength="${partKey === 'h' ? 4 : 2}" autocomplete="off">
      <span class="tlc-tf-suffix">${esc(labels[partKey])}</span>
      <div class="tlc-tf-steps">
        <button type="button" class="tlc-tf-step up" tabindex="-1">▲</button>
        <button type="button" class="tlc-tf-step down" tabindex="-1">▼</button>
      </div>
    </div>`

  return `
    <div class="tlc-time-control" data-name="${name}">
      <div class="tlc-tf-row">
        ${_col(parts[0], 'h')}
        <span class="tlc-tf-colon">:</span>
        ${_col(parts[1], 'm')}
        ${parts.length === 3 ? `
        <span class="tlc-tf-colon">:</span>
        ${_col(parts[2], 's')}` : ''}
      </div>
      <div class="tlc-field-error" id="${name}_error"></div>
    </div>`
}

/**
 * 渲染数值输入 + 步进按钮（用于 type="number" 模式）
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} value
 * @param {string} name
 * @returns {string}
 */
function _renderNumberControl(fmt, value, name) {
  const formatted = fmt.format(value, 'editor')
  const unit = fmt.unit
  return `
    <div class="tlc-number-control" data-name="${name}">
      <div class="tlc-tf-row">
        <div class="tlc-tf-col">
          <input type="text" inputmode="decimal" class="tlc-field-input" name="${name}" value="${esc(formatted)}" autocomplete="off">
          ${unit ? `<span class="tlc-tf-suffix">${esc(unit)}</span>` : ''}
        </div>
        <div class="tlc-tf-steps">
          <button type="button" class="tlc-tf-step up" tabindex="-1">▲</button>
          <button type="button" class="tlc-tf-step down" tabindex="-1">▼</button>
        </div>
      </div>
      <div class="tlc-field-error" id="${name}_error"></div>
    </div>`
}

/**
 * 读取时间分栏控件的合并值 → "HH:MM" 或 "HH:MM:SS"
 * @param {HTMLElement} control - .tlc-time-control
 * @returns {string}
 */
function _readTimeFields(control) {
  const h = control.querySelector('[data-part="h"] .tlc-tf-input')
  const m = control.querySelector('[data-part="m"] .tlc-tf-input')
  const s = control.querySelector('[data-part="s"] .tlc-tf-input')
  const hh = h ? String(parseInt(h.value, 10) || 0).padStart(2, '0') : '00'
  const mm = m ? String(parseInt(m.value, 10) || 0).padStart(2, '0') : '00'
  const ss = s ? String(parseInt(s.value, 10) || 0).padStart(2, '0') : ''
  return ss ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`
}

/**
 * 显示/清除字段错误
 * @param {string} controlName
 * @param {string} msg
 */
function _showError(controlName, msg) {
  const errEl = document.getElementById(`${controlName}_error`)
  if (!errEl) return
  errEl.textContent = msg
  const control = errEl.closest('.tlc-time-control, .tlc-number-control')
  if (!control) return
  // 时间控件高亮列容器，数值控件行容器（输入框已无独立边框）
  control.querySelectorAll('.tlc-tf-col, .tlc-tf-row, .tlc-field-input').forEach(el => {
    el.classList.toggle('tlc-input-error', !!msg)
  })
}

/**
 * 清除所有错误提示
 * @param {HTMLElement} modal
 */
function _clearErrors(modal) {
  modal.querySelectorAll('.tlc-field-error').forEach(el => el.textContent = '')
  modal.querySelectorAll('.tlc-input-error').forEach(el => el.classList.remove('tlc-input-error'))
}

/**
 * 检查段重叠
 * @param {import('./TimeTrack.js').TimeTrack|null} track
 * @param {number} start
 * @param {number} end
 * @param {import('./TimeSegment.js').TimeSegment} [exclude]
 * @returns {{label:string, start:number, end:number}|null}
 */
function _checkOverlap(track, start, end, exclude, unnamed) {
  if (!track) return null
  const segments = track.querySelectorAll('time-line-segment')
  for (const seg of segments) {
    if (seg === exclude) continue
    const ss = seg.start
    const se = seg.end
    if (start < se && end > ss) {
      return { label: seg.label || unnamed || '未命名', start: ss, end: se }
    }
  }
  return null
}

/**
 * 格式化数值模式的步进提示
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} step
 * @param {object} loc
 * @returns {string}
 */
function _formatStepHint(fmt, step, loc) {
  if (!step || step <= 0) return ''
  // 时间模式每列步进 1，无需额外提示
  if (_isTimeFormatter(fmt)) return ''
  // 数值模式：使用 locale 模板（限制小数位，避免浮点位长）
  const stepStr = esc(parseFloat(step.toFixed(4)).toString())
  return esc(formatLocale(loc.stepHint, { step: stepStr }))
}

function _setupLongPress(el, onStep) {
  // 长按步进按钮：300ms 延迟后 80ms 间隔自动连续步进
  let timer = null, interval = null
  const stop = () => {
    clearTimeout(timer); clearInterval(interval)
    timer = null; interval = null
  }
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    onStep()
    timer = setTimeout(() => { interval = setInterval(onStep, 80) }, 300)
  })
  el.addEventListener('pointerup',   stop)
  el.addEventListener('pointercancel', stop)
  el.addEventListener('pointerleave', stop)
  return stop
}

/**
 * 将值分发到时间控件的各列并触发校验
 * @param {HTMLElement} ctl - .tlc-time-control
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} val - 要设置的值（formatter base units）
 */
function _distributeValue(ctl, fmt, val) {
  const formatted = fmt.format(val, 'editor')
  const parts = formatted.split(':')
  const PK_MAP = { h: 0, m: 1, s: 2 }
  ctl.querySelectorAll('.tlc-tf-col').forEach(col => {
    const pk = col.dataset.part
    if (!pk || PK_MAP[pk] == null) return
    const inp = col.querySelector('.tlc-tf-input')
    if (!inp) return
    inp.value = String(parseInt(parts[PK_MAP[pk]], 10) || 0).padStart(2, '0')
  })
  ctl.querySelectorAll('.tlc-tf-input').forEach(inp => {
    inp.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

/**
 * 初始化表单控件交互：步进按钮（时间分栏 + 数值模式）+ 色板预设点击
 * @param {HTMLElement} modal - 模态框容器
 * @param {import('./formatter.js').ValueFormatter} fmt
 */
function _initFormControls(modal, fmt) {
  const isTime = _isTimeFormatter(fmt)

  // ── 步进按钮 ──
  if (isTime) {
    modal.querySelectorAll('.tlc-time-control').forEach(control => {
      control.querySelectorAll('.tlc-tf-col').forEach(col => {
        const input = col.querySelector('.tlc-tf-input')
        const up = col.querySelector('.tlc-tf-step.up')
        const down = col.querySelector('.tlc-tf-step.down')
        const part = col.dataset.part // 'h' | 'm' | 's'
        if (!input || !up || !down || !part) return

        const limits = { h: { min: 0, max: 9999 }, m: { min: 0, max: 59 }, s: { min: 0, max: 59 } }
        const limit = limits[part] || { min: 0, max: 59 }

        _setupLongPress(up, () => {
          const ctl = col.closest('.tlc-time-control')
          const mn = parseFloat(ctl.dataset.min)
          const mx = parseFloat(ctl.dataset.max)
          const hasRange = !isNaN(mn) && !isNaN(mx)
          // 1. Per-column increment（独立循环，不进位）
          let val = parseInt(input.value, 10) || 0
          val = val >= limit.max ? limit.min : val + 1
          input.value = String(val).padStart(2, '0')
          // 2. Range check on full value
          if (hasRange) {
            const raw = fmt.parse(_readTimeFields(ctl))
            if (!isNaN(raw) && (raw >= mx || raw < mn)) {
              _distributeValue(ctl, fmt, mn)
              return
            }
          }
          input.dispatchEvent(new Event('input', { bubbles: true }))
        })
        _setupLongPress(down, () => {
          const ctl = col.closest('.tlc-time-control')
          const mn = parseFloat(ctl.dataset.min)
          const mx = parseFloat(ctl.dataset.max)
          const hasRange = !isNaN(mn) && !isNaN(mx)
          // 1. Per-column decrement（独立循环，不进位）
          let val = parseInt(input.value, 10) || 0
          val = val <= limit.min ? limit.max : val - 1
          input.value = String(val).padStart(2, '0')
          // 2. Range check on full value
          if (hasRange) {
            const raw = fmt.parse(_readTimeFields(ctl))
            if (raw < mn) {
              _distributeValue(ctl, fmt, mx)
              return
            }
            if (raw > mx) {
              // Per-column cycle artifact (e.g. hours 0→9999): stay below max
              const oneMin = fmt.unit === 'second' ? 60 : fmt.unit === 'minute' ? 1 : 1 / 60
              _distributeValue(ctl, fmt, mx - oneMin)
              return
            }
          }
          input.dispatchEvent(new Event('input', { bubbles: true }))
        })
      })
    })
  } else {
    modal.querySelectorAll('.tlc-number-control').forEach(control => {
      const input = control.querySelector('.tlc-field-input')
      const up = control.querySelector('.tlc-tf-step.up')
      const down = control.querySelector('.tlc-tf-step.down')
      const step = parseFloat(control.dataset.step) || 1
      const min = parseFloat(control.dataset.min)
      const max = parseFloat(control.dataset.max)
      const hasMin = !isNaN(min)
      const hasMax = !isNaN(max)

      if (!input || !up || !down) return

      _setupLongPress(up, () => {
        const val = fmt.parse(input.value)
        if (!isNaN(val)) {
          let newVal = val + step
          if (hasMax && newVal > max) newVal = hasMin ? min : newVal
          input.value = fmt.format(newVal, 'editor')
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
      _setupLongPress(down, () => {
        const val = fmt.parse(input.value)
        if (!isNaN(val)) {
          let newVal = val - step
          if (hasMin && newVal < min) newVal = hasMax ? max : newVal
          input.value = fmt.format(newVal, 'editor')
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
    })
  }

  // ── 色板预设点击 ──
  modal.querySelectorAll('.tlc-color-presets').forEach(presets => {
    const colorInput = presets.closest('.tlc-color-control').querySelector('input[type="color"]')
    if (!colorInput) return
    presets.addEventListener('click', (e) => {
      const swatch = e.target.closest('.tlc-color-swatch')
      if (!swatch) return
      colorInput.value = swatch.dataset.color
    })
  })

  // ── blur 校验：将非法/NaN/越界的值 clamp 到范围内 ──
  modal.querySelectorAll('.tlc-time-control input, .tlc-number-control input').forEach(inp => {
    inp.addEventListener('blur', () => {
      const control = inp.closest('.tlc-time-control, .tlc-number-control')
      if (!control) return

      if (control.classList.contains('tlc-time-control')) {
        const min = parseFloat(control.dataset.min)
        const max = parseFloat(control.dataset.max)
        const hasMin = !isNaN(min)
        const hasMax = !isNaN(max)
        // 先做每列的整数/非负校验
        control.querySelectorAll('.tlc-tf-col').forEach(col => {
          const part = col.dataset.part
          if (!part) return
          const input = col.querySelector('.tlc-tf-input')
          if (!input) return
          const limits = { h: { min: 0, max: 9999 }, m: { min: 0, max: 59 }, s: { min: 0, max: 59 } }
          const limit = limits[part] || { min: 0, max: 59 }
          let val = parseInt(input.value, 10)
          if (isNaN(val) || val < limit.min) val = limit.min
          if (val > limit.max) val = limit.max
          input.value = String(val).padStart(2, '0')
        })
        // 再按总值 clamp
        const raw = fmt.parse(_readTimeFields(control))
        let clamped = isNaN(raw) ? (hasMin ? min : 0) : raw
        if (hasMin && clamped < min) clamped = min
        if (hasMax && clamped > max) clamped = max
        const formatted = fmt.format(clamped, 'editor')
        const parts = formatted.split(':')
        const PK_MAP = { h: 0, m: 1, s: 2 }
        control.querySelectorAll('.tlc-tf-col').forEach(col => {
          const pk = col.dataset.part
          if (!pk || PK_MAP[pk] == null) return
          const input = col.querySelector('.tlc-tf-input')
          if (!input) return
          const newVal = parts[PK_MAP[pk]] || '00'
          input.value = String(parseInt(newVal, 10) || 0).padStart(2, '0')
        })
        inp.dispatchEvent(new Event('input', { bubbles: true }))
        return
      }

      // 数值模式 clamp
      const raw = fmt.parse(inp.value)
      const min = parseFloat(control.dataset.min)
      const max = parseFloat(control.dataset.max)
      const hasMin = !isNaN(min)
      const hasMax = !isNaN(max)
      let clamped = isNaN(raw) ? (hasMin ? min : 0) : raw
      if (hasMin && clamped < min) clamped = min
      if (hasMax && clamped > max) clamped = max
      inp.value = fmt.format(clamped, 'editor')
      inp.dispatchEvent(new Event('input', { bubbles: true }))
    })
  })

  // ── 时间分栏输入时即时校验：越界立即显示错误样式，不 clamp ──
  modal.querySelectorAll('.tlc-time-control .tlc-tf-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const col = inp.closest('.tlc-tf-col')
      if (!col) return
      const control = col.closest('.tlc-time-control')
      if (!control) return
      const part = col.dataset.part
      if (!part) return

      // 1. Per-column limits check
      const limits = { h: { min: 0, max: 9999 }, m: { min: 0, max: 59 }, s: { min: 0, max: 59 } }
      const limit = limits[part] || { min: 0, max: 59 }
      const val = parseInt(inp.value, 10)
      let isError = inp.value === '' || isNaN(val) || val < limit.min || val > limit.max

      // 2. Full range check against dataset min/max (when all columns filled)
      if (!isError) {
        const min = parseFloat(control.dataset.min)
        const max = parseFloat(control.dataset.max)
        const hasMin = !isNaN(min)
        const hasMax = !isNaN(max)
        if (hasMin || hasMax) {
          const allFilled = [...control.querySelectorAll('.tlc-tf-col')].every(c => {
            const input = c.querySelector('.tlc-tf-input')
            return input && input.value !== '' && !isNaN(parseInt(input.value, 10))
          })
          if (allFilled) {
            const raw = fmt.parse(_readTimeFields(control))
            if (!isNaN(raw) && ((hasMin && raw < min) || (hasMax && raw > max))) {
              isError = true
            }
          }
        }
      }

      col.classList.toggle('tlc-input-error', isError)
    })
  })
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
  const track = segment.closest('time-line-track')
  const isTime = _isTimeFormatter(fmt)
  const modal = _getModal()

  // 步进值（仅数值模式使用）
  let step = 0
  if (track) {
    const s = track.step
    if (s && s > 0) step = s
  }
  if (!step) {
    step = isTime
      ? Math.max((track ? track.tEnd - track.tStart : 24) / 24, 0.5)
      : 1
  }

  modal.innerHTML = `
    <div class="tlc-modal-header">${esc(loc.segmentEditTitle)}</div>
    <div class="tlc-modal-body">
      ${_renderField(esc(loc.labelField), `<input class="tlc-field-input" name="label" type="text" value="${esc(segment.label)}">`)}
      ${_renderField(esc(loc.startTime),
        isTime ? _renderTimeControl(fmt, segment.start, 'start', loc) : _renderNumberControl(fmt, segment.start, 'start'),
        _formatStepHint(fmt, step, loc))}
      ${_renderField(esc(loc.endTime),
        isTime ? _renderTimeControl(fmt, segment.end, 'end', loc) : _renderNumberControl(fmt, segment.end, 'end'),
        _formatStepHint(fmt, step, loc))}
      ${_renderField(esc(loc.color), _renderColorPicker('color', segment.color))}
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${esc(loc.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${esc(loc.confirm)}</button>
    </div>`

  _showModal()

  // 步进+上下限写入控件 dataset（含时间控件的总值 clamp）
  {
    const tStart = track ? track.tStart : 0
    const tEnd = track ? track.tEnd : 24
    const startCtls = modal.querySelectorAll('.tlc-time-control[data-name="start"], .tlc-number-control[data-name="start"]')
    const endCtls = modal.querySelectorAll('.tlc-time-control[data-name="end"], .tlc-number-control[data-name="end"]')
    startCtls.forEach(el => {
      el.dataset.min = String(tStart)
      el.dataset.max = String(tEnd)
      if (el.classList.contains('tlc-number-control')) el.dataset.step = String(step)
    })
    endCtls.forEach(el => {
      el.dataset.min = String(tStart)
      el.dataset.max = String(tEnd)
      if (el.classList.contains('tlc-number-control')) el.dataset.step = String(step)
    })
  }

  _initFormControls(modal, fmt)

  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal)

  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    _clearErrors(modal)

    let start, end
    if (isTime) {
      start = fmt.parse(_readTimeFields(modal.querySelector('[data-name="start"]')))
      end   = fmt.parse(_readTimeFields(modal.querySelector('[data-name="end"]')))
    } else {
      const sv = modal.querySelector('input[name="start"]')
      const ev = modal.querySelector('input[name="end"]')
      start = sv ? fmt.parse(sv.value) : NaN
      end   = ev ? fmt.parse(ev.value) : NaN
    }

    // 校验（使用 locale 字符串）
    let valid = true
    if (isNaN(start) || isNaN(end)) {
      _showError('start', loc.invalidValue)
      _showError('end', loc.invalidValue)
      valid = false
    } else if (start >= end) {
      _showError('start', loc.startMustBeBeforeEnd)
      _showError('end', loc.startMustBeBeforeEnd)
      valid = false
    }

    // 重叠校验
    if (valid) {
      const overlap = _checkOverlap(track, start, end, segment, loc.unnamed)
      if (overlap) {
        const msg = formatLocale(loc.overlapHint, { label: overlap.label })
        _showError('start', msg)
        _showError('end', msg)
        valid = false
      }
    }

    if (!valid) {
      const firstErr = modal.querySelector('.tlc-input-error')
      if (firstErr) firstErr.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      return
    }

    const labelInput = modal.querySelector('input[name="label"]')
    segment.label = labelInput ? labelInput.value : ''
    segment.start = start
    segment.end   = end

    const colorInput = modal.querySelector('input[name="color"]')
    if (colorInput) segment.color = colorInput.value

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
  const isTime = _isTimeFormatter(fmt)
  const modal = _getModal()

  let step = 0
  const s = track.step
  if (s && s > 0) step = s
  if (!step) {
    step = isTime
      ? Math.max((track.tEnd - track.tStart) / 24, 0.5)
      : 1
  }

  modal.innerHTML = `
    <div class="tlc-modal-header">${esc(loc.trackEditTitle)}</div>
    <div class="tlc-modal-body">
      ${_renderField(esc(loc.name), `<input class="tlc-field-input" name="label" type="text" value="${esc(track.label)}">`)}
      ${_renderField(esc(loc.startTime),
        isTime ? _renderTimeControl(fmt, track.tStart, 'start', loc) : _renderNumberControl(fmt, track.tStart, 'start'),
        _formatStepHint(fmt, step, loc))}
      ${_renderField(esc(loc.endTime),
        isTime ? _renderTimeControl(fmt, track.tEnd, 'end', loc) : _renderNumberControl(fmt, track.tEnd, 'end'),
        _formatStepHint(fmt, step, loc))}
      ${_renderField(esc(loc.step), `<input class="tlc-field-input" name="step" type="text" value="${track.step}" style="width:100px;">`)}
      ${_renderField(esc(loc.maxSegmentsField), `<input class="tlc-field-input" name="maxSegments" type="number" step="1" min="0" placeholder="${esc(loc.zeroUnlimited)}" value="${track.maxSegments || ''}" style="width:100px;">`)}
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${esc(loc.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${esc(loc.confirm)}</button>
    </div>`

  _showModal()

  {
    const startCtls = modal.querySelectorAll('.tlc-time-control[data-name="start"], .tlc-number-control[data-name="start"]')
    const endCtls = modal.querySelectorAll('.tlc-time-control[data-name="end"], .tlc-number-control[data-name="end"]')
    startCtls.forEach(el => {
      el.dataset.min = String(track.tStart)
      el.dataset.max = String(track.tEnd)
      if (el.classList.contains('tlc-number-control')) el.dataset.step = String(step)
    })
    endCtls.forEach(el => {
      el.dataset.min = String(track.tStart)
      el.dataset.max = String(track.tEnd)
      if (el.classList.contains('tlc-number-control')) el.dataset.step = String(step)
    })
  }

  _initFormControls(modal, fmt)

  modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal)

  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    _clearErrors(modal)

    let start, end
    if (isTime) {
      start = fmt.parse(_readTimeFields(modal.querySelector('[data-name="start"]')))
      end   = fmt.parse(_readTimeFields(modal.querySelector('[data-name="end"]')))
    } else {
      const sv = modal.querySelector('input[name="start"]')
      const ev = modal.querySelector('input[name="end"]')
      start = sv ? fmt.parse(sv.value) : NaN
      end   = ev ? fmt.parse(ev.value) : NaN
    }

    const stepInput = modal.querySelector('input[name="step"]')
    const maxSegInput = modal.querySelector('input[name="maxSegments"]')
    const parsedStep = stepInput ? fmt.parse(stepInput.value) : NaN
    const maxSeg = maxSegInput ? parseInt(maxSegInput.value, 10) : NaN

    let valid = true
    if (isNaN(start) || isNaN(end)) {
      _showError('start', loc.invalidValue)
      _showError('end', loc.invalidValue)
      valid = false
    } else if (start >= end) {
      _showError('start', loc.startMustBeBeforeEnd)
      _showError('end', loc.startMustBeBeforeEnd)
      valid = false
    }

    if (!valid) {
      const firstErr = modal.querySelector('.tlc-input-error')
      if (firstErr) firstErr.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      return
    }

    const labelInput = modal.querySelector('input[name="label"]')
    if (labelInput) track.label = labelInput.value

    track.setAttribute('start', String(start))
    track.setAttribute('end',   String(end))
    track.step = (!isNaN(parsedStep) && parsedStep > 0) ? parsedStep : 0

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
