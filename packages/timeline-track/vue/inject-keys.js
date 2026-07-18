/**
 * Vue provide/inject key 常量
 *
 * 所有通过 provide/inject 在 VTimelineContainer → VTimelineTrack → VTimelineSegment
 * 之间传递的 key 集中定义于此，避免命名冲突。
 *
 * @module vue/inject-keys
 */

/** locale 对象（响应式） */
export const LOCALE_KEY = Symbol('locale')
/** Formatter 实例 */
export const FORMATTER_KEY = Symbol('formatter')
/** 容器方向 */
export const DIRECTION_KEY = Symbol('direction')
/** 轴模式 */
export const AXIS_MODE_KEY = Symbol('axis-mode')
/** 容器 editable 状态 */
export const CONTAINER_EDITABLE_KEY = Symbol('container-editable')
/** 容器 deletable 状态 */
export const CONTAINER_DELETABLE_KEY = Symbol('container-deletable')
/** 容器 creatable 状态 */
export const CONTAINER_CREATABLE_KEY = Symbol('container-creatable')
/** 容器 clearable 状态 */
export const CONTAINER_CLEARABLE_KEY = Symbol('container-clearable')
/** 容器 copyable 状态 */
export const CONTAINER_COPYABLE_KEY = Symbol('container-copyable')
/** 容器 step */
export const CONTAINER_STEP_KEY = Symbol('container-step')
/** 容器 default-color */
export const CONTAINER_DEFAULT_COLOR_KEY = Symbol('container-default-color')
/** 容器 tooltip-pos */
export const CONTAINER_TOOLTIP_POS_KEY = Symbol('container-tooltip-pos')
/** 全局段圆角 */
export const GLOBAL_RADIUS_KEY = Symbol('global-radius')
/** 是否启用选中模式 */
export const SELECTION_MODE_KEY = Symbol('selection-mode')
/** 标签位置控制 - 横向 */
export const LABEL_H_KEY = Symbol('label-h')
/** 标签位置控制 - 纵向 */
export const LABEL_V_KEY = Symbol('label-v')
/** 共享轴模式起止 */
export const SHARED_RANGE_KEY = Symbol('shared-range')
/** 共享轴裁剪模式 */
export const SHARED_CLIP_RANGE_KEY = Symbol('shared-clip-range')
/** 当前缩放范围 */
export const ZOOM_RANGE_KEY = Symbol('zoom-range')
/** 轨道标签容器引用（触发子元素 locale 刷新） */
export const LOCALE_VERSION_KEY = Symbol('locale-version')

/** 右键菜单事件发射器 */
export const CONTEXT_MENU_TRIGGER_KEY = Symbol('context-menu-trigger')
/** tooltip 控制接口 */
export const TOOLTIP_CONTROLLER_KEY = Symbol('tooltip-controller')
/** 模态框控制接口 */
export const MODAL_CONTROLLER_KEY = Symbol('modal-controller')
