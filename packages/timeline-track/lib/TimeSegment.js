/**
 * <time-line-segment> 自定义元素 — 时间段
 * 支持拖拽移动、两端手柄调长度、悬停删除
 * @module TimeSegment
 */

import { clamp, h, snap } from '../shared/utils.js'
import { createFormatter } from '../shared/formatter.js'
import { hideGlobalTip, showGlobalTip } from './tooltip.js'
import { hideContextMenu, showContextMenu, showDeleteConfirm, showSegmentEditDialog } from './contextmenu.js'
import { resolveLocale } from '../shared/locale.js'
import { clearClipboard, copyToClipboard } from './clipboard.js'

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
    this._copyMode = false   // Ctrl+拖拽复制模式
    this._copyMoved = false  // 复制模式中是否真正拖拽移动过
    this._ctrlOnDown = false // pointerdown 时是否按着 Ctrl
    this._copyGhost = null   // 复制浮层
    this._swapGuard = false  // 抑制把手交换期间的回调
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

  /* ---- 可编辑/可删除（继承自轨道） ---- */

  /** 是否允许编辑（拖拽移动/调整/修改属性），默认继承轨道值或 true */
  get editable() {
    if (this.hasAttribute('editable')) return this.getAttribute('editable') !== 'false'
    const t = this._track
    return t ? t.editable : true
  }
  set editable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('editable')
    else this.setAttribute('editable', 'false')
  }

  /** 是否允许删除（删除按钮/菜单项），默认继承轨道值或 true */
  get deletable() {
    if (this.hasAttribute('deletable')) return this.getAttribute('deletable') !== 'false'
    const t = this._track
    return t ? t.deletable : true
  }
  set deletable(v) {
    if (v == null || v === true || v === 'true') this.removeAttribute('deletable')
    else this.setAttribute('deletable', 'false')
  }

  /** 是否允许复制（右键菜单"复制段"），默认继承轨道值或 true */
  get copyable() {
    if (this.hasAttribute('copyable')) return this.getAttribute('copyable') !== 'false'
    const t = this._track
    return t ? t.copyable : true
  }

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

  static get observedAttributes() { return ['start', 'end', 'label', 'color', 'radius', 'editable', 'deletable'] }

  attributeChangedCallback(name, _ov, nv) {
    if (!this._init) return
    if (name === 'editable' || name === 'deletable') {
      this._buildDOM()
      return
    }
    if (name === 'label' || name === 'color') {
      this._buildDOM()
    }
    // radius 由容器 setGlobalRadius 统一控制
    if (name === 'start' || name === 'end') {
      if (this._swapGuard) return // 交换期间由交换方法统一触发一次刷新
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
    // 用数组 + filter(Boolean) 避免 append(null) 生成 "null" 文本
    this.append(...[
      this.editable ? h('div', { class: 'tls-hdl tls-hdl-left', 'data-role': 'hdl-left' }, h('div', { class: 'tls-hdl-bar' })) : null,
      this.editable ? h('div', { class: 'tls-hdl tls-hdl-right', 'data-role': 'hdl-right' }, h('div', { class: 'tls-hdl-bar' })) : null,
      h('div', { class: 'tls-bar', style: { background: col, border: `1px solid ${darker}`, borderRadius: r } }, [
        h('div', { class: 'tls-inner' }, [
          this.label ? h('span', { class: 'tls-label' }, this.label) : null,
          h('span', { class: 'tls-time' }, this._formatter.formatRange(
            Math.min(this.start, this.end),
            Math.max(this.start, this.end),
            'segment'
          )),
        ]),
      ]),
      this.deletable ? h('button', { class: 'tls-del', 'data-role': 'del', title: loc.deleteBtnTitle, onClick: null }, '×') : null,
    ].filter(Boolean))
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
      // 无标签时标题只显示时间范围，不填充占位名称
      const name = this.label || segRange
      const headerLabel = this.label
        ? l.segmentMenuHeader.replace('{name}', this.label).replace('{range}', segRange)
        : segRange
      const menuItems = [
        { type: 'header', label: headerLabel },
      ]
      if (this.editable) {
        menuItems.push({ label: l.modifyProps, action: () => showSegmentEditDialog(this) })
      }
      // ---- 复制 ----
      if (this.copyable) {
        menuItems.push({ label: l.copySegment, action: () => {
          clearClipboard() // 覆写前清空旧数据
          copyToClipboard('segment', {
            label: this.label,
            color: this.color,
            start: this.start,
            end: this.end,
          })
          this._pulseCopy()
        } })
      }
      if (this.deletable) {
        menuItems.push({ label: l.deleteBtnTitle, danger: true, action: () => {
          showDeleteConfirm(
            l.confirmDeleteSegment
              .replace('{name}', name)
              .replace('{range}', this._formatter.formatRange(this.start, this.end, 'axis')),
            () => this._deleteSegment(),
            this
          )
        }})
      }
      // 至少 header + 一个有效菜单项才显示
      if (menuItems.length > 1) {
        showContextMenu(menuItems, e.clientX, e.clientY)
      }
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
    // 段不可编辑时禁止拖拽移动/调整
    if (!this.editable) return
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
    this._copyMode = false
    this._copyMoved = false // 标记是否真正发生了拖拽移动
    // 记录 Ctrl 状态，在 _onMove_ 中检测移动后才决定是否进入复制模式
    this._ctrlOnDown = this._mode === 'move' && (e.ctrlKey || e.metaKey)

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

    // Ctrl+拖拽复制模式：移动超过 3px 阈值才激活，原段保持可见供参考
    if (this._ctrlOnDown && !this._copyMode && Math.abs(this._client(e) - this._ptr0) > 3) {
      const t = this._track
      if (t && t.copyable && t.creatable) {
        this._copyMode = true
        this._copyMoved = true
        this._createCopyGhost()
      }
    }
    if (this._copyMode) {
      // 复制模式中也检测跨轨道目标（类似移动模式）
      if (this._mode === 'move') {
        const targetTrack = this._detectTargetTrack(e)
        if (targetTrack && targetTrack !== this._tgtTrack) {
          // 进入新目标轨道
          if (this._tgtTrack) this._tgtTrack.classList.remove('tlt-drag-over')
          this._tgtTrack = targetTrack
          targetTrack.classList.add('tlt-drag-over')
        } else if (!targetTrack && this._tgtTrack) {
          // 离开目标轨道
          this._tgtTrack.classList.remove('tlt-drag-over')
          this._tgtTrack = null
        }
      }
      if (this._copyGhost) this._updateCopyGhost(e)
      return // 复制模式中，跳过普通拖拽
    }

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
    const minW = Math.max(0, t.minDur)

    if (this._mode === 'resize-left') {
      let s = this._s0 + dt
      s = snap(s, effStep)
      // 根据拖拽方向自动判断边界：
      // - 左柄向右拖（缩小段）：允许缩到零宽度（不超 end），触发交换后在新模式中恢复 minW
      // - 左柄向左拖（扩大段）：受相邻段/轨道边界 _lo 约束
      if (s > this._s0) {
        s = Math.min(s, this.end) // 允许缩到 end 触发零宽度交换
      } else {
        s = Math.max(s, this._lo)
      }
      this.start = s
      // 到达零宽度后继续向右拖拽 → 交换为右柄模式
      if (s >= this.end && this._client(e) > this._ptr0) {
        this._swapToResizeRight(e)
      }
    } else if (this._mode === 'resize-right') {
      let ev = this._e0 + dt
      ev = snap(ev, effStep)
      // 根据拖拽方向自动判断边界：
      // - 右柄向左拖（缩小段）：钳制到 start+minW（防止缩过最小宽度），触发交换回来
      // - 右柄向右拖（扩大段）：受相邻段/轨道边界 _hi 约束
      if (ev < this._e0) {
        ev = Math.max(ev, this.start + minW) // 缩到最小宽度后触发交换回来
      } else {
        ev = Math.min(ev, this._hi)
      }
      this.end = ev
      // 到达最小宽度后继续向左拖拽 → 交换为左柄模式
      if (this.end <= this.start + minW && this._client(e) < this._ptr0) {
        this._swapToResizeLeft(e)
      }
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
        // 目标轨道变为不可编辑时退出跨轨道模式
        if (!this._tgtTrack.editable) {
          this._exitCrossTrack()
          this.dispatchEvent(new CustomEvent('segment-change', {
            bubbles: true, detail: { segment: this, start: this.start, end: this.end }
          }))
          return
        }
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
    // 反转段：窄条定位到正在拖拽的那一端（_positionOne 仅按 start 定位，resize-right 不符）
    if (this.start >= this.end) {
      const r = t._segRect()
      if (r) {
        const { start: ts, end: te } = t._effRange()
        const range = te - ts
        if (range) {
          const dim = t.isVertical ? r.height : r.width
          const dragVal = this._mode === 'resize-left' ? this.start : this.end
          const pos = ((dragVal - ts) / range) * dim
          this.style.display = ''
          if (t.isVertical) { this.style.top = pos + 'px' }
          else { this.style.left = pos + 'px' }
        }
      }
    }
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
    const upMode = this._mode // 保存拖拽模式，后面用于反转修正
    this._ptrActive = false
    this._mode = null
    this.classList.remove('dragging', 'resizing', 'tls-selected')
    this.removeEventListener('pointermove', this._onMove)
    this.removeEventListener('pointerup',   this._onUp)
    this.removeEventListener('pointercancel', this._onUp)
    this.removeEventListener('lostpointercapture', this._onUp)

    // Ctrl+拖拽复制结束
    if (this._copyMode) {
      this._finishCopy(e)
      return
    }
    // 清理 _ctrlOnDown（未进入复制模式的 Ctrl+拖拽→当做普通拖拽，正常走下面的 segment-changed）
    this._ctrlOnDown = false

    // 跨轨道拖拽结束 → 完成迁移
    if (this._tgtTrack) {
      this._finishCrossTrack(e)
      return
    }

    // 关闭 tooltip（拖拽结束时清理，防止残留）
    hideGlobalTip()

    // 反转段（start > end）自动快照到零宽度：固定在拖拽端（光标位置）
    if (this.start > this.end) {
      if (upMode === 'resize-left') {
        // 左柄被拖过右端 → start 是拖拽端
        this.end = this.start
      } else {
        // 右柄被拖过左端 → end 是拖拽端
        this.start = this.end
      }
      this.style.display = ''
      this._buildDOM()
      const t = this._track
      if (t) { t._positionOne(this); t._refreshPositions() }
    }

    this.dispatchEvent(new CustomEvent('segment-changed', {
      bubbles: true, detail: { segment: this, start: this.start, end: this.end }
    }))
  }

  /* ---- Ctrl+拖拽复制 ---- */

  /** 创建复制浮层 */
  _createCopyGhost() {
    const t = this._track
    if (!t) return
    const darker = this._darken(this.color, 0.18)
    const c = this.closest('time-line-container')
    const ghostRadius = (c && c._globalRadius != null) ? c._globalRadius : '0'
    this._copyGhost = document.createElement('div')
    this._copyGhost.className = 'tlt-cross-ghost' // 复用跨轨道浮层样式
    this._copyGhost.style.opacity = '0.7'
    this._copyGhost.innerHTML = ''
    this._copyGhost.append(
      h('div', { class: 'tls-bar', style: { background: this.color, border: `1px solid ${darker}`, borderRadius: ghostRadius } }, [
        h('div', { class: 'tls-inner' }, [
          this.label ? h('span', { class: 'tls-label' }, this.label) : null,
          h('span', { class: 'tls-time' }, this._formatter.formatRange(this.start, this.end, 'segment')),
        ]),
      ])
    )
    document.body.appendChild(this._copyGhost)
    void this._copyGhost.offsetHeight
    this._copyGhost.classList.add('show')
  }

  /** 更新复制浮层位置（支持跨轨道：有 _tgtTrack 时用目标轨道的坐标范围） */
  _updateCopyGhost(e) {
    if (!this._copyGhost) return
    const t = this._tgtTrack || this._track
    if (!t) return
    const rect = t._segRect()
    if (!rect) return
    const { start: ts, end: te } = t._effRange()
    const range = te - ts
    if (!range) return
    const v = t.isVertical
    const dim = v ? rect.height : rect.width

    // 计算拖拽偏移后的起止
    const dp = this._client(e) - this._ptr0
    const dt = t.px2Time(dp)
    const w = this._e0 - this._s0
    let s = this._s0 + dt
    s = snap(s, t.step || 0)
    const bounds = t._dragBounds()
    s = clamp(s, bounds.start, bounds.end - w)
    const eTime = s + w

    const lo = ((s - ts) / range) * dim
    const hi = ((eTime - ts) / range) * dim
    const segW = Math.max(Math.abs(hi - lo), 2)
    const segL = Math.min(lo, hi)

    Object.assign(this._copyGhost.style, {
      position: 'fixed',
      zIndex: '9999',
      pointerEvents: 'none',
      ...(v
        ? { left: rect.left + 'px', top: rect.top + segL + 'px', width: rect.width + 'px', height: segW + 'px' }
        : { left: rect.left + segL + 'px', top: rect.top + 'px', width: segW + 'px', height: rect.height + 'px' }),
    })
  }

  /** 完成复制：在目标位置创建新段（支持跨轨道：_tgtTrack 存在时复制到目标轨道） */
  _finishCopy(e) {
    if (this._copyGhost) { this._copyGhost.remove(); this._copyGhost = null }
    this._copyMode = false
    this._copyMoved = false
    this._ctrlOnDown = false

    // 使用目标轨道（跨轨道复制）或当前轨道（同轨道复制）
    const t = this._tgtTrack || this._track
    if (!t) return

    // 同轨道复制时暂时从 DOM 移除原段，避免 addSegment 重叠检测误把自身算入
    const isSameTrack = this._tgtTrack == null
    if (isSameTrack) {
      const area = t._segArea()
      if (area && this.parentNode === area) {
        area.removeChild(this)
      }
    }

    const dp = this._client(e) - this._ptr0
    const dt = t.px2Time(dp)
    const w = this._e0 - this._s0
    let s = this._s0 + dt
    s = snap(s, t.step || 0)
    const bounds = t._dragBounds()
    s = clamp(s, bounds.start, bounds.end - w)
    let eTime = s + w
    if (eTime > bounds.end) { eTime = bounds.end; s = eTime - w }

    let copyError = null
    try {
      const seg = t.addSegment(s, eTime, { label: this.label, color: this.color })
      if (seg) { seg._pulseCopy() }
      else { copyError = 'segment-limit' } // addSegment 返回 null = 段数超限
    } catch (_) { copyError = 'overlap' } // addSegment 抛出 = 重叠

    if (copyError) {
      // 复制失败时派发事件，允许外部监听（如 toast 提示）
      this.dispatchEvent(new CustomEvent('segment-copy-error', {
        bubbles: true,
        detail: { source: this, targetTrack: t, reason: copyError, start: s, end: eTime }
      }))
    }

    // 恢复原段到 DOM
    if (isSameTrack) {
      const area = t._segArea()
      if (area) area.appendChild(this)
    }

    // 清理跨轨道状态
    if (this._tgtTrack) {
      this._tgtTrack.classList.remove('tlt-drag-over')
      this._tgtTrack = null
    }
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


  /**
   * 左柄缩小到最小宽度后 → 交换为右柄模式
   * 不交换起止值，段保持当前最小宽度，之后拖拽将拉伸右端
   */
  _swapToResizeRight(e) {
    this._mode = 'resize-right'
    this._ptr0 = this._client(e)
    this._s0 = this.start // 当前 start（最小宽度左边界）
    this._e0 = this.end   // 当前 end（右侧拉伸端）
    this._computeBounds()
  }

  /**
   * 右柄缩小到最小宽度后 → 交换为左柄模式
   * 不交换起止值，段保持当前最小宽度，之后拖拽将拉伸左端
   */
  _swapToResizeLeft(e) {
    this._mode = 'resize-left'
    this._ptr0 = this._client(e)
    this._s0 = this.start // 当前 start（左侧拉伸端）
    this._e0 = this.end   // 当前 end（最小宽度右边界）
    this._computeBounds()
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
    // 目标轨道不可编辑时不允许跨轨道拖入
    if (!track.editable) return null
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

    // 校验：目标轨道不可编辑
    if (!tgt.editable) { this._restorePosition(); return }
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

  /** 脉冲动画反馈（复制/粘贴成功） */
  _pulseCopy() {
    this.classList.remove('tls-copy-pulse')
    void this.offsetHeight
    this.classList.add('tls-copy-pulse')
    setTimeout(() => this.classList.remove('tls-copy-pulse'), 1200)
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
