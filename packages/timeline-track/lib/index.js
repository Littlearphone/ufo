/**
 * TimelineTrack 组件库入口
 * 注册三个自定义元素并导出类引用
 *
 * @module lib
 */

import { TimeContainer } from './TimeContainer.js'
import { TimeTrack } from './TimeTrack.js'
import { TimeSegment } from './TimeSegment.js'

// 注册自定义元素（仅当未被注册时）
if (!customElements.get('time-line-segment'))  customElements.define('time-line-segment',  TimeSegment)
if (!customElements.get('time-line-track'))    customElements.define('time-line-track',    TimeTrack)
if (!customElements.get('time-line-container')) customElements.define('time-line-container', TimeContainer)

export { TimeContainer, TimeTrack, TimeSegment }
