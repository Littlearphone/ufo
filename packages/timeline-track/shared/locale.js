/**
 * Locale configuration — user-visible text defaults and resolution.
 * All hardcoded UI strings are centralized here and overridable via
 * `loc-*` attributes on `time-line-container`.
 *
 * Usage: <time-line-container loc-unnamed="Untitled" loc-cancel="Cancel">
 * @module locale
 */

/** Default Chinese locale — 与 CLAUDE.md 文档保持一致 */
export const DEFAULT_LOCALE = {
  /** Fallback display name when a track/segment has no label */
  unnamed: '未命名',
  /** Title tooltip on segment delete button */
  deleteBtnTitle: '删除',
  /** Context menu item — edit properties */
  modifyProps: '修改属性',
  /** Context menu item — delete track */
  deleteTrack: '删除轨道',
  /** Context menu item — clear all segments */
  clearSegments: '清空时间段',
  /** Track context menu header template, {name}=track name */
  trackMenuHeader: '📋 {name}',
  /** Segment context menu header template, {name}=segment name, {range}=time range */
  segmentMenuHeader: '🔖 {name}  {range}',
  /** Delete track confirmation template, {name}=track name, {range}=time range */
  confirmDeleteTrack: '确定要删除轨道「{name}」({range}) 吗？',
  /** Delete segment confirmation template */
  confirmDeleteSegment: '确定要删除时间段「{name}」({range}) 吗？',
  /** Clear all segments confirmation template, {name}=track name */
  confirmClearSegments: '确定要清空轨道「{name}」的所有时间段吗？',

  /* ---- Copy / Paste ---- */
  /** Context menu — copy segment */
  copySegment: '复制段',
  /** Context menu — copy track */
  copyTrack: '复制轨道',
  /** Context menu — copy to other tracks */
  copyToTracks: '复制到其他轨道…',
  /** Context menu — paste segment */
  pasteSegment: '粘贴段',
  /** Context menu — paste as new track */
  pasteNewTrack: '粘贴为新轨道',
  /** Context menu — paste and overwrite this track */
  pasteOverwrite: '覆盖粘贴到本轨道',
  /** Copy-to-tracks dialog title, {name}=source track name */
  copyToTracksTitle: '将「{name}」的段复制到：',
  /** Copy-to-tracks dialog when no targets available */
  copyToTracksEmpty: '没有可用的目标轨道（目标必须可编辑且与来源不同）',
  /** Select all */
  copySelectAll: '全选',
  /** Segment count unit (e.g. "5 segments") */
  segmentUnit: '个时间段',

  /* ---- Edit Dialogs ---- */
  segmentEditTitle: '修改时间段属性',
  trackEditTitle: '修改轨道属性',
  labelField: '标签',
  startTime: '开始时间',
  endTime: '结束时间',
  rangeStart: '起始',
  rangeEnd: '结束',
  color: '颜色',
  name: '名称',
  step: '步长',
  maxSegmentsField: '最大段数',
  zeroUnlimited: '0=无限制',

  /* ---- Buttons ---- */
  cancel: '取消',
  confirm: '确定',
  confirmDelete: '确定删除',
  confirmDeleteTitle: '确认删除',

  /* ---- Time units --- */
  hourUnit: '时',
  minuteUnit: '分',
  secondUnit: '秒',

  /* ---- Fallback text for invalid time ---- */
  invalidTime: '--:--',

  /* ---- Step hint ---- */
  stepHint: '步长 {step}（点击调整）',

  /* ---- Validation messages ---- */
  invalidValue: '无效值',
  startMustBeBeforeEnd: '起始必须早于结束',
  /**
   * Overlap hint shown below the field
   * Placeholder: {label}=conflicting segment name
   */
  overlapHint: '与「{label}」重叠',

  /* ---- Axis ruler ---- */
  /**
   * Shared axis mode ruler label template.
   * Placeholders: {start}=shared start, {end}=shared end.
   * Set to empty string to hide the label.
   */
  axisRange: '{start} – {end}',

  /* ---- Error messages ---- */
  /**
   * addSegment segment overlap error template.
   * Placeholders: {start}/{end}=new segment range,
   * {label}=conflicting segment name,
   * {segStart}/{segEnd}=conflicting segment range.
   */
  segmentOverlapError: '时间段重叠：新段 [{start}–{end}] 与已有段「{label}」[{segStart}–{segEnd}] 冲突',
}

/**
 * 格式化 locale 模板字符串，替换 {key} 占位符
 * @param {string} tpl
 * @param {object} params
 * @returns {string}
 */
export function formatLocale(tpl, params) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => params[k] != null ? params[k] : `{${k}}`)
}

/** locale key → 属性名映射 */
const KEY_TO_ATTR = {}
/** 属性名 → locale key 映射 */
const ATTR_TO_KEY = {}

for (const key of Object.keys(DEFAULT_LOCALE)) {
  // 驼峰 → kebab-case：confirmDeleteTrack → loc-confirm-delete-track
  const attr = 'loc-' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
  KEY_TO_ATTR[key] = attr
  ATTR_TO_KEY[attr] = key
}

/** 所有 locale 属性名列表（供 observedAttributes 使用） */
export const LOCALE_ATTRS = Object.freeze(Object.values(KEY_TO_ATTR))

/**
 * 从 DOM 元素向上查找 time-line-container 并解析 locale
 * @param {Element|null} el - 任意元素（可为 null）
 * @param {object} [extra] - 额外 locale 覆盖
 * @returns {object} 合并后的 locale 对象
 */
export function resolveLocale(el, extra) {
  const c = el && el.closest ? el.closest('time-line-container') : null
  const locale = { ...DEFAULT_LOCALE }
  if (c) {
    for (const key of Object.keys(DEFAULT_LOCALE)) {
      const val = c.getAttribute(KEY_TO_ATTR[key])
      if (val != null) locale[key] = val
    }
  }
  if (extra) Object.assign(locale, extra)
  return locale
}
