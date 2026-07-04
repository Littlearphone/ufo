<template>
  <div class="panel controls-panel">
    <h2>🔧 控制台</h2>
    <div class="controls-scroll">

      <!-- ════ Tab 0: 基础操作 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 0 }">
        <Tab0Controls :container="containers[0]" />
      </div>

      <!-- ════ Tab 1: 密集数据 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 1 }">
        <Tab1Controls :container="containers[1]" />
      </div>

      <!-- ════ Tab 2: API 调用 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 2 }">
        <Tab2Controls :container="containers[2]" />
      </div>

      <!-- ════ Tab 3: 布局 / 共用轴 ════ -->
      <div class="controls-content" :class="{ active: activeTab === 3 }">
        <Tab3Controls :container="containers[3]" />
      </div>

    </div>
  </div>
</template>

<script setup>
import Tab0Controls from './controls/Tab0Controls.vue'
import Tab1Controls from './controls/Tab1Controls.vue'
import Tab2Controls from './controls/Tab2Controls.vue'
import Tab3Controls from './controls/Tab3Controls.vue'

defineProps({
  activeTab: { type: Number, required: true },
  containers: { type: Array, required: true }
})
</script>
