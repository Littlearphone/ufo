<template>
  <Teleport to="body">
    <div
      v-show="state.visible"
      class="tlc-context-menu"
      :style="{ top: adjustedTop + 'px', left: adjustedLeft + 'px' }"
      ref="menuRef"
    >
      <template v-for="(item, i) in state.items" :key="i">
        <div v-if="item.type === 'divider'" class="tlc-context-divider"></div>
        <div v-else-if="item.type === 'header'" class="tlc-context-header">{{ item.label }}</div>
        <div
          v-else
          class="tlc-context-item"
          :class="{ 'tlc-context-item-danger': item.danger }"
          @click="onItemClick(item)"
        >{{ item.label }}</div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ContextMenuPortal.vue — 右键菜单门户组件
 *
 * 使用 Teleport 到 body，由 useContextMenu() 的 state 驱动。
 *
 * @module vue/ContextMenuPortal
 */
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  /** useContextMenu() 返回的 state 对象 */
  state: { type: Object, required: true },
})

const emit = defineEmits(['action'])

const menuRef = ref(null)
const adjustedLeft = ref(0)
const adjustedTop = ref(0)

// 当菜单可见时修正位置以防止溢出视口
watch(() => props.state.visible, (visible) => {
  if (visible) {
    adjustedLeft.value = props.state.left
    adjustedTop.value = props.state.top
    nextTick(() => {
      const el = menuRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      let l = props.state.left
      let t = props.state.top
      if (l + rect.width > vw - 8) l = Math.max(8, vw - rect.width - 8)
      if (t + rect.height > vh - 8) t = Math.max(8, vh - rect.height - 8)
      adjustedLeft.value = l
      adjustedTop.value = t

      // iOS 弹框效果：transform-origin 设在源元素中心（不钳制），纯 scale 缩放
      const ox = props.state.originX - l
      const oy = props.state.originY - t
      el.style.transformOrigin = `${ox}px ${oy}px`

      // 添加 .show 触发进场动画
      el.classList.add('show')
    })
  }
})

function onItemClick(item) {
  // 先通知父组件关闭菜单（避免遮挡后续弹窗），再执行操作
  emit('action', item)
  if (item.action) item.action()
}
</script>
