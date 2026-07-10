/**
 * <time-line-segment> 自定义元素 — 时间段
 * 支持拖拽移动、两端手柄调长度、悬停删除
 * @module TimeSegment
 */

import { clamp, h, snap } from './utils.js'
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
    this._srcTrack = null    // 来源轨道（跨轨道拖拽）
    this._tgtTrack = null    // 目标轨道（跨轨道拖拽时）
    this._ghost = null       // 跨轨道拖拽浮层元素
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
  get label()    { const v = this.getAttribute('label'); return (v && v !== 'null' && v !== 'undefined') ? v : '' }
  set label(v)   { if (v == null) this.removeAttribute('label'); else this.setAttribute('label', v) }
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
    // 秒级显示由轴/轨道帧绘制时统一设置 fmt.showSec，段继承即可
    this.innerHTML = ''
    this.append(
      h('div', { class: 'tls-hdl tls-hdl-left', 'data-role': 'hdl-left' }, h('div', { class: 'tls-hdl-bar' })),
      h('div', { class: 'tls-hdl tls-hdl-right', 'data-role': 'hdl-right' }, h('div', { class: 'tls-hdl-bar' })),
      h('div', { class: 'tls-bar', style: { background: col, border: `1px solid ${darker}`, borderRadius: r } }, [
        h('div', { class: 'tls-inner' }, [
          this.label ? h('span', { class: 'tls-label' }, this.label) : null,
          h('span', { class: 'tls-time' }, this._formatter.formatRange(this.start, this.end, 'segment')),
        ]),
      ]),
      h('button', { class: 'tls-del', 'data-role': 'del', title: loc.deleteBtnTitle, onClick: null }, '×'),
    )
  }

  _bind() {
    this.addEventListener('pointerdown', e => this._onDown(e))
    this.addEventListener('click', e => {
      if (e.target.closest('[data-role="del"]')) {
        e.stopPropagation()
        const loc = resolveLocale(this)
        const segRange = this._formatter.formatRange(this.start, this.end, 'axis')
        const name = this.label || segRange
        showDeleteConfirm(
          loc.confirmDeleteSegment
            .replace('{name}', name)
            .replace('{range}', segRange),
          () => this._deleteSegment(),
          this
        )
      }
    })

    // Tooltip — 全局 portal，不受祖先 overflow 裁剪
    // 所有入口（mouseenter / mousemove / _onMove_）都实时检查 _isTruncated()，
    // 不依赖缓存标志，避免状态不同步
    this.addEventListener('mouseenter', () => {
      if (this._ptrActive) return
      this._refreshTooltip()
    })
    this.addEventListener('mousemove', () => {
      if (this._ptrActive) return   // 拖拽中由 _onMove_ 管理 tooltip
      this._refreshTooltip()
    })
    this.addEventListener('mouseleave', () => {
      hideGlobalTip()
    })

    // 右键菜单
    this.addEventListener('contextmenu', e => {
      if (this._ptrActive) return               // 拖拽中不响应
      if (e.target.closest('[data-role="del"]')) return // 删除按钮上不响应
      e.preventDefault()
      e.stopPropagation()                       // 阻止冒泡到轨道
      const l = resolveLocale(this)
      const segRange = this._formatter.formatRange(this.start, this.end, 'axis')
      // 无标签时使用时间范围替代"未命名"，避免无意义占位文字
      const segName = this.label || segRange
      const name = this.label || segRange
      showContextMenu([
        { type: 'header', label: l.segmentMenuHeader.replace('{name}', segName).replace('{range}', segRange) },
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

  /** 展示/隐藏（非拖拽期间的实时 tooltip 刷新） */
  _refreshTooltip() {
    const mode = this.tooltip
    if (mode === 'none') return
    if (mode === 'always' || this._isTruncated()) {
      showGlobalTip(this)
    } else {
      hideGlobalTip()
    }
  }

  /** 公开的 tooltip 显示方法（兼容外部调用） */
  _showTooltip() {
    if (this._ptrActive) return
    this._refreshTooltip()
  }

  /** 公开的 tooltip 隐藏方法（兼容外部调用） */
  _hideTooltip() {
    hideGlobalTip()
  }

  /** 容器 locale 属性变更时刷新文字相关 DOM */
  _onLocaleChange() {
    this._buildDOM()
    this._updateTextVisibility()
  }

  /** 刷新文字可见性 */
  _updateTextVisibility() {
    cancelAnimationFrame(this._tvRaf)
    this._tvRaf = requestAnimationFrame(() => {
      this._tvRaf = 0
      this.classList.toggle('tls-text-hidden', this._isTruncated())
    })
  }

  /** 检测段内文本是否被截断（横向/纵向均检测） */
  _isTruncated() {
    const label = this.querySelector(':scope > .tls-bar > .tls-inner > .tls-label')
    const time  = this.querySelector(':scope > .tls-bar > .tls-inner > .tls-time')
    // 水平方向：文本节点因段宽不足被截断（text-overflow: ellipsis）
    if (label && label.scrollWidth > label.clientWidth + 1) return true
    if (time  && time.scrollWidth  > time.clientWidth  + 1) return true
    const inner = this.querySelector(':scope > .tls-bar > .tls-inner')
    if (!inner) return false
    if (inner.scrollWidth > inner.clientWidth + 1) return true

    // 动态计算文字内容所需最小高度，适配自定义样式覆盖（字体放大等）
    // 注：inner.clientHeight 不受父容器 overflow:hidden 约束（可能等于内容自然高度），
    //     需用 tls-bar.clientHeight（即段实际可见高度）作为参考
    const children = inner.children
    if (children.length) {
      let contentH = 0
      for (const child of children) {
        const cs = getComputedStyle(child)
        const fs = parseFloat(cs.fontSize) || 11
        // lineHeight 可能为 'normal'（≈1.2），计算实际像素值
        const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight) || fs * 1.2
        contentH += lh
      }
      // flex-column 的 gap 也占用高度空间
      const gap = getComputedStyle(inner).gap
      if (gap && children.length > 1) {
        const gp = parseFloat(gap) || 0
        contentH += gp * (children.length - 1)
      }
      const bar = inner.parentElement
      if (bar && contentH > bar.clientHeight + 1) return true
    }

    return false
  }

  /* ---- 拖拽 ---- */
  _onDown(e) {
    if (e.target.closest('[data-role="del"]')) return // 让 click 处理
    if (e.button !== 0) return
    hideContextMenu() // 左键点击段时关闭可能存在的右键菜单
    this.classList.add('tls-selected')

    const hdl = e.target.closest('[data-role]')
    if (hdl && hdl.dataset.role === 'hdl-left')  this._mode = 'resize-left'
    else if (hdl && hdl.dataset.role === 'hdl-right') this._mode = 'resize-right'
    else this._mode = 'move'

    this._ptrActive = true
    this.classList.add(this._mode.startsWith('resize') ? 'resizing' : 'dragging')
    this._ptr0 = this._client(e)
    this._s0 = this.start
    this._e0 = this.end
    this._srcTrack = this._track
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
    const isCross = this._mode === 'move' && this._tgtTrack != null

    const dp = this._client(e) - this._ptr0
    const dt = t.px2Time(dp)
    const step = t.step || 0
    // 放大后步长回退到轴刻度步长，确保拉伸对齐刻度
    const vis = t._effRange()
    const visRange = vis.end - vis.start
    let axisStep = 0
    const body = t._bodyEl()
    if (body) {
      const bodyRect = body.getBoundingClientRect()
      const dim = t.isVertical ? bodyRect.height : bodyRect.width
      axisStep = t._formatter.niceStep(visRange, dim)
    }
    const effStep = step > 0 ? Math.min(step, (axisStep || visRange * 0.05) / 2) : 0
    const minW = t.minDur

    if (this._mode === 'resize-left') {
      let s = this._s0 + dt
      s = snap(s, effStep)
      s = clamp(s, this._lo, this._e0 - minW)
      this.start = s
    } else if (this._mode === 'resize-right') {
      let e = this._e0 + dt
      e = snap(e, effStep)
      e = clamp(e, this._s0 + minW, this._hi)
      this.end = e
    } else {
      const w = this._e0 - this._s0
      // 跨轨道时用目标轨道范围约束，否则用源轨道相邻段边界
      const bounds = isCross
        ? (this._tgtTrack._dragBounds ? this._tgtTrack._dragBounds() : this._tgtTrack._effRange())
        : { start: this._lo, end: this._hi }
      let s = this._s0 + dt
      s = snap(s, effStep)
      s = clamp(s, bounds.start, bounds.end - w)
      this.start = s
      this.end = s + w
    }

    // 跨轨道拖拽检测（仅 move 模式）
    if (this._mode === 'move') {
      const targetTrack = this._detectTargetTrack(e)
      if (targetTrack && targetTrack !== t) {
        if (!this._tgtTrack) {
          this._enterCrossTrack(e, targetTrack)
        } else {
          // 目标轨道变更（跨越中间轨道）：切换高亮并更新 _tgtTrack
          if (targetTrack !== this._tgtTrack) {
            this._tgtTrack.classList.remove('tlt-drag-over')
            targetTrack.classList.add('tlt-drag-over')
            this._tgtTrack = targetTrack
          }
          this._updateCrossGhost()
        }
        this.dispatchEvent(new CustomEvent('segment-change', {
          bubbles: true, detail: { segment: this, start: this.start, end: this.end }
        }))
        return
      }
      // 跨轨道拖拽中但指针不在其他轨道上
      if (this._tgtTrack) {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        const container = this._srcTrack.closest('time-line-container')
        // 离开容器或回到来源轨道时才退出；轨道间隙中保持浮层不动
        if (!el || !container.contains(el) || el.closest('time-line-track') === this._srcTrack) {
          this._exitCrossTrack()
        }
        this.dispatchEvent(new CustomEvent('segment-change', {
          bubbles: true, detail: { segment: this, start: this.start, end: this.end }
        }))
        return
      }
    }

    t._positionOne(this)
    this._buildDOM()
    this._updateTextVisibility()

    // 强制回排后检查截断状态，同步更新 tooltip
    void this.offsetHeight
    this._refreshTooltip()

    this.dispatchEvent(new CustomEvent('segment-change', {
      bubbles: true, detail: { segment: this, start: this.start, end: this.end }
    }))
  }

  _onUp_(e) {
    if (!this._ptrActive) return
    this._ptrActive = false
    this._mode = null
    this.classList.remove('dragging', 'resizing', 'tls-selected')
    this.removeEventListener('pointermove', this._onMove)
    this.removeEventListener('pointerup',   this._onUp)
    this.removeEventListener('pointercancel', this._onUp)
    this.removeEventListener('lostpointercapture', this._onUp)

    // 跨轨道拖拽结束 → 完成迁移
    if (this._tgtTrack) {
      this._finishCrossTrack(e)
      return
    }

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
    // 使用拖拽约束范围（共享轴裁剪 → 轨道自身范围；否则为有效范围）
    const { start: ts, end: te } = t._dragBounds ? t._dragBounds() : (t._effRange ? t._effRange() : { start: t.tStart, end: t.tEnd })
    this._lo = idx > 0 ? segs[idx - 1].end : ts
    this._hi = idx < segs.length - 1 ? segs[idx + 1].start : te
  }

  /** 获取指针位置（横/纵向自适应） */
  _client(e) {
    const t = this._track
    if (!t) return e.clientX
    return t.isVertical ? e.clientY : e.clientX
  }

  /* ---- 跨轨道拖拽 ---- */

  /**
   * 检测指针下方的目标轨道（同一容器内、同方向）
   * @param {PointerEvent} e
   * @returns {import('./TimeTrack.js').TimeTrack|null}
   */
  _detectTargetTrack(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el) return null
    const track = el.closest('time-line-track')
    if (!track || track === this._srcTrack) return null
    // 必须在同一个容器内且方向相同
    const srcC = this._srcTrack.closest('time-line-container')
    const tgtC = track.closest('time-line-container')
    if (srcC !== tgtC) return null
    if (track.isVertical !== this._srcTrack.isVertical) return null
    return track
  }

  /**
   * 进入跨轨道拖拽模式：隐藏原段，在目标轨道上创建浮层
   * @param {PointerEvent} e
   * @param {import('./TimeTrack.js').TimeTrack} track
   */
  _enterCrossTrack(e, track) {
    this._tgtTrack = track
    track.classList.add('tlt-drag-over')
    this.style.visibility = 'hidden'
    // 创建浮动 ghost（结构与真实段一致，使用与 _buildDOM 相同的圆角计算）
    const loc = resolveLocale(this)
    const darker = this._darken(this.color, 0.18)
    const c = this.closest('time-line-container')
    const ghostRadius = (c && c._globalRadius != null) ? c._globalRadius : '0'
    this._ghost = document.createElement('div')
    this._ghost.className = 'tlt-cross-ghost'
    this._ghost.innerHTML = ''
    this._ghost.append(
      h('div', { class: 'tls-bar', style: { background: this.color, border: `1px solid ${darker}`, borderRadius: ghostRadius } }, [
        h('div', { class: 'tls-inner' }, [
          this.label ? h('span', { class: 'tls-label' }, this.label) : null,
          h('span', { class: 'tls-time' }, this._formatter.formatRange(this.start, this.end, 'segment')),
        ]),
      ])
    )
    document.body.appendChild(this._ghost)
    // 触发入场动画（强制重排后加 show class）
    void this._ghost.offsetHeight
    this._ghost.classList.add('show')
    this._updateCrossGhost()
  }

  /** 更新浮层位置，跟随指针在当前目标轨道上映射的时间位置 */
  _updateCrossGhost() {
    if (!this._tgtTrack || !this._ghost) return
    const tgt = this._tgtTrack
    const rect = tgt._segRect()
    if (!rect) return
    const { start: ts, end: te } = tgt._effRange()
    const range = te - ts
    if (!range) return
    const v = tgt.isVertical
    const dim = v ? rect.height : rect.width
    const lo = ((this.start - ts) / range) * dim
    const hi = ((this.end   - ts) / range) * dim
    const segW = Math.max(Math.abs(hi - lo), 2)
    const segL = Math.min(lo, hi)

    // 定位采用 fixed，坐标来自 getBoundingClientRect（视口相对）
    Object.assign(this._ghost.style, {
      position: 'fixed',
      zIndex: '9999',
      pointerEvents: 'none',
      ...(v
        ? { left: rect.left + 'px', top: rect.top + segL + 'px', width: rect.width + 'px', height: segW + 'px' }
        : { left: rect.left + segL + 'px', top: rect.top + 'px', width: segW + 'px', height: rect.height + 'px' }),
    })
  }

  /** 退出跨轨道拖拽模式：清理浮层，恢复原段可见 */
  _exitCrossTrack() {
    if (this._tgtTrack) this._tgtTrack.classList.remove('tlt-drag-over')
    this._tgtTrack = null
    this.style.visibility = ''
    if (this._ghost) {
      // 退场动画后移除
      this._ghost.classList.remove('show')
      this._ghost.classList.add('hide')
      const g = this._ghost
      this._ghost = null
      setTimeout(() => { if (g.parentNode) g.remove() }, 200)
    }
  }

  /**
   * 完成跨轨道拖拽：校验约束 → 迁移 DOM → 刷新双轨道
   * 失败时回退到原轨道
   */
  _finishCrossTrack(e) {
    const tgt = this._tgtTrack
    const src = this._srcTrack
    // 清理视觉层
    if (this._ghost) { this._ghost.remove(); this._ghost = null }
    tgt.classList.remove('tlt-drag-over')
    this.style.visibility = ''

    const curStart = this.start
    const curEnd = this.end
    const dur = curEnd - curStart
    // 使用拖拽约束范围校验（共享轴裁剪 → 轨道自身范围）
    const { start: ts, end: te } = tgt._dragBounds ? tgt._dragBounds() : tgt._effRange()

    // 校验：超出目标轨道范围
    if (curStart < ts || curEnd > te || dur < tgt.minDur) { this._restorePosition(); return }
    // 校验：段数上限
    if (!tgt._checkSegmentLimit()) { this._restorePosition(); return }
    // 校验：与目标轨道已有段重叠
    for (const seg of tgt.sortedSegs()) {
      if (curStart < seg.end && curEnd > seg.start) { this._restorePosition(); return }
    }

    // ✅ 成功：闪光动画后迁移 DOM
    if (this._ghost) {
      this._ghost.classList.add('success')
      // 200ms 闪光动画完成后执行迁移
      const g = this._ghost
      this._ghost = null
      setTimeout(() => {
        if (g && g.parentNode) g.remove()
        this._doMigrate(tgt, src)
      }, 200)
    } else {
      this._doMigrate(tgt, src)
    }
  }

  /** 执行 DOM 迁移到目标轨道（成功动画回调） */
  _doMigrate(tgt, src) {
    this._buildDOM()
    src._segArea().removeChild(this)
    tgt._segArea().appendChild(this)
    requestAnimationFrame(() => {
      tgt._positionOne(this)
      tgt._refreshPositions()
      tgt._drawGrid()
      src._refreshPositions()
      src._drawGrid()
    })
    this.dispatchEvent(new CustomEvent('segment-changed', {
      bubbles: true, detail: { segment: this, start: this.start, end: this.end }
    }))
  }

  /** 跨轨道拖拽失败时回退到来源轨道原始位置 */
  _restorePosition() {
    this.start = this._s0
    this.end = this._e0
    this._buildDOM()
    this.style.visibility = ''
    // 移除 ghost 清理时残留的 hide class
    this.classList.remove('tls-text-hidden')
    const src = this._srcTrack
    this._srcTrack = null
    this._tgtTrack = null
    requestAnimationFrame(() => {
      src._positionOne(this)
      src._refreshPositions()
    })
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
