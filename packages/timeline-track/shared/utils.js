/**
 * 工具函数集
 * @module utils
 */

/** 将值限制在 [lo, hi] 区间内 */
export const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v

/** 按步长对齐数值 */
export const snap = (v, step) => step ? Math.round(v / step) * step : v

/**
 * 将小时数格式化为 HH:MM 时间字符串
 * @deprecated 已废弃，请使用 TimeFormatter.format() 或 formatter.formatRange() 替代
 * @param {number} th - 小时数（如 14.5 → "14:30"）
 * @param {boolean} [showMin] - 是否显示分钟，默认 true
 * @param {string} [invalidStr] - 无效值的回退文字，默认 '--:--'
 * @returns {string}
 */
export function fmtTime(th, showMin, invalidStr) {
  if (th == null || isNaN(th)) return invalidStr || '--:--'
  const neg = th < 0
  if (neg) th = -th
  const h = Math.floor(th)
  const m = Math.round((th - h) * 60)
  if (m === 60) return `${neg ? '-' : ''}${String(h + 1).padStart(2, '0')}:00`
  return `${neg ? '-' : ''}${String(h).padStart(2, '0')}:${showMin === false ? '00' : String(m).padStart(2, '0')}`
}

/** HTML 转义 */
/**
 * 唯一 ID 生成器（自动分配 key 用）
 * 生成格式：_k<计数器36进制>_<时间戳36进制>
 */
let _uidCounter = 0
export function nextKey() {
  return `_k${(++_uidCounter).toString(36)}_${Date.now().toString(36)}`
}

export function esc(s) {
  const d = document.createElement('div')
  d.textContent = s != null ? String(s) : ''
  return d.innerHTML
}

/**
 * 极简 hyperscript —— 创建 DOM 元素
 *
 * 用法：
 *   h('div', 'hello')
 *   h('div', { class: 'x', id: 'y' }, 'hello')
 *   h('button', { onClick: fn }, 'click')
 *   h('div', null, child1, child2)
 *   h('div', null, [child1, child2])
 *
 * @param {string} tag - HTML 标签名
 * @param {object|null} [props] - 属性/事件对象，可省略
 * @param {...(Node|string|number|false|null|Array)} children - 子节点
 * @returns {HTMLElement}
 */
export function h(tag, ...args) {
  const el = document.createElement(tag)
  let props = null
  let children = args

  // 第一个非空对象为 props，其余为 children
  if (args.length && args[0] != null && typeof args[0] === 'object' && !Array.isArray(args[0]) && !(args[0] instanceof Node)) {
    props = args[0]
    children = args.slice(1)
  }

  if (props) {
    const { class: cls, style, ...attrs } = props
    if (cls) el.className = Array.isArray(cls) ? cls.filter(Boolean).join(' ') : cls
    if (style) {
      if (typeof style === 'string') el.style.cssText = style
      else Object.assign(el.style, style)
    }
    for (const key of Object.keys(attrs)) {
      const val = attrs[key]
      if (!val) continue
      if (key.startsWith('on') && typeof val === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), val)
      } else {
        el.setAttribute(key, String(val))
      }
    }
  }

  if (children.length) {
    _append(el, children.length === 1 && Array.isArray(children[0]) ? children[0] : children)
  }
  return el
}

/** 递归追加子节点（数组展开、空值跳过） */
function _append(el, list) {
  for (const c of list) {
    if (c == null || c === false || c === true) continue
    if (typeof c === 'string' || typeof c === 'number') {
      el.appendChild(document.createTextNode(String(c)))
    } else if (c instanceof Node) {
      el.appendChild(c)
    } else if (Array.isArray(c)) {
      _append(el, c)
    }
  }
}
