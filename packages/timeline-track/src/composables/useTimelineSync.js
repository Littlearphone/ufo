/**
 * Vue 3 响应式同步 composable — 在 Custom Elements 与 Vue 响应式数据之间建立双向桥接
 *
 * ## 核心架构
 *
 * ```
 * Vue Component              Custom Elements
 * ─────────────              ───────────────
 * tracks (ref)  ──API──▶    container.addTrack()
 *                           track.addSegment()
 *               ◀─events──  segment-created
 *                           segment-changed
 *                           segment-deleted
 *                           track-deleted
 *               ◀─observer─ 属性变更（右键编辑等不含事件的场景）
 * ```
 *
 * ## 为什么不用 v-for？
 *
 * Custom Elements 在内部管理自身的子 DOM 结构（如 `TimeTrack._render()` 将
 * `<time-line-segment>` 移到 `.tlt-seg-area`），Vue 的 `v-for` 使用 `:key`
 * 驱动 DOM 重建，两者冲突。因此本 composable 采用**纯 API 驱动**模式：
 * 所有轨道/段通过 CE 的编程接口创建，不做模板渲染。
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 *   `<time-line-container>` 的 template ref
 * @param {import('vue').Ref<Array>} tracksRef
 *   外部持有的 tracks 响应式数组。**必须包含 `id` 字段**用于跨更新周期追踪身份。
 *   若初始为空，可在 `onMounted` 中 push 数据。
 * @param {Object} [options]
 * @param {boolean} [options.autoSync=true] 初始 mount 后自动从 tracksRef 同步到 CE
 * @param {Object} [options.events] 生命周期回调
 * @param {(seg:SegmentItem, trackIdx:number) => void} [options.events.onSegmentCreated]
 * @param {(seg:SegmentItem, trackIdx:number) => void} [options.events.onSegmentChanged]
 * @param {(seg:SegmentItem, trackIdx:number) => void} [options.events.onSegmentDeleted]
 * @param {(track:TrackItem, trackIdx:number) => void} [options.events.onTrackDeleted]
 *
 * @typedef {Object} TrackItem
 * @property {string|number} id
 * @property {string} label
 * @property {number|string} start
 * @property {number|string} end
 * @property {number} [step]
 * @property {SegmentItem[]} segments
 *
 * @typedef {Object} SegmentItem
 * @property {string|number} id
 * @property {number|string} start
 * @property {number|string} end
 * @property {string} [label]
 * @property {string} [color]
 * @property {number|string} [radius]
 *
 * @module useTimelineSync
 */
import { nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'

/**
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 * @param {import('vue').Ref<Array>} tracksRef
 * @param {Object} [options]
 * @returns {{
 *   syncing: import('vue').Ref<boolean>,
 *   sync: () => void,
 * }}
 */
export function useTimelineSync(containerRef, tracksRef, options = {}) {
  const { autoSync = true, events = {} } = options

  // ── 内部状态 — 用于防止同步循环 ──
  const syncing = ref(false) // 正在从 Vue 向 CE 推送
  let _initialized = false
  let _container = null
  /** 非响应式标志：防止 deep watch 在 sync() 内部触发反向同步 */
  let _pushingVueToCE = false

  /** 自增 ID 生成器（tracksRef 中的条目如无 id 时会自动分配） */
  let _nextId = 1
  function _uid() { return `_vue_${_nextId++}` }

  /**
   * 确保数组中每个条目都有 id
   * @param {Array} arr
   * @param {string} idField
   */
  function _ensureIds(arr, idField = 'id') {
    arr.forEach(item => {
      if (item[idField] == null) item[idField] = _uid()
    })
  }

  // ── 生成 Container 元素的 data-vue-sync 属性 ──
  // 用于在 MutationObserver 中识别由 composable 自己产生的属性变更
  const _SYNC_ATTR = 'data-vue-syncing'

  // ── 核心同步：将 tracksRef 状态全量推送到 CE ──
  /**
   * 全量同步 Vue 数据 → CE DOM
   * 对每个轨道/段，执行 reconciliation：
   *   - 已存在（通过 data-vue-id 匹配）→ 更新属性
   *   - 不存在 → 调用 CE API 创建
   *   - 在 CE 中存在但不在 Vue 中 → 从 CE 移除
   */
  function sync() {
    const c = containerRef.value
    if (!c) return

    _pushingVueToCE = true
    syncing.value = true
    c.setAttribute(_SYNC_ATTR, 'true')

    const vueData = toRaw(tracksRef.value)
    _ensureIds(vueData)

    // 把 Vue 数据中 track 的 id → data-vue-id 映射到 CE 子元素上
    const existingTrackEls = c.querySelectorAll(':scope > time-line-track')
    const vueTrackIds = new Set()

    vueData.forEach((td, tIdx) => {
      vueTrackIds.add(td.id)
      // 查找已有轨道
      let trackEl = c.querySelector(`:scope > time-line-track[data-vue-id="${td.id}"]`)
      if (!trackEl) {
        // 新建轨道
        trackEl = c.addTrack(td.label, td.start, td.end, td)
        trackEl.setAttribute('data-vue-id', String(td.id))
      } else {
        // 更新已有轨道属性
        if (String(trackEl.getAttribute('label')) !== String(td.label)) {
          trackEl.setAttribute('label', String(td.label))
        }
        if (String(trackEl.getAttribute('start')) !== String(td.start)) {
          trackEl.setAttribute('start', String(td.start))
        }
        if (String(trackEl.getAttribute('end')) !== String(td.end)) {
          trackEl.setAttribute('end', String(td.end))
        }
      }

      // ── 同步 segments ──
      const segs = td.segments || []
      _ensureIds(segs)
      // 先收集 CE 中已有（含用户拖拽创建但尚在 Vue 中无记录的段）
      const domSegs = trackEl.sortedSegs ? trackEl.sortedSegs() : []
      const vueSegIds = new Set()

      segs.forEach(sd => {
        vueSegIds.add(sd.id)
        let segEl = trackEl.querySelector(`:scope time-line-segment[data-vue-id="${sd.id}"]`)
        // 也可能在 .tlt-seg-area 下
        if (!segEl) {
          const area = trackEl.querySelector('.tlt-seg-area')
          if (area) segEl = area.querySelector(`[data-vue-id="${sd.id}"]`)
        }
        if (!segEl) {
          // 从 DOM 中找"未标记"的段（可能是用户拖拽创建的但尚在 Vue 中无记录）
          // 不过此时通过 segment-created 事件应已完成同步，这里作为兜底
          try {
            segEl = trackEl.addSegment(sd.start, sd.end, {
              label: sd.label,
              color: sd.color,
            })
            if (segEl) segEl.setAttribute('data-vue-id', String(sd.id))
          } catch (_) { /* 重叠等创建失败静默 */ }
        } else {
          // 更新属性
          if (segEl.start !== sd.start) segEl.start = sd.start
          if (segEl.end !== sd.end) segEl.end = sd.end
          if (sd.label != null && segEl.label !== sd.label) segEl.label = sd.label
          if (sd.color != null && segEl.color !== sd.color) segEl.color = sd.color
        }
      })

      // 移除 CE 中有但 Vue 中无的段（data-vue-id 不匹配的）
      for (const domSeg of domSegs) {
        const vid = domSeg.getAttribute('data-vue-id')
        if (vid && !vueSegIds.has(vid)) {
          domSeg.remove()
        }
      }
    })

    // 移除 CE 中有但 Vue 中无的轨道
    for (const el of existingTrackEls) {
      const vid = el.getAttribute('data-vue-id')
      if (vid && !vueTrackIds.has(vid)) {
        el.remove()
      }
    }

    // 移除标记
    c.removeAttribute(_SYNC_ATTR)
    syncing.value = false
    _pushingVueToCE = false
  }

  // ── 事件监听（CE → Vue） ──

  /**
   * 根据 CE 元素查找它在 Vue tracks 中的位置
   */
  function _findSegmentInTracks(segEl) {
    const vid = segEl.getAttribute('data-vue-id')
    const raw = toRaw(tracksRef.value)
    for (let ti = 0; ti < raw.length; ti++) {
      const t = raw[ti]
      const segs = t.segments || []
      for (let si = 0; si < segs.length; si++) {
        if (vid != null && String(segs[si].id) === vid) return { trackIdx: ti, segIdx: si, trackData: t, segData: segs[si] }
      }
    }
    return null
  }

  function _findTrackByElement(trackEl) {
    const vid = trackEl.getAttribute('data-vue-id')
    const raw = toRaw(tracksRef.value)
    for (let ti = 0; ti < raw.length; ti++) {
      if (vid != null && String(raw[ti].id) === vid) return { trackIdx: ti, trackData: raw[ti] }
    }
    return null
  }

  function _findTrackIndexByChild(segEl) {
    const trackEl = segEl.closest('time-line-track')
    if (!trackEl) return -1
    const vid = trackEl.getAttribute('data-vue-id')
    const raw = toRaw(tracksRef.value)
    for (let ti = 0; ti < raw.length; ti++) {
      if (vid != null && String(raw[ti].id) === vid) return ti
    }
    return -1
  }

  /** 从 CE 段元素读取数据 */
  function _readSegmentData(segEl) {
    return {
      id: segEl.getAttribute('data-vue-id') || _uid(),
      start: segEl.start,
      end: segEl.end,
      label: segEl.label,
      color: segEl.color,
    }
  }

  /** 处理 segment-created 事件 */
  function _onSegmentCreated(e) {
    if (syncing.value) return // 来自 sync() 的 push，忽略
    const segEl = e.detail && e.detail.segment
    if (!segEl || segEl.tagName !== 'TIME-LINE-SEGMENT') return

    // 如果已经有 data-vue-id，说明已存在 Vue 数据中（通过 composeable API 或 sync()），跳过
    if (segEl.hasAttribute('data-vue-id')) return

    const trackIdx = _findTrackIndexByChild(segEl)
    if (trackIdx < 0) return

    const segData = _readSegmentData(segEl)
    segEl.setAttribute('data-vue-id', segData.id)

    // 追加到 Vue 数据
    tracksRef.value[trackIdx].segments.push(segData)
    if (events.onSegmentCreated) events.onSegmentCreated(segData, trackIdx)
  }

  /** 处理 segment-changed 事件 */
  function _onSegmentChanged(e) {
    if (syncing.value) return
    const detail = e.detail
    if (!detail || !detail.segment) return
    const segEl = detail.segment

    const found = _findSegmentInTracks(segEl)
    if (found) {
      const { segIdx } = found
      const segData = _readSegmentData(segEl)
      tracksRef.value[found.trackIdx].segments[segIdx] = segData
      if (events.onSegmentChanged) events.onSegmentChanged(segData, found.trackIdx)
      return
    }

    // 跨轨道迁移后 data-vue-id 可能变化
    // 此时尝试按新位置查找
    const trackIdx = _findTrackIndexByChild(segEl)
    if (trackIdx >= 0) {
      const segData = _readSegmentData(segEl)
      segEl.setAttribute('data-vue-id', segData.id)
      tracksRef.value[trackIdx].segments.push(segData)
      if (events.onSegmentChanged) events.onSegmentChanged(segData, trackIdx)
    }
  }

  /** 处理 segment-deleted 事件 */
  function _onSegmentDeleted(e) {
    if (syncing.value) return
    const segEl = e.detail && e.detail.segment
    if (!segEl) return

    const found = _findSegmentInTracks(segEl)
    if (found) {
      const { trackIdx, segIdx, segData } = found
      tracksRef.value[trackIdx].segments.splice(segIdx, 1)
      if (events.onSegmentDeleted) events.onSegmentDeleted(segData, trackIdx)
    }
  }

  /** 处理 track-deleted 事件 */
  function _onTrackDeleted(e) {
    if (syncing.value) return
    const trackEl = e.detail && e.detail.track
    if (!trackEl) return

    const found = _findTrackByElement(trackEl)
    if (found) {
      const { trackIdx, trackData } = found
      tracksRef.value.splice(trackIdx, 1)
      if (events.onTrackDeleted) events.onTrackDeleted(trackData, trackIdx)
    }
  }

  // ── MutationObserver: 捕获右键编辑弹窗等不触发 CustomEvent 的属性变更 ──
  let _mutObs = null

  function _setupMutationObserver() {
    const c = containerRef.value
    if (!c) return

    _mutObs = new MutationObserver(muts => {
      if (syncing.value) return

      for (const m of muts) {
        if (m.type !== 'attributes') continue
        const el = m.target
        if (el.tagName !== 'TIME-LINE-SEGMENT') continue

        // 如果本 compositeable 自己触发了属性变更（通过 sync()），跳过
        const attr = m.attributeName
        if (attr !== 'start' && attr !== 'end' && attr !== 'label' && attr !== 'color') continue

        // 已在事件处理中更新过的，data-vue-id 匹配时跳过
        // MutationObserver 可能晚于事件触发，此处主要捕捉右键编辑弹窗保存场景
        const found = _findSegmentInTracks(el)
        if (found) {
          const { trackIdx, segIdx } = found
          const segData = _readSegmentData(el)
          tracksRef.value[trackIdx].segments[segIdx] = segData
          if (events.onSegmentChanged) events.onSegmentChanged(segData, trackIdx)
        }
      }
    })

    _mutObs.observe(c, {
      subtree: true,
      attributes: true,
      attributeFilter: ['start', 'end', 'label', 'color'],
    })
  }

  // ── Deep watch：外部修改 tracksRef 时自动同步到 CE ──
  watch(tracksRef, () => {
    // _pushingVueToCE 阻止 sync() 内部 ID 分配导致的循环
    if (!_initialized || _pushingVueToCE) return
    sync()
  }, { deep: true, flush: 'post' })

  // ── 生命周期钩子 ──
  onMounted(() => {
    if (_initialized) return
    _initialized = true
    _container = containerRef.value

    if (!_container) return

    // 事件绑定（所有 CE 事件都 bubbles 到 container）
    _container.addEventListener('segment-created', _onSegmentCreated)
    _container.addEventListener('segment-changed', _onSegmentChanged)
    _container.addEventListener('segment-deleted', _onSegmentDeleted)
    _container.addEventListener('track-deleted', _onTrackDeleted)

    // MutationObserver 兜底
    _setupMutationObserver()

    // 初始同步
    if (autoSync) {
      // CE 可能尚未完成首次 _render()，需等 nextTick
      nextTick(() => sync())
    }
  })

  onUnmounted(() => {
    _cleanup()
  })

  function _cleanup() {
    if (!_initialized) return
    _initialized = false

    if (_container) {
      _container.removeEventListener('segment-created', _onSegmentCreated)
      _container.removeEventListener('segment-changed', _onSegmentChanged)
      _container.removeEventListener('segment-deleted', _onSegmentDeleted)
      _container.removeEventListener('track-deleted', _onTrackDeleted)
      _container = null
    }
    if (_mutObs) {
      _mutObs.disconnect()
      _mutObs = null
    }
  }

  return {
    /** 是否正在从 Vue 向 CE 推送数据 */
    syncing,
    /**
     * 手动触发全量同步（将 tracksRef 当前状态推送到 CE）
     * 在直接修改了 tracksRef 的元素后（如 API 返回替换整个数组）调用
     */
    sync,
  }
}
