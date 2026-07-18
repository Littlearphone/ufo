/**
 * Vue Router 配置
 *
 * 使用 hash 历史模式（兼容单文件 demo 输出）。
 * Tab 切换通过查询参数 `?tab=<name>` 驱动，App.vue 通过 useRoute/useRouter 响应路由变化。
 * 不需要 <router-view>，因为 App.vue 始终作为根组件渲染。
 */
import { createRouter, createWebHashHistory } from 'vue-router'

/** 6 个标签页的路由名称（索引对齐） */
export const TAB_ROUTE_NAMES = ['basic', 'dense', 'api', 'modes', 'vue', 'crud']

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 单一 catch-all：所有路径都匹配，不同 tab 仅通过 ?tab=xxx 区分
    { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
  ],
})

export default router
