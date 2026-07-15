<template>
  <div class="tab-bar">
    <button
      v-for="(name, i) in tabs"
      :key="i"
      class="tab"
      :class="{ active: activeTab === i }"
      :data-tab="i"
      @click="$emit('select', i)"
    >{{ icons[i] }} {{ name }}</button>
  </div>
</template>

<script setup>
defineProps({
  activeTab: { type: Number, required: true }
})
defineEmits(['select'])

const tabs = ['基础操作', '密集数据', 'API 调用', '模式示例', 'Vue 3 集成', 'CRUD 权限']
const icons = ['📋', '📊', '🔌', '🎯', '⚡', '🔐']
</script>
