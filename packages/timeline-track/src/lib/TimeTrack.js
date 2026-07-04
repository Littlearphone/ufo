/**
 * <time-line-track> 自定义元素 — 单条轨道
 * 管理独立时间范围、网格刻度、段碰撞检测、拖拽创建新段
 * @module TimeTrack
 */

import { ensureCSS } from './css.js'
import { clamp, esc, fmtTime, snap } from './utils.js'

export class TimeTrack extends HTMLElement {
  constructor() {
    super()
    this._init = false
    this._mutObs = null
    this._trackMutObs = null
    this._resObs = null

    // 拖拽创建状态
    this._creating = false
    this._crS = 0
    this._crP0 = 0
    this._ghost = null
  }

  /* ---- 属性 ---- */
  get tStart() { return parseFloat(this.getAttribute('start')) || 0 }
  get tEnd()   { return parseFloat(this.getAttribute('end'))   || 24 }
  get label()  { return this.getAttribute('label') || '' }
  set label(v) { this.setAttribute('label', v) }
  get step()   { return parseFloat(this.getAttribute('step'))  || 0 }
  set step(v)  { this.setAttribute('step', v) }
  get minDur() {
    const a = this.getAttribute('min-duration')
    if (a != null) return parseFloat(a)
    // 默认最小宽度为范围的 0.5%
    return (this.tEnd - this.tStart) * 0.005
  }
  get isVertical() {
    const c = this.closest('time-line-container')
    if (!c) return false
    const d = c.getAttribute('direction') || c.getAttribute('方向') || ''
    return d === 'vertical' || d === '纵向'
  }

  /** 横向模式轴标签位置：从容器读取 */
  get labelH() { const c = this.closest('time-line-container'); return c ? c.labelH : 'top' }
  /** 纵向模式轴标签位置：从容器读取 */
  get labelV() { const c = this.closest('time-line-container'); return c ? c.labelV : 'right' }

  /* ---- 公共 API ---- */

  /** 按时间排序所有段 */
  sortedSegs() {
    const arr = Array.from(this.querySelectorAll(':scope .tlt-seg-area > time-line-segment'))
    arr.sort((a, b) => a.start - b.start)
    return arr
  }

  /** 像素 → 时间值 */
  px2Time(px) {
    const r = this._segRect()
    if (!r) return 0
    const dim = this.isVertical ? r.height : r.width
    if (!dim) return 0
    const { start: ts, end: te } = this._effRange()
    return (px / dim) * (te - ts)
  }

  /** 时间值 → 像素 */
  time2Px(t) {
    const r = this._segRect()
    if (!r) return 0
    const dim = this.isVertical ? r.height : r.width
    const { start: ts, end: te } = this._effRange()
    return ((t - ts) / (te - ts)) * dim
  }

  /** 编程式创建时间段 */
  addSegment(start, end, opts = {}) {
    const seg = document.createElement('time-line-segment')
    const { start: ts, end: te } = this._effRange()
    seg.start = clamp(start, ts, te)
    seg.end   = clamp(end,   ts, te)
    if (opts.label)  seg.label  = opts.label
    if (opts.color)  seg.color  = opts.color
    if (opts.radius) seg.radius = opts.radius
    this._segArea().appendChild(seg)
    requestAnimationFrame(() => {
      this._positionOne(seg)
      this._drawGrid()
    })
    this.dispatchEvent(new CustomEvent('segment-created', {
      bubbles: true, detail: { segment: seg }
    }))
    return seg
  }

  /* ---- 生命周期 ---- */
  connectedCallback() {
    ensureCSS()
    if (this._init) { this._onDirChange(); return }
    this._init = true
    this._render()
  }

  disconnectedCallback() {
    if (this._mutObs) this._mutObs.disconnect()
    if (this._trackMutObs) this._trackMutObs.disconnect()
    if (this._resObs) this._resObs.disconnect()
  }

  static get observedAttributes() { return ['label', 'start', 'end', 'step', 'min-duration'] }

  attributeChangedCallback(name, _ov, nv) {
    if (!this._init) return
    if (name === 'label') {
      const el = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-label')
      if (el) { el.textContent = this.label || '未命名'; el.title = this.label || '未命名' }
    } else {
      requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
    }
  }

  /* ---- 初次渲染 ---- */
  _render() {
    // 暂存已有 segment 元素
    const chips = Array.from(this.children).filter(c => c.tagName === 'TIME-LINE-SEGMENT')

    const v = this.isVertical
    this.classList.toggle('vertical', v)
    this.innerHTML =
      `<div class="tlt-row">
        <div class="tlt-head">
          <span class="tlt-head-label" title="${esc(this.label) || '未命名'}">${esc(this.label) || '未命名'}</span>
          <span class="tlt-head-range">${fmtTime(this.tStart, false)} – ${fmtTime(this.tEnd, false)}</span>
        </div>
        <div class="tlt-body">
          <canvas class="tlt-grid-canvas"></canvas>
          <div class="tlt-seg-area"></div>
        </div>
      </div>`

    // 共享轴模式：隐藏轨道头部时间范围（由轴尺统一显示）
    if (this._isSharedMode()) {
      const headRange = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-range')
      if (headRange) headRange.style.display = 'none'
    }

    // 把暂存的 segment 放回 .tlt-seg-area
    const area = this._segArea()
    chips.forEach(c => area.appendChild(c))

    // 事件绑定
    const body = this.querySelector('.tlt-body')
    body.addEventListener('pointerdown', e => this._bodyDown(e))

    // ResizeObserver 监听尺寸变化
    this._resObs = new ResizeObserver(() => { this._drawGrid(); this._refreshPositions() })
    this._resObs.observe(body)

    // 观测 .tlt-seg-area 子节点变更
    this._mutObs = new MutationObserver(muts => {
      let dirty = false
      for (const m of muts) {
        if (m.type !== 'childList') continue
        if (m.addedNodes.length || m.removedNodes.length) dirty = true
      }
      if (dirty) {
        requestAnimationFrame(() => { this._refreshPositions(); this._drawGrid() })
      }
    })
    this._mutObs.observe(this._segArea(), { childList: true })

    // 额外监听 track 自身：segment 可能被直接 append 到 track 上
    this._trackMutObs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type !== 'childList') continue
        for (const n of m.addedNodes) {
          if (n.nodeType === 1 && n.tagName === 'TIME-LINE-SEGMENT') {
            this._segArea().appendChild(n)
          }
        }
      }
    })
    this._trackMutObs.observe(this, { childList: true })

    // 根据 label-h/label-v 调整 seg-area 间距
    this._applyLabelPos()

    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /** 方向变更时重新应用布局 */
  _onDirChange() {
    const v = this.isVertical
    this.classList.toggle('vertical', v)
    this._applyLabelPos()
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /** 根据容器 label-h/label-v 属性调整 seg-area 间距 */
  _applyLabelPos() {
    const area = this._segArea()
    if (!area) return
    const c = this.closest('time-line-container')
    const isShared = c && c.axisMode === 'shared'

    // 共享模式（有粘性轴尺）：seg-area 完全填满
    if (isShared && c && c.axisRulerActive) {
      area.style.left   = '0'
      area.style.right  = '0'
      area.style.top    = '0'
      area.style.bottom = '0'
      return
    }

    // 纵向共享模式（兼容旧版，无轴尺情况）
    if (isShared && this.isVertical) {
      area.style.left   = this.labelV === 'left' ? '36px' : '0'
      area.style.right  = this.labelV === 'left' ? '0' : '36px'
      area.style.top    = ''
      area.style.bottom = ''
      return
    }

    // 独立轴模式：按 labelH/labelV 为轴标签留空
    if (this.isVertical) {
      area.style.left   = this.labelV === 'left' ? '36px' : '0'
      area.style.right  = this.labelV === 'left' ? '0' : '36px'
      area.style.top    = ''
      area.style.bottom = ''
    } else {
      area.style.left   = ''
      area.style.right  = ''
      area.style.top    = this.labelH === 'bottom' ? '0' : '18px'
      area.style.bottom = this.labelH === 'bottom' ? '18px' : '0'
    }
  }

  /** 轴标签位置属性变更后的响应 */
  _onLabelPosChange() {
    this._applyLabelPos()
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /* ---- 内部 DOM 快捷方法 ---- */
  _bodyEl()   { return this.querySelector(':scope > .tlt-row > .tlt-body') }
  _canvasEl() { return this.querySelector(':scope > .tlt-row > .tlt-body > .tlt-grid-canvas') }
  _segArea()  { return this.querySelector(':scope > .tlt-row > .tlt-body > .tlt-seg-area') }
  _segRect()  { const a = this._segArea(); return a ? a.getBoundingClientRect() : null }

  /* ---- 拖拽创建 ---- */
  _bodyDown(e) {
    if (e.button !== 0) return
    // 是否点在了已有 segment 上？
    const path = e.composedPath()
    if (path.some(el => el.tagName === 'TIME-LINE-SEGMENT')) return

    const rect = this._segRect()
    if (!rect) return
    const v = this.isVertical
    const cp = v ? e.clientY : e.clientX
    const orig = v ? rect.top : rect.left
    const dim  = v ? rect.height : rect.width
    if (!dim) return

    this._creating = true
    this._crS  = this.tStart + ((cp - orig) / dim) * (this._effRange().end - this._effRange().start)
    this._crP0 = cp

    // 创建半透明预览条
    this._ghost = document.createElement('div')
    this._ghost.className = 'tlt-ghost'
    this._segArea().appendChild(this._ghost)
    if (v) {
      const y = this.time2Px(this._crS)
      this._ghost.style.cssText = `left:0;right:0;top:${y}px;height:2px;`
    } else {
      const x = this.time2Px(this._crS)
      this._ghost.style.cssText = `top:0;bottom:0;left:${x}px;width:2px;`
    }

    this.setPointerCapture(e.pointerId)
    const onM = ev => this._createMove(ev)
    const onU = ev => this._createUp(ev, onM, onU)
    this.addEventListener('pointermove', onM)
    this.addEventListener('pointerup', onU)
    this.addEventListener('pointercancel', onU)
    e.preventDefault()
  }

  _createMove(e) {
    if (!this._creating || !this._ghost) return
    const v = this.isVertical
    const cp = v ? e.clientY : e.clientX
    const t1 = this._crS
    const rect = this._segRect(); if (!rect) return
    const orig = v ? rect.top : rect.left
    const dim  = v ? rect.height : rect.width
    const t2 = this.tStart + ((cp - orig) / dim) * (this._effRange().end - this._effRange().start)
    const lo = Math.min(t1, t2), hi = Math.max(t1, t2)
    const p1 = this.time2Px(lo), p2 = this.time2Px(hi)

    if (v) {
      this._ghost.style.top    = p1 + 'px'
      this._ghost.style.height = Math.max(3, p2 - p1) + 'px'
    } else {
      this._ghost.style.left  = p1 + 'px'
      this._ghost.style.width = Math.max(3, p2 - p1) + 'px'
    }
  }

  _createUp(e, onM, onU) {
    this._creating = false
    this.removeEventListener('pointermove', onM)
    this.removeEventListener('pointerup', onU)
    this.removeEventListener('pointercancel', onU)
    if (this._ghost) { this._ghost.remove(); this._ghost = null }

    const v = this.isVertical
    const cp = v ? e.clientY : e.clientX
    const rect = this._segRect(); if (!rect) return
    const orig = v ? rect.top : rect.left
    const dim  = v ? rect.height : rect.width
    const t2 = this.tStart + ((cp - orig) / dim) * (this._effRange().end - this._effRange().start)
    let lo = Math.min(this._crS, t2), hi = Math.max(this._crS, t2)

    if (this.step) { lo = snap(lo, this.step); hi = snap(hi, this.step) }

    // 确保不与其他段重叠
    const exist = this.sortedSegs()
    for (const seg of exist) {
      if (lo < seg.end && hi > seg.start) {
        if (this._crS < seg.start) hi = Math.min(hi, seg.start)
        else lo = Math.max(lo, seg.end)
      }
    }
    const { start: ts, end: te } = this._effRange()
    lo = clamp(lo, ts, te)
    hi = clamp(hi, ts, te)
    if (hi - lo >= this.minDur) this.addSegment(lo, hi)
  }

  /* ---- 网格绘制 ---- */
  _drawGrid() {
    const canvas = this._canvasEl()
    const body   = this._bodyEl()
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

    const v = this.isVertical
    const { start: gridStart, end: gridEnd } = this._effRange()
    const range = gridEnd - gridStart
    if (!range) return
    const dim  = v ? rect.height : rect.width
    const step = this._niceStep(range, dim)

    // 计算 seg-area 相对于 body 的偏移量
    const segRect = this._segRect()
    const offX = segRect ? segRect.left - rect.left : 5
    const offY = segRect ? segRect.top  - rect.top  : (v ? 5 : 0)

    // 网格线（次刻度）
    ctx.strokeStyle = '#f0f2f5'; ctx.lineWidth = 0.5
    for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step / 2) {
      this._drawLine(ctx, rect, t, v, offX, offY)
    }
    // 网格线（主刻度）
    ctx.strokeStyle = '#dde0e4'; ctx.lineWidth = 0.7
    for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
      this._drawLine(ctx, rect, t, v, offX, offY)
    }

    // 共享模式（有粘性轴尺）所有轨道不画标签
    if (this._isSharedMode()) {
      const c = this.closest('time-line-container')
      if (c && c.axisRulerActive) return
    }

    // 标签
    ctx.fillStyle = '#7a8591'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
    if (v) {
      ctx.textBaseline = 'middle'
      ctx.textAlign = this.labelV === 'left' ? 'left' : 'right'
      const labelX = this.labelV === 'left' ? 6 : rect.width - 6
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        const px = this.time2Px(t)
        if (px > 14 && px < rect.height - 8) ctx.fillText(fmtTime(t, step < 1), labelX, px + offY)
      }
      // 强制显示首尾
      const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd)
      if (sp <= 14) ctx.fillText(fmtTime(gridStart, step < 1), labelX, sp + offY + 10)
      if (ep >= rect.height - 8) ctx.fillText(fmtTime(gridEnd, step < 1), labelX, ep + offY - 10)
    } else {
      ctx.textAlign = 'center'
      ctx.textBaseline = this.labelH === 'bottom' ? 'bottom' : 'top'
      const labelY = this.labelH === 'bottom' ? rect.height - 4 : 4
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        const px = this.time2Px(t)
        if (px > 24 && px < rect.width - 24) ctx.fillText(fmtTime(t, step < 1), px + offX, labelY)
      }
      // 强制显示首尾
      const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd)
      ctx.textAlign = 'left'
      if (sp <= 24) ctx.fillText(fmtTime(gridStart, step < 1), Math.max(sp + offX, 2), labelY)
      ctx.textAlign = 'right'
      if (ep >= rect.width - 24) ctx.fillText(fmtTime(gridEnd, step < 1), Math.min(ep + offX, rect.width - 2), labelY)
    }
  }

  _drawLine(ctx, bodyRect, t, vertical, offX, offY) {
    const px = this.time2Px(t)
    if (vertical) {
      const y = px + offY
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(bodyRect.width, y); ctx.stroke()
    } else {
      const x = px + offX
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, bodyRect.height); ctx.stroke()
    }
  }

  /** 计算合适的网格步长 */
  _niceStep(range, pxSize) {
    const targetPx = 72
    const raw = range / (pxSize / targetPx)
    const ticks = [0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 24, 48]
    for (const t of ticks) if (raw <= t) return t
    let p = 1; while (p < raw) p *= 2
    return p
  }

  /* ---- 段定位 ---- */
  _positionOne(seg) {
    const r = this._segRect()
    if (!r) return
    const { start: ts, end: te } = this._effRange()
    const range = te - ts
    if (!range) return
    const v = this.isVertical
    const dim = v ? r.height : r.width
    const p1  = ((seg.start - ts) / range) * dim
    const p2  = ((seg.end   - ts) / range) * dim
    if (v) {
      seg.style.top    = p1 + 'px'
      seg.style.left   = '0'
      seg.style.right  = '0'
      seg.style.height = Math.max(6, p2 - p1) + 'px'
      seg.style.width  = ''
      seg.style.bottom = ''
    } else {
      seg.style.left   = p1 + 'px'
      seg.style.top    = '0'
      seg.style.bottom = '0'
      seg.style.width  = Math.max(6, p2 - p1) + 'px'
      seg.style.height = ''
      seg.style.right  = ''
    }
  }

  _refreshPositions() { this.sortedSegs().forEach(s => this._positionOne(s)) }

  /** 是否处于共享轴模式 */
  _isSharedMode() {
    const c = this.closest('time-line-container')
    return c && c.axisMode === 'shared'
  }

  /** 有效时间范围（共享轴 → 容器范围；独立轴 → 自身范围） */
  _effRange() {
    const c = this.closest('time-line-container')
    if (c && c.axisMode === 'shared') return { start: c.sharedStart, end: c.sharedEnd }
    return { start: this.tStart, end: this.tEnd }
  }

  /** 共享轴配置变更时回调 */
  _onSharedConfigChange() {
    const headRange = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-range')
    if (this._isSharedMode()) {
      if (headRange) headRange.style.display = 'none'
    } else {
      if (headRange) headRange.style.display = ''
    }
    this._applyLabelPos()
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }
}
