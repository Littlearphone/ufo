/**
 * ValueFormatter — 可插拔的值格式化/解析/刻度系统
 *
 * 将「值如何解析、显示、分档」从组件业务代码中解耦，
 * 支持 type="time"（默认）和 type="number" 两种模式。
 *
 * @module formatter
 */

/* ===================================================================
 *  内部工具
 * =================================================================== */

/** 将小时数中的分钟/秒部分格式化为两位数 */
function _p(n) { return String(Math.floor(n)).padStart(2, '0') }

/**
 * 将小时数 → HH:MM[:SS] 字符串（纯计算，不依赖 formatter 实例）
 * @param {number} th - 小时数（如 14.5 → "14:30"）
 * @param {boolean} [showSec=false] - 是否显示秒
 * @param {string} [invalidStr='--:--'] - 无效值回退
 * @returns {string}
 */
function _fmtHours(th, showSec, invalidStr) {
  if (th == null || isNaN(th)) return invalidStr || '--:--'
  const neg = th < 0
  if (neg) th = -th
  const h = Math.floor(th)
  const totalMin = Math.round((th - h) * 60)
  if (showSec) {
    // 秒级精度模式：用 total seconds 计算
    const totalSec = Math.round(th * 3600)
    const hh = Math.floor(totalSec / 3600)
    const mm = Math.floor((totalSec % 3600) / 60)
    const ss = totalSec % 60
    return `${neg ? '-' : ''}${_p(hh)}:${_p(mm)}:${_p(ss)}`
  }
  const m = totalMin
  if (m === 60) return `${neg ? '-' : ''}${_p(h + 1)}:00`
  return `${neg ? '-' : ''}${_p(h)}:${_p(m)}`
}

/**
 * 解析自然单位字符串
 * "2h" / "30min" / "15sec" / "1.5h" → { val, unit }
 * @param {string} s
 * @returns {{ val: number, unit: string }|null}
 */
function _parseUnit(s) {
  const m = s.match(/^([\d.]+)\s*(h|hour|hours|min|mins|minute|minutes|sec|secs|second|seconds)$/i)
  if (!m) return null
  const val = parseFloat(m[1])
  if (isNaN(val)) return null
  const raw = m[2].toLowerCase()
  let unit = ''
  if (raw === 'h' || raw === 'hour' || raw === 'hours') unit = 'hour'
  else if (raw.startsWith('mi')) unit = 'minute'
  else if (raw.startsWith('se')) unit = 'second'
  return { val, unit }
}

/** 单位 → 小时的转换因子 */
const TO_HOUR = { hour: 1, minute: 1 / 60, second: 1 / 3600 }

/** 基本小时刻度候选（所有 TimeFormatter unit 由此派生） */
const HOUR_TICKS = [0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 24, 48]

/**
 * 根据目标单位从小时刻度派生对应的刻度数组
 * @param {'hour'|'minute'|'second'} unit
 * @returns {number[]}
 */
function _ticksForUnit(unit) {
  if (unit === 'hour') return HOUR_TICKS
  const f = unit === 'minute' ? 60 : 3600
  return HOUR_TICKS.map(t => +(t * f).toFixed(6))
}

/** NumberFormatter 通用等比刻度候选 */
const NUM_TICKS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1e3, 5e3, 1e4, 5e4, 1e5, 5e5, 1e6]

/* ===================================================================
 *  ValueFormatter 抽象基类
 * =================================================================== */

/**
 * 所有 Formatter 的抽象接口
 * 子类必须实现：_doParse, _doFormat, _doNiceStep, _doInputType, _doInputValue
 */
export class ValueFormatter {
  /**
   * @param {'hour'|'minute'|'second'|string} unit - 归一化/显示单位
   */
  constructor(unit = '') {
    this._unit = unit
  }

  /** @returns {string} 当前单位 */
  get unit() { return this._unit }

  /**
   * 解析属性字符串 → 归一化数值
   * @param {string|number|null} str
   * @param {number} [fallback=0]
   * @returns {number}
   */
  parse(str, fallback = 0) {
    if (str == null || str === '') return fallback
    if (typeof str === 'number') return str
    return this._doParse(String(str).trim(), fallback)
  }

  /**
   * 格式化数值 → 显示字符串
   * @param {number} val - 归一化数值
   * @param {'axis'|'segment'|'tooltip'|'editor'} [context='axis'] - 显示上下文
   * @returns {string}
   */
  format(val, context = 'axis') {
    if (val == null || isNaN(val)) return '--:--'
    return this._doFormat(val, context)
  }

  /**
   * 格式化范围 → 显示字符串
   * @param {number} start
   * @param {number} end
   * @param {'axis'|'segment'|'tooltip'|'editor'} [context='axis']
   * @returns {string}
   */
  formatRange(start, end, context = 'axis') {
    return this.format(start, context) + ' – ' + this.format(end, context)
  }

  /**
   * 计算合适的刻度步长
   * @param {number} range - 值范围（end - start）
   * @param {number} pxSize - 可用像素尺寸
   * @param {number} [targetPx=72] - 目标像素间隔
   * @returns {number} 步长
   */
  niceStep(range, pxSize, targetPx = 72) {
    if (!range || !pxSize) return 1
    const raw = range / (pxSize / targetPx)
    return this._doNiceStep(raw)
  }

  /**
   * 编辑框输入属性
   * @param {number} val - 当前值
   * @returns {{ type: string, step?: string, value: string, [key: string]: string }}
   */
  inputAttrs(val) {
    return {
      type: this._doInputType(val),
      value: this._doInputValue(val),
      ...(this._doInputStep ? { step: this._doInputStep(val) } : {})
    }
  }

  /* ---- 子类实现 ---- */
  _doParse(str, fallback) { throw new Error('must implement _doParse') }
  _doFormat(val, context) { throw new Error('must implement _doFormat') }
  _doNiceStep(raw)        { throw new Error('must implement _doNiceStep') }
  _doInputType(val)       { throw new Error('must implement _doInputType') }
  _doInputValue(val)      { throw new Error('must implement _doInputValue') }
  _doInputStep(val)       { return undefined }
}

/* ===================================================================
 *  TimeFormatter — type="time"
 * =================================================================== */

/**
 * 时间模式：HH:MM / HH:MM:SS 显示，时间刻度，自然时间解析
 * 默认 unit="hour"，完全等价现有 fmtTime+parseFloat+_niceStep 行为
 */
export class TimeFormatter extends ValueFormatter {
  /**
   * @param {'hour'|'minute'|'second'} [unit='hour'] - 归一化单位
   */
  constructor(unit = 'hour') {
    super(unit)
    this._ticks = _ticksForUnit(unit)
  }

  /** 转换为小时（所有内部计算以小时为基准 */
  _toHours(val) {
    return val * (TO_HOUR[this._unit] || 1)
  }

  /** 从小时转换为当前单位 */
  _fromHours(hours) {
    return hours / (TO_HOUR[this._unit] || 1)
  }

  _doParse(str, fallback) {
    // 1. HH:MM / HH:MM:SS（允许负号）
    const timeMatch = str.match(/^(-?)(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (timeMatch) {
      const [_, neg, h, m, sec] = timeMatch
      const hours = parseInt(h, 10) + parseInt(m, 10) / 60 + (sec ? parseInt(sec, 10) / 3600 : 0)
      return this._fromHours(neg ? -hours : hours)
    }

    // 2. 自然单位（2h, 30min, 15sec）
    const unitResult = _parseUnit(str)
    if (unitResult) {
      return this._fromHours(unitResult.val * TO_HOUR[unitResult.unit])
    }

    // 3. 纯数字回退
    const n = parseFloat(str)
    return isNaN(n) ? fallback : n
  }

  _doFormat(val, context) {
    // tooltip / editor 含秒，axis / segment 仅 HH:MM
    return _fmtHours(this._toHours(val), context === 'tooltip' || context === 'editor')
  }

  _doNiceStep(raw) {
    for (const t of this._ticks) if (raw <= t) return t
    // 超出最大候选：翻倍扩展
    let p = this._ticks[this._ticks.length - 1]
    while (p < raw) p *= 2
    return p
  }

  _doInputType(val) {
    // second 精度用 text（原生 time 在部分浏览器不支持秒）
    return this._unit === 'second' ? 'text' : 'time'
  }

  _doInputValue(val) {
    // time 输入期望 HH:MM 格式
    return _fmtHours(this._toHours(val), this._unit === 'second')
  }

  _doInputStep(val) {
    // type="time" 的 step 以秒为单位
    if (this._unit === 'second') return undefined
    // 0.1h = 360s（匹配原 step="0.1" 的增量粒度）
    return '360'
  }
}

/* ===================================================================
 *  NumberFormatter — type="number"
 * =================================================================== */

/**
 * 数值模式：纯数字显示，通用等比刻度，可选单位后缀
 * 支持 "100"、"50px"、"1.5k" 等格式
 */
export class NumberFormatter extends ValueFormatter {
  /**
   * @param {string} [unit=''] - 显示单位后缀（如 "px"、"%"、"min"）
   */
  constructor(unit = '') {
    super(unit)
  }

  _doParse(str, fallback) {
    // 1. 自然单位（同样支持，但在这个模式下以当前 unit 为基准转换）
    const unitResult = _parseUnit(str)
    if (unitResult) return unitResult.val // number mode 不转换

    // 2. 提取数字前缀（去除单位后缀）
    const numMatch = str.match(/^(-?[\d.]+)\s*.*$/)
    if (numMatch) {
      const n = parseFloat(numMatch[1])
      return isNaN(n) ? fallback : n
    }

    // 3. parseFloat 回退
    const n = parseFloat(str)
    return isNaN(n) ? fallback : n
  }

  _doFormat(val, context) {
    // 智能小数：去除尾部多余的零
    const abs = Math.abs(val)
    let decimals = 0
    if (abs < 1) decimals = 3
    else if (abs < 10) decimals = 2
    else if (abs < 100) decimals = 1

    const formatted = parseFloat(val.toFixed(decimals)).toString()
    return this._unit ? `${formatted} ${this._unit}` : formatted
  }

  _doNiceStep(raw) {
    for (const t of NUM_TICKS) if (raw <= t) return t
    // 等比扩展
    let p = NUM_TICKS[NUM_TICKS.length - 1]
    while (p < raw) p *= 10
    return p
  }

  _doInputType(val) { return 'number' }

  _doInputValue(val) { return String(val) }

  _doInputStep(val) {
    // 根据值范围自适应步长
    const abs = Math.abs(val)
    if (abs < 1) return '0.1'
    if (abs < 10) return '0.5'
    if (abs < 100) return '1'
    return '10'
  }
}

/* ===================================================================
 *  工厂函数
 * =================================================================== */

/**
 * 根据 type 和 unit 创建对应的 Formatter 实例
 * @param {'time'|'number'} type
 * @param {string} [unit]
 * @returns {ValueFormatter}
 */
export function createFormatter(type = 'time', unit = 'hour') {
  if (type === 'number') {
    return new NumberFormatter(unit)
  }
  // type === 'time'（默认）
  const validUnits = ['hour', 'minute', 'second']
  return new TimeFormatter(validUnits.includes(unit) ? unit : 'hour')
}
