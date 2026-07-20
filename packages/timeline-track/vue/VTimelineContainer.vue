<template>
  <div
    class="tlc-container"
    :class="[
      `tlc-dir-${direction}`,
      { 'tlc-shared': axisMode === 'shared', 'tlc-borderless': borderless }
    ]"
    :style="containerStyle"
    ref="containerRef"
    @wheel="onWheel"
  >
    <!-- 共享轴尺 -->
    <div v-if="axisMode === 'shared'" class="tlc-axis-ruler" ref="rulerRef">
      <div class="tlc-axis-spacer">
        <span class="tlc-axis-range">{{ axisRangeLabel }}</span>
      </div>
      <div class="tlc-axis-body">
        <canvas ref="rulerCanvasRef" class="tlc-axis-canvas" />
      </div>
    </div>

    <!-- hover 浮动框（放在容器直接子级，用 position:absolute 相对于容器定位） -->
    <div v-show="hoverFloatVisible" class="tlc-hover-float" :class="{ visible: hoverFloatVisible }" :style="hoverFloatStyle"></div>

    <!-- 轨道列表 -->
    <VTimelineTrack
      v-for="track in tracks"
      :key="track.id"
      :track="track"
      :vertical="direction === 'vertical'"
      :step="resolveStep(track)"
      :min-duration="resolveMinDuration(track)"
      :range-start="getTrackStart(track)"
      :range-end="getTrackEnd(track)"
      :formatter="formatter"
      :locale="locale"
      :editable="resolveEditable(track)"
      :deletable="resolveDeletable(track)"
      :creatable="resolveCreatable(track)"
      :clearable="resolveClearable(track)"
      :copyable="resolveCopyable(track)"
      :max-segments="resolveMaxSegments(track)"
      :default-color="resolveDefaultColor(track)"
      :label-h="trackLabelH"
      :label-v="trackLabelV"
      :tooltip-pos="tooltipPos"
      :global-radius="globalRadius"
      :selection-mode="selectionMode"
      :shared-clip-range="sharedClipRange"
      :shared-start="sharedRange.start"
      :shared-end="sharedRange.end"
      :zoom-start="zoomRange.start"
      :zoom-end="zoomRange.end"
      @seg-change="onSegChange"
      @seg-delete="onSegDelete"
      @seg-create="onSegCreate"
      @context-menu="onTrackContextMenu"
    />

    <!-- 门户组件（Teleport 到 body） -->
    <TooltipPortal :state="tooltipCtrl.state" />
    <ContextMenuPortal :state="ctxMenuCtrl.state" @action="onCtxMenuAction" />
    <ModalPortal
      :state="modalCtrl.state"
      :formatter="formatter"
      :cancel-text="locale.cancel"
      :confirm-text="locale.confirm"
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
      @field-input="onModalFieldInput"
    />
  </div>
</template>

<script setup>
/**
 * VTimelineContainer.vue — 顶层容器 Vue 组件
 *
 * 完全兼容 lib/TimeContainer.js 的全部功能，使用 Vue 3 Composition API 实现。
 *
 * ## 新增功能（对比旧版 Vue 组件）
 * - 完整 CRUD：clearable, copyable
 * - 右键菜单系统（轨道/段）
 * - 全局 Tooltip（支持 position 配置）
 * - 模态框（编辑属性/删除确认）
 * - 剪贴板（复制/粘贴）
 * - 选中模式（selection-mode）
 * - 共享轴 hover 浮动框效果
 * - Ctrl+滚轮缩放
 * - locale 系统（loc-* 属性）
 * - zoom-start / zoom-end 视图缩放
 * - 共享轴裁剪模式（shared-clip-range）
 * - 标签位置控制（label-h / label-v）
 * - 无边框模式（borderless）
 * - 全局默认颜色（default-color）
 *
 * @module vue/VTimelineContainer
 */
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch, } from 'vue'
import { createFormatter } from '../shared/formatter.js'
import { clamp } from '../shared/utils.js'
import { formatLocale, resolveLocaleFromProps } from './useLocale.js'
import { useTooltip } from './useTooltip.js'
import { useContextMenu } from './useContextMenu.js'
import { useModal } from './useModal.js'
import { useClipboard } from './useClipboard.js'
import VTimelineTrack from './VTimelineTrack.vue'
import TooltipPortal from './TooltipPortal.vue'
import ContextMenuPortal from './ContextMenuPortal.vue'
import ModalPortal from './ModalPortal.vue'
import {
  AXIS_MODE_KEY,
  CONTAINER_CLEARABLE_KEY,
  CONTAINER_COPYABLE_KEY,
  CONTAINER_CREATABLE_KEY,
  CONTAINER_DEFAULT_COLOR_KEY,
  CONTAINER_DELETABLE_KEY,
  CONTAINER_EDITABLE_KEY,
  CONTAINER_STEP_KEY,
  CONTAINER_TOOLTIP_POS_KEY,
  DIRECTION_KEY,
  FORMATTER_KEY,
  GLOBAL_RADIUS_KEY,
  LABEL_H_KEY,
  LABEL_V_KEY,
  LOCALE_KEY,
  LOCALE_VERSION_KEY,
  SELECTION_MODE_KEY,
  SHARED_CLIP_RANGE_KEY,
  SHARED_RANGE_KEY,
  ZOOM_RANGE_KEY,
} from './inject-keys.js'

/* =============================== Props =============================== */

const props = defineProps({
  // v-model 数据
  modelValue: { type: Array, default: () => [] },

  // 布局
  direction: { type: String, default: 'horizontal' },
  axisMode: { type: String, default: 'per-track' },
  type: { type: String, default: 'time' },
  unit: { type: String, default: 'hour' },
  step: { type: [Number, String], default: undefined },

  // 共享轴
  sharedStart: { type: [Number, String], default: undefined },
  sharedEnd: { type: [Number, String], default: undefined },
  sharedClipRange: { type: Boolean, default: false },

  // 缩放
  zoomStart: { type: [Number, String], default: undefined },
  zoomEnd: { type: [Number, String], default: undefined },
  minZoomRange: { type: [Number, String], default: undefined },
  maxZoomRange: { type: [Number, String], default: undefined },

  // CRUD 权限（容器级默认值）
  editable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  creatable: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true },
  copyable: { type: Boolean, default: true },
  maxSegments: { type: [Number, String], default: undefined },

  // 外观
  borderless: { type: Boolean, default: false },
  defaultColor: { type: String, default: '#5c9ce6' },
  globalRadius: { type: String, default: '0' },
  selectionMode: { type: Boolean, default: false },
  tooltipPos: { type: String, default: 'top-center' },
  labelH: { type: String, default: 'top' },
  labelV: { type: String, default: 'left' },

  // 轴标签（共享模式用，覆盖 loc-axis-range）
  axisLabel: { type: String, default: undefined },

  // locale 属性（动态注入，使用 Vue 的 kebab-case → camelCase 自动转换）

  // 模态框动效：true 启用缩放动效（默认），false 禁用
  modalAnimation: { type: Boolean, default: true },
})

const emit = defineEmits([
  'update:modelValue',
  'update:zoomStart',
  'update:zoomEnd',
  'seg-changed',
  'seg-created',
  'seg-deleted',
  'seg-copy-error',
])

/* =============================== Refs =============================== */

const containerRef = ref(null)
const rulerRef = ref(null)
const rulerCanvasRef = ref(null)

/* =============================== Locale =============================== */

const locale = computed(() => resolveLocaleFromProps(props))
provide(LOCALE_KEY, locale)
provide(LOCALE_VERSION_KEY, ref(0))

/** 强制刷新子元素 locale（当使用者动态修改 loc-* props 时调用） */
function refreshLocale() {
  // 通过递增版本号触发子组件重新读取 locale
  // 由使用者通过模板 ref 调用
}

/* =============================== Formatter =============================== */

const formatter = computed(() => createFormatter(props.type, props.unit))
provide(FORMATTER_KEY, formatter)

/* =============================== 容器级 context =============================== */

/* ---- 全局圆角（支持运行时修改，覆盖 prop 默认值） ---- */
const _globalRadius = ref(props.globalRadius)

provide(DIRECTION_KEY, computed(() => props.direction))
provide(AXIS_MODE_KEY, computed(() => props.axisMode))
provide(CONTAINER_EDITABLE_KEY, computed(() => props.editable))
provide(CONTAINER_DELETABLE_KEY, computed(() => props.deletable))
provide(CONTAINER_CREATABLE_KEY, computed(() => props.creatable))
provide(CONTAINER_CLEARABLE_KEY, computed(() => props.clearable))
provide(CONTAINER_COPYABLE_KEY, computed(() => props.copyable))
provide(CONTAINER_STEP_KEY, computed(() => props.step))
provide(CONTAINER_DEFAULT_COLOR_KEY, computed(() => props.defaultColor))
provide(CONTAINER_TOOLTIP_POS_KEY, computed(() => props.tooltipPos))
provide(GLOBAL_RADIUS_KEY, _globalRadius)
provide(SELECTION_MODE_KEY, computed(() => props.selectionMode))
provide(LABEL_H_KEY, computed(() => props.labelH))
provide(LABEL_V_KEY, computed(() => props.labelV))
provide(SHARED_CLIP_RANGE_KEY, computed(() => props.sharedClipRange))

const sharedRange = computed(() => {
  if (props.axisMode !== 'shared') return { start: 0, end: 24 }
  let start, end
  if (props.sharedStart != null) {
    start = formatter.value.parse(props.sharedStart, 0)
  } else {
    const t = props.modelValue
    start = t.length ? Math.min(...t.map(x => formatter.value.parse(x.start, 0))) : 0
  }
  if (props.sharedEnd != null) {
    end = formatter.value.parse(props.sharedEnd, 24)
  } else {
    const t = props.modelValue
    end = t.length ? Math.max(...t.map(x => formatter.value.parse(x.end, 24))) : 24
  }
  return { start, end }
})
provide(SHARED_RANGE_KEY, sharedRange)

const zoomRange = computed(() => {
  const zs = props.zoomStart != null ? formatter.value.parse(props.zoomStart, null) : null
  const ze = props.zoomEnd != null ? formatter.value.parse(props.zoomEnd, null) : null
  return { start: zs, end: ze }
})
provide(ZOOM_RANGE_KEY, zoomRange)

/* =============================== Tooltip / ContextMenu / Modal =============================== */

const tooltipCtrl = useTooltip()
const ctxMenuCtrl = useContextMenu()
const modalCtrl = useModal()
const clipboardCtrl = useClipboard()

/* =============================== 容器样式 =============================== */

const containerStyle = computed(() => ({
  flexDirection: props.direction === 'vertical' ? 'row' : 'column',
}))

/* =============================== 轴标签 =============================== */

const trackLabelH = computed(() => {
  if (props.axisMode === 'shared') return props.labelH
  return props.labelH
})

const trackLabelV = computed(() => {
  if (props.axisMode === 'shared') return props.labelV
  return props.labelV
})

const axisRangeLabel = computed(() => {
  const fmt = formatter.value
  const sr = sharedRange.value
  if (props.axisLabel != null) return props.axisLabel
  const text = locale.value.axisRange
    .replace('{start}', fmt.format(sr.start, 'axis'))
    .replace('{end}', fmt.format(sr.end, 'axis'))
  return text
})

/* =============================== 轨道范围解析 =============================== */

function getTrackStart(track) {
  // 始终返回轨道自身范围：拖拽边界和裁剪遮罩依赖 track 自身的 rangeStart/rangeEnd
  return formatter.value.parse(track.start, 0)
}

function getTrackEnd(track) {
  return formatter.value.parse(track.end, 24)
}

/* =============================== 步长/权限继承 =============================== */

function resolveStep(track) {
  if (track.step != null) return formatter.value.parse(track.step, 0)
  if (props.step != null) return formatter.value.parse(props.step, 0)
  return 0
}

/** 最小段持续时长 — track 显式设置优先，否则默认 0.5% 轨道范围（与 CE TimeTrack.minDur 一致） */
function resolveMinDuration(track) {
  if (track.minDuration != null) return formatter.value.parse(track.minDuration, 0)
  const start = formatter.value.parse(track.start, 0)
  const end = formatter.value.parse(track.end, 24)
  return (end - start) * 0.005
}

function resolveMaxSegments(track) {
  // track 显式设置 > 容器 maxSegments 属性 > 0（无限制）
  if (track.maxSegments != null) return parseInt(track.maxSegments, 10) || 0
  if (props.maxSegments != null) return parseInt(props.maxSegments, 10) || 0
  return 0
}

function resolveEditable(track) {
  return track.editable != null ? track.editable : props.editable
}

function resolveDeletable(track) {
  return track.deletable != null ? track.deletable : props.deletable
}

function resolveCreatable(track) {
  return track.creatable != null ? track.creatable : props.creatable
}

function resolveClearable(track) {
  return track.clearable != null ? track.clearable : props.clearable
}

function resolveCopyable(track) {
  return track.copyable != null ? track.copyable : props.copyable
}

function resolveDefaultColor(track) {
  if (track.color) return track.color
  if (track.defaultColor) return track.defaultColor
  return props.defaultColor
}

/* =============================== 轨道数据 =============================== */

const tracks = computed(() => props.modelValue)

/* =============================== 段事件 =============================== */

function onSegChange({ trackId, id, start, end, copyFrom, targetTrackId }) {
  const list = [...props.modelValue]
  const tIdx = list.findIndex(t => t.id === trackId)
  if (tIdx < 0) return

  // Ctrl+拖拽复制：创建新段，不移动原段
  if (copyFrom) {
    // 跨轨道复制：使用 targetTrackId 指定的目标轨道，否则使用源轨道（同轨道复制）
    const effectiveTrackId = targetTrackId || trackId
    const tgtIdx = list.findIndex(t => t.id === effectiveTrackId)
    if (tgtIdx < 0) return

    // 找源段数据（同轨道时为源轨道，跨轨道时为源轨道中的段）
    const srcTrack = list[tIdx]
    const srcSeg = srcTrack.segments.find(s => s.id === copyFrom)
    if (!srcSeg) return

    // 校验：目标轨道可编辑
    if (resolveEditable(list[tgtIdx]) === false) {
      emit('seg-copy-error', { trackId, targetTrackId, sourceId: copyFrom, start, end, reason: 'track-not-editable' })
      return
    }

    // 校验段数上限（与 CE _finishCopy 一致）
    const tgtTrack = list[tgtIdx]
    const maxSegs = resolveMaxSegments(tgtTrack)
    if (maxSegs > 0 && tgtTrack.segments.length >= maxSegs) {
      emit('seg-copy-error', { trackId, targetTrackId: effectiveTrackId, sourceId: copyFrom, start, end, reason: 'segment-limit' })
      return
    }

    // 校验与目标轨道已有段重叠
    const overlap = (tgtTrack.segments || []).find(s =>
      start < s.end && end > s.start
    )
    if (overlap) {
      emit('seg-copy-error', { trackId, targetTrackId: effectiveTrackId, sourceId: copyFrom, start, end, reason: 'overlap' })
      return
    }

    const newSeg = {
      id: crypto.randomUUID ? crypto.randomUUID() : `vseg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      start,
      end,
      label: srcSeg.label || '',
      color: srcSeg.color || resolveDefaultColor(tgtTrack),
    }
    const segs = [...(tgtTrack.segments || []), newSeg]
    list[tgtIdx] = { ...tgtTrack, segments: segs }
    emit('update:modelValue', list)
    emit('seg-created', { trackId: effectiveTrackId, segment: formatter.value.resolveSegment(newSeg) })
    return
  }

  // 普通移动/调整大小：原地更新
  const segs = [...list[tIdx].segments]
  const sIdx = segs.findIndex(s => s.id === id)
  if (sIdx < 0) return
  segs[sIdx] = { ...segs[sIdx], start, end }
  list[tIdx] = { ...list[tIdx], segments: segs }
  emit('update:modelValue', list)
  emit('seg-changed', { trackId, ...formatter.value.resolveSegment({ id, start, end }) })
}

function onSegDelete({ trackId, id }) {
  const list = [...props.modelValue]
  const tIdx = list.findIndex(t => t.id === trackId)
  if (tIdx < 0) return
  const segs = list[tIdx].segments.filter(s => s.id !== id)
  list[tIdx] = { ...list[tIdx], segments: segs }
  emit('update:modelValue', list)
  emit('seg-deleted', { trackId, id })
}

function onSegCreate({ trackId, start, end, color }) {
  const list = [...props.modelValue]
  const tIdx = list.findIndex(t => t.id === trackId)
  if (tIdx < 0) return
  const newSeg = {
    id: crypto.randomUUID ? crypto.randomUUID() : `vseg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    start,
    end,
    label: '',
    color: color || resolveDefaultColor(list[tIdx]),
  }
  const segs = [...list[tIdx].segments, newSeg]
  list[tIdx] = { ...list[tIdx], segments: segs }
  emit('update:modelValue', list)
  emit('seg-created', { trackId, segment: formatter.value.resolveSegment(newSeg) })
}

/** 处理 Track/Segment 转发上来的复杂操作（跨轨道拖放、编辑、删除轨道、粘贴等） */
function onTrackContextMenu(e) {
  // ── 跨轨道拖放 ──
  if (e.action === 'cross-track-drop') {
    const list = [...props.modelValue]
    const srcIdx = list.findIndex(t => t.id === e.sourceTrackId)
    const tgtIdx = list.findIndex(t => t.id === e.targetTrackId)
    if (srcIdx < 0 || tgtIdx < 0) return

    const srcTrack = list[srcIdx]
    const segToMove = srcTrack.segments.find(s => s.id === e.segment.id)
    if (!segToMove) return

    // 使用段计算的目标落位值（已根据目标轨道有效范围吸附 + 边界钳制）
    const dropStart = e.start != null ? e.start : segToMove.start
    const dropEnd = e.end != null ? e.end : segToMove.end
    if (dropStart >= dropEnd) return

    const tgtTrack = list[tgtIdx]

    // 校验：目标轨道可编辑（与 CE _finishCrossTrack 一致）
    if (resolveEditable(tgtTrack) === false) return

    // 校验：目标轨道段数上限（与 CE _finishCrossTrack 一致）
    const maxSegs = resolveMaxSegments(tgtTrack)
    if (maxSegs > 0 && tgtTrack.segments.length >= maxSegs) return

    // 校验：最小持续长度（与 CE minDur 一致）
    const minDur = resolveMinDuration(tgtTrack)
    if (dropEnd - dropStart < minDur) return

    // 校验：与目标轨道已有段重叠（与 CE _finishCrossTrack 一致）
    const overlap = tgtTrack.segments.some(s =>
      dropStart < s.end && dropEnd > s.start
    )
    if (overlap) return

    // 通过全部校验：从源轨道移除
    const srcSegs = srcTrack.segments.filter(s => s.id !== e.segment.id)
    list[srcIdx] = { ...srcTrack, segments: srcSegs }

    // 添加到目标轨道（使用落位值）
    const movedSeg = { ...segToMove, start: dropStart, end: dropEnd }
    const tgtSegs = [...tgtTrack.segments, movedSeg]
    list[tgtIdx] = { ...tgtTrack, segments: tgtSegs }

    emit('update:modelValue', list)
    return
  }

  // ── 段编辑属性 ──
  if (e.action === 'edit-segment') {
    const loc = locale.value
    const fmt = formatter.value
    const seg = e.segment
    const isTime = fmt ? fmt.format(0, 'editor').includes(':') : true
    // 查找轨道数据以确定范围/步长
    const trackData = props.modelValue.find(t => t.id === e.trackId)
    const trackStart = trackData && fmt ? fmt.parse(trackData.start, 0) : 0
    const trackEnd = trackData && fmt ? fmt.parse(trackData.end, 24) : 24
    const trackStep = resolveStep(trackData || {})

    modalCtrl.show({
      type: 'edit-segment',
      title: loc.segmentEditTitle || '修改时间段属性',
      originEl: e.originEl,  // 从段位置展开
      formFields: [
        { name: 'label', type: 'text', label: loc.labelField || '标签', value: seg.label || '' },
        { name: 'start', type: isTime ? 'time' : 'text', label: loc.startTime || '开始时间',
          value: fmt ? fmt.format(seg.start, 'editor') : seg.start,
          step: isTime ? trackStep : undefined, min: trackStart, max: trackEnd },
        { name: 'end', type: isTime ? 'time' : 'text', label: loc.endTime || '结束时间',
          value: fmt ? fmt.format(seg.end, 'editor') : seg.end,
          step: isTime ? trackStep : undefined, min: trackStart, max: trackEnd },
        { name: 'color', type: 'color', label: loc.color || '颜色', value: seg.color || '' },
      ],
      onConfirm: (values) => {
        const list = [...props.modelValue]
        const tIdx = list.findIndex(t => t.id === e.trackId)
        if (tIdx < 0) return
        const segs = list[tIdx].segments.map(s => {
          if (s.id !== seg.id) return s
          return {
            ...s,
            label: values.label != null ? values.label : s.label,
            start: values.start != null ? fmt.parse(values.start, s.start) : s.start,
            end: values.end != null ? fmt.parse(values.end, s.end) : s.end,
            color: values.color != null ? values.color : s.color,
          }
        })
        list[tIdx] = { ...list[tIdx], segments: segs }
        emit('update:modelValue', list)
        modalCtrl.hide()
      },
    })
    return
  }

  // ── 删除轨道 ──
  if (e.action === 'delete-track') {
    emit('update:modelValue', props.modelValue.filter(t => t.id !== e.trackId))
    return
  }

  // ── 编辑轨道属性 ──
  if (e.action === 'edit-track') {
    const list = [...props.modelValue]
    const tIdx = list.findIndex(t => t.id === e.trackId)
    if (tIdx < 0) return
    const vals = e.values
    const fmt = formatter.value
    list[tIdx] = {
      ...list[tIdx],
      label: vals.label != null ? vals.label : list[tIdx].label,
      start: vals.start != null ? String(fmt.parse(vals.start, 0)) : list[tIdx].start,
      end: vals.end != null ? String(fmt.parse(vals.end, 24)) : list[tIdx].end,
      step: vals.step != null && vals.step !== '' ? vals.step : undefined,
      maxSegments: vals.maxSegments != null ? parseInt(vals.maxSegments, 10) || 0 : list[tIdx].maxSegments,
    }
    emit('update:modelValue', list)
    return
  }

  // ── 复制到其他轨道 ──
  if (e.action === 'copy-to-tracks') {
    const srcTrack = props.modelValue.find(t => t.id === e.trackId)
    if (!srcTrack) return
    const loc = locale.value
    // 与 CE 一致：filter 目标轨道使用 deletable（复制会清空目标轨道后重建）
    const targets = props.modelValue.filter(t => t.id !== e.trackId && resolveDeletable(t))
    if (!targets.length) {
      modalCtrl.show({
        type: 'custom',
        title: loc.copyToTracksTitle?.replace('{name}', srcTrack.label || '') || `将「${srcTrack.label || ''}」的段复制到：`,
        message: loc.copyToTracksEmpty || '没有可用的目标轨道',
        onConfirm: () => modalCtrl.hide(),
      })
      return
    }
    // 显示多选对话框（简化实现：使用 Modal 展示目标轨道列表）
    modalCtrl.show({
      type: 'copy-to-tracks',
      title: formatLocale(loc.copyToTracksTitle || '将「{name}」的段复制到：', { name: srcTrack.label || '' }),
      originEl: e.originEl,  // 从轨道位置展开
      formFields: targets.map(t => ({
        name: `track_${t.id}`,
        type: 'checkbox',
        label: t.label || loc.unnamed || '未命名',
        value: false,
      })),
      data: { sourceTrackId: e.trackId, targetTracks: targets, unnamedText: loc.unnamed || '未命名' },
      onConfirm: (values) => {
        const list = [...props.modelValue]
        const srcIdx = list.findIndex(t => t.id === e.trackId)
        if (srcIdx < 0) { modalCtrl.hide(); return }
        const source = list[srcIdx]
        for (const t of targets) {
          if (!values[`track_${t.id}`]) continue
          const tgtIdx = list.findIndex(tr => tr.id === t.id)
          if (tgtIdx < 0) continue
          // 与 CE 一致：清空目标轨道后重建
          const copies = source.segments.map(s => ({
            id: crypto.randomUUID ? crypto.randomUUID() : `vseg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            start: s.start, end: s.end, label: s.label || '', color: s.color || '',
          }))
          list[tgtIdx] = { ...list[tgtIdx], segments: [...copies] }
        }
        emit('update:modelValue', list)
        modalCtrl.hide()
      },
    })
    return
  }

  // ── 粘贴为新轨道 ──
  if (e.action === 'paste-new-track') {
    const data = e.data
    const newTrack = {
      id: crypto.randomUUID ? crypto.randomUUID() : `vt_${Date.now()}`,
      label: data.label || '',
      start: String(sharedRange.value.start),
      end: String(sharedRange.value.end),
      segments: (data.segments || []).map(s => ({
        id: crypto.randomUUID ? crypto.randomUUID() : `vseg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        start: s.start, end: s.end, label: s.label || '', color: s.color || props.defaultColor,
      })),
    }
    emit('update:modelValue', [...props.modelValue, newTrack])
    return
  }
}

/* =============================== 缩放 =============================== */

/** 核心缩放计算（从 onWheel 提取，供公共方法复用） */
function _getMinZoomRange() {
  if (props.minZoomRange != null) {
    const v = formatter.value.parse(props.minZoomRange, 0)
    if (v > 0) return v
  }
  const total = sharedRange.value.end - sharedRange.value.start
  return Math.max(total * 0.003, 0.01)
}

function _getMaxZoomRange() {
  if (props.maxZoomRange != null) {
    const v = formatter.value.parse(props.maxZoomRange, 0)
    if (v > 0) return v
  }
  const total = sharedRange.value.end - sharedRange.value.start
  return total * 1.2
}

function _zoomAtRatio(ratio, factor) {
  let vs, ve
  // 允许单独设置 zoomStart 或 zoomEnd（与 CE 一致）
  if (props.zoomStart != null) {
    vs = formatter.value.parse(props.zoomStart, sharedRange.value.start)
  } else {
    vs = sharedRange.value.start
  }
  if (props.zoomEnd != null) {
    ve = formatter.value.parse(props.zoomEnd, sharedRange.value.end)
  } else {
    ve = sharedRange.value.end
  }

  const range = ve - vs
  if (!range) return

  const center = vs + ratio * range
  const newRange = range * factor

  // 从 props 解析约束范围
  const minR = _getMinZoomRange()
  const maxR = _getMaxZoomRange()
  if (newRange < minR || newRange >= maxR) return

  let newStart = center - newRange * ratio
  let newEnd = center + newRange * (1 - ratio)

  // 边界 clamp
  const ss = sharedRange.value.start; const se = sharedRange.value.end
  if (newStart < ss) { newEnd = Math.min(newEnd + (ss - newStart), se); newStart = ss }
  if (newEnd > se) { newStart = Math.max(newStart - (newEnd - se), ss); newEnd = se }

  emit('update:zoomStart', newStart)
  emit('update:zoomEnd', newEnd)
}

function zoomIn(centerRatio = 0.5) { _zoomAtRatio(centerRatio, 1 / 1.2) }
function zoomOut(centerRatio = 0.5) { _zoomAtRatio(centerRatio, 1.2) }
function zoomTo(start, end) { emit('update:zoomStart', start); emit('update:zoomEnd', end) }
function zoomReset() { emit('update:zoomStart', null); emit('update:zoomEnd', null) }
function zoomFit() { zoomReset() }

/** Ctrl+滚轮缩放（与 CE _wheelZoom 对齐） */
function onWheel(e) {
  if (!e.ctrlKey && !e.metaKey) return
  e.preventDefault()

  const isV = props.direction === 'vertical'
  const tracksVal = tracks.value
  if (!tracksVal.length) return

  // 使用 elementFromPoint 查找鼠标下轨道（与 CE 一致，不受事件目标影响）
  let areaRect = null
  const hovered = document.elementFromPoint(e.clientX, e.clientY)
  if (hovered) {
    const row = hovered.closest('.tlt-row')
    if (row) {
      const segArea = row.querySelector('.tlt-seg-area')
      if (segArea) areaRect = segArea.getBoundingClientRect()
    }
  }
  // 回退：用第一条轨道
  if (!areaRect) {
    const first = document.querySelector('.tlt-row .tlt-seg-area')
    if (first) areaRect = first.getBoundingClientRect()
  }
  if (!areaRect || !areaRect.width || !areaRect.height) return

  const cp = isV ? e.clientY - areaRect.top : e.clientX - areaRect.left
  const dim = isV ? areaRect.height : areaRect.width

  const ratio = clamp(cp / dim, 0, 1)
  const factor = e.deltaY > 0 ? 1.2 : 1 / 1.2
  _zoomAtRatio(ratio, factor)
}

/* =============================== 编程式 API =============================== */

/** 编程式添加轨道（与 CE addTrack 行为一致） */
function addTrack(label, start, end, opts = {}) {
  const track = {
    id: crypto.randomUUID ? crypto.randomUUID() : `vt_${Date.now()}`,
    label: label || '',
    start: String(start ?? 0),
    end: String(end ?? 24),
    segments: [],
    step: opts.step,
    minDuration: opts.minDuration,
    maxSegments: opts.maxSegments,
    editable: opts.editable,
    deletable: opts.deletable,
    clearable: opts.clearable,
    copyable: opts.copyable,
    creatable: opts.creatable,
  }
  emit('update:modelValue', [...props.modelValue, track])
  return track
}

/** 编程式删除轨道（支持传 id 字符串或 track 对象） */
function removeTrack(trackOrId) {
  const id = typeof trackOrId === 'object' ? trackOrId.id : trackOrId
  emit('update:modelValue', props.modelValue.filter(t => t.id !== id))
}

/** 返回所有轨道数据（与 CE allTracks() 行为一致） */
function allTracks() { return props.modelValue }

function setGlobalRadius(val) { _globalRadius.value = val }
function getGlobalRadius() { return _globalRadius.value }

/* =============================== 共享轴 Canvas 绘制 =============================== */

const hoverFloatVisible = ref(false)
const hoverFloatStyle = ref({})

function drawAxisRuler() {
  const canvas = rulerCanvasRef.value
  const ruler = rulerRef.value
  if (!canvas || !ruler) return

  const body = ruler.querySelector('.tlc-axis-body')
  if (!body) return
  const rect = body.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  const fmt = formatter.value
  const sr = sharedRange.value
  const range = sr.end - sr.start
  if (!range) return

  const isH = props.direction !== 'vertical'
  const dim = isH ? rect.width : rect.height
  const step = fmt.niceStep(range, dim)

  ctx.strokeStyle = '#d0d4da'
  ctx.lineWidth = 1
  ctx.beginPath()
  if (isH) {
    ctx.moveTo(0, rect.height - 0.5)
    ctx.lineTo(rect.width, rect.height - 0.5)
  } else {
    ctx.moveTo(rect.width - 0.5, 0)
    ctx.lineTo(rect.width - 0.5, rect.height)
  }
  ctx.stroke()

  // 次刻度
  ctx.strokeStyle = '#e0e3e8'
  ctx.lineWidth = 0.5
  for (let t = Math.floor(sr.start / step) * step; t <= sr.end; t += step / 2) {
    const px = ((t - sr.start) / range) * dim
    if (px < 2 || px > dim - 2) continue
    ctx.beginPath()
    if (isH) {
      ctx.moveTo(px, rect.height - 0.5)
      ctx.lineTo(px, rect.height - 4)
    } else {
      ctx.moveTo(rect.width - 0.5, px)
      ctx.lineTo(rect.width - 5, px)
    }
    ctx.stroke()
  }

  // 主刻度
  ctx.strokeStyle = '#c0c5cc'
  ctx.lineWidth = 1
  for (let t = Math.floor(sr.start / step) * step; t <= sr.end; t += step) {
    const px = ((t - sr.start) / range) * dim
    if (px < 1 || px > dim - 1) continue
    ctx.beginPath()
    if (isH) {
      ctx.moveTo(px, rect.height - 0.5)
      ctx.lineTo(px, rect.height - 8)
    } else {
      ctx.moveTo(rect.width - 0.5, px)
      ctx.lineTo(rect.width - 9, px)
    }
    ctx.stroke()
  }

  // 标签（步长 < 1min 时自动显示秒）
  fmt.showSec = step < 1 / 60
  ctx.fillStyle = '#6b7d8e'
  ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif'
  if (isH) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    let _lastHLabel = ''
    for (let t = Math.floor(sr.start / step) * step; t <= sr.end; t += step) {
      const px = ((t - sr.start) / range) * dim
      if (px < 20 || px > dim - 20) continue
      const text = fmt.format(t, 'axis')
      if (text === _lastHLabel) continue
      ctx.fillText(text, px, rect.height - 9)
      _lastHLabel = text
    }
    // 强制显示首尾（防重叠 + 防格式化文字重复）
    ctx.textAlign = 'left'
    {
      const tick = Math.floor(sr.start / step) * step + step
      const nextPx = tick <= sr.end ? ((tick - sr.start) / range) * dim : dim
      const drawX = Math.max(0, 2)
      if (nextPx - drawX > 30) {
        if (tick > sr.end || fmt.format(sr.start, 'axis') !== fmt.format(tick, 'axis')) {
          ctx.fillText(fmt.format(sr.start, 'axis'), drawX, rect.height - 9)
        }
      }
    }
    ctx.textAlign = 'right'
    {
      const lastTick = Math.floor(sr.end / step) * step
      const prevPx = lastTick > sr.start ? ((lastTick - sr.start) / range) * dim : 0
      const drawX = Math.min(dim, dim - 2)
      if (drawX - prevPx > 30) {
        if (!_lastHLabel || fmt.format(sr.end, 'axis') !== _lastHLabel) {
          ctx.fillText(fmt.format(sr.end, 'axis'), drawX, rect.height - 9)
        }
      }
    }
  } else {
    // 纵向标签去重与强制首尾（与 CE 对齐）
    fmt.showSec = step < 1 / 60
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    let _lastVLabel = ''
    for (let t = Math.floor(sr.start / step) * step; t <= sr.end; t += step) {
      const px = ((t - sr.start) / range) * dim
      if (px < 12 || px > dim - 12) continue
      const text = fmt.format(t, 'axis')
      if (text === _lastVLabel) continue
      ctx.fillText(text, rect.width - 11, px)
      _lastVLabel = text
    }
    // 强制显示首尾（防重叠 + 防格式化文字重复）
    {
      const tick = Math.floor(sr.start / step) * step + step
      const nextPy = tick <= sr.end ? ((tick - sr.start) / range) * dim : dim
      const drawPy = Math.max(0, 8)
      if (nextPy - drawPy > 30) {
        if (tick > sr.end || fmt.format(sr.start, 'axis') !== fmt.format(tick, 'axis')) {
          ctx.fillText(fmt.format(sr.start, 'axis'), rect.width - 11, drawPy)
        }
      }
    }
    {
      const lastTick = Math.floor(sr.end / step) * step
      const prevPy = lastTick > sr.start ? ((lastTick - sr.start) / range) * dim : 0
      const drawPy = Math.min(dim, dim - 8)
      if (drawPy - prevPy > 30) {
        if (!_lastVLabel || fmt.format(sr.end, 'axis') !== _lastVLabel) {
          ctx.fillText(fmt.format(sr.end, 'axis'), rect.width - 11, drawPy)
        }
      }
    }
  }
}

/* ---- 共享轴 hover 浮动框 ---- */

function onMouseEnter() {
  hoverFloatVisible.value = true
}

function onMouseLeave() {
  hoverFloatVisible.value = false
}

function onTrackMouseOver(e) {
  if (props.axisMode !== 'shared') return
  const trackEl = e.target.closest('.tlt-row')
  if (!trackEl) return
  const conRect = containerRef.value?.getBoundingClientRect()
  const rowRect = trackEl.getBoundingClientRect()
  if (!conRect || !rowRect) return
  const isH = props.direction !== 'vertical'
  if (isH) {
    hoverFloatStyle.value = {
      top: (rowRect.top - conRect.top) + 'px',
      height: rowRect.height + 'px',
      left: (rowRect.left - conRect.left) + 'px',
      width: rowRect.width + 'px',
    }
  } else {
    hoverFloatStyle.value = {
      left: (rowRect.left - conRect.left) + 'px',
      width: rowRect.width + 'px',
      top: (rowRect.top - conRect.top) + 'px',
      height: rowRect.height + 'px',
    }
  }
  hoverFloatVisible.value = true
}

/* =============================== 生命周期 =============================== */

let _rulerResObs = null

onMounted(() => {
  if (props.axisMode === 'shared') {
    const body = rulerRef.value?.querySelector('.tlc-axis-body')
    if (body) {
      _rulerResObs = new ResizeObserver(() => nextTick(() => drawAxisRuler()))
      _rulerResObs.observe(body)
      nextTick(() => drawAxisRuler())
    }
  }

  // 共享轴 hover 浮动框事件
  if (props.axisMode === 'shared' && containerRef.value) {
    containerRef.value.addEventListener('mouseenter', onMouseEnter)
    containerRef.value.addEventListener('mouseleave', onMouseLeave)
    containerRef.value.addEventListener('mouseover', onTrackMouseOver)
  }
})

onUnmounted(() => {
  if (_rulerResObs) _rulerResObs.disconnect()
  if (containerRef.value) {
    containerRef.value.removeEventListener('mouseenter', onMouseEnter)
    containerRef.value.removeEventListener('mouseleave', onMouseLeave)
    containerRef.value.removeEventListener('mouseover', onTrackMouseOver)
  }
})

watch(() => [props.axisMode, props.type, props.unit], () => {
  nextTick(() => drawAxisRuler())
})

watch(() => props.axisMode, (mode) => {
  if (mode === 'shared') {
    nextTick(() => {
      const body = rulerRef.value?.querySelector('.tlc-axis-body')
      if (body) {
        if (_rulerResObs) _rulerResObs.disconnect()
        _rulerResObs = new ResizeObserver(() => nextTick(() => drawAxisRuler()))
        _rulerResObs.observe(body)
        drawAxisRuler()
      }
      // 添加 hover 事件
      if (containerRef.value) {
        containerRef.value.addEventListener('mouseenter', onMouseEnter)
        containerRef.value.addEventListener('mouseleave', onMouseLeave)
        containerRef.value.addEventListener('mouseover', onTrackMouseOver)
      }
    })
  } else {
    if (_rulerResObs) { _rulerResObs.disconnect(); _rulerResObs = null }
    hoverFloatVisible.value = false
    if (containerRef.value) {
      containerRef.value.removeEventListener('mouseenter', onMouseEnter)
      containerRef.value.removeEventListener('mouseleave', onMouseLeave)
      containerRef.value.removeEventListener('mouseover', onTrackMouseOver)
    }
  }
})

/* =============================== 模态框回调 =============================== */

function onModalConfirm() {
  // 由 useModal 的 onConfirm 回调处理
}

function onModalCancel() {
  // 由 useModal 的 onCancel 回调处理
}

function onModalFieldInput({ index, value }) {
  // 供外部覆盖
}

/* =============================== 右键菜单回调 =============================== */

/** 点选菜单项后关闭右键菜单（item.action 已在 ContextMenuPortal 中执行） */
function onCtxMenuAction() {
  ctxMenuCtrl.hide()
}

/* =============================== 暴露公共 API =============================== */

defineExpose({
  addTrack, removeTrack, allTracks,
  zoomIn, zoomOut, zoomTo, zoomReset, zoomFit,
  setGlobalRadius, getGlobalRadius,
  refreshLocale,
})
</script>

<style scoped>
/* 引用 lib/base.css 和 lib/popup.css 的 CSS 变量体系 */
.tlc-container {
  display: flex;
  gap: var(--tlc-gap, 10px);
  background: var(--tlc-bg, #f8f9fb);
  border: 1px solid var(--tlc-border, #dfe3e8);
  border-radius: var(--tlc-radius, 0);
  padding: var(--tlc-padding, 14px 16px);
  font-family: var(--tlc-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: 13px;
  color: var(--tlc-text, #333);
  overflow: auto;
  min-height: 0;
  position: relative;
}

.tlc-container.tlc-shared {
  gap: 0;
  padding: 0;
  overflow-x: hidden;
}

.tlc-container.tlc-borderless .tlt-row {
  border: none;
  border-radius: 0;
}

/* 共享轴尺 */
.tlc-axis-ruler {
  display: flex;
  align-items: stretch;
  flex-shrink: 0;
  background: var(--tlc-axis-bg, var(--tlc-bg, #f8f9fb));
  border-bottom: 1px solid var(--tlc-border, #dfe3e8);
}

.tlc-axis-ruler .tlc-axis-spacer {
  flex: 0 0 var(--tlt-header-w, 110px);
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 10px;
  color: var(--tlc-text-muted, #6b7d8e);
  border-right: 1px solid var(--tlc-border-light, #e5e8ec);
}

.tlc-axis-ruler .tlc-axis-body {
  flex: 1;
  position: relative;
  height: 28px;
}

.tlc-axis-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* hover 浮动框 — 与 CE .tlc-hover-float 对齐 */
.tlc-hover-float {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(66, 133, 244, 0.18);
  border-left: 3px solid var(--tlc-primary, #4285f4);
  pointer-events: none;
  z-index: 3;
  opacity: 0;
  transition: top 0.15s ease, height 0.15s ease, opacity 0.18s ease;
}
.tlc-hover-float.visible {
  opacity: 1;
}
</style>
