<template>
  <div class="tls-segment-root">
    <div
      class="tls-wrapper"
      :class="{
        dragging: _dragging,
        resizing: _resizing,
        'tls-active': _active,
        'tls-del-hidden': segWidth < 28,
        'tls-text-hidden': _textHidden,
        'tls-copy-pulse': _pulsing,
        vertical: vertical,
      }"
      :style="wrapperStyle"
      @pointerdown.prevent="onDown"
      @contextmenu.prevent="onCtxMenu"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
      @mousemove="onMove"
      ref="wrapperRef"
    >
      <!-- 左手柄（与 CE 一致：只受 editable 控制，不限宽度） -->
      <div
        v-if="segmentEditable"
        class="tls-hdl tls-hdl-left"
        data-role="hdl-left"
        @pointerdown.stop="onHandleDown('resize-left', $event)"
      >
        <div class="tls-hdl-bar"></div>
      </div>

      <!-- 段主体 -->
      <div
        class="tls-bar"
        :style="barStyle"
      >
        <div class="tls-inner">
          <span v-if="segment.label" class="tls-label">{{ segment.label }}</span>
          <span class="tls-time">{{ timeRange }}</span>
        </div>
      </div>

      <!-- 右手柄（与 CE 一致：只受 editable 控制，不限宽度） -->
      <div
        v-if="segmentEditable"
        class="tls-hdl tls-hdl-right"
        data-role="hdl-right"
        @pointerdown.stop="onHandleDown('resize-right', $event)"
      >
        <div class="tls-hdl-bar"></div>
      </div>

      <!-- 删除按钮 -->
      <button
        v-if="segmentDeletable && segWidth >= 28"
        class="tls-del"
        data-role="del"
        @click.stop="onDeleteClick"
        :title="locale.deleteBtnTitle || '删除'"
      >×</button>
    </div>

    <!-- 跨轨道拖拽浮层（渲染到 body） -->
    <Teleport to="body">
      <div
        v-if="_crossGhost"
        class="tlt-cross-ghost show"
        :style="crossGhostStyle"
      >
        <div class="tls-bar" :style="crossGhostBarStyle">
          <div class="tls-inner">
            <span v-if="segment.label" class="tls-label">{{ segment.label }}</span>
            <span class="tls-time">{{ timeRange }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * VTimelineSegment.vue — 时间段 Vue 组件
 *
 * 完全兼容 lib/TimeSegment.js 的全部功能：
 * - 拖拽移动 + 调整大小（带把手交换）
 * - 跨轨道拖拽（浮层 + DOM 迁移）
 * - Ctrl+拖拽复制
 * - 右键菜单（编辑属性/复制/删除）
 * - Tooltip（auto/always/none + 位置配置）
 * - 选中模式
 * - 文字截断检测
 * - 脉冲动画
 *
 * @module vue/VTimelineSegment
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { clamp, snap } from '../shared/utils.js'
import { formatLocale, useLocale } from './useLocale.js'
import { useTooltip } from './useTooltip.js'
import { useContextMenu } from './useContextMenu.js'
import { useClipboard } from './useClipboard.js'
import { useModal } from './useModal.js'

/* =============================== Props =============================== */

const props = defineProps({
  segment: { type: Object, required: true },
  pixelLeft: { type: Number, default: 0 },
  pixelTop: { type: Number, default: 0 },
  pixelWidth: { type: Number, default: 0 },
  pixelHeight: { type: Number, default: 0 },
  hidden: { type: Boolean, default: false },
  step: { type: Number, default: 0 },
  minDuration: { type: Number, default: 0 },
  editable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  copyable: { type: Boolean, default: true },
  trackCreatable: { type: Boolean, default: true },
  vertical: { type: Boolean, default: false },
  rangeStart: { type: Number, default: 0 },
  rangeEnd: { type: Number, default: 24 },
  formatter: { type: Object, default: null },
  locale: { type: Object, default: null },
  tooltipPos: { type: String, default: 'top-center' },
  globalRadius: { type: String, default: '0' },
  selectionMode: { type: Boolean, default: false },
  /** 相邻段边界：前一段的 end 值（段间阻隔用，与 CE _computeBounds 对齐） */
  prevSegEnd: { type: Number, default: null },
  /** 相邻段边界：后一段的 start 值 */
  nextSegStart: { type: Number, default: null },
  /** 段数上限（0=无限制），与 CE maxSegments 继承链一致 */
  maxSegments: { type: Number, default: 0 },
  /** 有效视觉范围（缩放/共享轴用，像素↔值转换依赖此范围而非 rangeStart/rangeEnd） */
  effRangeStart: { type: Number, default: 0 },
  effRangeEnd: { type: Number, default: 24 },
})

const emit = defineEmits([
  'change',
  'delete',
  'segment-change',
  'context-menu',
  'segment-copy-error',
])

/* =============================== 基础设施 =============================== */

const _locale = computed(() => props.locale || useLocale())
const tooltipCtrl = useTooltip()
const ctxMenuCtrl = useContextMenu()
const clipboardCtrl = useClipboard()
const modalCtrl = useModal()

const wrapperRef = ref(null)

/* =============================== 继承权限 =============================== */

/** 段级权限优先查 segment 数据，fallback 轨道级（与 CE 继承链一致） */
const segmentEditable = computed(() => {
  if (props.segment.editable != null) return props.segment.editable
  return props.editable
})
const segmentDeletable = computed(() => {
  if (props.segment.deletable != null) return props.segment.deletable
  return props.deletable
})
const segmentCopyable = computed(() => {
  if (props.segment.copyable != null) return props.segment.copyable
  return props.copyable
})

/* =============================== 外观 =============================== */

const segWidth = computed(() => props.vertical ? props.pixelHeight : props.pixelWidth)

const wrapperStyle = computed(() => {
  if (props.hidden) return { display: 'none' }
  const isV = props.vertical

  // 拖拽移动模式：仅偏移位置，尺寸不变
  if (_dragging.value) {
    return isV
      ? { top: (props.pixelLeft + _dragDeltaPx.value) + 'px', left: '0', right: '0', height: props.pixelWidth + 'px' }
      : { left: (props.pixelLeft + _dragDeltaPx.value) + 'px', top: '0', bottom: '0', width: props.pixelWidth + 'px' }
  }

  // resize-left：左边缘移动，宽度同步缩小/扩大
  // 基准 _resizeBaseLeft/_resizeBaseWidth 在把手交换后更新，确保连续视觉
  if (_resizing.value && _mode === 'resize-left') {
    return isV
      ? { top: (_resizeBaseLeft.value + _resizeDeltaPx.value) + 'px', left: '0', right: '0', height: Math.max(2, _resizeBaseWidth.value - _resizeDeltaPx.value) + 'px' }
      : { left: (_resizeBaseLeft.value + _resizeDeltaPx.value) + 'px', top: '0', bottom: '0', width: Math.max(2, _resizeBaseWidth.value - _resizeDeltaPx.value) + 'px' }
  }

  // resize-right：右边缘移动，左边缘固定（把手交换后左边缘改为零宽度点）
  if (_resizing.value && _mode === 'resize-right') {
    return isV
      ? { top: _resizeBaseLeft.value + 'px', left: '0', right: '0', height: Math.max(2, _resizeBaseWidth.value + _resizeDeltaPx.value) + 'px' }
      : { left: _resizeBaseLeft.value + 'px', top: '0', bottom: '0', width: Math.max(2, _resizeBaseWidth.value + _resizeDeltaPx.value) + 'px' }
  }

  // 非拖拽状态：完全由父组件 pixelLeft/pixelWidth 驱动
  return isV
    ? { top: props.pixelLeft + 'px', left: '0', right: '0', height: props.pixelWidth + 'px' }
    : { left: props.pixelLeft + 'px', top: '0', bottom: '0', width: props.pixelWidth + 'px' }
})

const barStyle = computed(() => {
  const col = props.segment.color || '#5c9ce6'
  const darker = _darken(col, 0.18)
  // 段级 radius 优先于全局 globalRadius（与 CE segment.radius 属性一致）
  const radius = props.segment.radius ?? props.globalRadius ?? '0'
  return {
    background: col,
    border: `1px solid ${darker}`,
    borderRadius: radius,
  }
})

/** 段级 tooltip-pos 优先于轨道/容器（与 CE tooltip-pos 属性继承一致） */
const effectiveTooltipPos = computed(() => {
  return props.segment.tooltipPos || props.tooltipPos || 'top-center'
})

const timeRange = computed(() => {
  // 拖拽中显示实时值（与 CE _onMove_ → _buildDOM 实时重建文字对齐）
  if (_dragTimeText.value) return _dragTimeText.value
  const fmt = props.formatter
  if (!fmt) return `${props.segment.start} – ${props.segment.end}`
  return fmt.formatRange(
    Math.min(props.segment.start, props.segment.end),
    Math.max(props.segment.start, props.segment.end),
    'segment',
  )
})

/* ---- 颜色加深 ---- */
function _darken(hex, amt) {
  let r, g, b
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16)
    r = (n >> 16) & 0xff
    g = (n >> 8) & 0xff
    b = n & 0xff
  } else {
    const m = hex.match(/[\d.]+/g)
    if (!m) return hex
    ;[r, g, b] = m.map(Number)
  }
  return `rgb(${clamp(r + amt * 255, 0, 255) | 0},${clamp(g + amt * 255, 0, 255) | 0},${clamp(b + amt * 255, 0, 255) | 0})`
}

/* =============================== Tooltip =============================== */

function onEnter() {
  if (_ptrActive.value) return
  _refreshTooltip()
}

function onMove() {
  if (_ptrActive.value) return
  _refreshTooltip()
}

function onLeave() {
  tooltipCtrl.hide()
}

function _refreshTooltip() {
  const mode = props.segment.tooltip || 'auto'
  if (mode === 'none') return
  if (mode === 'always' || _isTruncated()) {
    const el = wrapperRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fmt = props.formatter
    tooltipCtrl.show({
      label: props.segment.label || '',
      timeText: fmt ? fmt.formatRange(props.segment.start, props.segment.end, 'tooltip') : `${props.segment.start} – ${props.segment.end}`,
      rect,
      pos: effectiveTooltipPos.value,
    })
  } else {
    tooltipCtrl.hide()
  }
}

/* =============================== 文字截断检测 =============================== */

const _textHidden = ref(false)

function _isTruncated() {
  const el = wrapperRef.value
  if (!el) return false
  // 守卫：元素尚未完成布局（尺寸为 0），避免误判为截断
  if (el.offsetWidth === 0 && el.offsetHeight === 0) return false
  const label = el.querySelector('.tls-label')
  const time = el.querySelector('.tls-time')
  // 水平溢出检测（+1 容差避免子像素舍入误判）
  if (label && label.scrollWidth > label.clientWidth + 1) return true
  if (time && time.scrollWidth > time.clientWidth + 1) return true
  const inner = el.querySelector('.tls-inner')
  if (!inner) return false
  if (inner.scrollWidth > inner.clientWidth + 1) return true

  // 垂直溢出检测：从样式推算内容总高度，与 bar.clientHeight 比较
  // 不依赖 scrollHeight（绝对定位 + overflow:hidden 的 flex 容器 scrollHeight 不准确）
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
    const bar = inner.parentElement  // .tls-bar
    if (bar && contentH > bar.clientHeight + 1) return true
  }

  return false
}

/** 延迟到下一渲染帧 + Vue DOM 更新后执行，确保布局完成再检测 */
function _updateTextVisibility() {
  requestAnimationFrame(() => {
    nextTick(() => {
      _textHidden.value = _isTruncated()
    })
  })
}

// 段挂载后做初始检测（此时 DOM 已挂载但可能尚未完成首次布局）
onMounted(() => {
  _updateTextVisibility()
  // 监听容器级 tls-deactivate 事件：其他段 _toggleActive 时清除此段选中状态
  const el = wrapperRef.value
  if (el) {
    el.addEventListener('tls-deactivate', () => { _active.value = false })
    // ResizeObserver 检测 CSS 变量驱动的尺寸变化（如 --tls-height 调整后段高度变化）
    _resizeObs = new ResizeObserver(() => _updateTextVisibility())
    _resizeObs.observe(el)
  }
})

onUnmounted(() => {
  if (_resizeObs) _resizeObs.disconnect()
})

watch(() => [props.segment.label, props.segment.start, props.segment.end, props.pixelWidth, props.pixelHeight, props.vertical], () => {
  _updateTextVisibility()
})

/* =============================== 选中模式 =============================== */

const _active = ref(false)

function _toggleActive() {
  const wasActive = _active.value

  // 单选：清除同一容器内其他段的选中状态（与 CE _toggleActive 一致）
  const container = wrapperRef.value?.closest('.tlc-container')
  if (container) {
    container.querySelectorAll('.tls-wrapper.tls-active').forEach(el => {
      el.classList.remove('tls-active')
      // 通过自定义事件通知该段的 Vue 组件重置 _active ref
      el.dispatchEvent(new CustomEvent('tls-deactivate', { bubbles: false }))
    })
  }

  // 之前未选中才激活自身
  if (!wasActive) {
    _active.value = true
  }
}

const _pulsing = ref(false)

function _pulseCopy() {
  _pulsing.value = true
  setTimeout(() => { _pulsing.value = false }, 1200)
}

/* =============================== 拖拽状态 =============================== */

let _resizeObs = null  // ResizeObserver，检测 CSS 变量驱动的高度变化

const _dragging = ref(false)
const _resizing = ref(false)
const _ptrActive = ref(false)

// 像素级偏移 — 拖拽期间直接控制视觉位置，不依赖父组件 model 更新（与 CE 直接操作 DOM 一致）
const _dragDeltaPx = ref(0)    // move 模式：沿轴的像素偏移
const _resizeDeltaPx = ref(0)  // resize 模式：边缘像素变化量
// 拖拽中实时时间文字（覆盖 timeRange computed，与 CE _buildDOM 实时重建文字对齐）
const _dragTimeText = ref(null)

let _mode = null // 'move' | 'resize-left' | 'resize-right'
let _ptrStart = 0
let _s0 = 0
let _e0 = 0
let _segAreaRect = null
let _lo = 0
let _hi = 0

// 把手交换后，resize 模式的基准左边缘和宽度会变化（如 resize-left→resize-right 后基准变为右边缘+0宽度）
const _resizeBaseLeft = ref(0)
const _resizeBaseWidth = ref(0)

// 跨轨道拖拽状态
let _srcTrackEl = null
let _targetTrackEl = null
const _crossGhost = ref(null)
const crossGhostStyle = ref({})
const crossGhostBarStyle = ref({})

// Ctrl+拖拽复制状态
let _copyMode = false
let _ctrlOnDown = false
let _copyMoved = false

function _getAreaRect() {
  const el = wrapperRef.value
  if (!el) return null
  const area = el.closest('.tlt-seg-area')
  return area ? area.getBoundingClientRect() : null
}

function _client(e) {
  return props.vertical ? e.clientY : e.clientX
}

/** resize 模式有效步长：min(trackStep, axisNiceStep/2)，确保放大后对齐轴刻度（与 CE 一致） */
function _getResizeStep(trackStep) {
  if (!trackStep) return 0
  if (!props.formatter || !_segAreaRect) return trackStep
  const range = props.effRangeEnd - props.effRangeStart
  if (!range) return trackStep
  const dim = props.vertical ? _segAreaRect.height : _segAreaRect.width
  const axisStep = props.formatter.niceStep(range, dim)
  // CE fallback：axisStep 为 0 时用 range*5%/2 代替
  const divisor = (axisStep || range * 0.05) / 2
  return Math.min(trackStep, divisor) || trackStep
}

function _px2Val(dpx) {
  const rect = _segAreaRect
  if (!rect) return 0
  const dim = props.vertical ? rect.height : rect.width
  if (!dim) return 0
  const range = props.effRangeEnd - props.effRangeStart
  return (dpx / dim) * range
}

/* pointerdown — 段主体 */
function onDown(e) {
  if (e.button !== 0) return
  if (e.target.closest('[data-role]')) return

  // 选中模式
  if (props.selectionMode) {
    _toggleActive()
    return
  }

  // 使用段级 editable（与 CE 一致：先查 segment.editable，再回退轨道/容器）
  if (!segmentEditable.value) return
  ctxMenuCtrl.hide()
  _startDrag('move', e)
}

/* pointerdown — 手柄 */
function onHandleDown(mode, e) {
  if (!segmentEditable.value) return
  if (!e) return
  _startDrag(mode, e)
}

/* ---- 计算段间阻隔边界（与 CE _computeBounds 对齐）---- */
/** 从相邻段数据计算当前段的拖拽边界，防止段穿过段 */
function _computeBounds() {
  // 优先使用 Track 预计算的相邻段边界，fallback 到轨道范围
  _lo = props.prevSegEnd != null ? props.prevSegEnd : props.rangeStart
  _hi = props.nextSegStart != null ? props.nextSegStart : props.rangeEnd
}

/* ---- 启动拖拽 ---- */
function _startDrag(mode, e) {
  _mode = mode
  _ptrActive.value = true
  _dragging.value = mode === 'move'
  _resizing.value = mode.startsWith('resize')
  _ptrStart = _client(e)
  _s0 = props.segment.start
  _e0 = props.segment.end
  _segAreaRect = _getAreaRect()
  _srcTrackEl = wrapperRef.value?.closest('.tlt-row')

  // 重置像素偏移（新一次拖拽从零开始）
  _dragDeltaPx.value = 0
  _resizeDeltaPx.value = 0

  // 初始化 resize 基准位置（把手交换后会更新）
  _resizeBaseLeft.value = props.pixelLeft
  _resizeBaseWidth.value = props.pixelWidth

  // Ctrl+拖拽复制
  _copyMode = false
  _ctrlOnDown = mode === 'move' && (e.ctrlKey || e.metaKey)
  _copyMoved = false

  // 计算段间阻隔边界（与 CE _computeBounds 对齐：禁止穿过相邻段）
  _computeBounds()

  if (wrapperRef.value) {
    wrapperRef.value.setPointerCapture(e.pointerId)
  }

  const onMove = (ev) => _onMove(ev)
  const onUp = (ev) => { _onUp(ev); cleanup() }
  const cleanup = () => {
    if (wrapperRef.value) {
      wrapperRef.value.removeEventListener('pointermove', onMove)
      wrapperRef.value.removeEventListener('pointerup', onUp)
      wrapperRef.value.removeEventListener('pointercancel', onUp)
      wrapperRef.value.removeEventListener('lostpointercapture', onUp)
    }
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
  }
  if (wrapperRef.value) {
    wrapperRef.value.addEventListener('pointermove', onMove)
    wrapperRef.value.addEventListener('pointerup', onUp)
    wrapperRef.value.addEventListener('pointercancel', onUp)
    // 浏览器释放 pointer capture 时的安全兜底（与 CE lostpointercapture 一致）
    wrapperRef.value.addEventListener('lostpointercapture', onUp)
  }
  // 全局兜底（指针可能离开元素）
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
}

/**
 * 拖拽中实时更新内部文字 + 截断检测 + tooltip（与 CE _onMove_ 末尾对齐）：
 * CE: _buildDOM → _updateTextVisibility → void offsetHeight → _refreshTooltip
 */
function _updateDragDisplay(curStart, curEnd) {
  if (!_ptrActive.value) return
  // 1. 更新内部时间文字（覆盖 timeRange computed）
  const fmt = props.formatter
  _dragTimeText.value = fmt
    ? fmt.formatRange(Math.min(curStart, curEnd), Math.max(curStart, curEnd), 'segment')
    : `${curStart} – ${curEnd}`
  const el = wrapperRef.value
  if (!el) return
  // 2. 同步截断检测（布局已由 wrapperStyle 更新 + getBoundingClientRect 强制重排）
  const label = el.querySelector('.tls-label')
  const time = el.querySelector('.tls-time')
  let hidden = false
  if (label && label.scrollWidth > label.clientWidth + 1) hidden = true
  else if (time && time.scrollWidth > time.clientWidth + 1) hidden = true
  else {
    const inner = el.querySelector('.tls-inner')
    if (inner && inner.scrollWidth > inner.clientWidth + 1) hidden = true
    // 垂直溢出检测：从样式推算内容总高度（与 _isTruncated 一致）
    if (!hidden && inner && inner.children.length) {
      let contentH = 0
      for (const child of inner.children) {
        const cs = getComputedStyle(child)
        const fs = parseFloat(cs.fontSize) || 11
        const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight) || fs * 1.2
        contentH += lh
      }
      const gap = getComputedStyle(inner).gap
      if (gap && inner.children.length > 1) {
        contentH += (parseFloat(gap) || 0) * (inner.children.length - 1)
      }
      const bar = inner.parentElement
      if (bar && contentH > bar.clientHeight + 1) hidden = true
    }
  }
  _textHidden.value = hidden
  // 3. 更新 tooltip
  const tipMode = props.segment.tooltip || 'auto'
  if (tipMode !== 'none') {
    const rect = el.getBoundingClientRect()
    tooltipCtrl.show({
      label: props.segment.label || '',
      timeText: fmt ? fmt.formatRange(curStart, curEnd, 'tooltip') : `${curStart} – ${curEnd}`,
      rect,
      pos: effectiveTooltipPos.value,
    })
  }
}

function _onMove(e) {
  if (!_ptrActive.value) return

  // Ctrl+复制模式检测（需段可复制且目标轨道可创建，与 CE 一致）
  if (_ctrlOnDown && !_copyMode && Math.abs(_client(e) - _ptrStart) > 3) {
    if (props.copyable && props.trackCreatable) {
      _copyMode = true
      _copyMoved = true
      _enterCopyMode(e)
    }
  }
  if (_copyMode) {
    // 复制模式中同样检测跨轨道目标（与 CE 一致）
    if (_mode === 'move') {
      const tgt = _detectTargetTrack(e)
      if (tgt && tgt !== _targetTrackEl) {
        if (_targetTrackEl) _targetTrackEl.classList.remove('tlt-drag-over')
        _targetTrackEl = tgt
        if (tgt) tgt.classList.add('tlt-drag-over')
      } else if (!tgt && _targetTrackEl) {
        _targetTrackEl.classList.remove('tlt-drag-over')
        _targetTrackEl = null
      }
    }
    _updateCopyGhost(e)
    return
  }

  // 跨轨道检测（仅 move 模式）
  if (_mode === 'move') {
    const tgt = _detectTargetTrack(e)
    if (tgt && tgt !== _targetTrackEl) {
      if (_targetTrackEl) _targetTrackEl.classList.remove('tlt-drag-over')
      _targetTrackEl = tgt
      if (tgt) tgt.classList.add('tlt-drag-over')
      if (tgt) _enterCrossTrack(e)
      return
    } else if (!tgt && _targetTrackEl) {
      _exitCrossTrack()
      return
    }
    if (_targetTrackEl) {
      _updateCrossGhost(e)
      return
    }
  }

  // 像素→值转换
  const dp = _client(e) - _ptrStart
  const dt = _px2Val(dp)
  const trackStep = props.step > 0 ? props.step : 0
  // 有效步长：min(trackStep, axisNiceStep/2)，确保放大后对齐轴刻度（与 CE 一致）
  const effStep = _getResizeStep(trackStep)

  // 计算像素偏移（用于 wrapperStyle 直接驱动视觉位置，不依赖父组件 model 更新）
  const dim = _segAreaRect ? (props.vertical ? _segAreaRect.height : _segAreaRect.width) : 0
  const range = props.effRangeEnd - props.effRangeStart

  if (_mode === 'resize-left') {
    let s = snap(_s0 + dt, effStep)
    // 根据 snapped 值判断方向（与 CE 一致：使用最终值而非鼠标原始方向）
    s = s > _s0 ? Math.min(s, _e0) : Math.max(s, _lo)
    // 将值变化转为像素偏移，直接应用到 wrapperStyle
    // 零宽点时强制 _resizeDeltaPx = _resizeBaseWidth，避免因 dim 与 pixelWidth
    // 测量方式差异导致视觉残留数像素（getBoundingClientRect vs 父组件计算）
    if (s >= _e0) {
      _resizeDeltaPx.value = _resizeBaseWidth.value
    } else {
      _resizeDeltaPx.value = dim && range ? ((s - _s0) / range) * dim : dp
    }
    // 把手交换：左边缘超过原始右边缘时切换为 resize-right（CE: s >= this.end && px > this._ptr0）
    if (s >= _e0 && _client(e) > _ptrStart) {
      _swapToResizeRight(e)
    }
    _updateDragDisplay(Math.min(s, _e0), Math.max(s, _e0))
  } else if (_mode === 'resize-right') {
    let ev = snap(_e0 + dt, effStep)
    // 根据 snapped 值判断方向（与 CE 一致）
    ev = ev < _e0 ? Math.max(ev, _s0) : Math.min(ev, _hi)
    // 零宽点时强制 _resizeDeltaPx = -_resizeBaseWidth
    if (ev <= _s0) {
      _resizeDeltaPx.value = -_resizeBaseWidth.value
    } else {
      _resizeDeltaPx.value = dim && range ? ((ev - _e0) / range) * dim : dp
    }
    // 把手交换：右边缘越过原始左边缘时切换为 resize-left
    if (ev <= _s0 && _client(e) < _ptrStart) {
      _swapToResizeLeft(e)
    }
    _updateDragDisplay(Math.min(ev, _s0), Math.max(ev, _s0))
  } else if (_mode === 'move') {
    const w = _e0 - _s0
    // move 使用与 resize 相同的有效步长（与 CE 一致：统一 effStep）
    let s = snap(_s0 + dt, effStep)
    s = clamp(s, _lo, _hi - w)
    // 将 snap 后的值变化转为像素偏移
    _dragDeltaPx.value = dim && range ? ((s - _s0) / range) * dim : dp
    _updateDragDisplay(s, s + w)
  }
}

function _onUp(e) {
  if (!_ptrActive.value) return

  // Ctrl+复制结束
  if (_copyMode) {
    _finishCopy(e)
    return
  }
  _ctrlOnDown = false

  // 跨轨道结束
  if (_targetTrackEl) {
    _finishCrossTrack(e)
    return
  }

  // 保存模式以计算最终值（_mode 即将清空）
  const savedMode = _mode
  _ptrActive.value = false
  _dragging.value = false
  _resizing.value = false
  _mode = null
  _dragDeltaPx.value = 0
  _resizeDeltaPx.value = 0
  _dragTimeText.value = null

  tooltipCtrl.hide()

  if (wrapperRef.value) {
    wrapperRef.value.releasePointerCapture(e.pointerId)
  }

  // 从初始快照 + snap 后的 delta 重新计算最终值（不依赖 props.segment.start/end，因拖拽期间未被更新）
  const dp = _client(e) - _ptrStart
  const dt = _px2Val(dp)
  const trackStep = props.step > 0 ? props.step : 0
  const effStep = _getResizeStep(trackStep)

  let finalStart, finalEnd
  if (savedMode === 'move') {
    const w = _e0 - _s0
    let s = snap(_s0 + dt, effStep)
    s = clamp(s, _lo, _hi - w)
    finalStart = s
    finalEnd = s + w
  } else if (savedMode === 'resize-left') {
    let s = snap(_s0 + dt, effStep)
    s = s > _s0 ? Math.min(s, _e0) : Math.max(s, _lo)
    finalStart = s
    finalEnd = _e0
    // 最小宽度约束（与 CE minDur 一致）
    if (props.minDuration > 0 && finalEnd - finalStart < props.minDuration) {
      finalStart = finalEnd - props.minDuration
    }
  } else if (savedMode === 'resize-right') {
    let ev = snap(_e0 + dt, effStep)
    ev = ev < _e0 ? Math.max(ev, _s0) : Math.min(ev, _hi)
    finalStart = _s0
    finalEnd = ev
    // 最小宽度约束
    if (props.minDuration > 0 && finalEnd - finalStart < props.minDuration) {
      finalEnd = finalStart + props.minDuration
    }
  }

  // 零宽锚点（_s0 === _e0，即刚完成把手交换）释放时，dp < 5px 视为精确零宽
  // 避免交换后鼠标微抖（2–5px 不可觉位移）产生的值偏移（如 08:53-09:00）
  if (_s0 === _e0) {
    const releaseDp = _client(e) - _ptrStart
    if (Math.abs(releaseDp) < 5) {
      finalStart = _s0
      finalEnd = _s0
    }
  }

  // 反向拖拽吸附：始终在拖拽到的位置归零宽度（与 CE 一致）
  if (finalStart > finalEnd) {
    if (savedMode === 'resize-left') {
      finalEnd = finalStart // 左柄为主，右边缘吸附到左柄
    } else {
      finalStart = finalEnd // 右柄为主，左边缘吸附到右柄
    }
  }

  emit('change', { id: props.segment.id, start: finalStart, end: finalEnd })
}

/* =============================== 把手交换 =============================== */
/** 左柄越过右边缘 → 切换为右柄模式，从零宽度位置开始向右拉伸 */
function _swapToResizeRight(e) {
  // ── 零宽点的像素位置：当前视觉左边缘 _resizeBaseLeft + _resizeDeltaPx
  //   （初始交换：右边缘 pixelLeft+pixelWidth；swap-back：左边缘 pixelLeft）
  // ── 零宽点的值：resize-left 的上界 _e0
  //   （初始交换：14；swap-back：10，已由 _swapToResizeLeft 正确设定）
  //   CE 版拖拽中实时更新属性值，Vue 版必须保留当前值不能回退到 props.segment.end。
  const currentVisualLeft = _resizeBaseLeft.value + _resizeDeltaPx.value
  const zeroVal = _e0
  _mode = 'resize-right'
  _ptrStart = _client(e)
  _resizeBaseLeft.value = currentVisualLeft
  _resizeBaseWidth.value = 0
  _s0 = zeroVal
  _e0 = zeroVal
  _resizeDeltaPx.value = 0
  _dragging.value = false
  _resizing.value = true
  _computeBounds()
}

/** 右柄越过左边缘 → 切换为左柄模式，从零宽度位置开始向左拉伸 */
function _swapToResizeLeft(e) {
  // ── 零宽点的值：使用 resize-right 正在钳制的 _s0（可能已因此前交换从 start 变为 end）──
  //   CE 版拖拽中实时更新 this.start/end，所以直接取 this.start 就对了；
  //   Vue 版 props 不可变，必须保留当前的零宽值 _s0，不能回退到 props.segment.start。
  // ── 零宽点的视觉位置：_resizeBaseLeft 应保持当前位置（不重置），
  //   它已由 _startDrag（左边缘）或 _swapToResizeRight（右边缘）正确设定。──
  const zeroVal = _s0
  _mode = 'resize-left'
  _ptrStart = _client(e)
  // 不改变 _resizeBaseLeft — 它已经指向正确的零宽点像素位置
  _resizeBaseWidth.value = 0
  _s0 = zeroVal
  _e0 = zeroVal
  _resizeDeltaPx.value = 0
  _dragging.value = false
  _resizing.value = true
  _computeBounds()
}

/* =============================== 删除 =============================== */

function onDeleteClick() {
  const loc = _locale.value
  const fmt = props.formatter
  const segRange = fmt ? fmt.formatRange(props.segment.start, props.segment.end, 'axis') : `${props.segment.start} – ${props.segment.end}`
  const name = props.segment.label || segRange
  const msg = formatLocale(loc.confirmDeleteSegment || '确定要删除时间段「{name}」({range}) 吗？', { name, range: segRange })

  // 使用 ModalPortal 做删除确认（与 CE showDeleteConfirm 行为一致）
  modalCtrl.show({
    type: 'delete-confirm',
    title: loc.confirmDeleteTitle || '确认删除',
    message: msg,
    danger: true,
    originEl: wrapperRef.value,  // 从段位置展开
    onConfirm: () => {
      modalCtrl.hide()
      emit('delete', props.segment.id)
    },
  })
}

/* =============================== 右键菜单 =============================== */

function onCtxMenu(e) {
  if (_ptrActive.value) return
  if (e.target.closest('[data-role="del"]')) return
  e.stopPropagation()

  const loc = _locale.value
  const fmt = props.formatter
  const segRange = fmt ? fmt.formatRange(props.segment.start, props.segment.end, 'axis') : `${props.segment.start} – ${props.segment.end}`
  const headerLabel = formatLocale(loc.segmentMenuHeader || '🔖 {name}  {range}', { name: props.segment.label || '', range: segRange })

  const items = [
    { type: 'header', label: headerLabel },
  ]

  if (segmentEditable.value) {
    items.push({
      label: loc.modifyProps || '修改属性',
      action: () => _editSegment(),
    })
  }

  if (segmentCopyable.value) {
    items.push({
      label: loc.copySegment || '复制段',
      action: () => _copySegment(),
    })
  }

  if (segmentDeletable.value) {
    items.push({
      label: loc.deleteBtnTitle || '删除',
      danger: true,
      action: () => {
        // 使用 ModalPortal 做删除确认（与 CE showDeleteConfirm 行为一致）
        const msg = formatLocale(loc.confirmDeleteSegment || '确定要删除时间段「{name}」({range}) 吗？', { name: props.segment.label || segRange, range: segRange })
        modalCtrl.show({
          type: 'delete-confirm',
          title: loc.confirmDeleteTitle || '确认删除',
          message: msg,
          danger: true,
          originEl: wrapperRef.value,  // 从段位置展开
          onConfirm: () => {
            modalCtrl.hide()
            emit('delete', props.segment.id)
          },
        })
      },
    })
  }

  if (items.length > 1) {
    ctxMenuCtrl.show(items, e.clientX, e.clientY, wrapperRef.value)
  }
}

/* ---- 编辑段 ---- */
function _editSegment() {
  emit('context-menu', { action: 'edit-segment', segment: props.segment, originEl: wrapperRef.value })
}

/* ---- 复制段 ---- */
function _copySegment() {
  clipboardCtrl.copyToClipboard('segment', {
    label: props.segment.label,
    color: props.segment.color,
    start: props.segment.start,
    end: props.segment.end,
  })
  _pulseCopy()
}

/* =============================== 跨轨道拖拽 =============================== */

function _detectTargetTrack(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY)
  if (!el) return null
  const track = el.closest('.tlt-row')
  if (!track || track === _srcTrackEl) return null
  // 目标轨道不可编辑时不允许跨轨道进入（与 CE _detectTargetTrack 一致）
  if (track.dataset.editable === 'false') return null
  const srcContainer = _srcTrackEl?.closest('.tlc-container')
  const tgtContainer = track.closest('.tlc-container')
  if (srcContainer !== tgtContainer) return null
  return track
}

function _enterCrossTrack(e) {
  if (!_targetTrackEl) return
  // 隐藏原段
  if (wrapperRef.value) wrapperRef.value.style.visibility = 'hidden'

  const darker = _darken(props.segment.color || '#5c9ce6', 0.18)
  crossGhostBarStyle.value = {
    background: props.segment.color || '#5c9ce6',
    border: `1px solid ${darker}`,
    borderRadius: props.globalRadius || '0',
  }
  _crossGhost.value = true
  _updateCrossGhost(e)
}

function _updateCrossGhost(e) {
  if (!_targetTrackEl) return
  const segArea = _targetTrackEl.querySelector('.tlt-seg-area')
  if (!segArea) return
  const rect = segArea.getBoundingClientRect()
  if (!rect) return

  /* 从目标轨道 DOM 读取有效范围（dragBounds 优先，fallback effRange），
     与 TimeTrack.dragBounds / effRange 计算逻辑对齐 */
  const tgtRS = parseFloat(_targetTrackEl.dataset.dragBoundsStart ?? _targetTrackEl.dataset.effRangeStart ?? props.rangeStart)
  const tgtRE = parseFloat(_targetTrackEl.dataset.dragBoundsEnd ?? _targetTrackEl.dataset.effRangeEnd ?? props.rangeEnd)
  const range = tgtRE - tgtRS
  if (!range) return

  const v = props.vertical
  const dim = v ? rect.height : rect.width
  /* 鼠标在目标轨道 seg-area 内的相对位置 → 值空间 */
  const cp = v ? e.clientY : e.clientX
  const orig = v ? rect.top : rect.left
  const mouseVal = tgtRS + ((cp - orig) / dim) * range

  /* 保持段时长，以鼠标位置居中，吸附并钳制到目标轨道边界 */
  const w = Math.min(_e0 - _s0, range)
  let s = mouseVal - w / 2
  s = snap(s, props.step || 0)
  s = clamp(s, tgtRS, tgtRE - w)
  const eTime = s + w

  /* 像素坐标（用于 Ghost 定位） */
  const lo = ((s - tgtRS) / range) * dim
  const hi = ((eTime - tgtRS) / range) * dim
  const segW = Math.max(Math.abs(hi - lo), 2)
  const segL = Math.min(lo, hi)

  crossGhostStyle.value = v
    ? {
        position: 'fixed',
        zIndex: '9999',
        pointerEvents: 'none',
        left: rect.left + 'px',
        top: rect.top + segL + 'px',
        width: rect.width + 'px',
        height: segW + 'px',
        opacity: '0.7',
      }
    : {
        position: 'fixed',
        zIndex: '9999',
        pointerEvents: 'none',
        left: rect.left + segL + 'px',
        top: rect.top + 'px',
        width: segW + 'px',
        height: rect.height + 'px',
        opacity: '0.7',
      }
}

function _exitCrossTrack() {
  if (_targetTrackEl) _targetTrackEl.classList.remove('tlt-drag-over')
  _targetTrackEl = null
  _crossGhost.value = false
  if (wrapperRef.value) wrapperRef.value.style.visibility = ''
}

function _finishCrossTrack(e) {
  const tgt = _targetTrackEl
  if (!tgt) { _exitCrossTrack(); return }

  /* — 计算落位值（使用目标轨道的有效范围，与 _updateCrossGhost 一致） — */
  const segArea = tgt.querySelector('.tlt-seg-area')
  const rect = segArea?.getBoundingClientRect()
  const tgtRS = parseFloat(tgt.dataset.dragBoundsStart ?? tgt.dataset.effRangeStart ?? props.rangeStart)
  const tgtRE = parseFloat(tgt.dataset.dragBoundsEnd ?? tgt.dataset.effRangeEnd ?? props.rangeEnd)

  let dropStart, dropEnd
  if (rect && tgtRE > tgtRS) {
    const v = props.vertical
    const cp = v ? e.clientY : e.clientX
    const orig = v ? rect.top : rect.left
    const dim = v ? rect.height : rect.width
    const range = tgtRE - tgtRS
    const mouseVal = tgtRS + ((cp - orig) / dim) * range
    const w = Math.min(_e0 - _s0, range)
    let s = mouseVal - w / 2
    s = snap(s, props.step || 0)
    s = clamp(s, tgtRS, tgtRE - w)
    dropStart = s
    dropEnd = s + w
  } else {
    // 兜底：保持原始值
    dropStart = _s0
    dropEnd = _e0
  }

  _exitCrossTrack()

  _ptrActive.value = false
  _dragging.value = false
  _mode = null
  _dragTimeText.value = null
  if (wrapperRef.value) wrapperRef.value.releasePointerCapture(e.pointerId)

  // 携带目标轨道 ID 和落位值，由 Track → Container 完成数据迁移及重叠校验
  emit('context-menu', {
    action: 'cross-track-drop',
    sourceTrackId: _srcTrackEl?.dataset?.trackId,
    targetTrackId: tgt.dataset?.trackId,
    segment: props.segment,
    start: dropStart,
    end: dropEnd,
  })
}

/* ---- Ctrl+拖拽复制 ---- */

function _enterCopyMode(e) {
  const darker = _darken(props.segment.color || '#5c9ce6', 0.18)
  crossGhostBarStyle.value = {
    background: props.segment.color || '#5c9ce6',
    border: `1px solid ${darker}`,
    borderRadius: props.globalRadius || '0',
  }
  _crossGhost.value = true
  _updateCopyGhost(e)
}

function _updateCopyGhost(e) {
  // 使用目标轨道或当前轨道的坐标范围（与 CE 一致：t = this._tgtTrack || this._track）
  const tEl = _targetTrackEl || _srcTrackEl
  if (!tEl) return
  const rect = tEl.querySelector('.tlt-seg-area')?.getBoundingClientRect()
  if (!rect) return

  // 跨轨道时用目标轨道的数据集范围，否则用 props 范围
  const er = _targetTrackEl
    ? {
        start: parseFloat(_targetTrackEl.dataset.dragBoundsStart ?? _targetTrackEl.dataset.effRangeStart ?? props.rangeStart),
        end:   parseFloat(_targetTrackEl.dataset.dragBoundsEnd   ?? _targetTrackEl.dataset.effRangeEnd   ?? props.rangeEnd),
      }
    : { start: props.rangeStart, end: props.rangeEnd }
  const range = er.end - er.start
  if (!range) return

  const dp = _client(e) - _ptrStart
  const dim = (props.vertical ? rect.height : rect.width)
  const dt = (dp / dim) * range

  const w = _e0 - _s0
  let s = _s0 + dt
  s = snap(s, props.step || 0)
  s = clamp(s, er.start, er.end - w)
  const eTime = s + w

  const v = props.vertical
  const lo = ((s - er.start) / range) * dim
  const hi = ((eTime - er.start) / range) * dim
  const segW = Math.max(Math.abs(hi - lo), 2)
  const segL = Math.min(lo, hi)

  crossGhostStyle.value = v
    ? {
        position: 'fixed',
        zIndex: '9999',
        pointerEvents: 'none',
        left: rect.left + 'px',
        top: rect.top + segL + 'px',
        width: rect.width + 'px',
        height: segW + 'px',
        opacity: '0.7',
      }
    : {
        position: 'fixed',
        zIndex: '9999',
        pointerEvents: 'none',
        left: rect.left + segL + 'px',
        top: rect.top + 'px',
        width: segW + 'px',
        height: rect.height + 'px',
        opacity: '0.7',
      }
}

function _finishCopy(e) {
  _crossGhost.value = false
  _copyMode = false
  _ctrlOnDown = false

  // 跨轨道复制 → 传递 targetTrackId 给 Container，在目标轨道创建新段
  const targetTrackId = _targetTrackEl?.dataset?.trackId

  // 计算目标位置
  const tEl = _targetTrackEl || _srcTrackEl
  if (!tEl) {
    _ptrActive.value = false
    _dragging.value = false
    _mode = null
    _dragTimeText.value = null
    if (_targetTrackEl) _targetTrackEl.classList.remove('tlt-drag-over')
    _targetTrackEl = null
    return
  }

  let s, eTime, w
  if (_targetTrackEl) {
    // 跨轨道复制：使用目标轨道的坐标空间计算（与 CE 一致：t = this._tgtTrack）
    const segArea = _targetTrackEl.querySelector('.tlt-seg-area')
    const rect = segArea?.getBoundingClientRect()
    const tgtRS = parseFloat(_targetTrackEl.dataset.dragBoundsStart ?? _targetTrackEl.dataset.effRangeStart ?? 0)
    const tgtRE = parseFloat(_targetTrackEl.dataset.dragBoundsEnd ?? _targetTrackEl.dataset.effRangeEnd ?? 24)
    const range = tgtRE - tgtRS
    if (rect && range) {
      const v = props.vertical
      const cp = v ? e.clientY : e.clientX
      const orig = v ? rect.top : rect.left
      const dim = v ? rect.height : rect.width
      const mouseVal = tgtRS + ((cp - orig) / dim) * range
      w = _e0 - _s0
      s = mouseVal - w / 2
      s = snap(s, props.step || 0)
      s = clamp(s, tgtRS, tgtRE - w)
    } else {
      s = _s0; w = _e0 - _s0
    }
    eTime = s + w
  } else {
    // 同轨道复制（原有逻辑）
    const dp = _client(e) - _ptrStart
    const range = props.effRangeEnd - props.effRangeStart
    const dt = _segAreaRect ? (dp / (props.vertical ? _segAreaRect.height : _segAreaRect.width)) * range : 0
    w = _e0 - _s0
    s = snap(_s0 + dt, props.step || 0)
    s = clamp(s, props.effRangeStart, props.effRangeEnd - w)
    eTime = s + w
    if (eTime > props.rangeEnd) { eTime = props.rangeEnd; s = eTime - w }
  }

  // 段数上限校验由 Container 处理（与 CE addSegment → _checkSegmentLimit 等效）
  // emit 创建事件（带 copyFrom 标记，Container 会据此创建新段而非移动原段）
  // 跨轨道复制时携带 targetTrackId，让 Container 在目标轨道创建
  emit('change', {
    id: props.segment.id,
    start: s,
    end: eTime,
    copyFrom: props.segment.id,
    targetTrackId,
  })

  _ptrActive.value = false
  _dragging.value = false
  _mode = null
  _dragTimeText.value = null
  if (_targetTrackEl) _targetTrackEl.classList.remove('tlt-drag-over')
  _targetTrackEl = null
  if (wrapperRef.value) wrapperRef.value.releasePointerCapture(e.pointerId)
}

/* =============================== 暴露方法 =============================== */

defineExpose({
  pulseCopy: _pulseCopy,
  isTruncated: _isTruncated,
})
</script>

<style scoped>
/* 与 lib/base.css time-line-segment 样式完全对齐，使用 CSS 变量 */
.tls-segment-root { display: contents; }

.tls-wrapper {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  user-select: none;
  touch-action: none;
  transition: box-shadow .12s;
  /* --tls-height 控制横向模式段高度（如 30px），默认 auto 填满轨道 */
  height: var(--tls-height);
  margin: auto 0;
}
.tls-wrapper.vertical {
  /* --tls-width 控制纵向模式段宽度（如 24px），默认 auto 填满轨道 */
  width: var(--tls-width);
  margin: 0 auto;
  height: auto;
}
.tls-wrapper:hover { z-index: 4; }
.tls-wrapper.dragging { z-index: 12; }
.tls-wrapper.resizing { z-index: 12; }
.tls-wrapper.tls-active .tls-bar {
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.65);
}

.tls-bar {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transition: filter .12s, box-shadow .12s, border-radius .15s;
}
.tls-wrapper:hover .tls-bar { filter: brightness(1.06); }
.tls-wrapper.dragging .tls-bar,
.tls-wrapper.resizing .tls-bar {
  filter: brightness(1.10);
  box-shadow: 0 2px 14px rgba(0,0,0,.22);
}

.tls-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
  padding: 0 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 11px;
  line-height: 1.3;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,.3);
  pointer-events: none;
}
.tls-label {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.tls-time {
  font-size: 10px;
  opacity: .82;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 文字溢出隐藏 */
.tls-text-hidden .tls-inner { visibility: hidden; }

/* 拖拽手柄 — 3px 宽、-1.5px 偏移（缩小把手降低零宽时视觉残留） */
.tls-hdl {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tls-hdl-left { left: -1.5px; }
.tls-hdl-right { right: -1.5px; }
.tls-hdl-bar {
  width: 3px;
  height: 50%;
  background: linear-gradient(to right, rgba(0,0,0,0.04), rgba(255,255,255,0.10));
  border-radius: 2px;
  pointer-events: none;
  opacity: 0;
  transition: opacity .14s;
}
.tls-wrapper:hover .tls-hdl-bar { opacity: 1; }

/* 拖拽/调整大小时隐藏删除按钮 */
.tls-wrapper.dragging .tls-del,
.tls-wrapper.resizing .tls-del { opacity: 0; }

/* 删除按钮 — 保留 Vue 版本设计（lib 已同步至此样式） */
.tls-del {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 4;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: rgba(0,0,0,.35);
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  border-radius: 0 0 0 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity .12s;
}
.tls-wrapper:hover .tls-del { opacity: 1; }
.tls-del:hover { background: rgba(200,0,0,.7); }

/* 窄段隐藏删除按钮 */
.tls-del-hidden .tls-del { display: none; }

/* ── 选中模式：段表面扫光动画 — 与 CE @keyframes tls-bar-shine 对齐 ── */
@keyframes tls-bar-shine {
  0%   { transform: translateX(-120%) skewX(-15deg); }
  100% { transform: translateX(320%) skewX(-15deg); }
}
.tls-wrapper.tls-active .tls-bar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,.2) 35%,
    rgba(255,255,255,.45) 50%,
    rgba(255,255,255,.2) 65%,
    transparent
  );
  transform: translateX(-120%) skewX(-15deg);
  animation: tls-bar-shine 1.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

/* 复制脉冲动画 — 与 CE @keyframes tls-copy-pulse 对齐 */
.tls-copy-pulse .tls-bar {
  animation: tls-copy-pulse .6s ease-out forwards;
}
@keyframes tls-copy-pulse {
  0%   { box-shadow: inset 0 0 0 0 rgba(66,133,244,.5); }
  50%  { box-shadow: inset 0 0 0 3px rgba(66,133,244,.25); }
  100% { box-shadow: inset 0 0 0 0 rgba(66,133,244,0); }
}
</style>

<!-- 垂直模式光标 + CE 自定义 SVG 光标（需感知父轨道 .tlt-row.vertical，scoped 内无法跨组件选择） -->
<style>
/* 水平状态光标 — SVG 小手 */
.tls-wrapper { cursor: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%3E%3Cg%20fill='%23444'%20stroke='%23fff'%20stroke-width='1.5'%20stroke-linejoin='round'%3E%3Crect%20x='8'%20y='12'%20width='11'%20height='9'%20rx='2.5'/%3E%3Crect%20x='9'%20y='6'%20width='3'%20height='7.5'%20rx='1.5'/%3E%3Crect%20x='12.5'%20y='5'%20width='3'%20height='8.5'%20rx='1.5'/%3E%3Crect%20x='16'%20y='6.5'%20width='3'%20height='7'%20rx='1.5'/%3E%3Crect%20x='5.5'%20y='10'%20width='3'%20height='6'%20rx='1.5'%20transform='rotate(-18%207%2013)'/%3E%3C/g%3E%3C/svg%3E") 12 12, grab; }
/* 水平 dragging 光标 — 填充版 */
.tls-wrapper.dragging { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' fill='%23444' stroke='none'/%3E%3C/svg%3E") 10 10, grabbing; }
/* 水平 resize 光标 — 左右三角箭头 */
.tls-wrapper.resizing { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,12 11,5 11,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='18,12 13,5 13,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }
/* 水平手柄光标 */
.tls-hdl { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,12 11,5 11,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='18,12 13,5 13,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }

/* 垂直模式：默认小手，拖拽/调整大小 ns-resize + 上下三角箭头 */
.tlt-row.vertical .tls-wrapper { cursor: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%3E%3Cg%20fill='%23444'%20stroke='%23fff'%20stroke-width='1.5'%20stroke-linejoin='round'%3E%3Crect%20x='8'%20y='12'%20width='11'%20height='9'%20rx='2.5'/%3E%3Crect%20x='9'%20y='6'%20width='3'%20height='7.5'%20rx='1.5'/%3E%3Crect%20x='12.5'%20y='5'%20width='3'%20height='8.5'%20rx='1.5'/%3E%3Crect%20x='16'%20y='6.5'%20width='3'%20height='7'%20rx='1.5'/%3E%3Crect%20x='5.5'%20y='10'%20width='3'%20height='6'%20rx='1.5'%20transform='rotate(-18%207%2013)'/%3E%3C/g%3E%3C/svg%3E") 12 12, grab; }
.tlt-row.vertical .tls-wrapper.dragging { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' fill='%23444' stroke='none'/%3E%3C/svg%3E") 10 10, grabbing; }
.tlt-row.vertical .tls-wrapper.resizing { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='12,6 5,11 19,11' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='12,18 5,13 19,13' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }
.tlt-row.vertical .tls-hdl { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='12,6 5,11 19,11' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpolygon points='12,18 5,13 19,13' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }
/* 垂直手柄位置 */
.tlt-row.vertical .tls-hdl-left { top: -1.5px; left: 0; right: 0; bottom: auto; width: auto; height: 3px; }
.tlt-row.vertical .tls-hdl-right { bottom: -1.5px; left: 0; right: 0; top: auto; width: auto; height: 3px; }
</style>
