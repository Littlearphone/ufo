<template>
  <Teleport to="body">
    <div
      v-show="state.visible"
      class="tls-global-tip"
      :class="[state.posClass, { show: state.visible }]"
      :style="tipStyle"
    >
      <div v-if="state.label" class="tls-global-tip-label">{{ state.label }}</div>
      <div class="tls-global-tip-time">{{ state.timeText }}</div>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * TooltipPortal.vue — 全局 Tooltip 渲染组件
 *
 * 使用 Teleport 到 body，避免祖先 overflow 裁剪。
 * 通过 useTooltip().state 驱动。
 *
 * @module vue/TooltipPortal
 */
import { computed } from 'vue'

const props = defineProps({
  /** useTooltip() 返回的 state 对象 */
  state: { type: Object, required: true },
})

const tipStyle = computed(() => ({
  top: props.state.top + 'px',
  left: props.state.left + 'px',
  ...props.state.arrowStyle,
}))
</script>
