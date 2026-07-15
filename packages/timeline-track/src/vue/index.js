/**
 * @ufo/timeline-track Vue 3 源码组件入口
 *
 * 导出一组 Vue 3 原生组件，可直接 import 到项目中使用。
 * 这些组件使用 Vue template 渲染（而非 Custom Elements），
 * 完全支持 v-for / v-model / @event 等 Vue 特性。
 *
 * ## 使用方式
 *
 * ```vue
 * import { VTimelineContainer } from '@ufo/timeline-track/vue'
 * // 或复制 src/vue/ 目录到项目中后：
 * import { VTimelineContainer } from '@/components/timeline-vue'
 * ```
 *
 * @module vue/index
 */
export { default as VTimelineContainer } from './VTimelineContainer.vue'
export { default as VTimelineTrack } from './VTimelineTrack.vue'
export { default as VTimelineSegment } from './VTimelineSegment.vue'
