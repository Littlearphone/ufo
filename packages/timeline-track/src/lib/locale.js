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
  /** 轨道菜单标题模板，{name}=轨道名 */
  trackMenuHeader: '📋 {name}',
  /** 段菜单标题模板，{name}=段名，{range}=时间范围 */
  segmentMenuHeader: '🔖 {name}  {range}',
  /** 删除轨道确认模板，{name}=轨道名，{range}=时间范围 */
  confirmDeleteTrack: '确定要删除轨道「{name}」({range}) 吗？',
  /** 删除段确认模板 */
  confirmDeleteSegment: '确定要删除时间段「{name}」({range}) 吗？',
  /** 清空轨道所有时间段确认模板，{name}=轨道名 */
  confirmClearSegments: '确定要清空轨道「{name}」的所有时间段吗？',

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

  /* ---- 时间单位 --- */
  hourUnit: '时',
  minuteUnit: '分',
  secondUnit: '秒',

  /* ---- 步进提示 ---- */
  stepHint: '步进 {step}（点击增减）',

  /* ---- 校验消息 ---- */
  invalidValue: '无效的值',
  startMustBeBeforeEnd: '开始必须早于结束',
  /**
   * 重叠提示（显示在字段下方）
   * 占位符：{label}=冲突段名称
   */
  overlapHint: '与「{label}」重叠',

  /* ---- 错误消息 ---- */
  /**
   * addSegment 时间段重叠错误模板
   * 占位符：{start}{end}=新段时间，{label}=冲突段名称，{segStart}{segEnd}=冲突段时间
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
