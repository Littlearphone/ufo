/**
 * 本地化配置 — 用户可见文本的默认值与解析
 * 所有硬编码 UI 文字集中管理，支持通过 time-line-container 的 loc-* 属性覆盖
 * 用法：<time-line-container loc-unnamed="未命名轨道" loc-cancel="取消">
 * @module locale
 */

/** 默认中文 locale */
export const DEFAULT_LOCALE = {
  /** 轨道/段无标签时的回退显示名 */
  unnamed: '未命名',
  /** 无效时间的回退显示 */
  invalidTime: '--:--',
  /** 段删除按钮的 title tooltip */
  deleteBtnTitle: '删除',
  /** 右键菜单项 */
  modifyProps: '修改属性',
  /** 删除轨道菜单项 */
  deleteTrack: '删除轨道',
  /** 清空时间段菜单项 */
  clearSegments: '清空时间段',
  /** 删除轨道确认模板，{name}=轨道名，{range}=时间范围 */
  confirmDeleteTrack: '确定要删除轨道「{name}」({range}) 吗？',
  /** 删除段确认模板 */
  confirmDeleteSegment: '确定要删除时间段「{name}」({range}) 吗？',

  /* ---- 编辑弹窗 ---- */
  segmentEditTitle: '修改时间段属性',
  trackEditTitle: '修改轨道属性',
  labelField: '标签',
  startTime: '开始时间',
  endTime: '结束时间',
  color: '颜色',
  name: '名称',
  step: '步长',
  maxSegmentsField: '最大段数',
  zeroUnlimited: '0=无限制',

  /* ---- 按钮 ---- */
  cancel: '取消',
  confirm: '确定',
  confirmDelete: '确定删除',
  confirmDeleteTitle: '确认删除',
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
