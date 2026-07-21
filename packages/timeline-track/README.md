# ⏱ @ufo/timeline-track — 时间线轨道组件

原生 Web Component（Custom Elements v1 + Pointer Events），零框架依赖。
提供可拖拽的时间段轨道，支持**创建、移动、缩放、删除**时间段。支持时间/数值双模式。

## 快速体验

打开 `dist/index.html`（浏览器直接打开或部署到 GitHub Pages），包含 7 个标签页的多场景演示。

## 安装

```html
<script src="./dist/TimelineTrack.js"></script>
<!-- 或通过 npm -->
<!-- npm install @ufo/timeline-track -->
```

## 基本使用

```html
<time-line-container>
  <time-line-track label="摄像头-A" start="00:00" end="24:00" step="900">
    <time-line-segment start="06:00" end="09:00" label="早班值守" color="#27ae60"></time-line-segment>
    <time-line-segment start="14:00" end="15:00" label="超短时段" color="#e67e22"></time-line-segment>
  </time-line-track>
  <time-line-track label="摄像头-B" start="00:00" end="24:00" step="1800">
    <time-line-segment start="08:00" end="12:00" label="上午录像" color="#2980b9"></time-line-segment>
    <time-line-segment start="13:00" end="17:00" label="中班录像" color="#8e44ad"></time-line-segment>
  </time-line-track>
</time-line-container>
```

> `type="time"` 模式默认 `unit="second"`，裸数字视为秒（如 `start="30600"` = 08:30）。
> 推荐使用 `HH:MM` 格式（如 `start="08:30"`）或自然单位（如 `step="30min"`），
> 前者自动解析为秒，后者按单位换算，均无需关注精确的秒数值。

---

## `<time-line-container>` — 顶层容器

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `direction` | `horizontal` / `vertical` | `horizontal` | 轨道排列方向 |
| `axis-mode` | `per-track` / `shared` | `per-track` | 独立轴 / 共享轴 |
| `shared-start` | number | 各轨道最小 start | 共享轴范围起始 |
| `shared-end` | number | 各轨道最大 end | 共享轴范围结束 |
| `shared-clip-range` | 布尔 | — | 共享轴裁剪模式：段不超出自身轨道范围 |
| `borderless` | 布尔 | — | 共享轴模式下移除所有轨道边框 |
| `axis-label` | string | — | 轴尺标签文字（固定值，覆盖 loc-axis-range） |
| `type` | `time` / `number` | `time` | 值模式（时间 / 纯数值） |
| `unit` | `hour` / `minute` / `second` / `""` | `second` | 归一化单位。`type="time"` 默认秒，裸数字视为秒 |
| `step` | number | `0`（自由） | 全局默认吸附步长，各轨道可单独覆盖。`type="time"` 默认单位为秒，`step="1800"` = 30分 |
| `default-color` | string | `#5c9ce6` | 新建段的默认颜色 |
| `max-segments` | number | `0`（无限制） | 全局默认最大段数 |
| `zoom-start` | number | — | 缩放视图起始 |
| `zoom-end` | number | — | 缩放视图结束 |
| `label-h` | `top` / `bottom` | `top` | 横向模式轴标签位置 |
| `label-v` | `left` / `right` | `left` | 纵向模式轴标签位置 |
| `tooltip-pos` | `<side>-<align>` | `top-center` | Tooltip 弹出位置 |
| `editable` | `false` | `true`（不设） | 是否允许编辑（拖拽修改属性） |
| `deletable` | `false` | `true`（不设） | 是否允许删除 |
| `creatable` | `false` | `true`（不设） | 是否允许创建新段 |
| `clearable` | `false` | `true`（不设） | 是否允许清空所有段 |
| `copyable` | `false` | `true`（不设） | 是否允许复制 |
| `loc-*` | string | 见 locale 默认值 | 覆盖用户可见文字（见下方 locale 表） |

### 方法

| 方法 | 说明 |
|---|---|
| `addTrack(label, start, end, opts?)` | 添加轨道，返回 `<time-line-track>` |
| `removeTrack(track)` | 删除轨道 |
| `allTracks()` | 获取所有轨道数组 |
| `getFormatter()` | 获取当前 ValueFormatter 实例（见下方「值解析系统」） |
| `setGlobalRadius(radius)` | 设置所有段的圆角 |
| `zoomIn(centerRatio?)` | 放大 |
| `zoomOut(centerRatio?)` | 缩小 |
| `zoomTo(start, end)` | 缩放到指定范围 |
| `zoomReset()` | 重置缩放 |
| `zoomFit()` | 自适应缩放 |

> `getFormatter()` 返回的 Formatter 实例提供 `resolve(val)`、`resolveSegment(seg)`、`toHours(val)`、`toMinutes(val)`、`toSeconds(val)`、`toFormatted(val)` 等方法，用于将段数据的原始值转换为小时/分钟/秒/格式化字符串。 |

### Tooltip 位置格式

`<side>-<align>`，共 12 种组合：
- `side`: `top` / `bottom` / `left` / `right`
- `align`: `start` / `center` / `end`
- 示例: `top-center`, `bottom-start`, `left-end`

---

## `<time-line-track>` — 单条轨道

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `label` | string | — | 轨道名称 |
| `start` | number | `0` | 时间范围起始 |
| `end` | number | `24` | 时间范围结束 |
| `step` | number | 继承容器 | 吸附步长（`0`=自由，不继承容器） |
| `min-duration` | number | 范围的 0.5% | 段最小持续时间 |
| `max-segments` | number | 继承容器 | 段数量上限 |
| `default-color` | string | 继承容器 | 新建段的默认颜色 |
| `key` | `string|number` | — | 用户自定义标识符，事件 detail 中直接携带此值（见下方「数据关联」） |
| `editable` | `false` | 继承容器 | 是否允许编辑 |
| `deletable` | `false` | 继承容器 | 是否允许删除 |
| `creatable` | `false` | 继承容器 | 是否允许创建新段 |
| `clearable` | `false` | 继承容器 | 是否允许清空 |
| `copyable` | `false` | 继承容器 | 是否允许复制 |

> **步长 / CRUD 权限 / 默认颜色 均采用「轨道自身 → 容器」继承链。**
> 轨道未设属性时自动读取容器值，容器也未设时使用内置默认值。

### 方法

| 方法 | 对应右键菜单 | 说明 |
|---|---|---|
| `addSegment(start, end, opts?)` | — | 添加时间段，返回 `<time-line-segment>` |
| `sortedSegs()` | — | 按 start 排序的段数组 |
| `clearAllSegments()` | 清空时间段 | 清空本轨道所有段 |
| `px2Time(px)` | — | 像素值 → 值空间 |
| `time2Px(t)` | — | 值空间 → 像素值 |
| `editTrack()` | 修改属性 | 打开轨道属性编辑弹窗 |
| `deleteTrack()` | 删除轨道 | 直接删除本轨道（发送可取消 `track-before-delete` 事件） |
| `copyTrack()` | 复制轨道 | 复制本轨道所有段到内部剪贴板 |
| `pasteSegment(data, clientX?, clientY?)` | 粘贴段 | 在指定坐标位置粘贴段，缺省坐标使用段区域中心 |
| `pasteNewTrack(data)` | 粘贴为新轨道 | 从剪贴板数据创建新轨道（粘贴到当前轨道之后） |
| `pasteOverwrite(data)` | 覆盖粘贴到本轨道 | 用剪贴板数据覆盖本轨道所有段 |

---

## `<time-line-segment>` — 时间段

### 方法

| 方法 | 对应右键菜单 | 说明 |
|---|---|---|
| `editSegment()` | 修改属性 | 打开段属性编辑弹窗 |
| `copySegment()` | 复制段 | 复制本段到内部剪贴板 |
| `deleteSegment()` | 删除 | 直接删除本段（发送可取消 `segment-before-delete` 事件） |

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `key` | `string|number` | — | 用户自定义标识符，事件 detail 中直接携带此值（见下方「数据关联」） |
| `start` | number | — | 起始值（配置 unit 下的原始浮点数） |
| `end` | number | — | 结束值 |
| `label` | string | — | 显示名称 |
| `color` | string | 轨道 `default-color` | 背景色 |
| `tooltip` | `auto` / `always` / `none` | `auto` | Tooltip 显示策略 |
| `editable` | `false` | 继承轨道 | 是否允许编辑（移动/调整大小） |
| `deletable` | `false` | 继承轨道 | 是否允许删除 |

### 值解析 Getter（基于容器 Formatter，自动适配 type/unit）

| Getter | 类型 | 说明 |
|---|---|---|
| `startSeconds` | number | 起始秒数（始终返回秒，不受 unit 影响） |
| `startMinutes` | number | 起始分钟数 |
| `startHours` | number | 起始小时数 |
| `startFormatted` | string | 起始格式化字符串 HH:MM |
| `startResolved` | object | `{ raw, hours, minutes, seconds, formatted }` |
| `endSeconds` | number | 结束秒数 |
| `endMinutes` | number | 结束分钟数 |
| `endHours` | number | 结束小时数 |
| `endFormatted` | string | 结束格式化字符串 |
| `endResolved` | object | `{ raw, hours, minutes, seconds, formatted }` |

```js
const seg = track.querySelector('time-line-segment')
console.log(seg.startSeconds)   // 34200（假设 start=9.5, unit=hour）
console.log(seg.startFormatted) // "09:30"
console.log(seg.startResolved)
// → { raw: 9.5, hours: 9.5, minutes: 570, seconds: 34200, formatted: "09:30" }
```

### tooltip 属性说明

| 值 | 行为 |
|---|---|
| `auto`（默认） | 仅段内文字被截断时显示 tooltip |
| `always` | 始终显示 tooltip |
| `none` | 永不显示 tooltip |

### 交互行为

- 空白处拖拽 → 创建时间段
- 拖拽段体 → 移动位置（支持跨轨道拖拽）
- 拖拽段两端手柄 → 调整长度
- Ctrl + 拖拽段体 → 复制
- 悬停显示 × → 删除（段宽 < 28px 时自动隐藏）
- 太窄的段自动隐藏文字，hover 时 tooltip 查看完整内容
- 拖拽创建时 ghost 虚线框实时显示起止值

---

## 事件

所有事件冒泡到 `document`。**段相关事件的 `detail` 中除了下方列出的字段外，还包含完整的值解析字段**（`startSeconds`、`endSeconds`、`startFormatted`、`startFormattedSec`、`durationSeconds` 等，见下方示例），可直接解构使用。

| 事件名 | 冒泡 | 可取消 | 说明 |
|---|---|---|---|
| `segment-created` | ✅ | — | 创建时间段 `detail: { segment, key, start, end, startSeconds, endSeconds, … }` |
| `segment-change` | ✅ | — | 拖拽移动/调整中（频繁触发） `detail: { segment, key, start, end, startSeconds, … }` |
| `segment-changed` | ✅ | — | 拖拽完成 `detail: { segment, key, start, end, startSeconds, endFormattedSec, durationSeconds, … }` |
| `segment-before-delete` | ✅ | ✅ | 段删除前（可阻止） `detail: { segment, key, startSeconds, … }` |
| `segment-deleted` | ✅ | — | 段已删除 `detail: { segment, key, startSeconds, … }` |
| `segment-limit-reached` | ✅ | — | 段数已达上限 `detail: { track, key, current, max }` |
| `segment-copy-error` | ✅ | — | Ctrl+拖拽复制失败 `detail: { source, key, targetTrack, reason, start, end, startSeconds, … }` |
| `track-before-delete` | ✅ | ✅ | 轨道删除前（可阻止） `detail: { track, key }` |
| `track-deleted` | ✅ | — | 轨道已删除 `detail: { track, key }` |

```js
document.addEventListener('segment-changed', e => {
  const { start, end, startSeconds, endSeconds, startFormatted, startFormattedSec, durationSeconds } = e.detail
  console.log(`${startFormatted} → ${endFormatted}, 持续 ${durationSeconds} 秒`)
  // "09:30 → 14:15, 持续 17100 秒"
})
```

> `startFormattedSec` / `endFormattedSec` 始终输出 **HH:MM:SS** 格式（含秒），`startFormatted` / `endFormatted` 输出 HH:MM（秒由 `showSec` 控制）。所有 `*Seconds` / `*Minutes` / `*Hours` 字段不受容器 `unit` 影响，始终返回绝对单位的数值。

---

## 数据关联（Key Binding）

通过 `key` 属性将轨道/段元素与你的响应式数据关联。所有事件的 `detail` 中**直接携带 `key` 值**，无需操作 DOM。

### 核心原理

每个 `<time-line-track>` 和 `<time-line-segment>` 都有一个 `key` 属性。所有事件的 `detail` 中**直接附带 `key` 值**，你只需在创建元素时设一次 `key`，事件中即可按 ID 查找。

```js
// ─── 创建时设置 key ───
const track = container.addTrack('摄像头-A', 0, 24)
track.key = 'cam-a'                          // ← 设一次

const seg = track.addSegment(6, 9, { label: '早班' })
seg.key = 's1'                               // ← 设一次

// ─── 事件中直接拿到 key ───
document.addEventListener('segment-changed', e => {
  const { key: segKey, start, end } = e.detail  // ← 直接拿到 's1'
  // 用 segKey 在你的 Vue reactive 数组里查找
  const item = myDataArray.find(d => d.id === segKey)
  item.start = start
  item.end   = end
})
```

### Vue 完整示例

```js
// stores/timeline.js
import { ref } from 'vue'

const tracks = ref([
  { key: 'cam-a', name: '摄像头-A', segments: [
    { key: 's1', start: 6, end: 9, label: '早班' },
  ]},
])

const container = ref(null)

// 从数据 → DOM 的同步
function syncToDOM() {
  tracks.value.forEach(td => {
    const track = container.value.addTrack(td.name, 0, 24)
    track.key = td.key            // ← 关键：key 与数据关联
    td.segments.forEach(sd => {
      const seg = track.addSegment(sd.start, sd.end, { label: sd.label })
      seg.key = sd.key            // ← 同上
    })
  })
}

// 从事件 → 数据的同步（无需碰 DOM）
function onSegmentChanged({ key, start, end }) {
  for (const td of tracks.value) {
    const seg = td.segments.find(s => s.key === key)
    if (seg) { seg.start = start; seg.end = end; break }
  }
}

function onSegmentDeleted({ key }) {
  for (const td of tracks.value) {
    const idx = td.segments.findIndex(s => s.key === key)
    if (idx >= 0) { td.segments.splice(idx, 1); break }
  }
}

function onTrackDeleted({ key }) {
  const idx = tracks.value.findIndex(t => t.key === key)
  if (idx >= 0) tracks.value.splice(idx, 1)
}

export { tracks, container, syncToDOM, onSegmentChanged, onSegmentDeleted, onTrackDeleted }
```

```vue
<!-- App.vue -->
<script setup>
import { onMounted } from 'vue'
import { tracks, container, syncToDOM, onSegmentChanged, onSegmentDeleted, onTrackDeleted } from './stores/timeline.js'

onMounted(() => {
  syncToDOM()

  document.addEventListener('segment-changed', e => onSegmentChanged(e.detail))
  document.addEventListener('segment-deleted',  e => onSegmentDeleted(e.detail))
  document.addEventListener('track-deleted',    e => onTrackDeleted(e.detail))
})
</script>

<template>
  <time-line-container ref="container">
    <time-line-track
      v-for="td in tracks"
      :key="td.key"
      :label="td.name"
      start="0"
      end="24:00"
    >
      <time-line-segment
        v-for="sd in td.segments"
        :key="sd.key"
        :start="sd.start"
        :end="sd.end"
        :label="sd.label"
      ></time-line-segment>
    </time-line-track>
  </time-line-container>
</template>
```

### 通过方法调用右键菜单操作

```js
// 在自定义 UI 中直接触发操作
const track = container.querySelector('time-line-track')
const seg  = track.querySelector('time-line-segment')

// 打开编辑弹窗
track.editTrack()
seg.editSegment()

// 删除（带确认弹窗和可取消事件）
seg.deleteSegment()  // 先派发 segment-before-delete，可阻止

// 复制/粘贴
track.copyTrack()
track.pasteNewTrack(clipboardData)
track.pasteOverwrite(clipboardData)
track.pasteSegment(segmentData, 300, 400)  // 在 (300,400) 坐标位置粘贴
```

---

## 共享轴模式

通过 `axis-mode="shared"` 启用，所有轨道共用同一轴尺和刻度，适合对比多个轨道的同一时段。

```html
<time-line-container axis-mode="shared" shared-start="00:00" shared-end="24:00">
  <time-line-track label="摄像头-A" start="00:00" end="24:00"></time-line-track>
  <time-line-track label="摄像头-B" start="00:00" end="24:00"></time-line-track>
</time-line-container>
```

### 裁剪模式

加 `shared-clip-range` 属性后，每个轨道的段只能在自身 `start~end` 范围内拖拽：

```html
<time-line-container axis-mode="shared" shared-start="00:00" shared-end="24:00" shared-clip-range>
  <time-line-track label="全天" start="00:00" end="24:00"><!-- 全范围 -->
  </time-line-track>
  <time-line-track label="机房" start="08:00" end="22:00"><!-- 仅 8~22 -->
  </time-line-track>
</time-line-container>
```

### 无边框模式

加 `borderless` 属性移除所有轨道边框，呈现无缝连续外观：

```html
<time-line-container axis-mode="shared" borderless>
```

### Hover 效果

共享轴模式下 hover 轨道时，整行（含头部 label）显示浅蓝背景 + 左侧蓝色高亮竖线。
可通过 `--tlc-axis-bg` 变量自定义轴尺行背景色。

---

## Locale 配置系统

所有用户可见文字通过 `loc-*` 属性在 `<time-line-container>` 上覆盖，未设置时使用内置默认值。

```html
<time-line-container loc-unnamed="Untitled" loc-modify-props="Edit">
```

| locale key | 属性名 | 默认值 | 说明 |
|---|---|---|---|
| `unnamed` | `loc-unnamed` | `未命名` | 轨道/段无标签时的回退名 |
| `invalidTime` | `loc-invalid-time` | `--:--` | 无效时间回退文字 |
| `deleteBtnTitle` | `loc-delete-btn-title` | `删除` | 删除按钮 title |
| `modifyProps` | `loc-modify-props` | `修改属性` | 右键菜单项 |
| `deleteTrack` | `loc-delete-track` | `删除轨道` | 右键菜单项 |
| `clearSegments` | `loc-clear-segments` | `清空时间段` | 右键菜单项 |
| `copySegment` | `loc-copy-segment` | `复制段` | 右键菜单项 |
| `copyTrack` | `loc-copy-track` | `复制轨道` | 右键菜单项 |
| `pasteSegment` | `loc-paste-segment` | `粘贴段` | 右键菜单项 |
| `pasteNewTrack` | `loc-paste-new-track` | `粘贴为新轨道` | 右键菜单项 |
| `pasteOverwrite` | `loc-paste-overwrite` | `覆盖粘贴到本轨道` | 右键菜单项 |
| `copyToTracks` | `loc-copy-to-tracks` | `复制到其他轨道…` | 右键菜单项 |
| `segmentEditTitle` | `loc-segment-edit-title` | `修改时间段属性` | 编辑弹窗标题 |
| `trackEditTitle` | `loc-track-edit-title` | `修改轨道属性` | 编辑弹窗标题 |
| `axisRange` | `loc-axis-range` | `{start} – {end}` | 共享轴尺标签模板 |
| `confirmDelete` | `loc-confirm-delete` | `确定删除` | 删除确认按钮 |
| `segmentOverlapError` | `loc-segment-overlap-error` | 见 CLAUDE.md | 段重叠异常消息 |
| …（完整列表见 [`CLAUDE.md`](../../CLAUDE.md#locale-配置系统)） | | | |

---

## 类型系统（type / unit）

通过 `type` 和 `unit` 属性切换时间/数值模式，支持自然语言输入：

```html
<!-- 百分比数值模式 -->
<time-line-container type="number" unit="%">
  <time-line-track label="进度" start="0%" end="100%">
    <time-line-segment start="0%" end="30%" label="需求" color="#3498db"></time-line-segment>
  </time-line-track>
</time-line-container>

<!-- 秒级精度 -->
<time-line-container type="time" unit="second">
  <time-line-track label="录制" start="0sec" end="3600sec">
    <time-line-segment start="0sec" end="600sec" label="开场" color="#27ae60"></time-line-segment>
  </time-line-track>
</time-line-container>
```

详见 [`DESIGN.md`](./DESIGN.md) 设计文档。

---

## 值解析系统

通过容器 `getFormatter()` 获取的 `ValueFormatter` 实例，提供了一系列方法将原始值（配置 unit 下的浮点数）转换为绝对单位或格式化字符串。

### 单值解析

```js
const fmt = container.getFormatter()

// type="time" 时（假设 unit="hour", val=9.5）
fmt.resolve(9.5)
// → { raw: 9.5, hours: 9.5, minutes: 570, seconds: 34200, formatted: "09:30" }

fmt.toSeconds(9.5)     // 34200（始终返回秒）
fmt.toMinutes(9.5)     // 570（始终返回分钟）
fmt.toHours(9.5)       // 9.5（始终返回小时，与 unit 无关）
fmt.toFormatted(9.5)   // "09:30"（HH:MM）
fmt.toFormatted(9.5, true) // "09:30:00"（HH:MM:SS）

// type="number" 时（假设 unit="px", val=100）
fmt.resolve(100)
// → { raw: 100, formatted: "100 px" }
```

### 段数据解析

```js
// 传入任意含 start/end 的对象，返回完整 detail 对象
const detail = fmt.resolveSegment({ id: 's1', start: 9.5, end: 14.25, label: '前端' })
// detail 包含所有原始字段 + 解析字段：
// { id: 's1', start: 9.5, end: 14.25, label: '前端',
//   startHours: 9.5, startMinutes: 570, startSeconds: 34200,
//   startFormatted: "09:30", startFormattedSec: "09:30:00",
//   endHours: 14.25, endMinutes: 855, endSeconds: 51300,
//   endFormatted: "14:15", endFormattedSec: "14:15:00",
//   duration: 4.75, durationSeconds: 17100, durationFormatted: "04:45:00" }

// 事件 detail 已自动通过 resolveSegment 增强，可直接解构：
container.addEventListener('segment-changed', ({ detail }) => {
  const { startSeconds, endSeconds, startFormattedSec } = detail
  console.log(`从 ${startFormattedSec} 到 ${endSeconds}秒`)
})
```

---

## CSS 变量

### 容器通用（`:root` 或 `time-line-container`）

| 变量 | 默认值 | 说明 |
|---|---|---|
| `--tlc-bg` | `#f8f9fb` | 容器背景色 |
| `--tlc-axis-bg` | `var(--tlc-bg)` | 共享轴尺行背景色 |
| `--tlc-border` | `#dfe3e8` | 容器边框色 |
| `--tlc-radius` | `0` | 容器圆角 |
| `--tlc-padding` | `14px 16px` | 容器内边距 |
| `--tlc-gap` | `10px` | 轨道间距 |
| `--tlc-primary` | `#4285f4` | 主色调（段默认色、hover 高亮） |
| `--tlc-danger` | `#e53935` | 危险色（删除按钮） |
| `--tlc-bg-card` | `#fff` | 轨道卡片背景 |
| `--tlc-bg-tooltip` | `rgba(30,35,42,.92)` | Tooltip 背景 |
| `--tlc-font` | `-apple-system, …` | 字体栈 |
| `--tlc-text` | `#333` | 文字颜色 |
| `--tlc-border-light` | `#e5e8ec` | 轨道分隔线色 |
| `--tlc-shadow-sm` | `0 1px 4px rgba(0,0,0,.2)` | 小阴影 |
| `--tlc-modal-radius` | `0` | 模态框圆角（编辑弹窗、确认弹窗） |

### 轨道尺寸（`time-line-track`）

| 变量 | 默认值 | 模式 | 说明 |
|---|---|---|---|
| `--tlt-row-h` | `70px` | 横向 | 轨道最小高度 |
| `--tlt-row-w` | `150px` | 纵向 | 轨道宽度 |
| `--tlt-row-min-h` | `280px` | 纵向 | 轨道最小长度方向尺寸 |
| `--tlt-header-w` | `110px` | 横/纵向 | 头部 label 区宽度 |
| `--tlt-seg-top` | `18px` | 横向 | 段区顶部留白（轴标签） |
| `--tlt-seg-bottom` | `0px` | 横向 | 段区底部留白 |
| `--tlt-axis-gap` | `36px` | 纵向 | 段区左右边距（轴标签） |

### 段尺寸（`time-line-segment`）

| 变量 | 默认值 | 模式 | 说明 |
|---|---|---|---|
| `--tls-height` | `100%` | 横向 | 段高度（设 px 可控制条厚度） |
| `--tls-width` | `100%` | 纵向 | 段宽度（设 px 可控制条厚度） |

> 设 `--tls-height: 30px`（横向）或 `--tls-width: 24px`（纵向）可控制段条厚度，配合 `auto 0` / `0 auto` margin 自动居中。

---

## 开发

```bash
# 安装依赖（根目录）
pnpm install

# 开发服务器（HMR）
cd packages/timeline-track && pnpm run dev

# 构建库
pnpm run build:lib     # → dist/TimelineTrack.js

# 构建单文件 demo
pnpm run build         # → dist/index.html

# 构建全部
pnpm run build:all
```

## 构建产物

| 文件 | 格式 | 用途 |
|---|---|---|
| `dist/TimelineTrack.js` | UMD | 浏览器 / npm 发布 |
| `dist/index.html` | 自包含 HTML | GitHub Pages / 直接打开 |
