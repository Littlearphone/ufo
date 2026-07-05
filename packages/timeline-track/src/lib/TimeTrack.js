/**
 * <time-line-track> 自定义元素 — 单条轨道
 * 管理独立时间范围、网格刻度、段碰撞检测、拖拽创建新段
 * @module TimeTrack
 */

import { ensureCSS } from './css.js'
import { clamp, esc, snap } from './utils.js'
import { showContextMenu, showDeleteConfirm, showTrackEditDialog } from './contextmenu.js'
import { resolveLocale } from './locale.js'

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
  get tStart() { return this._formatter.parse(this.getAttribute('start'), 0) }
  get tEnd()   { return this._formatter.parse(this.getAttribute('end'),   24) }
  get label()  { return this.getAttribute('label') || '' }
  set label(v) { this.setAttribute('label', v) }
  get step()   { return this._formatter.parse(this.getAttribute('step'),  0) }
  set step(v)  { this.setAttribute('step', v) }
  get minDur() {
    const a = this.getAttribute('min-duration')
    if (a != null) return this._formatter.parse(a)
    // 默认最小宽度为范围的 0.5%
    return (this.tEnd - this.tStart) * 0.005
  }
  /** 最大段数：轨道自身属性 > 容器全局配置 > 无限制 */
  get maxSegments() {
    const mine = this.getAttribute('max-segments')
    if (mine != null) {
      const n = parseInt(mine, 10)
      return n > 0 ? n : 0
    }
    const c = this.closest('time-line-container')
    if (c && c.maxSegments) return c.maxSegments
    return 0 // 0 = 无限制
  }
  set maxSegments(v) { this.setAttribute('max-segments', v) }

  get isVertical() {
    const c = this.closest('time-line-container')
    if (!c) return false
    const d = c.getAttribute('direction') || c.getAttribute('方向') || ''
    return d === 'vertical' || d === '纵向'
  }

  /** 从容器获取 Formatter（找不到时用默认 TimeFormatter） */
  get _formatter() {
    const c = this.closest('time-line-container')
    return c ? c.getFormatter() : (this._fmtFallback || (this._fmtFallback = createFormatter('time', 'hour')))
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
    // 检查段数上限
    if (!this._checkSegmentLimit()) return null

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

  /** 程序化删除本轨道（发送可取消事件，供右键菜单调用） */
  _deleteTrack() {
    const ok = this.dispatchEvent(new CustomEvent('track-before-delete', {
      bubbles: true, cancelable: true, detail: { track: this }
    }))
    if (!ok) return
    this.remove()
    this.dispatchEvent(new CustomEvent('track-deleted', {
      bubbles: true, detail: { track: this }
    }))
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
    if (this._winResizeHandler) window.removeEventListener('resize', this._winResizeHandler)
  }

  static get observedAttributes() { return ['label', 'start', 'end', 'step', 'min-duration', 'max-segments'] }

  attributeChangedCallback(name, _ov, nv) {
    if (!this._init) return
    if (name === 'label') {
      const el = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-label')
      if (el) {
        const loc = resolveLocale(this)
        const txt = this.label || loc.unnamed
        el.textContent = txt; el.title = txt
      }
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
    const loc = resolveLocale(this)
    const labelTxt = this.label || loc.unnamed
    this.innerHTML =
      `<div class="tlt-row">
        <div class="tlt-head">
          <span class="tlt-head-label" title="${esc(labelTxt)}">${esc(labelTxt)}</span>
          <span class="tlt-head-range">${this._formatter.formatRange(this.tStart, this.tEnd, 'axis')}</span>
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

    // 右键菜单（段已在自身处理并 stopPropagation，此处的右键事件只来自轨道头部或空白区域）
    this.addEventListener('contextmenu', e => {
      if (this._creating) return              // 拖拽创建中不响应
      e.preventDefault()
      const l = resolveLocale(this)
      const name = this.label || l.unnamed
      showContextMenu([
        { label: l.modifyProps, action: () => showTrackEditDialog(this) },
        { type: 'divider' },
        { label: l.deleteTrack, danger: true, action: () => {
          showDeleteConfirm(
            l.confirmDeleteTrack
              .replace('{name}', name)
              .replace('{range}', this._formatter.formatRange(this.tStart, this.tEnd, 'axis')),
            () => { this._deleteTrack() },
            this
          )
        }}
      ], e.clientX, e.clientY)
    })

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

    // 窗口 resize 兜底：ResizeObserver 在某些浏览器或场景可能延迟/不触发
    this._resizeRaf = null
    this._winResizeHandler = () => {
      if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf)
      this._resizeRaf = requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
    }
    window.addEventListener('resize', this._winResizeHandler)

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

  /** 容器 locale 属性变更时的响应：刷新头部标签文字 */
  _onLocaleChange() {
    const el = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-label')
    if (el) {
      const loc = resolveLocale(this)
      const txt = this.label || loc.unnamed
      el.textContent = txt; el.title = txt
    }
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
    if (hi - lo >= this.minDur) {
      // 检查段数上限（拖拽创建）
      if (!this._checkSegmentLimit()) return
      this.addSegment(lo, hi)
    }
  }

  /** 检查当前段数是否已达上限，超限则派发事件并阻止创建 */
  _checkSegmentLimit() {
    const max = this.maxSegments
    if (max <= 0) return true
    const current = this.sortedSegs().length
    if (current < max) return true
    // 已超限：派发通知事件（fire-and-forget），始终阻止创建
    this.dispatchEvent(new CustomEvent('segment-limit-reached', {
      bubbles: true,
      detail: { track: this, current, max }
    }))
    return false
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

    const fmt = this._formatter
    const v = this.isVertical
    const { start: gridStart, end: gridEnd } = this._effRange()
    const range = gridEnd - gridStart
    if (!range) return
    const dim  = v ? rect.height : rect.width
    const step = fmt.niceStep(range, dim)

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
        if (px > 14 && px < rect.height - 8) ctx.fillText(fmt.format(t, 'axis'), labelX, px + offY)
      }
      // 强制显示首尾
      const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd)
      if (sp <= 14) ctx.fillText(fmt.format(gridStart, 'axis'), labelX, sp + offY + 10)
      if (ep >= rect.height - 8) ctx.fillText(fmt.format(gridEnd, 'axis'), labelX, ep + offY - 10)
    } else {
      ctx.textAlign = 'center'
      ctx.textBaseline = this.labelH === 'bottom' ? 'bottom' : 'top'
      const labelY = this.labelH === 'bottom' ? rect.height - 4 : 4
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        const px = this.time2Px(t)
        if (px > 24 && px < rect.width - 24) ctx.fillText(fmt.format(t, 'axis'), px + offX, labelY)
      }
      // 强制显示首尾
      const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd)
      ctx.textAlign = 'left'
      if (sp <= 24) ctx.fillText(fmt.format(gridStart, 'axis'), Math.max(sp + offX, 2), labelY)
      ctx.textAlign = 'right'
      if (ep >= rect.width - 24) ctx.fillText(fmt.format(gridEnd, 'axis'), Math.min(ep + offX, rect.width - 2), labelY)
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

  /** @deprecated 委托给 this._formatter.niceStep */
  _niceStep(range, pxSize) { return this._formatter.niceStep(range, pxSize) }

  /* ---- 段定位 ---- */

  /**
   * 计算单个段的像素位置与动态最小宽度
   * 最小宽度考虑与下一段之间的可用空间，避免视觉重叠
   * @param {TimeSegment} seg - 要定位的段元素
   * @param {number} [bulkDim] - 批量刷新时传入的总尺寸，避免重复 getBoundingClientRect
   */
  _positionOne(seg, bulkDim) {
    const r = bulkDim ? null : this._segRect()
    if (!r && bulkDim == null) return
    const { start: ts, end: te } = this._effRange()
    const range = te - ts
    if (!range) return
    const v = this.isVertical
    const dim = bulkDim ?? (v ? r.height : r.width)
    const p1  = ((seg.start - ts) / range) * dim
    const p2  = ((seg.end   - ts) / range) * dim

    // 计算到下一段左边界的像素间距，用于约束最小宽度
    // 避免密集场景下 6px 硬最小值导致的视觉重叠
    const segs = this.sortedSegs()
    const idx  = segs.indexOf(seg)
    let rightBound = dim  // 末段或独立段：边界为轨道末端
    if (idx >= 0 && idx < segs.length - 1) {
      const nStart = ((segs[idx + 1].start - ts) / range) * dim
      // 仅当下一段在视觉右侧时约束（防止已重叠段的错误放大）
      if (nStart > p1) rightBound = nStart
    }

    const avail = rightBound - p1     // 该段左边界到下一段左边界的像素距离

    // 三向约束：最小宽度不超过可用空间 & 实际宽度不超可用空间
    // 解释：
    //   1) Math.min(6, avail) — 尽量让段至少有 6px 可见，但受限于可用空间
    //   2) Math.max(p2 - p1, ...) — 至少等于时间计算出来的自然宽度
    //   3) Math.min(..., avail) — 绝对不能超出到下一段的空间（防止时间重叠的段溢出）
    //   → 极端场景（avail < 1px）：段变为细线但不会重叠
    const minW  = Math.min(6, avail)
    const segW  = Math.min(Math.max(p2 - p1, minW), avail)

    if (v) {
      seg.style.top    = p1 + 'px'
      seg.style.left   = '0'
      seg.style.right  = '0'
      seg.style.height = segW + 'px'
      seg.style.width  = ''
      seg.style.bottom = ''
    } else {
      seg.style.left   = p1 + 'px'
      seg.style.top    = '0'
      seg.style.bottom = '0'
      seg.style.width  = segW + 'px'
      seg.style.height = ''
      seg.style.right  = ''
    }
  }

  /**
   * 批量刷新所有段的位置（含重叠预防）
   * 一次计算总尺寸，所有段共享，避免反复 layout thrashing
   */
  _refreshPositions() {
    const segs = this.sortedSegs()
    if (!segs.length) return
    const r = this._segRect()
    if (!r) return
    const { start: ts, end: te } = this._effRange()
    const range = te - ts
    if (!range) return
    const v = this.isVertical
    const dim = v ? r.height : r.width

    // 单次计算所有段的 p1（左边界），用于约束相邻段
    const lefts = segs.map(s => ((s.start - ts) / range) * dim)

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      const p1 = lefts[i]
      const p2 = ((seg.end - ts) / range) * dim
      const nextBound = i < segs.length - 1 ? lefts[i + 1] : dim
      const avail = nextBound - p1
      const minW = Math.min(6, avail)
      const segW = Math.min(Math.max(p2 - p1, minW), avail)

      if (v) {
        seg.style.top    = p1 + 'px'
        seg.style.left   = '0'
        seg.style.right  = '0'
        seg.style.height = segW + 'px'
        seg.style.width  = ''
        seg.style.bottom = ''
      } else {
        seg.style.left   = p1 + 'px'
        seg.style.top    = '0'
        seg.style.bottom = '0'
        seg.style.width  = segW + 'px'
        seg.style.height = ''
        seg.style.right  = ''
      }
    }
  }

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
