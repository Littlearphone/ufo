/**
 * <time-line-container> 自定义元素 — 顶层容器
 * 管理方向布局、共享轴模式、全局圆角、Tooltip 位置
 * @module TimeContainer
 */

import { ensureCSS } from './css.js'
import { clamp, h } from './utils.js'
import { LOCALE_ATTRS, resolveLocale } from './locale.js'
import { createFormatter } from './formatter.js'

export class TimeContainer extends HTMLElement {
  constructor() {
    super()
    this._init = false
    this._axisRuler = null
    this._rulerResObs = null
    this._formatter = null
  }

  connectedCallback() {
    ensureCSS()
    if (this._init) return
    this._init = true
    this._formatter = createFormatter(this.type, this.unit)
    this._applyDir()
    this._syncAxisRuler() // 处理初始共享模式
    // Ctrl/⌘+滚轮缩放
    this.addEventListener('wheel', this._wheelZoom, { passive: false })
  }

  disconnectedCallback() {
    this.removeEventListener('wheel', this._wheelZoom)
    if (this._vrfRaf) cancelAnimationFrame(this._vrfRaf)
  }

  static get observedAttributes() {
    return [
      'direction', 'label-h', 'label-v', 'axis-mode',
      'shared-start', 'shared-end', 'shared-clip-range',
      'tooltip-pos', 'max-segments',
      'type', 'unit', 'step',
      'zoom-start', 'zoom-end',
      ...LOCALE_ATTRS
    ]
  }

  attributeChangedCallback(name, _ov, nv) {
    if (!this._init) return
    // 本地化属性变更 → 通知所有子元素刷新文字
    if (name.startsWith('loc-')) {
      this.querySelectorAll('time-line-track, time-line-segment').forEach(el => {
        if (el._onLocaleChange) el._onLocaleChange()
      })
      return
    }
    if (name === 'tooltip-pos' || name === 'step') return // 仅运行时读取
    // type / unit 变更 → 重建 formatter 并刷新所有轨道
    if (name === 'type' || name === 'unit') {
      this._formatter = createFormatter(this.type, this.unit)
      this._onSharedConfigChange()
      return
    }
    if (name === 'label-h' || name === 'label-v') {
      this.querySelectorAll('time-line-track').forEach(t => {
        if (t._onLabelPosChange) t._onLabelPosChange()
      })
    } else if (name === 'axis-mode' || name === 'shared-start' || name === 'shared-end' || name === 'shared-clip-range') {
      this._onSharedConfigChange()
    } else if (name === 'zoom-start' || name === 'zoom-end') {
      this._onViewRangeChange()
    } else {
      this._applyDir()
      this._syncAxisRuler()
      this.querySelectorAll('time-line-track').forEach(t => {
        if (t._onDirChange) t._onDirChange()
      })
    }
  }

  get direction() { return this.getAttribute('direction') || 'horizontal' }
  set direction(v) { this.setAttribute('direction', v) }

  /** 值模式：'time' | 'number' */
  get type() { return this.getAttribute('type') || 'time' }
  set type(v) { this.setAttribute('type', v) }

  /** 归一化/显示单位：'hour' | 'minute' | 'second' | ''（自定义） */
  get unit() { return this.getAttribute('unit') || 'hour' }
  set unit(v) {
    if (v == null || v === 'hour') this.removeAttribute('unit')
    else this.setAttribute('unit', v)
  }

  /** 获取当前 Formatter 实例 */
  getFormatter() {
    if (!this._formatter) {
      this._formatter = createFormatter(this.type, this.unit)
    }
    return this._formatter
  }

  /** 横向模式轴标签位置 */
  get labelH() { return this.getAttribute('label-h') || 'top' }
  set labelH(v) { this.setAttribute('label-h', v) }
  /** 纵向模式轴标签位置 */
  get labelV() { return this.getAttribute('label-v') || 'left' }
  set labelV(v) { this.setAttribute('label-v', v) }

  /* ---- Tooltip 位置 ---- */
  get tooltipPos() { return this.getAttribute('tooltip-pos') || 'top-center' }
  set tooltipPos(v) {
    if (v == null) this.removeAttribute('tooltip-pos')
    else this.setAttribute('tooltip-pos', v)
  }

  /* ---- 共享轴模式 ---- */
  get axisMode() { return this.getAttribute('axis-mode') || 'per-track' }
  set axisMode(v) { this.setAttribute('axis-mode', v) }

  /** 解析此容器的 locale（子元素可直接调用） */
  resolveLocale() {
    return resolveLocale(this)
  }

  get axisRulerActive() {
    return this.axisMode === 'shared'
  }

  get sharedStart() {
    const v = this.getAttribute('shared-start')
    if (v != null) return this.getFormatter().parse(v, 0)
    const tracks = this.allTracks()
    if (!tracks.length) return 0
    return Math.min(...tracks.map(t => t.tStart))
  }
  set sharedStart(v) { this.setAttribute('shared-start', v) }

  get sharedEnd() {
    const v = this.getAttribute('shared-end')
    if (v != null) return this.getFormatter().parse(v, 24)
    const tracks = this.allTracks()
    if (!tracks.length) return 24
    return Math.max(...tracks.map(t => t.tEnd))
  }
  set sharedEnd(v) { this.setAttribute('shared-end', v) }

  /** 共享轴裁剪模式：段拖拽不超出各轨道自身范围 */
  get sharedClipRange() { return this.hasAttribute('shared-clip-range') }
  set sharedClipRange(v) { this.toggleAttribute('shared-clip-range', v) }

  /* ---- 公共 API ---- */

  /** 全局默认最大段数（各轨道可单独覆盖） */
  get maxSegments() {
    const v = this.getAttribute('max-segments')
    if (v != null) { const n = parseInt(v, 10); return n > 0 ? n : 0 }
    return 0 // 0 = 无限制
  }
  set maxSegments(v) {
    if (v == null || v <= 0) this.removeAttribute('max-segments')
    else this.setAttribute('max-segments', String(v))
  }

  /** 全局默认步长（各轨道可单独覆盖，无自身 step 属性的轨道会回退到此值） */
  get step() {
    const v = this.getAttribute('step')
    return v != null ? this.getFormatter().parse(v, 0) : 0
  }
  set step(v) {
    if (v == null || v <= 0) this.removeAttribute('step')
    else this.setAttribute('step', String(v))
  }

  /* ---- 缩放（视图范围） ---- */

  /** 视图起始（缩小范围 = 放大；null = 禁用缩放，使用默认范围） */
  get zoomStart() {
    const v = this.getAttribute('zoom-start')
    return v != null ? this.getFormatter().parse(v, null) : null
  }
  set zoomStart(v) {
    if (v == null) this.removeAttribute('zoom-start')
    else this.setAttribute('zoom-start', String(+(+v).toFixed(4)))
  }

  /** 视图结束 */
  get zoomEnd() {
    const v = this.getAttribute('zoom-end')
    return v != null ? this.getFormatter().parse(v, null) : null
  }
  set zoomEnd(v) {
    if (v == null) this.removeAttribute('zoom-end')
    else this.setAttribute('zoom-end', String(+(+v).toFixed(4)))
  }

  /** 最小缩放范围（防止无限放大），默认内容总范围的 0.3% */
  get minZoomRange() {
    const attr = this.getAttribute('min-zoom-range')
    if (attr != null) {
      const v = this.getFormatter().parse(attr, 0)
      if (v > 0) return v
    }
    // 默认：所有轨道总范围的 0.3%，最低不低于 0.05
    const total = this.sharedEnd - this.sharedStart
    return Math.max(total * 0.003, 0.05)
  }
  set minZoomRange(v) {
    if (v == null) this.removeAttribute('min-zoom-range')
    else this.setAttribute('min-zoom-range', String(v))
  }

  /** 轴尺渲染所用范围（优先使用缩放视图） */
  _axisRange() {
    if (this.zoomStart != null && this.zoomEnd != null) {
      return { start: this.zoomStart, end: this.zoomEnd }
    }
    return { start: this.sharedStart, end: this.sharedEnd }
  }

  /** 获取所有轨道 */
  allTracks() { return Array.from(this.querySelectorAll(':scope > time-line-track')) }

  /** 编程式创建轨道 */
  addTrack(label, start, end, opts = {}) {
    const t = document.createElement('time-line-track')
    t.setAttribute('label', label || '')
    t.setAttribute('start', String(start ?? 0))
    t.setAttribute('end',   String(end ?? 24))
    if (opts.step)         t.setAttribute('step',         String(opts.step))
    if (opts.minDuration)  t.setAttribute('min-duration',  String(opts.minDuration))
    if (opts.maxSegments)  t.setAttribute('max-segments', String(opts.maxSegments))
    this.appendChild(t)
    return t
  }

  /** 移除轨道 */
  removeTrack(track) { track.remove() }

  /* ---- 缩放 API ---- */

  /** 以指定（或鼠标位置）为中心放大一步 */
  zoomIn(centerRatio = 0.5) {
    this._zoomAtRatio(centerRatio, 1 / 1.2)
  }

  /** 以指定（或鼠标位置）为中心缩小一步 */
  zoomOut(centerRatio = 0.5) {
    this._zoomAtRatio(centerRatio, 1.2)
  }

  /**
   * 缩放到指定范围
   * @param {number} start - 视图起始
   * @param {number} end - 视图结束
   */
  zoomTo(start, end) {
    this.zoomStart = start
    this.zoomEnd = end
  }

  /** 重置缩放：清除 zoom-start/zoom-end，恢复默认视图范围 */
  zoomReset() {
    this.removeAttribute('zoom-start')
    this.removeAttribute('zoom-end')
  }

  /** 缩放到适合所有内容（重置 + 若共享模式则自动计算全范围） */
  zoomFit() {
    this.zoomReset()
  }

  /**
   * 在给定比例位置执行缩放
   * @param {number} ratio - 缩放中心在视图中的比例（0~1）
   * @param {number} factor - 缩放系数（>1 缩小，<1 放大）
   */
  _zoomAtRatio(ratio, factor) {
    const vs = this.zoomStart != null ? this.zoomStart : this.sharedStart
    const ve = this.zoomEnd   != null ? this.zoomEnd   : this.sharedEnd
    const range = ve - vs
    if (!range) return

    const center = vs + ratio * range
    const newRange = range * factor
    const minR = this.minZoomRange
    if (newRange < minR) return

    this.zoomStart = center - newRange * ratio
    this.zoomEnd   = center + newRange * (1 - ratio)
  }

  /** 视图范围变更：刷新轴尺 + 所有轨道 */
  _onViewRangeChange() {
    const doDraw = () => {
      // 刷新轴尺（如果存在）
      if (this._axisRuler) this._drawAxisRuler()
      // 刷新所有轨道
      this.allTracks().forEach(t => {
        if (t._onViewRangeChange) t._onViewRangeChange()
      })
    }
    if (this._vrfRaf) cancelAnimationFrame(this._vrfRaf)
    this._vrfRaf = requestAnimationFrame(doDraw)
  }

  /**
   * 滚轮事件处理（Ctrl/Meta+滚轮 = 缩放，纯滚轮 = 滚动）
   * 使用 passive:false 以允许 preventDefault 阻止浏览器页面缩放
   */
  _wheelZoom(e) {
    // 只响应 Ctrl/Meta 组合键（阻止页面缩放，用于轨道缩放）
    const isZoom = e.ctrlKey || e.metaKey
    if (!isZoom) return

    e.preventDefault()

    const rect = this.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const isV = this.direction === 'vertical'
    const cp = isV ? e.clientY - rect.top : e.clientX - rect.left
    const dim = isV ? rect.height : rect.width

    // 鼠标位置在视图中的比例（0~1）
    const ratio = clamp(cp / dim, 0, 1)

    // 缩放系数：向下滚（deltaY>0）缩小，向上滚放大
    const FACTOR = 1.2
    const factor = e.deltaY > 0 ? FACTOR : 1 / FACTOR

    this._zoomAtRatio(ratio, factor)
  }

  /** 设置全局段圆角 */
  setGlobalRadius(val) {
    this._globalRadius = val
    this.querySelectorAll('time-line-segment').forEach(seg => {
      const bar = seg.querySelector(':scope > .tls-bar')
      if (bar) bar.style.borderRadius = val
    })
  }

  getGlobalRadius() {
    return this._globalRadius || '0'
  }

  /* ---- 共享轴模式 ---- */

  _onSharedConfigChange() {
    this._syncAxisRuler()
    this.allTracks().forEach(t => {
      if (t._onSharedConfigChange) t._onSharedConfigChange()
    })
  }

  /* ---- 粘性轴尺管理 ---- */

  /** 清除轴尺的 ResizeObserver 并移除 DOM */
  _cleanupRuler() {
    if (this._rulerResObs) { this._rulerResObs.disconnect(); this._rulerResObs = null }
    if (this._axisRuler) { this._axisRuler.remove(); this._axisRuler = null }
  }

  _syncAxisRuler() {
    if (this.axisRulerActive) {
      // 轴尺不存在、被 innerHTML 等操作移出 DOM、或方向变更时重新创建
      const isVertical = this.direction === 'vertical'
      const staleDir = this._axisRuler && this._axisRuler.classList.contains('vertical') !== isVertical
      if (!this._axisRuler || !this._axisRuler.isConnected || staleDir) {
        this._cleanupRuler()
        this._createAxisRuler()
      }
      requestAnimationFrame(() => this._drawAxisRuler())
      this.style.setProperty('--tlc-gap', '0')
      this.style.setProperty('--tlc-padding', '0')
      this.style.overflowX = isVertical ? '' : 'hidden'
    } else {
      this._cleanupRuler()
      this.style.removeProperty('overflow-x')
      this.style.removeProperty('--tlc-gap')
      this.style.setProperty('--tlc-padding', '14px 16px')
    }
  }

  _createAxisRuler() {
    this._axisRuler = document.createElement('div')
    this._axisRuler.className = 'tlc-axis-ruler'
    const isHorizontal = this.direction !== 'vertical'
    if (!isHorizontal) this._axisRuler.classList.add('vertical')
    this._axisRuler.innerHTML = ''
    this._axisRuler.append(
      h('div', { class: 'tlc-axis-spacer' }, h('span', { class: 'tlc-axis-range' })),
      h('div', { class: 'tlc-axis-body' }, h('canvas', { class: 'tlc-axis-canvas' })),
    )
    this.insertBefore(this._axisRuler, this.firstChild)

    const body = this._axisRuler.querySelector('.tlc-axis-body')
    this._rulerResObs = new ResizeObserver(() => {
      requestAnimationFrame(() => this._drawAxisRuler())
    })
    this._rulerResObs.observe(body)
  }

  _drawAxisRuler() {
    const ruler = this._axisRuler
    if (!ruler) return

    const fmt = this.getFormatter()
    const isHorizontal = this.direction !== 'vertical'
    // 使用缩放感知的范围
    const { start: axisStart, end: axisEnd } = this._axisRange()
    const rangeEl = ruler.querySelector('.tlc-axis-range')
    if (rangeEl) {
      const loc = resolveLocale(this)
      const text = loc.axisRange
        .replace('{start}', fmt.format(axisStart, 'axis'))
        .replace('{end}', fmt.format(axisEnd, 'axis'))
      rangeEl.textContent = text
    }

    const canvas = ruler.querySelector('.tlc-axis-canvas')
    const body   = ruler.querySelector('.tlc-axis-body')
    if (!canvas || !body) return
    const rect = body.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const dpr = window.devicePixelRatio || 1
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    canvas.style.width  = rect.width  + 'px'
    canvas.style.height = rect.height + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const range = axisEnd - axisStart
    if (!range) return

    const dim  = isHorizontal ? rect.width : rect.height
    const step = fmt.niceStep(range, dim)

    if (isHorizontal) {
      // 横向轴尺（顶部，刻度朝下）
      ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, rect.height - 0.5); ctx.lineTo(rect.width, rect.height - 0.5); ctx.stroke()

      // 次刻度
      ctx.strokeStyle = '#e0e3e8'; ctx.lineWidth = 0.5
      for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step / 2) {
        const px = ((t - axisStart) / range) * dim
        if (px < 2 || px > dim - 2) continue
        ctx.beginPath(); ctx.moveTo(px, rect.height - 0.5); ctx.lineTo(px, rect.height - 4); ctx.stroke()
      }

      // 主刻度
      ctx.strokeStyle = '#c0c5cc'; ctx.lineWidth = 1
      for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
        const px = ((t - axisStart) / range) * dim
        if (px < 1 || px > dim - 1) continue
        ctx.beginPath(); ctx.moveTo(px, rect.height - 0.5); ctx.lineTo(px, rect.height - 8); ctx.stroke()
      }

      // 时间文字
      ctx.fillStyle = '#6b7d8e'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
        const px = ((t - axisStart) / range) * dim
        if (px < 20 || px > dim - 20) continue
        ctx.fillText(fmt.format(t, 'axis'), px, rect.height - 9)
      }
      // 强制显示首尾
      ctx.textAlign = 'left'
      if (0 < 20) ctx.fillText(fmt.format(axisStart, 'axis'), Math.max(0, 2), rect.height - 9)
      ctx.textAlign = 'right'
      if (dim > dim - 20) ctx.fillText(fmt.format(axisEnd, 'axis'), Math.min(dim, dim - 2), rect.height - 9)
    } else {
      // 纵向轴尺（左侧，刻度朝右）
      ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(rect.width - 0.5, 0); ctx.lineTo(rect.width - 0.5, rect.height); ctx.stroke()

      // 次刻度
      ctx.strokeStyle = '#e0e3e8'; ctx.lineWidth = 0.5
      for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step / 2) {
        const py = ((t - axisStart) / range) * dim
        if (py < 2 || py > dim - 2) continue
        ctx.beginPath(); ctx.moveTo(rect.width - 0.5, py); ctx.lineTo(rect.width - 5, py); ctx.stroke()
      }

      // 主刻度
      ctx.strokeStyle = '#c0c5cc'; ctx.lineWidth = 1
      for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
        const py = ((t - axisStart) / range) * dim
        if (py < 1 || py > dim - 1) continue
        ctx.beginPath(); ctx.moveTo(rect.width - 0.5, py); ctx.lineTo(rect.width - 9, py); ctx.stroke()
      }

      // 时间文字
      ctx.fillStyle = '#6b7d8e'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
      for (let t = Math.floor(axisStart / step) * step; t <= axisEnd; t += step) {
        const py = ((t - axisStart) / range) * dim
        if (py < 12 || py > dim - 12) continue
        ctx.fillText(fmt.format(t, 'axis'), rect.width - 11, py)
      }
      // 强制显示首尾
      if (0 < 12) ctx.fillText(fmt.format(axisStart, 'axis'), rect.width - 11, Math.max(0, 8))
      if (dim > dim - 12) ctx.fillText(fmt.format(axisEnd, 'axis'), rect.width - 11, Math.min(dim, dim - 8))
    }
  }

  /* ---- 内部 ---- */
  _applyDir() {
    const v = this.direction === 'vertical'
    this.style.flexDirection = v ? 'row' : 'column'
    this.style.overflow = 'auto'
  }
}
