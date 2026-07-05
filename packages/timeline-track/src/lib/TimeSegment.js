/**
 * <time-line-segment> 自定义元素 — 时间段
 * 支持拖拽移动、两端手柄调长度、悬停删除
 * @module TimeSegment
 */

import { clamp, esc, snap } from './utils.js'
import { createFormatter } from './formatter.js'
import { hideGlobalTip, showGlobalTip } from './tooltip.js'
import { hideContextMenu, showContextMenu, showDeleteConfirm, showSegmentEditDialog } from './contextmenu.js'
import { resolveLocale } from './locale.js'

export class TimeSegment extends HTMLElement {
  constructor() {
    super()
    this._init = false
    this._ptrActive = false
    this._mode = null        // 'move' | 'resize-left' | 'resize-right'
    this._ptr0 = 0
    this._s0 = 0
    this._e0 = 0
    this._lo = 0             // 左边界（时间值）
    this._hi = 0             // 右边界（时间值）
    this._onMove = null
    this._onUp = null
  }

  /* ---- 属性 ---- */
  /** 从容器获取 Formatter（找不到时用默认 TimeFormatter） */
  get _formatter() {
    const c = this.closest('time-line-container')
    return c ? c.getFormatter() : (this._fmtFallback || (this._fmtFallback = createFormatter('time', 'hour')))
  }

  get start()    { return this._formatter.parse(this.getAttribute('start'), 0) }
  set start(v)   { this.setAttribute('start', String(typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)) }
  get end()      { return this._formatter.parse(this.getAttribute('end'), 0) }
  set end(v)     { this.setAttribute('end',   String(typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)) }
  get label()    { return this.getAttribute('label') || '' }
  set label(v)   { this.setAttribute('label', v) }
  get color()    { return this.getAttribute('color') || '#5c9ce6' }
  set color(v)   { this.setAttribute('color', v) }
  get radius()   { return this.getAttribute('radius') || '5px' }
  set radius(v)  { this.setAttribute('radius', v) }
  get tooltip()  { return this.getAttribute('tooltip') || 'auto' }
  set tooltip(v) { this.setAttribute('tooltip', v) }
  get duration() { return this.end - this.start }

  /** 获取所属的 time-line-track 元素 */
  get _track() {
    let p = this.parentElement
    while (p) {
      if (p.tagName === 'TIME-LINE-TRACK') return p
      p = p.parentElement
    }
    return null
  }

  /* ---- 生命周期 ---- */
  connectedCallback() {
    if (this._init) return
    this._init = true
    this._buildDOM()
    this._bind()
  }

  static get observedAttributes() { return ['start', 'end', 'label', 'color', 'radius'] }

  attributeChangedCallback(name, _ov, nv) {
    if (!this._init) return
    if (name === 'label' || name === 'color') {
      this._buildDOM()
    }
    // radius 由容器 setGlobalRadius 统一控制
    if (name === 'start' || name === 'end') {
      this._buildDOM()
      const t = this._track
      if (t && t._positionOne) t._positionOne(this)
      this._updateTextVisibility()
    }
  }

  /* ---- DOM ---- */
  _buildDOM() {
    const col = this.color
    const darker = this._darken(col, 0.18)
    const c = this.closest('time-line-container')
    const r = (c && c._globalRadius != null) ? c._globalRadius : '0'
    const loc = resolveLocale(this)
    this.innerHTML =
      `<div class="tls-hdl tls-hdl-left" data-role="hdl-left">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-hdl tls-hdl-right" data-role="hdl-right">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-bar" style="background:${col};border:1px solid ${darker};border-radius:${r};">
        <div class="tls-inner">
          ${this.label ? `<span class="tls-label">${esc(this.label)}</span>` : ''}
          <span class="tls-time">${this._formatter.formatRange(this.start, this.end, 'segment')}</span>
        </div>
      </div>
      <button class="tls-del" data-role="del" title="${esc(loc.deleteBtnTitle)}">&times;</button>`
  }

  _bind() {
    this.addEventListener('pointerdown', e => this._onDown(e))
    this.addEventListener('click', e => {
      if (e.target.closest('[data-role="del"]')) {
        e.stopPropagation()
        const loc = resolveLocale(this)
        const name = this.label || loc.unnamed
        showDeleteConfirm(
          loc.confirmDeleteSegment
            .replace('{name}', name)
            .replace('{range}', this._formatter.formatRange(this.start, this.end, 'axis')),
          () => this._deleteSegment(),
          this
        )
      }
    })

    // Tooltip — 全局 portal，不受祖先 overflow 裁剪
    let _tipShown = false
    this.addEventListener('mouseenter', () => {
      if (this._ptrActive) return
      const mode = this.tooltip
      if (mode === 'none') return
      const truncated = this._isTruncated()
      if (mode === 'always' || truncated) {
        showGlobalTip(this)
        _tipShown = true
      }
    })
    this.addEventListener('mousemove', () => {
      if (_tipShown) showGlobalTip(this)
    })
    this.addEventListener('mouseleave', () => {
      hideGlobalTip()
      _tipShown = false
    })

    // 右键菜单
    this.addEventListener('contextmenu', e => {
      if (this._ptrActive) return               // 拖拽中不响应
      if (e.target.closest('[data-role="del"]')) return // 删除按钮上不响应
      e.preventDefault()
      e.stopPropagation()                       // 阻止冒泡到轨道
      const l = resolveLocale(this)
      const name = this.label || l.unnamed
      const segLabel = this.label || l.unnamed
      const segRange = this._formatter.formatRange(this.start, this.end, 'axis')
      showContextMenu([
        { type: 'header', label: l.segmentMenuHeader.replace('{name}', segLabel).replace('{range}', segRange) },
        { label: l.modifyProps, action: () => showSegmentEditDialog(this) },
        { label: l.deleteBtnTitle, danger: true, action: () => {
          showDeleteConfirm(
            l.confirmDeleteSegment
              .replace('{name}', name)
              .replace('{range}', this._formatter.formatRange(this.start, this.end, 'axis')),
            () => this._deleteSegment(),
            this
          )
        }}
      ], e.clientX, e.clientY)
    })
  }

  /** 公开的 tooltip 显示/隐藏方法（兼容外部调用） */
  _showTooltip() {
    if (this._ptrActive) return
    const mode = this.tooltip
    if (mode === 'none') return
    const truncated = this._isTruncated()
    if (mode === 'always' || truncated) showGlobalTip(this)
  }

  _hideTooltip() {
    hideGlobalTip()
  }

  /** 容器 locale 属性变更时刷新文字相关 DOM */
  _onLocaleChange() {
    this._buildDOM()
    this._updateTextVisibility()
  }

  /** 容器 locale 属性变更时刷新文字相关 DOM */
  _updateTextVisibility() {
    cancelAnimationFrame(this._tvRaf)
    this._tvRaf = requestAnimationFrame(() => {
      this._tvRaf = 0
      this.classList.toggle('tls-text-hidden', this._isTruncated())
    })
  }

  /** 检测段内文本是否被截断 */
  _isTruncated() {
    const label = this.querySelector(':scope > .tls-bar > .tls-inner > .tls-label')
    const time  = this.querySelector(':scope > .tls-bar > .tls-inner > .tls-time')
    if (label && label.scrollWidth > label.clientWidth + 1) return true
    if (time  && time.scrollWidth  > time.clientWidth  + 1) return true
    const inner = this.querySelector(':scope > .tls-bar > .tls-inner')
    if (inner && inner.scrollWidth > inner.clientWidth + 1) return true
    return false
  }

  /* ---- 拖拽 ---- */
  _onDown(e) {
    if (e.target.closest('[data-role="del"]')) return // 让 click 处理
    if (e.button !== 0) return
    hideContextMenu() // 左键点击段时关闭可能存在的右键菜单

    const hdl = e.target.closest('[data-role]')
    if (hdl && hdl.dataset.role === 'hdl-left')  this._mode = 'resize-left'
    else if (hdl && hdl.dataset.role === 'hdl-right') this._mode = 'resize-right'
    else this._mode = 'move'

    this._ptrActive = true
    this.classList.add(this._mode.startsWith('resize') ? 'resizing' : 'dragging')
    this._ptr0 = this._client(e)
    this._s0 = this.start
    this._e0 = this.end
    this._computeBounds()
    this.setPointerCapture(e.pointerId)

    this._onMove = ev => this._onMove_(ev)
    this._onUp   = ev => this._onUp_(ev)
    this.addEventListener('pointermove', this._onMove)
    this.addEventListener('pointerup',   this._onUp)
    this.addEventListener('pointercancel', this._onUp)
    this.addEventListener('lostpointercapture', this._onUp)

    e.preventDefault()
    e.stopPropagation()
  }

  _onMove_(e) {
    if (!this._ptrActive) return
    const t = this._track
    if (!t) return

    const dp = this._client(e) - this._ptr0
    const dt = t.px2Time(dp)
    const step = t.step || 0
    const minW = t.minDur

    if (this._mode === 'resize-left') {
      let s = this._s0 + dt
      s = snap(s, step)
      s = clamp(s, this._lo, this._e0 - minW)
      this.start = s
    } else if (this._mode === 'resize-right') {
      let e = this._e0 + dt
      e = snap(e, step)
      e = clamp(e, this._s0 + minW, this._hi)
      this.end = e
    } else {
      const w = this._e0 - this._s0
      let s = this._s0 + dt
      s = snap(s, step)
      s = clamp(s, this._lo, this._hi - w)
      this.start = s
      this.end = s + w
    }

    t._positionOne(this)
    this._buildDOM()
    this._updateTextVisibility()

    // 拖拽/缩放期间同步更新 tooltip
    if (this.tooltip !== 'none') {
      const tip = document.querySelector('.tls-global-tip')
      if (tip && tip.classList.contains('show')) showGlobalTip(this)
    }

    this.dispatchEvent(new CustomEvent('segment-change', {
      bubbles: true, detail: { segment: this, start: this.start, end: this.end }
    }))
  }

  _onUp_(e) {
    if (!this._ptrActive) return
    this._ptrActive = false
    this._mode = null
    this.classList.remove('dragging', 'resizing')
    this.removeEventListener('pointermove', this._onMove)
    this.removeEventListener('pointerup',   this._onUp)
    this.removeEventListener('pointercancel', this._onUp)
    this.removeEventListener('lostpointercapture', this._onUp)

    this.dispatchEvent(new CustomEvent('segment-changed', {
      bubbles: true, detail: { segment: this, start: this.start, end: this.end }
    }))
  }

  /** 计算拖拽边界（左右相邻段之间） */
  _computeBounds() {
    const t = this._track
    if (!t) { this._lo = 0; this._hi = 24; return }
    const segs = t.sortedSegs()
    const idx  = segs.indexOf(this)
    const { start: ts, end: te } = t._effRange ? t._effRange() : { start: t.tStart, end: t.tEnd }
    this._lo = idx > 0 ? segs[idx - 1].end : ts
    this._hi = idx < segs.length - 1 ? segs[idx + 1].start : te
  }

  /** 获取指针位置（横/纵向自适应） */
  _client(e) {
    const t = this._track
    if (!t) return e.clientX
    return t.isVertical ? e.clientY : e.clientX
  }

  /** 程序化删除（无事件参数，供右键菜单调用） */
  _deleteSegment() {
    const ok = this.dispatchEvent(new CustomEvent('segment-before-delete', {
      bubbles: true, cancelable: true, detail: { segment: this }
    }))
    if (!ok) return
    this.remove()
    this.dispatchEvent(new CustomEvent('segment-deleted', {
      bubbles: true, detail: { segment: this }
    }))
  }

  /** 颜色加深 */
  _darken(hex, amt) {
    let r, g, b
    if (hex.startsWith('#')) {
      const n = parseInt(hex.slice(1), 16)
      r = (n >> 16) & 0xff; g = (n >> 8) & 0xff; b = n & 0xff
    } else {
      const m = hex.match(/[\d.]+/g)
      if (!m) return hex
      ;[r, g, b] = m.map(Number)
    }
    return `rgb(${clamp(r + amt * 255, 0, 255) | 0},${clamp(g + amt * 255, 0, 255) | 0},${clamp(b + amt * 255, 0, 255) | 0})`
  }
}
