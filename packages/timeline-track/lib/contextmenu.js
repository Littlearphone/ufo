/**
 * 右键菜单与编辑弹窗系统
 * 提供 ContextMenu（右键菜单）、编辑属性模态框、删除确认框
 * @module contextmenu
 */

import { h } from '../shared/utils.js'
import { formatLocale, resolveLocale } from '../shared/locale.js'

/* ============================ CSS（Vite 库模式自动内联）============================ */
import './popup.css'

/* ============================ STATE ============================ */
let _menuEl = null
let _overlay = null
let _modalEl = null
let _closeHandler = null
let _keyHandler = null
let _menuClickHandler = null
let _closeModalHandler = null

/* ============================ CLOSE ALL ============================ */

/**
 * 关闭所有弹出层（右键菜单 + 模态框）
 */
export function closeAll() {
  _closeDropdown()
  hideContextMenu()
  closeModal()
}

/* ============================ CONTEXT MENU ============================ */

/**
 * 显示右键菜单
 * @param {Array<{label?:string, type?:string, danger?:boolean, action?:Function}>} items - 菜单项
 * @param {number} x - 屏幕 X 坐标
 * @param {number} y - 屏幕 Y 坐标
 * @param {Element} [originEl] - 源元素，用于计算 transform-origin（段中心 / label 中心）
 */
export function showContextMenu(items, x, y, originEl) {
  closeAll()

  if (!_menuEl) {
    _menuEl = document.createElement('div')
    _menuEl.className = 'tlc-context-menu'
    document.body.appendChild(_menuEl)
  }

  // 清除上次残留的 closing 状态
  _menuEl.classList.remove('closing', 'show')

  // 渲染菜单项
  _menuEl.innerHTML = ''
  const menuChildren = []
  items.forEach((item, i) => {
    if (item.type === 'divider') {
      menuChildren.push(h('div', { class: 'tlc-context-divider' }))
    } else if (item.type === 'header') {
      menuChildren.push(h('div', { class: 'tlc-context-header' }, item.label))
    } else {
      const cls = ['tlc-context-item']
      if (item.danger) cls.push('tlc-context-item-danger')
      menuChildren.push(h('div', { class: cls, 'data-idx': String(i) }, item.label))
    }
  })
  _menuEl.append(...menuChildren)

  // 菜单项点击处理（需先移除旧监听器避免闭包持有过期 items）
  if (_menuClickHandler) _menuEl.removeEventListener('click', _menuClickHandler)
  _menuClickHandler = (e) => {
    const itemEl = e.target.closest('.tlc-context-item')
    if (!itemEl) return
    const idx = parseInt(itemEl.dataset.idx, 10)
    const item = items[idx]
    if (item && item.action) item.action()
    hideContextMenu()
  }
  _menuEl.addEventListener('click', _menuClickHandler)

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

    // iOS 弹框效果：transform-origin 设在源元素中心（不钳制），动画纯 scale 放大
    // 浏览器会自动从源点做缩放，无需 translate
    if (originEl) {
      const r = originEl.getBoundingClientRect()
      const srcCx = r.left + r.width / 2
      const srcCy = r.top  + r.height / 2
      // 不钳制！即使原点在菜单外部，浏览器也能正确计算从该点的缩放
      const ox = srcCx - left
      const oy = srcCy - top
      _menuEl.style.transformOrigin = `${ox}px ${oy}px`
    } else {
      _menuEl.style.transformOrigin = 'center'
    }

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
 * 隐藏右键菜单（触发 fadeOut+scale 缩小动画）
 */
export function hideContextMenu() {
  if (_menuEl) {
    if (_menuEl.classList.contains('show')) {
      _menuEl.classList.remove('show')
      _menuEl.classList.add('closing')
      // 动画结束后移除 closing 类
      _menuEl.addEventListener('animationend', () => {
        _menuEl.classList.remove('closing')
      }, { once: true })
    } else {
      // 非 show 状态也清理 closing
      _menuEl.classList.remove('closing')
    }
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

/** 显示模态框（从 originEl 位置展开到窗口中央） */
function _showModal(originEl) {
  hideContextMenu()
  const overlay = _getOverlay()
  const modal = _getModal()

  // 取消前一次关闭时注册的 animationend 监听（防止其在新 modal 打开后误删元素）
  if (_closeModalHandler) {
    overlay.removeEventListener('animationend', _closeModalHandler)
    _closeModalHandler = null
  }
  // 确保 overlay 无 closing 残留，modal 在 overlay 中
  overlay.classList.remove('closing')
  if (modal.parentNode !== overlay) overlay.appendChild(modal)

  // 在 rAF 之前计算自定义属性值（此时布局已稳定），
  // @keyframes 中的 var() 会在动画启动时读取这些值
  if (originEl && typeof originEl.getBoundingClientRect === 'function') {
    const modalRect = modal.getBoundingClientRect()
    const srcRect = originEl.getBoundingClientRect()
    if (modalRect.width > 0 && modalRect.height > 0) {
      const srcCx = srcRect.left + srcRect.width / 2
      const srcCy = srcRect.top  + srcRect.height / 2
      const modalCx = modalRect.left + modalRect.width / 2
      const modalCy = modalRect.top  + modalRect.height / 2
      modal.style.setProperty('--tlc-modal-tx', `${(srcCx - modalCx).toFixed(1)}px`)
      modal.style.setProperty('--tlc-modal-ty', `${(srcCy - modalCy).toFixed(1)}px`)
    } else {
      modal.style.setProperty('--tlc-modal-tx', '0px')
      modal.style.setProperty('--tlc-modal-ty', '0px')
    }
  } else {
    modal.style.setProperty('--tlc-modal-tx', '0px')
    modal.style.setProperty('--tlc-modal-ty', '0px')
  }

  requestAnimationFrame(() => {
    overlay.classList.add('show')
  })
  // 自动聚焦第一个输入框
  const firstInput = modal.querySelector('input:not([type="color"])')
  if (firstInput) setTimeout(() => firstInput.focus(), 120)
}

/**
 * 关闭模态框（触发 fadeOut + scale 缩小退场动画）
 */
export function closeModal() {
  _closeDropdown()
  if (_overlay) {
    if (_overlay.classList.contains('show')) {
      _overlay.classList.remove('show')
      _overlay.classList.add('closing')
      // 清除旧 listener 再注册新 listener（确保不会重复）
      if (_closeModalHandler) _overlay.removeEventListener('animationend', _closeModalHandler)
      _closeModalHandler = () => {
        _closeModalHandler = null
        _overlay.classList.remove('closing')
        // 仅当 modal 未被重新打开时才移除（_showModal 会清除 listener）
        if (_modalEl && _modalEl.parentNode === _overlay && !_overlay.classList.contains('show')) {
          _overlay.removeChild(_modalEl)
        }
      }
      _overlay.addEventListener('animationend', _closeModalHandler)
    } else {
      // 非 show 状态直接清理
      if (_closeModalHandler) {
        _overlay.removeEventListener('animationend', _closeModalHandler)
        _closeModalHandler = null
      }
      _overlay.classList.remove('closing')
      if (_modalEl && _modalEl.parentNode === _overlay) {
        _overlay.removeChild(_modalEl)
      }
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
 * @param {string} labelText
 * @param {Node} control - DOM 元素
 * @param {string} [hint] - 提示文字
 * @returns {HTMLElement}
 */
function _renderField(labelText, control, hint) {
  const children = [
    h('label', { class: 'tlc-field-label' }, labelText),
    control,
  ]
  if (hint) children.push(h('span', { class: 'tlc-field-hint' }, hint))
  return h('div', { class: 'tlc-field' }, children)
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
 * @returns {HTMLElement}
 */
function _renderColorPicker(name, currentColor) {
  return h('div', { class: 'tlc-color-control' }, [
    h('div', { class: 'tlc-color-presets' },
      PRESET_COLORS.map(c =>
        h('button', { type: 'button', class: 'tlc-color-swatch', 'data-color': c, style: `background:${c}`, tabindex: '-1' })
      )
    ),
    h('input', { name, type: 'color', value: currentColor }),
  ])
}

/**
 * 渲染时间分栏独立输入（每列有自己的 +/- 按钮，suffix 标注单位）
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} value
 * @param {string} name
 * @param {object} loc - locale 对象
 * @returns {HTMLElement}
 */
function _renderTimeControl(fmt, value, name, loc) {
  const formatted = fmt.format(value, 'editor')
  const parts = formatted.split(':')
  const labels = { h: loc.hourUnit, m: loc.minuteUnit, s: loc.secondUnit }

  /** 渲染单列：带 suffix 的输入框 + 独立步进按钮 */
  const _col = (partVal, partKey) =>
    h('div', { class: 'tlc-tf-col', 'data-part': partKey }, [
      h('input', { type: 'text', inputmode: 'numeric', class: 'tlc-tf-input', name: `${name}_${partKey}`, value: partVal, 'data-part': partKey, maxlength: partKey === 'h' ? '4' : '2', autocomplete: 'off' }),
      h('span', { class: 'tlc-tf-suffix' }, labels[partKey]),
      h('div', { class: 'tlc-tf-steps' }, [
        h('button', { type: 'button', class: 'tlc-tf-step up', tabindex: '-1' }, '▲'),
        h('button', { type: 'button', class: 'tlc-tf-step down', tabindex: '-1' }, '▼'),
      ]),
    ])

  const rowChildren = [
    _col(parts[0], 'h'),
    h('span', { class: 'tlc-tf-colon' }, ':'),
    _col(parts[1], 'm'),
  ]
  if (parts.length === 3) {
    rowChildren.push(h('span', { class: 'tlc-tf-colon' }, ':'))
    rowChildren.push(_col(parts[2], 's'))
  }

  return h('div', { class: 'tlc-time-control', 'data-name': name }, [
    h('div', { class: 'tlc-tf-row' }, rowChildren),
    h('div', { class: 'tlc-field-error', id: `${name}_error` }),
  ])
}

/**
 * 渲染数值输入 + 步进按钮（用于 type="number" 模式）
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} value
 * @param {string} name
 * @returns {HTMLElement}
 */
function _renderNumberControl(fmt, value, name) {
  const formatted = fmt.format(value, 'editor')
  const unit = fmt.unit
  return h('div', { class: 'tlc-number-control', 'data-name': name }, [
    h('div', { class: 'tlc-tf-row' }, [
      h('div', { class: 'tlc-tf-col' }, [
        h('input', { type: 'text', inputmode: 'decimal', class: 'tlc-field-input', name, value: formatted, autocomplete: 'off' }),
        unit ? h('span', { class: 'tlc-tf-suffix' }, unit) : null,
      ]),
      h('div', { class: 'tlc-tf-steps' }, [
        h('button', { type: 'button', class: 'tlc-tf-step up', tabindex: '-1' }, '▲'),
        h('button', { type: 'button', class: 'tlc-tf-step down', tabindex: '-1' }, '▼'),
      ]),
    ]),
    h('div', { class: 'tlc-field-error', id: `${name}_error` }),
  ])
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
      return { label: seg.label || unnamed, start: ss, end: se }
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
  const stepStr = parseFloat(step.toFixed(4)).toString()
  return formatLocale(loc.stepHint, { step: stepStr })
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

  // ── ▾ 下拉快选 ──
  _initDropdowns(modal, fmt, isTime)
}

/* ============================ ▾ 下拉快选 ============================ */

let _dropdownEl = null
let _ddCloseHandler = null
let _ddBlurEl = null
let _ddBlurHandler = null

/**
 * 生成下拉快选选项
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {number} min
 * @param {number} max
 * @param {number} step
 * @returns {Array<{value:number, label:string}>}
 */
function _buildDropdownOptions(fmt, min, max, step) {
  step = step || Math.max((max - min) / 24, 1)
  const range = max - min
  const effStep = range / Math.min(range / step, 48) || step
  const opts = []
  for (let v = min; v <= max + effStep / 2; v += effStep) {
    const clamped = Math.min(Math.max(v, min), max)
    const label = fmt.format(clamped, 'editor')
    if (!opts.length || opts[opts.length - 1].label !== label) {
      opts.push({ value: clamped, label })
    }
  }
  return opts
}

/** 关闭下拉面板（触发 fadeOut+slideUp 动画后移除） */
function _closeDropdown() {
  // ── 动画关闭：添加 .closing 类，动画结束后移除 DOM ──
  if (_dropdownEl && !_dropdownEl.classList.contains('closing')) {
    const el = _dropdownEl
    el.classList.add('closing')
    // 解绑 blur 监听后再触发动画，避免 Tab 键时序问题
    if (_ddBlurEl && _ddBlurHandler) {
      _ddBlurEl.removeEventListener('blur', _ddBlurHandler)
      _ddBlurEl = null
      _ddBlurHandler = null
    }
    el.addEventListener('animationend', () => {
      if (el.parentNode) el.parentNode.removeChild(el)
      // 仅当 _dropdownEl 未被新面板替换时才置 null
      if (_dropdownEl === el) _dropdownEl = null
    }, { once: true })
  } else if (_dropdownEl) {
    // 已在关闭中，直接移除
    _dropdownEl.remove()
    _dropdownEl = null
  }
  // ── 移除全局关闭监听器 ──
  if (_ddCloseHandler) {
    document.removeEventListener('pointerdown', _ddCloseHandler, true)
    _ddCloseHandler = null
  }
}

/**
 * 初始化下拉快选：各列独立下拉（时列 00-23，分/秒列按步进）
 * @param {HTMLElement} modal
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {boolean} isTime
 */
function _initDropdowns(modal, fmt, isTime) {
  // ── 时间控件：每列独立下拉 ──
  if (isTime) {
    modal.querySelectorAll('.tlc-time-control .tlc-tf-col').forEach(col => {
      const input = col.querySelector('.tlc-tf-input')
      if (!input) return
      const part = col.dataset.part  // 'h' | 'm' | 's'
      const control = col.closest('.tlc-time-control')

      const showDropdown = () => {
        _closeDropdown()
        // 生成该列的选项
        let opts = []
        if (part === 'h') {
          // 小时：00-24（24:00 是有效终点）
          for (let v = 0; v <= 24; v++) opts.push(String(v).padStart(2, '0'))
        } else {
          // 分/秒：00-59
          for (let v = 0; v <= 59; v++) opts.push(String(v).padStart(2, '0'))
        }

        _renderDropdownPanel(opts, col, (val) => {
          input.value = val
          input.dispatchEvent(new Event('input', { bubbles: true }))
          // 选 24 点时，分秒强制为 00
          if (part === 'h' && val === '24') {
            const mInput = control.querySelector('.tlc-tf-col[data-part="m"] .tlc-tf-input')
            const sInput = control.querySelector('.tlc-tf-col[data-part="s"] .tlc-tf-input')
            if (mInput) { mInput.value = '00'; mInput.dispatchEvent(new Event('input', { bubbles: true })) }
            if (sInput) { sInput.value = '00'; sInput.dispatchEvent(new Event('input', { bubbles: true })) }
          }
        }, input)
      }

      input.addEventListener('focus', showDropdown)
      input.addEventListener('click', () => { if (!_dropdownEl) showDropdown() })
    })
  }

  // ── 数值控件 ──
  modal.querySelectorAll('.tlc-number-control .tlc-field-input').forEach(input => {
    const control = input.closest('.tlc-number-control')
    const showDropdown = () => {
      _closeDropdown()
      const min = parseFloat(control.dataset.min) || 0
      const max = parseFloat(control.dataset.max) || 100
      const step = control.dataset.step ? parseFloat(control.dataset.step) : 1
      const opts = _buildDropdownOptions(fmt, min, max, step)

      _renderDropdownPanel(opts, input, (label) => {
        input.value = label
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }, input)
    }
    input.addEventListener('focus', showDropdown)
    input.addEventListener('click', () => { if (!_dropdownEl) showDropdown() })
  })
}

/**
 * 渲染下拉面板（固定定位在锚点元素下方，对齐整列宽度）
 * @param {Array<{value:number, label:string}>|string[]} opts
 * @param {HTMLElement} anchor - 锚点元素（如 .tlc-tf-col）
 * @param {Function} onSelect - 选中回调 (val) => void
 * @param {HTMLElement} [blurInput] - 可选，失焦时自动关闭下拉的输入框
 */
function _renderDropdownPanel(opts, anchor, onSelect, blurInput) {
  _dropdownEl = document.createElement('div')
  _dropdownEl.className = 'tlc-tf-dropdown-panel'
  opts.forEach(o => {
    const label = typeof o === 'string' ? o : o.label
    const item = document.createElement('div')
    item.className = 'tlc-tf-dropdown-item'
    item.textContent = label
    item.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      onSelect(label)
      _closeDropdown()
    })
    _dropdownEl.appendChild(item)
  })

  const r = anchor.getBoundingClientRect()
  _dropdownEl.style.position = 'fixed'
  _dropdownEl.style.top = (r.bottom + 4) + 'px'
  _dropdownEl.style.left = r.left + 'px'
  _dropdownEl.style.width = r.width + 'px'
  _dropdownEl.style.zIndex = '200000'
  document.body.appendChild(_dropdownEl)
  // rAF 后添加 panel-enter 类触发 fadeIn+slideDown 动画
  requestAnimationFrame(() => _dropdownEl.classList.add('panel-enter'))

  // 自动滚动到当前值位置
  if (blurInput) {
    const cur = blurInput.value
    const items = _dropdownEl.querySelectorAll('.tlc-tf-dropdown-item')
    for (const item of items) {
      if (item.textContent === cur) {
        item.classList.add('active')
        item.scrollIntoView({ block: 'nearest' })
        break
      }
    }
  }

  _ddCloseHandler = (ev) => {
    if (!_dropdownEl.contains(ev.target) && ev.target !== input) _closeDropdown()
  }
  document.addEventListener('pointerdown', _ddCloseHandler, true)

  // Blur：输入框失焦时关闭下拉（Tab 键、点击其他可聚焦元素等）
  if (blurInput) {
    _ddBlurEl = blurInput
    _ddBlurHandler = () => _closeDropdown()
    blurInput.addEventListener('blur', _ddBlurHandler)
  }
}

/* ============================ SHARED DIALOG HELPERS ============================ */

/**
 * 解析步进值
 * @param {import('./TimeTrack.js').TimeTrack|null} track
 * @param {boolean} isTime
 * @returns {number}
 */
function _resolveStep(track, isTime) {
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
  return step
}

/**
 * 将范围/步进值写入控件的 dataset
 * @param {HTMLElement} modal
 * @param {number} tStart
 * @param {number} tEnd
 * @param {number} step
 */
function _setupRangeDataset(modal, tStart, tEnd, step) {
  const startCtls = modal.querySelectorAll('.tlc-time-control[data-name="start"], .tlc-number-control[data-name="start"]')
  const endCtls = modal.querySelectorAll('.tlc-time-control[data-name="end"], .tlc-number-control[data-name="end"]')
  ;[startCtls, endCtls].forEach(ctls => {
    ctls.forEach(el => {
      el.dataset.min = String(tStart)
      el.dataset.max = String(tEnd)
      if (el.classList.contains('tlc-number-control')) el.dataset.step = String(step)
    })
  })
}

/**
 * 从 modal 中读取 start/end 值
 * @param {HTMLElement} modal
 * @param {import('./formatter.js').ValueFormatter} fmt
 * @param {boolean} isTime
 * @returns {{start:number, end:number}}
 */
function _readTimeValues(modal, fmt, isTime) {
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
  return { start, end }
}

/**
 * 校验时间范围（start < end），显示错误
 * @param {number} start
 * @param {number} end
 * @param {object} loc
 * @returns {boolean} true=有效
 */
function _validateTimeRange(start, end, loc) {
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
  return valid
}

/**
 * 滚动到第一个错误字段
 * @param {HTMLElement} modal
 */
function _scrollToFirstError(modal) {
  const firstErr = modal.querySelector('.tlc-input-error')
  if (firstErr) firstErr.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

/**
 * 渲染编辑弹窗骨架、显示模态框、初始化控件、绑定取消按钮
 * (消除两个对话框的重复模板)
 * @param {HTMLElement} modal
 * @param {object} loc
 * @param {string} title
 * @param {(Node|Array<Node>)} bodyChildren
 * @param {number} tStart
 * @param {number} tEnd
 * @param {number} step
 * @param {import('./formatter.js').ValueFormatter} fmt
 */
function _showEditDialog(modal, loc, title, bodyChildren, tStart, tEnd, step, fmt, originEl) {
  modal.innerHTML = ''
  modal.append(
    h('div', { class: 'tlc-modal-header' }, title),
    h('div', { class: 'tlc-modal-body' }, bodyChildren),
    h('div', { class: 'tlc-modal-footer' }, [
      h('button', { class: 'tlc-btn', 'data-action': 'cancel', onClick: closeModal }, loc.cancel),
      h('button', { class: 'tlc-btn tlc-btn-primary', 'data-action': 'confirm' }, loc.confirm),
    ])
  )
  _showModal(originEl)
  _setupRangeDataset(modal, tStart, tEnd, step)
  _initFormControls(modal, fmt)
}

/* ============================ SEGMENT EDIT DIALOG ============================ */

/**
 * 显示时间段属性编辑框
 * @param {import('./TimeSegment.js').TimeSegment} segment
 */
export function showSegmentEditDialog(segment) {
  const loc = resolveLocale(segment)
  const fmt = segment._formatter
  const track = segment.closest('time-line-track')
  const isTime = _isTimeFormatter(fmt)
  const modal = _getModal()
  const step = _resolveStep(track, isTime)

  // 仅 body 内容不同，骨架由 _showEditDialog 统一渲染
  const bodyChildren = [
    _renderField(loc.labelField, h('input', { class: 'tlc-field-input', name: 'label', type: 'text', value: segment.label }),
    ),
    _renderField(loc.startTime,
      isTime ? _renderTimeControl(fmt, segment.start, 'start', loc) : _renderNumberControl(fmt, segment.start, 'start'),
      _formatStepHint(fmt, step, loc)),
    _renderField(loc.endTime,
      isTime ? _renderTimeControl(fmt, segment.end, 'end', loc) : _renderNumberControl(fmt, segment.end, 'end'),
      _formatStepHint(fmt, step, loc)),
    _renderField(loc.color, _renderColorPicker('color', segment.color)),
  ]
  _showEditDialog(modal, loc, loc.segmentEditTitle, bodyChildren,
    track ? track.tStart : 0, track ? track.tEnd : 24, step, fmt, segment)

  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    _clearErrors(modal)

    const { start, end } = _readTimeValues(modal, fmt, isTime)
    let valid = _validateTimeRange(start, end, loc)

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
      _scrollToFirstError(modal)
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
  const loc = resolveLocale(track)
  const fmt = track._formatter
  const isTime = _isTimeFormatter(fmt)
  const modal = _getModal()
  const step = _resolveStep(track, isTime)

  const bodyChildren = [
    _renderField(loc.name, h('input', { class: 'tlc-field-input', name: 'label', type: 'text', value: track.label }),
    ),
    _renderField(loc.rangeStart,
      isTime ? _renderTimeControl(fmt, track.tStart, 'start', loc) : _renderNumberControl(fmt, track.tStart, 'start'),
      _formatStepHint(fmt, step, loc)),
    _renderField(loc.rangeEnd,
      isTime ? _renderTimeControl(fmt, track.tEnd, 'end', loc) : _renderNumberControl(fmt, track.tEnd, 'end'),
      _formatStepHint(fmt, step, loc)),
    _renderField(loc.step,
      isTime ? _renderTimeControl(fmt, track.step, 'step', loc) : _renderNumberControl(fmt, track.step, 'step'),
      _formatStepHint(fmt, step, loc)),
    _renderField(loc.maxSegmentsField,
      h('input', { class: 'tlc-field-input', name: 'maxSegments', type: 'text', inputmode: 'numeric', placeholder: loc.zeroUnlimited, value: track.maxSegments || '' }),
    ),
  ]
  _showEditDialog(modal, loc, loc.trackEditTitle, bodyChildren, track.tStart, track.tEnd, step, fmt, track)

  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    _clearErrors(modal)

    const { start, end } = _readTimeValues(modal, fmt, isTime)

    // 从自定义控件读取步长值
    const stepCtl = modal.querySelector('[data-name="step"]')
    let parsedStep = NaN
    if (stepCtl) {
      parsedStep = isTime ? fmt.parse(_readTimeFields(stepCtl)) : fmt.parse(stepCtl.querySelector('input').value)
    }
    const maxSegInput = modal.querySelector('input[name="maxSegments"]')
    const maxSeg = maxSegInput ? parseInt(maxSegInput.value, 10) : NaN

    let valid = _validateTimeRange(start, end, loc)

    if (!valid) {
      _scrollToFirstError(modal)
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
  const loc = resolveLocale(refEl)
  const modal = _getModal()
  modal.innerHTML = ''
  modal.append(
    h('div', { class: 'tlc-modal-header' }, loc.confirmDeleteTitle),
    h('div', { class: 'tlc-modal-body' }, h('p', message)),
    h('div', { class: 'tlc-modal-footer' }, [
      h('button', { class: 'tlc-btn', 'data-action': 'cancel', onClick: closeModal }, loc.cancel),
      h('button', { class: 'tlc-btn tlc-btn-danger', 'data-action': 'confirm', onClick: () => { closeModal(); if (onConfirm) onConfirm() } }, loc.confirm),
    ])
  )
  _showModal(refEl)
}

/* ============================ COPY TO TRACKS DIALOG ============================ */

/**
 * 显示"复制到其他轨道"多选弹窗
 * @param {import('./TimeTrack.js').TimeTrack} srcTrack - 源轨道
 */
export function showCopyToTracksDialog(srcTrack) {
  const container = srcTrack.closest('time-line-container')
  if (!container) return
  const loc = resolveLocale(srcTrack)
  const allTracks = container.allTracks()
  // 过滤出可编辑且不是源轨道的目标
  const targets = allTracks.filter(t => t !== srcTrack && t.deletable)

  const modal = _getModal()
  modal.innerHTML = ''

  const header = h('div', { class: 'tlc-modal-header' },
    loc.copyToTracksTitle.replace('{name}', srcTrack.label || loc.unnamed)
  )

  const bodyChildren = []
  if (!targets.length) {
    bodyChildren.push(h('p', { style: 'color:#999;font-size:12px;padding:12px' }, loc.copyToTracksEmpty))
  } else {
    // 全选/取消全选行（与轨道项视觉一致，勾选对齐）
    const syncToggle = () => {
      const cbs = modal.querySelectorAll('input[name="copy-target"]')
      const allChecked = Array.from(cbs).every(cb => cb.checked)
      const toggleCb = modal.querySelector('.tlc-copy-toggle-cb')
      if (toggleCb) toggleCb.checked = allChecked
    }
    const toggleAll = () => {
      const cbs = modal.querySelectorAll('input[name="copy-target"]')
      const allChecked = Array.from(cbs).every(cb => cb.checked)
      cbs.forEach(cb => cb.checked = !allChecked)
      syncToggle()
    }
    bodyChildren.push(h('div', { class: 'tlc-copy-track-header' }, [
      h('div', { class: 'tlc-copy-toggle-item', onClick: toggleAll }, [
        h('span', { class: 'tlc-copy-track-name tlc-copy-toggle-label' }, loc.copySelectAll),
        h('span', { class: 'tlc-copy-track-meta' }),
        h('input', { type: 'checkbox', class: 'tlc-copy-toggle-cb', checked: true, hidden: true }),
        h('span', { class: 'tlc-copy-track-check' }),
      ]),
    ]))
    const checkboxes = targets.map((t, i) => {
      const segCount = t.sortedSegs().length
      return h('label', { class: 'tlc-copy-track-item' }, [
        h('span', { class: 'tlc-copy-track-name' }, t.label || loc.unnamed),
        h('span', { class: 'tlc-copy-track-meta' }, `${segCount} ${loc.segmentUnit}`),
        h('input', { type: 'checkbox', name: 'copy-target', 'data-idx': String(i), checked: true, hidden: true, onChange: syncToggle }),
        h('span', { class: 'tlc-copy-track-check' }),
      ])
    })
    bodyChildren.push(...checkboxes)
  }

  const body = h('div', { class: 'tlc-modal-body' }, bodyChildren)
  const footer = h('div', { class: 'tlc-modal-footer' }, [
    h('button', { class: 'tlc-btn', 'data-action': 'cancel', onClick: closeModal }, loc.cancel),
    h('button', { class: 'tlc-btn tlc-btn-primary', 'data-action': 'confirm', onClick: () => {
      const checked = modal.querySelectorAll('input[name="copy-target"]:checked')
      if (checked.length === 0) return
      // 收集源轨道数据
      const srcSegs = srcTrack.sortedSegs().map(s => ({
        label: s.label, color: s.color, start: s.start, end: s.end, radius: s.radius,
      }))
      // 逐个覆盖目标轨道
      checked.forEach(cb => {
        const idx = parseInt(cb.dataset.idx, 10)
        const tgt = targets[idx]
        if (!tgt) return
        tgt.clearAllSegments()
        for (const sd of srcSegs) {
          try { tgt.addSegment(sd.start, sd.end, { label: sd.label, color: sd.color }) } catch (_) {}
        }
        tgt._pulseCopy()
      })
      closeModal()
    } }, loc.confirm),
  ])

  modal.append(header, body, footer)
  _showModal(srcTrack)
}
