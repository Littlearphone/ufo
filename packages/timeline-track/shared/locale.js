/**
 * Locale configuration — user-visible text defaults and resolution.
 * All hardcoded UI strings are centralized here and overridable via
 * `loc-*` attributes on `time-line-container`.
 *
 * Default locale is English. Override individual strings via:
 * <time-line-container loc-unnamed="自定义名称" loc-cancel="取消">
 *
 * @module locale
 */

/** Default English locale */
export const DEFAULT_LOCALE = {
  /** Fallback display name when a track/segment has no label */
  unnamed: 'Untitled',
  /** Title tooltip on segment delete button */
  deleteBtnTitle: 'Delete',
  /** Context menu item — edit properties */
  modifyProps: 'Edit Properties',
  /** Context menu item — delete track */
  deleteTrack: 'Delete Track',
  /** Context menu item — clear all segments */
  clearSegments: 'Clear Segments',
  /** Track context menu header template, {name}=track name */
  trackMenuHeader: '# {name}',
  /** Segment context menu header template, {name}=segment name, {range}=time range */
  segmentMenuHeader: '# {name} - {range}',
  /** Delete track confirmation template, {name}=track name, {range}=time range */
  confirmDeleteTrack: 'Delete track "{name}" ({range})?',
  /** Delete segment confirmation template */
  confirmDeleteSegment: 'Delete segment "{name}" ({range})?',
  /** Clear all segments confirmation template, {name}=track name */
  confirmClearSegments: 'Clear all segments in track "{name}"?',

  /* ---- Copy / Paste ---- */
  /** Context menu — copy segment */
  copySegment: 'Copy Segment',
  /** Context menu — copy track */
  copyTrack: 'Copy Track',
  /** Context menu — copy to other tracks */
  copyToTracks: 'Copy to Other Tracks…',
  /** Context menu — paste segment */
  pasteSegment: 'Paste Segment',
  /** Context menu — paste as new track */
  pasteNewTrack: 'Paste as New Track',
  /** Context menu — paste and overwrite this track */
  pasteOverwrite: 'Overwrite Paste to This Track',
  /** Copy-to-tracks dialog title, {name}=source track name */
  copyToTracksTitle: 'Copy segments from "{name}" to:',
  /** Copy-to-tracks dialog when no targets available */
  copyToTracksEmpty: 'No available target tracks (target must be editable and different from source)',
  /** Select all */
  copySelectAll: 'Select All',
  /** Segment count unit (e.g. "5 segments") */
  segmentUnit: 'segments',

  /* ---- Edit Dialogs ---- */
  segmentEditTitle: 'Edit Segment',
  trackEditTitle: 'Edit Track',
  labelField: 'Label',
  startTime: 'Start Time',
  endTime: 'End Time',
  rangeStart: 'Start',
  rangeEnd: 'End',
  color: 'Color',
  name: 'Name',
  step: 'Step',
  maxSegmentsField: 'Max Segments',
  zeroUnlimited: '0=Unlimited',

  /* ---- Buttons ---- */
  cancel: 'Cancel',
  confirm: 'OK',
  confirmDelete: 'Delete',
  confirmDeleteTitle: 'Confirm Delete',

  /* ---- Time units ---- */
  hourUnit: 'h',
  minuteUnit: 'm',
  secondUnit: 's',

  /* ---- Fallback text for invalid time ---- */
  invalidTime: '--:--',

  /* ---- Step hint ---- */
  stepHint: 'Step {step} (click to adjust)',

  /* ---- Validation messages ---- */
  invalidValue: 'Invalid value',
  startMustBeBeforeEnd: 'Start must be before end',
  /**
   * Overlap hint shown below the field
   * Placeholder: {label}=conflicting segment name
   */
  overlapHint: 'Overlaps with "{label}"',

  /* ---- Axis ruler ---- */
  /**
   * Shared axis mode ruler label template.
   * Placeholders: {start}=shared start, {end}=shared end.
   * Set to empty string to hide the label.
   */
  axisRange: '{start} - {end}',

  /* ---- Error messages ---- */
  /**
   * addSegment segment overlap error template.
   * Placeholders: {start}/{end}=new segment range,
   * {label}=conflicting segment name,
   * {segStart}/{segEnd}=conflicting segment range.
   */
  segmentOverlapError: 'Segment overlap: new [{start}-{end}] conflicts with "{label}" [{segStart}-{segEnd}]',
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
