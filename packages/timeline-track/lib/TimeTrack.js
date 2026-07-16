/**
 * <time-line-track> 自定义元素 — 单条轨道
 * 管理独立时间范围、网格刻度、段碰撞检测、拖拽创建新段
 * @module TimeTrack
 */

import { ensureCSS } from './css.js'
import { clamp, h, snap } from '../shared/utils.js'
import { showContextMenu, showCopyToTracksDialog, showDeleteConfirm, showTrackEditDialog } from './contextmenu.js'
import { resolveLocale } from '../shared/locale.js'
import { clearClipboard, copyToClipboard, getClipboard } from './clipboard.js'

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
  get step() {
    // 轨道自身有 step 属性 → 使用自身值（0=显式禁用吸附）
    if (this.hasAttribute('step')) return this._formatter.parse(this.getAttribute('step'), 0)
    // 无自身属性 → 回退到容器
    const c = this.closest('time-line-container')
    if (c && c.hasAttribute('step')) return c.getFormatter().parse(c.getAttribute('step'), 0)
    return 0 // 无任何配置 → 自由模式
  }
  set step(v)  { if (v == null) this.removeAttribute('step'); else this.setAttribute('step', v) }
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

  /** 获取默认段颜色（track属性 > container属性 > #5c9ce6） */
  get defaultColor() {
    if (this.hasAttribute('default-color')) return this.getAttribute('default-color')
    const c = this.closest('time-line-container')
    if (c && c.hasAttribute('default-color')) return c.getAttribute('default-color')
    return '#5c9ce6'
  }
  set defaultColor(v) {
    if (v == null || v === '#5c9ce6') this.removeAttribute('default-color')
    else this.setAttribute('default-color', v)
  }

  /* ---- 可编辑/可删除（继承自容器） ---- */

  /** 是否允许编辑（拖拽创建/移动/调整/修改属性），默认继承容器值或 true */
  get editable() {
    if (this.hasAttribute('editable')) return this.getAttribute('editable') !== 'false'
    const c = this.closest('time-line-container')
    return c ? c.editable : true
  }
  set editable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('editable')
    else this.setAttribute('editable', 'false')
  }

  /** 是否允许删除（删除轨道/段删除按钮和菜单），默认继承容器值或 true */
  get deletable() {
    if (this.hasAttribute('deletable')) return this.getAttribute('deletable') !== 'false'
    const c = this.closest('time-line-container')
    return c ? c.deletable : true
  }
  set deletable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('deletable')
    else this.setAttribute('deletable', 'false')
  }

  /** 是否允许清空本轨道所有段（右键菜单"清空时间段"），默认继承容器值或 true */
  get clearable() {
    if (this.hasAttribute('clearable')) return this.getAttribute('clearable') !== 'false'
    const c = this.closest('time-line-container')
    return c ? c.clearable : true
  }
  set clearable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('clearable')
    else this.setAttribute('clearable', 'false')
  }

  /** 是否允许复制本轨道的段（菜单"复制段/轨道"），默认继承容器值或 true */
  get copyable() {
    if (this.hasAttribute('copyable')) return this.getAttribute('copyable') !== 'false'
    const c = this.closest('time-line-container')
    return c ? c.copyable : true
  }
  set copyable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('copyable')
    else this.setAttribute('copyable', 'false')
  }

  /** 是否允许创建新段（拖拽创建），默认继承容器值或 true */
  get creatable() {
    if (this.hasAttribute('creatable')) return this.getAttribute('creatable') !== 'false'
    const c = this.closest('time-line-container')
    return c ? c.creatable : true
  }
  set creatable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('creatable')
    else this.setAttribute('creatable', 'false')
  }

  get isVertical() {
    const c = this.closest('time-line-container')
    if (!c) return false
    const d = c.getAttribute('direction') || ''
    return d === 'vertical'
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

    const { start: ts, end: te } = this._effRange()
    start = clamp(start, ts, te)
    end   = clamp(end,   ts, te)

    // 检查与已有段的时间重叠
    const existing = this.sortedSegs()
    for (const seg of existing) {
      if (start < seg.end && end > seg.start) {
        const fmt = this._formatter
        const loc = resolveLocale(this)
        const msg = loc.segmentOverlapError
          .replace('{start}', fmt.format(start))
          .replace('{end}', fmt.format(end))
          .replace('{label}', seg.label || loc.unnamed)
          .replace('{segStart}', fmt.format(seg.start))
          .replace('{segEnd}', fmt.format(seg.end))
        throw new Error('addSegment ' + msg)
      }
    }

    const seg = document.createElement('time-line-segment')
    seg.start = start
    seg.end   = end
    if (opts.label)  seg.label  = opts.label
    seg.color  = opts.color || this.defaultColor
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

  /** 清空本轨道所有时间段 */
  clearAllSegments() {
    this.sortedSegs().forEach(s => s.remove())
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

  /* ---- 复制/粘贴 ---- */

  /** 复制本轨道全部段到剪贴板（覆写已有剪贴板内容） */
  _copyTrack() {
    // 先清空旧剪贴板数据，避免残留的粘贴选项干扰菜单
    clearClipboard()
    const segs = this.sortedSegs().map(s => ({
      label: s.label,
      color: s.color,
      start: s.start,
      end: s.end,
      radius: s.radius,
    }))
    copyToClipboard('track', {
      label: this.label,
      segments: segs,
    })
    // 脉冲视觉反馈
    this._pulseCopy()
  }

  /** 从右键点击位置粘贴段（仅段数据到本轨道） */
  _pasteSegment(e, data) {
    // 计算点击位置的时间值
    const rect = this._segRect()
    if (!rect) return
    const v = this.isVertical
    const cp = v ? e.clientY : e.clientX
    const orig = v ? rect.top : rect.left
    const dim = v ? rect.height : rect.width
    if (!dim) return
    const { start: ts, end: te } = this._effRange()
    const duration = data.end - data.start
    let start = ts + ((cp - orig) / dim) * (te - ts)
    // 吸附到步长
    if (this.step > 0) start = snap(start, this.step)
    let end = start + duration
    // 约束到轨道范围
    const { start: dbS, end: dbE } = this._dragBounds()
    if (end > dbE) { start = dbE - duration; end = dbE }
    if (start < dbS) { start = dbS; end = dbS + duration }
    // 创建段
    try {
      const seg = this.addSegment(start, end, {
        label: data.label,
        color: data.color,
      })
      if (seg) seg._pulseCopy()
    } catch (_) { /* 重叠等错误静默忽略 */ }
  }

  /** 从剪贴板轨道数据创建新轨道 */
  _pasteNewTrack(data) {
    const container = this.closest('time-line-container')
    if (!container) return
    const label = data.label ? data.label + '（副本）' : ''
    const track = container.addTrack(label, this.tStart, this.tEnd)
    // 复制段
    for (const sd of data.segments) {
      try {
        track.addSegment(sd.start, sd.end, { label: sd.label, color: sd.color })
      } catch (_) { /* 静默 */ }
    }
    track._pulseCopy()
  }

  /** 用剪贴板轨道数据覆盖本轨道所有段 */
  _pasteOverwrite(data) {
    this.clearAllSegments()
    for (const sd of data.segments) {
      try {
        this.addSegment(sd.start, sd.end, { label: sd.label, color: sd.color })
      } catch (_) { /* 静默 */ }
    }
    this._pulseCopy()
  }

  /** 脉冲动画反馈 */
  _pulseCopy() {
    const row = this.querySelector(':scope > .tlt-row')
    if (!row) return
    row.classList.remove('tlt-copy-pulse')
    void row.offsetHeight // 强制重排
    row.classList.add('tlt-copy-pulse')
    setTimeout(() => row.classList.remove('tlt-copy-pulse'), 1200)
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

  static get observedAttributes() { return ['label', 'start', 'end', 'step', 'min-duration', 'max-segments', 'editable', 'deletable', 'creatable', 'clearable', 'copyable'] }

  attributeChangedCallback(name, _ov, nv) {
    if (!this._init) return
    if (name === 'label') {
      const el = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-label')
      if (el) {
        const loc = resolveLocale(this)
        const txt = this.label || loc.unnamed
        el.textContent = txt; el.title = txt
      }
    } else if (name === 'editable' || name === 'deletable' || name === 'creatable') {
      // 通知子 segments 刷新 DOM（删除按钮/手柄可见性）
      this.querySelectorAll('time-line-segment').forEach(seg => {
        if (seg._buildDOM) seg._buildDOM()
      })
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
    this.innerHTML = ''
    this.append(
      h('div', { class: 'tlt-row' }, [
        h('div', { class: 'tlt-head' }, [
          h('span', { class: 'tlt-head-label', title: labelTxt }, labelTxt),
          h('span', { class: 'tlt-head-range' }, this._formatter.formatRange(this.tStart, this.tEnd, 'axis')),
        ]),
        h('div', { class: 'tlt-body' }, [
          h('canvas', { class: 'tlt-grid-canvas' }),
          h('div', { class: 'tlt-seg-area' }),
        ]),
      ])
    )

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
      const trackLabel = this.label || l.unnamed
      const clip = getClipboard()
      const menuItems = [
        { type: 'header', label: l.trackMenuHeader.replace('{name}', trackLabel) },
      ]
      if (this.editable) {
        menuItems.push({ label: l.modifyProps, action: () => showTrackEditDialog(this) })
      }
      // ---- 粘贴（从剪贴板） ----
      if (clip && clip.type === 'segment' && this.creatable) {
        menuItems.push({ label: l.pasteSegment, action: () => {
          this._pasteSegment(e, clip.data)
        } })
      }
      if (clip && clip.type === 'track' && this.creatable) {
        // 粘贴为新轨道需要容器 creatable
        const container = this.closest('time-line-container')
        if (container && container.creatable) {
          menuItems.push({ label: l.pasteNewTrack, action: () => {
            this._pasteNewTrack(clip.data)
          } })
        }
      }
      if (clip && clip.type === 'track' && this.deletable) {
        menuItems.push({ label: l.pasteOverwrite, action: () => {
          this._pasteOverwrite(clip.data)
        } })
      }
      // ---- 复制 ----
      if (this.copyable) {
        menuItems.push({ label: l.copyTrack, action: () => {
          this._copyTrack()
        } })
        menuItems.push({ label: l.copyToTracks, action: () => {
          showCopyToTracksDialog(this)
        } })
      }
      if (this.clearable) {
        menuItems.push({ label: l.clearSegments, action: () => {
          showDeleteConfirm(
            l.confirmClearSegments.replace('{name}', trackLabel),
            () => this.clearAllSegments(),
            this
          )
        } })
      }
      if (this.deletable) {
        menuItems.push({ label: l.deleteTrack, danger: true, action: () => {
          showDeleteConfirm(
            l.confirmDeleteTrack
              .replace('{name}', trackLabel)
              .replace('{range}', this._formatter.formatRange(this.tStart, this.tEnd, 'axis')),
            () => { this._deleteTrack() },
            this
          )
        }})
      }
      // 至少 header + 一个有效菜单项才显示
      if (menuItems.length > 1) {
        showContextMenu(menuItems, e.clientX, e.clientY)
      }
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
    this._updateClipOverlay()
  }

  /** 方向变更时重新应用布局 */
  _onDirChange() {
    const v = this.isVertical
    this.classList.toggle('vertical', v)
    this._applyLabelPos()
    this._updateClipOverlay()
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /** 根据容器 label-h/label-v 属性调整 seg-area 间距 */
  _applyLabelPos() {
    const area = this._segArea()
    if (!area) return
    const c = this.closest('time-line-container')
    const isShared = c && c.axisMode === 'shared'

    // 读取 CSS 变量（可由用户覆盖），取整数值（px）
    const cs = getComputedStyle(this)
    const axisGap = parseFloat(cs.getPropertyValue('--tlt-axis-gap')) || 36
    const segTop  = parseFloat(cs.getPropertyValue('--tlt-seg-top'))   || 18
    const segBot  = parseFloat(cs.getPropertyValue('--tlt-seg-bottom')) || 0

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
      area.style.left   = this.labelV === 'left' ? axisGap + 'px' : '0'
      area.style.right  = this.labelV === 'left' ? '0' : axisGap + 'px'
      area.style.top    = ''
      area.style.bottom = ''
      return
    }

    // 独立轴模式：按 labelH/labelV 为轴标签留空
    if (this.isVertical) {
      area.style.left   = this.labelV === 'left' ? axisGap + 'px' : '0'
      area.style.right  = this.labelV === 'left' ? '0' : axisGap + 'px'
      area.style.top    = ''
      area.style.bottom = ''
    } else {
      area.style.left   = ''
      area.style.right  = ''
      area.style.top    = this.labelH === 'bottom' ? segBot + 'px' : segTop + 'px'
      area.style.bottom = this.labelH === 'bottom' ? segTop + 'px' : segBot + 'px'
    }
  }

  /** 轴标签位置属性变更后的响应 */
  _onLabelPosChange() {
    this._applyLabelPos()
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /** 容器 editable/deletable 属性变更时的响应：刷新子段 DOM */
  _onEditableChange() {
    this.querySelectorAll('time-line-segment').forEach(seg => {
      if (seg._buildDOM) seg._buildDOM()
    })
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
    // 轨道不可创建时禁止拖拽创建新段
    if (!this.creatable) return
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
    const _eff = this._effRange()
    this._crS  = _eff.start + ((cp - orig) / dim) * (_eff.end - _eff.start)
    // 裁剪模式下禁止在禁拖区域开始创建新段
    const { start: dbS, end: dbE } = this._dragBounds()
    if (this._crS < dbS || this._crS > dbE) { this._creating = false; return }
    this._crP0 = cp

    // 创建半透明预览条（含时间范围标签）
    this._ghost = document.createElement('div')
    this._ghost.className = 'tlt-ghost'
    this._ghost.innerHTML = '<span class="tlt-ghost-label"></span>'
    this._segArea().appendChild(this._ghost)
    this._ghostLabel = this._ghost.querySelector('.tlt-ghost-label')
    if (this._ghostLabel) this._ghostLabel.textContent = this._formatter.format(this._crS, 'tooltip')
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
    const _eff = this._effRange()
    let t2 = _eff.start + ((cp - orig) / dim) * (_eff.end - _eff.start)
    // 裁剪模式下预览不超出拖拽范围
    const { start: dbS, end: dbE } = this._dragBounds()
    t2 = clamp(t2, dbS, dbE)
    const lo = Math.min(t1, t2), hi = Math.max(t1, t2)
    const p1 = this.time2Px(lo), p2 = this.time2Px(hi)

    // 更新拖拽预览标签，显示当前时间段范围
    if (this._ghostLabel) {
      this._ghostLabel.textContent = this._formatter.formatRange(lo, hi, 'tooltip')
    }

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
    this._ghostLabel = null

    const v = this.isVertical
    const cp = v ? e.clientY : e.clientX
    const rect = this._segRect(); if (!rect) return
    const orig = v ? rect.top : rect.left
    const dim  = v ? rect.height : rect.width
    const _eff = this._effRange()
    const t2 = _eff.start + ((cp - orig) / dim) * (_eff.end - _eff.start)
    let lo = Math.min(this._crS, t2), hi = Math.max(this._crS, t2)

    if (this.step) {
      // 放大后步长回退到轴刻度步长，确保创建段对齐刻度
      const vis = this._effRange()
      const visRange = vis.end - vis.start
      const body = this._bodyEl()
      let axisStep = 0
      if (body) {
        const bodyRect = body.getBoundingClientRect()
        const dim = this.isVertical ? bodyRect.height : bodyRect.width
        axisStep = this._formatter.niceStep(visRange, dim)
      }
      const effStep = Math.min(this.step, (axisStep || visRange * 0.05) / 2)
      lo = snap(lo, effStep); hi = snap(hi, effStep)
    }

    // 确保不与其他段重叠
    const exist = this.sortedSegs()
    for (const seg of exist) {
      if (lo < seg.end && hi > seg.start) {
        if (this._crS < seg.start) hi = Math.min(hi, seg.start)
        else lo = Math.max(lo, seg.end)
      }
    }
    // 裁剪模式下用拖拽约束范围，防止段落在禁拖区域
    const { start: ts, end: te } = this._dragBounds()
    lo = clamp(lo, ts, te)
    hi = clamp(hi, ts, te)
    if (hi - lo >= this.minDur) {
      // 检查段数上限（拖拽创建）
      if (!this._checkSegmentLimit()) return
      this.addSegment(lo, hi, { color: this.defaultColor })
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

    // 标签（步长 < 1min 时自动显示秒）
    ctx.fillStyle = '#7a8591'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
    fmt.showSec = step < 1 / 60
    if (v) {
      ctx.textBaseline = 'middle'
      ctx.textAlign = this.labelV === 'left' ? 'left' : 'right'
      const labelX = this.labelV === 'left' ? 6 : rect.width - 6
      let _lastTLabel = ''
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        const px = this.time2Px(t)
        if (px > 14 && px < rect.height - 8) {
          const text = fmt.format(t, 'axis')
          if (text !== _lastTLabel) {
            ctx.fillText(text, labelX, px + offY)
            _lastTLabel = text
          }
        }
      }
      // 强制显示首尾（防重叠：相邻标签 < 28px 则跳过）
      const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd)
      if (sp <= 14) {
        const tick = Math.floor(gridStart / step) * step + step
        const nextPx = tick <= gridEnd ? this.time2Px(tick) : rect.height
        const drawPx = sp + offY + 10
        if (nextPx - drawPx > 28) {
          if (tick > gridEnd || fmt.format(gridStart, 'axis') !== fmt.format(tick, 'axis')) {
            ctx.fillText(fmt.format(gridStart, 'axis'), labelX, drawPx)
          }
        }
      }
      if (ep >= rect.height - 8) {
        const lastTick = Math.floor(gridEnd / step) * step
        const prevPx = lastTick > gridStart ? this.time2Px(lastTick) : 0
        const drawPx = ep + offY - 10
        if (drawPx - prevPx > 28) {
          if (!_lastTLabel || fmt.format(gridEnd, 'axis') !== _lastTLabel) {
            ctx.fillText(fmt.format(gridEnd, 'axis'), labelX, drawPx)
          }
        }
      }
    } else {
      ctx.textAlign = 'center'
      ctx.textBaseline = this.labelH === 'bottom' ? 'bottom' : 'top'
      const labelY = this.labelH === 'bottom' ? rect.height - 4 : 4
      let _lastHLabel = ''
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        const px = this.time2Px(t)
        if (px > 24 && px < rect.width - 24) {
          const text = fmt.format(t, 'axis')
          if (text === _lastHLabel) continue
          ctx.fillText(text, px + offX, labelY)
          _lastHLabel = text
        }
      }
      // 强制显示首尾（防重叠：相邻标签 < 28px 则跳过）
      const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd)
      ctx.textAlign = 'left'
      if (sp <= 24) {
        const tick = Math.floor(gridStart / step) * step + step
        const nextPx = tick <= gridEnd ? this.time2Px(tick) : rect.width
        const drawX = Math.max(sp + offX, 2)
        if (nextPx - drawX > 28) {
          if (tick > gridEnd || fmt.format(gridStart, 'axis') !== fmt.format(tick, 'axis')) {
            ctx.fillText(fmt.format(gridStart, 'axis'), drawX, labelY)
          }
        }
      }
      ctx.textAlign = 'right'
      if (ep >= rect.width - 24) {
        const lastTick = Math.floor(gridEnd / step) * step
        const prevPx = lastTick > gridStart ? this.time2Px(lastTick) : 0
        const drawX = Math.min(ep + offX, rect.width - 2)
        if (drawX - prevPx > 28) {
          if (!_lastHLabel || fmt.format(gridEnd, 'axis') !== _lastHLabel) {
            ctx.fillText(fmt.format(gridEnd, 'axis'), drawX, labelY)
          }
        }
      }
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
    const cs = getComputedStyle(this)
    // 读取段尺寸变量：横轴模式段高（--tls-height），纵轴模式段宽（--tls-width）
    const segSizeVar = v ? cs.getPropertyValue('--tls-width').trim() : cs.getPropertyValue('--tls-height').trim()
    // 仅在设为具体数值（非 auto/100%/空）时启用自定义尺寸
    const useCustomSize = segSizeVar && segSizeVar !== 'auto' && segSizeVar !== '100%'

    let p1  = ((seg.start - ts) / range) * dim
    let p2  = ((seg.end   - ts) / range) * dim
    // 反转段（start > end）：保持 p1/p2 原始顺序，窄条跟随手柄移动
    // 安全防护：防止越界段溢出轨道区域（如共享轴拖拽后回退独立轴）
    if (p1 < 0) p1 = 0
    if (p2 > dim) p2 = dim

    // 段完全在可视范围之外 → 隐藏（避免 overflow:auto 产生滚动条）
    if (p1 >= dim || p2 <= 0) {
      seg.style.display = 'none'
      return
    }
    seg.style.display = ''

    // 计算到下一段左边界的像素间距，用于约束最小宽度
    // 避免密集场景下 6px 硬最小值导致的视觉重叠
    const segs = this.sortedSegs()
    const idx  = segs.indexOf(seg)
    let rightBound = dim  // 末段或独立段：边界为轨道末端
    if (idx >= 0 && idx < segs.length - 1) {
      const nStart = ((segs[idx + 1].start - ts) / range) * dim
      // 仅当下一段完全在右侧（不重叠）时才约束，否则会错误地截断重叠段
      if (nStart >= p2) rightBound = nStart
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
      seg.style.width  = useCustomSize ? segSizeVar : ''
      seg.style.bottom = ''
      seg.style.margin = useCustomSize ? '0 auto' : ''
    } else {
      seg.style.left   = p1 + 'px'
      seg.style.top    = '0'
      seg.style.bottom = '0'
      seg.style.width  = segW + 'px'
      seg.style.height = useCustomSize ? segSizeVar : ''
      seg.style.right  = ''
      seg.style.margin = useCustomSize ? 'auto 0' : ''
    }

    // 太窄的段自动隐藏 × 删除按钮（右键菜单及 tooltip 仍可用）
    seg.classList.toggle('tls-del-hidden', segW < 28)
  }

  /**
   * 批量刷新所有段的位置（含重叠预防）
   * 一次计算总尺寸，所有段共享，避免反复 layout thrashing
   */
  _refreshPositions() {
    this._updateClipOverlay()
    const segs = this.sortedSegs()
    if (!segs.length) return
    const r = this._segRect()
    if (!r) return
    const { start: ts, end: te } = this._effRange()
    const range = te - ts
    if (!range) return
    const v = this.isVertical
    const dim = v ? r.height : r.width
    const cs = getComputedStyle(this)
    const segSizeVar = v ? cs.getPropertyValue('--tls-width').trim() : cs.getPropertyValue('--tls-height').trim()
    const useCustomSize = segSizeVar && segSizeVar !== 'auto' && segSizeVar !== '100%'

    // 单次计算所有段的 p1（左边界），用于约束相邻段
    const lefts = segs.map(s => ((s.start - ts) / range) * dim)

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      let p1 = lefts[i]
      let p2 = ((seg.end - ts) / range) * dim
      // 安全防护：防止越界段溢出轨道区域（与 _positionOne 一致）
      if (p1 < 0) p1 = 0
      if (p2 > dim) p2 = dim

      // 段完全在可视范围之外 → 隐藏（避免 overflow:auto 产生滚动条）
      if (p1 >= dim || p2 <= 0) {
        seg.style.display = 'none'
        continue
      }
      seg.style.display = ''

      // 计算右边界：仅当下一段完全在当前段右侧（不重叠）时才用其起点约束
      let rightBound = dim
      if (i < segs.length - 1) {
        const nStart = lefts[i + 1]
        if (nStart >= p2) rightBound = nStart
      }
      const avail = rightBound - p1
      const minW = Math.min(6, avail)
      const segW = Math.min(Math.max(p2 - p1, minW), avail)

      if (v) {
        seg.style.top    = p1 + 'px'
        seg.style.left   = '0'
        seg.style.right  = '0'
        seg.style.height = segW + 'px'
        seg.style.width  = useCustomSize ? segSizeVar : ''
        seg.style.bottom = ''
        seg.style.margin = useCustomSize ? '0 auto' : ''
      } else {
        seg.style.left   = p1 + 'px'
        seg.style.top    = '0'
        seg.style.bottom = '0'
        seg.style.width  = segW + 'px'
        seg.style.height = useCustomSize ? segSizeVar : ''
        seg.style.right  = ''
        seg.style.margin = useCustomSize ? 'auto 0' : ''
      }

      // 太窄的段自动隐藏 × 删除按钮（右键菜单仍可用）
      seg.classList.toggle('tls-del-hidden', segW < 28)
    }
    // 批量检查文字溢出（下一次 layout 后）
    if (this._segTextCheckRaf) cancelAnimationFrame(this._segTextCheckRaf)
    this._segTextCheckRaf = requestAnimationFrame(() => {
      this._segTextCheckRaf = 0
      segs.forEach(s => s.classList.toggle('tls-text-hidden', s._isTruncated()))
    })
  }

  /** 是否处于共享轴模式 */
  _isSharedMode() {
    const c = this.closest('time-line-container')
    return c && c.axisMode === 'shared'
  }

  /** 有效时间范围（缩放 > 共享轴 > 独立轴） */
  _effRange() {
    const c = this.closest('time-line-container')
    if (!c) return { start: this.tStart, end: this.tEnd }

    // 容器缩放范围优先
    if (c.zoomStart != null && c.zoomEnd != null) {
      return { start: c.zoomStart, end: c.zoomEnd }
    }

    // 共享轴模式 → 容器范围
    if (c.axisMode === 'shared') return { start: c.sharedStart, end: c.sharedEnd }

    // 独立轴模式 → 轨道自身范围
    return { start: this.tStart, end: this.tEnd }
  }

  /**
   * 拖拽约束范围（共享轴裁剪模式时仅限轨道自身范围）
   * 段在该范围内可自由拖拽，防止越界到其他轨道的不可见区域
   */
  _dragBounds() {
    const c = this.closest('time-line-container')
    if (c && c.sharedClipRange && this._isSharedMode()) {
      return { start: this.tStart, end: this.tEnd }
    }
    return this._effRange()
  }

  /** 共享轴配置变更时回调 */
  _onSharedConfigChange() {
    const c = this.closest('time-line-container')
    const headRange = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-range')
    if (this._isSharedMode()) {
      if (headRange) headRange.style.display = 'none'
      // 裁剪模式下自动修正越界段到轨道自身范围
      if (c && c.sharedClipRange) {
        const { start: ts, end: te } = { start: this.tStart, end: this.tEnd }
        for (const seg of this.sortedSegs()) {
          seg.start = clamp(seg.start, ts, te)
          seg.end   = clamp(seg.end,   ts, te)
        }
      }
    } else {
      if (headRange) headRange.style.display = ''
      // 从共享轴切回独立轴：将段 clamp 到轨道自身范围，防止越界重叠 label
      // 共享轴下段可能被拖到轨道自身范围之外，回退后需修正
      const { start: ts, end: te } = { start: this.tStart, end: this.tEnd }
      for (const seg of this.sortedSegs()) {
        seg.start = clamp(seg.start, ts, te)
        seg.end   = clamp(seg.end,   ts, te)
      }
    }
    this._applyLabelPos()
    this._updateClipOverlay()
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /** 视图范围（缩放）变更时回调：仅重绘，不做模式切换相关操作 */
  _onViewRangeChange() {
    requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions() })
  }

  /* ---- 共享轴裁剪模式遮罩 ---- */

  /**
   * 在 seg-area 上叠加半透明斜纹遮罩，标识不可拖拽区域
   * 仅 shared-clip-range 开启且在共享轴模式时生效
   */
  _updateClipOverlay() {
    const c = this.closest('time-line-container')
    const active = c && c.sharedClipRange && this._isSharedMode()
    const area = this._segArea()
    if (!area) return

    // 获取或创建遮罩容器
    let overlay = area.querySelector(':scope > .tlt-clip-overlay')
    if (!active) {
      if (overlay) overlay.remove()
      return
    }

    if (!overlay) {
      overlay = document.createElement('div')
      overlay.className = 'tlt-clip-overlay'
      overlay.innerHTML = '<div class="tlt-clip-block tlt-clip-left"></div><div class="tlt-clip-block tlt-clip-right"></div>'
      area.appendChild(overlay)
    }

    // 计算遮罩位置：轨道自身范围在共享轴中的像素偏移
    const { start: sharedStart, end: sharedEnd } = this._effRange()
    const range = sharedEnd - sharedStart
    if (!range) return

    const dim = this.isVertical ? area.offsetHeight : area.offsetWidth
    if (!dim) return

    const leftPx  = ((this.tStart - sharedStart) / range) * dim
    const rightPx = ((this.tEnd   - sharedStart) / range) * dim
    const leftBlock  = overlay.querySelector('.tlt-clip-left')
    const rightBlock = overlay.querySelector('.tlt-clip-right')

    if (this.isVertical) {
      Object.assign(leftBlock.style,  { left: '0', right: '0', top: '0', height: leftPx + 'px', bottom: 'auto' })
      Object.assign(rightBlock.style, { left: '0', right: '0', top: rightPx + 'px', bottom: '0', height: 'auto' })
    } else {
      Object.assign(leftBlock.style,  { top: '0', bottom: '0', left: '0', width: leftPx + 'px', right: 'auto' })
      Object.assign(rightBlock.style, { top: '0', bottom: '0', left: rightPx + 'px', right: '0', width: 'auto' })
    }
  }
}
