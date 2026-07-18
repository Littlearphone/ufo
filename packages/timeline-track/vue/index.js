/**
 * @ufo/timeline-track Vue 3 源码组件入口
 *
 * 导出一组 Vue 3 原生组件，可直接 import 到项目中使用。
 * 这些组件使用 Vue template 渲染（而非 Custom Elements），
 * 完全支持 v-for / v-model / @event 等 Vue 特性。
 *
 * 使用方式：
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

/** 门户组件（Teleport 渲染到 body） */
export { default as TooltipPortal } from './TooltipPortal.vue'
export { default as ContextMenuPortal } from './ContextMenuPortal.vue'
export { default as ModalPortal } from './ModalPortal.vue'

/** Composables */
export { useLocale, resolveLocaleFromProps, formatLocale } from './useLocale.js'
export { useTooltip } from './useTooltip.js'
export { useContextMenu } from './useContextMenu.js'
export { useModal } from './useModal.js'
export { useClipboard } from './useClipboard.js'

/** Inject keys */
export * from './inject-keys.js'
