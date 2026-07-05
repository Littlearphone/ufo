/**
 * <time-line-container> 自定义元素 — 顶层容器
 * 管理方向布局、共享轴模式、全局圆角、Tooltip 位置
 * @module TimeContainer
 */

import { ensureCSS } from './css.js'
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
    this._formatter = createFormatter(this.type, this.unitValue)
    this._applyDir()
    this._syncAxisRuler() // 处理初始共享模式
  }

  static get observedAttributes() {
    return [
      'direction', '方向', 'label-h', 'label-v', 'axis-mode',
      'shared-start', 'shared-end', 'tooltip-pos', 'max-segments',
      'type', 'unit',
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
    if (name === 'tooltip-pos') return // 仅在鼠标悬停时读取
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
    } else if (name === 'axis-mode' || name === 'shared-start' || name === 'shared-end') {
      this._onSharedConfigChange()
    } else {
      this._applyDir()
      this._syncAxisRuler()
      this.querySelectorAll('time-line-track').forEach(t => {
        if (t._onDirChange) t._onDirChange()
      })
    }
  }

  get direction() { return this.getAttribute('direction') || this.getAttribute('方向') || 'horizontal' }
  set direction(v) { this.setAttribute('direction', v); this.setAttribute('方向', v) }

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
      const isVertical = this.direction === 'vertical' || this.direction === '纵向'
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
    const isHorizontal = this.direction !== 'vertical' && this.direction !== '纵向'
    if (!isHorizontal) this._axisRuler.classList.add('vertical')
    this._axisRuler.innerHTML =
      '<div class="tlc-axis-spacer"><span class="tlc-axis-range"></span></div>' +
      '<div class="tlc-axis-body"><canvas class="tlc-axis-canvas"></canvas></div>'
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
    const isHorizontal = this.direction !== 'vertical' && this.direction !== '纵向'
    const rangeEl = ruler.querySelector('.tlc-axis-range')
    if (rangeEl) rangeEl.textContent = fmt.formatRange(this.sharedStart, this.sharedEnd, 'axis')

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

    const range = this.sharedEnd - this.sharedStart
    if (!range) return

    const dim  = isHorizontal ? rect.width : rect.height
    const step = fmt.niceStep(range, dim)

    if (isHorizontal) {
      // 横向轴尺（顶部，刻度朝下）
      ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, rect.height - 0.5); ctx.lineTo(rect.width, rect.height - 0.5); ctx.stroke()

      // 次刻度
      ctx.strokeStyle = '#e0e3e8'; ctx.lineWidth = 0.5
      for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step / 2) {
        const px = ((t - this.sharedStart) / range) * dim
        if (px < 2 || px > dim - 2) continue
        ctx.beginPath(); ctx.moveTo(px, rect.height - 0.5); ctx.lineTo(px, rect.height - 4); ctx.stroke()
      }

      // 主刻度
      ctx.strokeStyle = '#c0c5cc'; ctx.lineWidth = 1
      for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
        const px = ((t - this.sharedStart) / range) * dim
        if (px < 1 || px > dim - 1) continue
        ctx.beginPath(); ctx.moveTo(px, rect.height - 0.5); ctx.lineTo(px, rect.height - 8); ctx.stroke()
      }

      // 时间文字
      ctx.fillStyle = '#6b7d8e'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
        const px = ((t - this.sharedStart) / range) * dim
        if (px < 20 || px > dim - 20) continue
        ctx.fillText(fmt.format(t, 'axis'), px, rect.height - 9)
      }
      // 强制显示首尾
      ctx.textAlign = 'left'
      if (0 < 20) ctx.fillText(fmt.format(this.sharedStart, 'axis'), Math.max(0, 2), rect.height - 9)
      ctx.textAlign = 'right'
      if (dim > dim - 20) ctx.fillText(fmt.format(this.sharedEnd, 'axis'), Math.min(dim, dim - 2), rect.height - 9)
    } else {
      // 纵向轴尺（左侧，刻度朝右）
      ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(rect.width - 0.5, 0); ctx.lineTo(rect.width - 0.5, rect.height); ctx.stroke()

      // 次刻度
      ctx.strokeStyle = '#e0e3e8'; ctx.lineWidth = 0.5
      for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step / 2) {
        const py = ((t - this.sharedStart) / range) * dim
        if (py < 2 || py > dim - 2) continue
        ctx.beginPath(); ctx.moveTo(rect.width - 0.5, py); ctx.lineTo(rect.width - 5, py); ctx.stroke()
      }

      // 主刻度
      ctx.strokeStyle = '#c0c5cc'; ctx.lineWidth = 1
      for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
        const py = ((t - this.sharedStart) / range) * dim
        if (py < 1 || py > dim - 1) continue
        ctx.beginPath(); ctx.moveTo(rect.width - 0.5, py); ctx.lineTo(rect.width - 9, py); ctx.stroke()
      }

      // 时间文字
      ctx.fillStyle = '#6b7d8e'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
      for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
        const py = ((t - this.sharedStart) / range) * dim
        if (py < 12 || py > dim - 12) continue
        ctx.fillText(fmt.format(t, 'axis'), rect.width - 11, py)
      }
      // 强制显示首尾
      if (0 < 12) ctx.fillText(fmt.format(this.sharedStart, 'axis'), rect.width - 11, Math.max(0, 8))
      if (dim > dim - 12) ctx.fillText(fmt.format(this.sharedEnd, 'axis'), rect.width - 11, Math.min(dim, dim - 8))
    }
  }

  /* ---- 内部 ---- */
  _applyDir() {
    const v = this.direction === 'vertical' || this.direction === '纵向'
    this.style.flexDirection = v ? 'row' : 'column'
    this.style.overflow = 'auto'
  }
}
