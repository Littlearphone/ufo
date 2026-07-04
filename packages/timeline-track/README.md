# ⏱ @ufo/timeline-track — 时间线轨道组件

原生 Web Component，零框架依赖。提供可拖拽的时间段轨道，支持**创建、移动、缩放、删除**时间段。

## 快速体验

打开 `demo/index.html`（浏览器直接打开），包含 4 个标签页的不同用法演示。

## 安装

```html
<script src="./dist/TimelineTrack.js"></script>
```

## 使用

```html
<time-line-container direction="horizontal">
  <time-line-track label="摄像头-A" start="0" end="24" step="0.25">
    <time-line-segment start="6" end="9" label="早班值守" color="#27ae60"></time-line-segment>
    <time-line-segment start="14" end="15" label="超短时段" color="#e67e22"></time-line-segment>
  </time-line-track>
  <time-line-track label="摄像头-B" start="0" end="24" step="0.5">
    <time-line-segment start="8" end="12" label="上午录像" color="#2980b9"></time-line-segment>
  </time-line-track>
</time-line-container>
```

## 组件 API

### `<time-line-container>` — 顶层容器

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `direction` / `方向` | `horizontal` \| `vertical` | `horizontal` | 轨道排列方向 |
| `axis-mode` / `轴模式` | `per-track` \| `shared` | `per-track` | 每轨道独立轴 / 共用轴 |
| `shared-start` / `共用起始` | number | — | 共用轴起始时间 |
| `shared-end` / `共用结束` | number | — | 共用轴结束时间 |
| `label-h` / `横轴标签` | `top` \| `bottom` | `top` | 横向轴标签位置 |
| `label-v` / `纵轴标签` | `left` \| `right` | `left` | 纵向轴标签位置 |
| `tooltip-pos` / `提示位置` | `<side>-<align>` | `top-center` | Tooltip 弹出位置（见下方） |

**方法：**

| 方法 | 说明 |
|---|---|
| `addTrack(label, start, end, opts?)` | 添加轨道，返回 `<time-line-track>` 元素 |
| `removeTrack(track)` | 删除轨道 |
| `allTracks()` | 获取所有轨道数组 |
| `setGlobalRadius(radius)` | 设置所有段的圆角 |

**Tooltip 位置格式：** `<side>-<align>`
- `side`: `top` \| `bottom` \| `left` \| `right`
- `align`: `start` \| `center` \| `end`
- 示例: `top-center`, `bottom-start`, `left-end`（共 12 种组合）

### `<time-line-track>` — 单条轨道

| 属性 | 类型 | 说明 |
|---|---|---|
| `label` | string | 轨道名称 |
| `start` | number | 时间范围起始 |
| `end` | number | 时间范围结束 |
| `step` | number | 网格刻度步长（0 为无网格） |

**方法：**

| 方法 | 说明 |
|---|---|
| `addSegment(start, end, opts?)` | 添加时间段，返回 `<time-line-segment>` 元素 |
| `sortedSegs()` | 按 start 排序的时间段数组 |

### `<time-line-segment>` — 时间段

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `start` | number | — | 起始时间 |
| `end` | number | — | 结束时间 |
| `label` | string | — | 显示名称 |
| `color` | string | — | 背景色 |
| `tooltip` | `auto` \| `always` \| `none` | `auto` | Tooltip 显示策略 |

**交互：**
- 空白处拖拽 → 创建时间段
- 拖拽段体 → 移动位置
- 拖拽段两端 → 调整长度
- 悬停显示 × → 删除

### 事件

所有事件冒泡到 `document`：

| 事件名 | 说明 |
|---|---|
| `segment-created` | 创建时间段 |
| `segment-change` | 拖动中（频繁触发） |
| `segment-changed` | 拖动完成 |
| `segment-deleted` | 删除时间段 |

### CSS 变量

| 变量 | 作用范围 | 说明 |
|---|---|---|
| `--tlc-bg` | Container | 容器背景色 |
| `--tlt-bg` | Track | 轨道背景色 |
| `--tlt-label-color` | Track | 轨道标签颜色 |
| `--tlt-grid-color` | Track | 网格线颜色 |
| `--tls-hover-brighten` | Segment | 悬停时亮度增量 |
| `--tls-label-color` | Segment | 段内文字颜色 |
| `--tls-font-size` | Segment | 段内文字大小 |

## 开发

```bash
# 安装依赖
pnpm install

# Vite 开发服务器
pnpm run dev

# 构建库
pnpm run build:lib   # → dist/TimelineTrack.js
```

## 构建产物

`dist/TimelineTrack.js` — UMD 格式，可直接在浏览器中使用。
