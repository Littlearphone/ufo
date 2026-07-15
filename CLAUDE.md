# UFO — 自定义元素组件库

## Development Rules

- NEVER run development servers (e.g., `npm run dev`, `vite`) automatically.
- Do not run any long-running or non-terminating background processes.
- Only run build (`npm run build`) or linting/testing commands if needed to verify code.

## 项目概览

基于 **Custom Elements v1** + **Pointer Events** 的原生 Web 组件库。采用 **pnpm workspace monorepo** 结构，每个组件独立构建发布。

- **Node.js** ≥ 22.13
- **pnpm** 11.6.0（通过 `package.json` 的 `packageManager` 字段锁定）

## 项目结构

```
ufo/                              # GitHub repo 根
├── pnpm-workspace.yaml           # 工作空间定义
├── package.json                  # 根 workspace
│
└── packages/
    ├── timeline-track/           # ▸ 时间线轨道组件
    │   ├── src/lib/              #   Custom Elements 源码（框架无关）
    │   │   ├── index.js          #   入口 & 注册
    │   │   ├── TimeContainer.js  #   <time-line-container>
    │   │   ├── TimeTrack.js      #   <time-line-track>
    │   │   ├── TimeSegment.js    #   <time-line-segment>
    │   │   ├── css.js            #   样式注入
    │   │   ├── tooltip.js        #   全局 Tooltip
    │   │   └── utils.js          #   工具函数
    │   ├── src/components/       #   Vue 3 演示组件
    │   ├── dist/
    │   │   ├── TimelineTrack.js  #   构建产物（UMD 库）
    │   │   └── index.html        #   构建产物（自包含 demo）
    │   ├── index.html            #   Vite 唯一入口（开发/构建共用）
    │   ├── vite.config.js        #   构建配置
    │   └── package.json          #   @ufo/timeline-track
    │
    └── 其他组件/                   # ▸ 未来新增组件（相同结构）
        ├── src/lib/
        ├── dist/
        │   ├── OtherModule.js    #   构建产物（UMD 库）
        │   └── index.html        #   构建产物（自包含 demo）
        ├── index.html
        ├── vite.config.js
        └── package.json
```

## 包管理（pnpm）

```bash
# 安装全部依赖（根目录执行）
pnpm install

# 开发单个组件
cd packages/timeline-track && pnpm run dev

# 构建单个组件的独立库
cd packages/timeline-track && pnpm run build:lib

# 构建单文件 demo（自包含 HTML）
cd packages/timeline-track && pnpm run build

# 构建全部（demo + 库）
cd packages/timeline-track && pnpm run build:all

# 构建所有组件
pnpm -r run build:all
```

## 组件开发规范

每个组件包遵循同一结构：

| 目录/文件 | 说明 |
|---|---|
| `src/lib/` | Custom Elements 源码，纯原生、零框架依赖 |
| `dist/TimelineTrack.js` | 构建产出的 UMD 独立库，**由 Actions 构建发布** |
| `dist/index.html` | 构建产出的自包含 demo 页面，**可 GH Pages / 直接打开** |
| `index.html` | Vite 唯一入口（开发 HMR + 构建共用） |
| `src/` (除 lib) | Vue 3 演示组件源码 |
| `vite.config.js` | `mode=lib` 输出 UMD 库；默认模式输出单文件 demo |
| `package.json` | 独立版本号，`build:all` 一次产出库 + demo |

### 自定义元素约定

- 自定义元素属性名统一使用英文 kebab-case（如 `direction`、`max-segments`）
- CSS 变量以 `--tlc-`（Container）、`--tlt-`（Track）、`--tls-`（Segment）为前缀
- 事件命名 kebab-case，统一冒泡到 document

### `tooltip` 属性（`<time-line-segment>`）

段元素的 tooltip 行为通过 `tooltip` 属性控制：

| 值 | 行为 |
|---|---|
| `auto`（默认） | 仅当段内文字被截断时显示 tooltip |
| `always` | 无论文字是否截断，hover 时始终显示 tooltip |
| `none` | 永不显示 tooltip |

示例：

```html
<time-line-segment start="14" end="15" label="超短时段" tooltip="always"></time-line-segment>
<time-line-segment start="13" end="17" label="长名称段" tooltip="auto"></time-line-segment>
<time-line-segment start="20" end="23" label="夜间" tooltip="none"></time-line-segment>
```

> 页面上可通过 `<time-line-segment>` 元素上的 `tooltip` 属性值来区分当前使用的模式。未设置时默认 `auto`。

## GitHub Release 策略

每个组件包独立版本化：

1. **打标签**：`git tag <name>@<version>`（如 `timeline-track@2.1.0`）
2. **推送**：`git push --tags`
3. **自动发布**：GitHub Actions 检测到 tag 后自动构建对应组件，在 Releases 页创建 Draft Release
4. **检查发布**：在 GitHub Releases 页面审核 Draft，确认后点击发布
5. **（可选）发布 npm**：`cd packages/<name> && npm publish`

> 构建产物 `dist/<name>.js` + `dist/index.html` 由 Actions 自动构建并附加到 Release，无需提交到 git。

新增组件时，复制现有组件包的结构模板即可。

## locale 配置系统

所有用户可见文本（按钮、弹窗标题、表单标签、提示文字等）集中定义在 `locale.js` 中，**不硬编码在业务代码里**。通过自定义元素的 `loc-*` 属性可覆盖任意文字（类似 Element Plus 的 `element-loading-text` 模式）。

### 用法

```html
<time-line-container
  loc-unnamed="Untitled"
  loc-modify-props="Edit"
  loc-delete-track="Delete Track"
  loc-cancel="Cancel"
  loc-confirm="OK"
>
  <time-line-track label="" start="0" end="24"></time-line-track>
</time-line-container>
```

所有 `loc-*` 属性均为可选，不设置时使用 `DEFAULT_LOCALE` 中的默认中文值。

### 完整配置项列表

属性名 = locale key 的驼峰转 kebab-case + `loc-` 前缀（如 `confirmDeleteTrack` → `loc-confirm-delete-track`）。

| locale key | 属性名 | 默认值 | 说明 |
|---|---|---|---|
| `unnamed` | `loc-unnamed` | `未命名` | 轨道/段无标签时的回退显示名 |
| `invalidTime` | `loc-invalid-time` | `--:--` | 无效时间回退文字 |
| `deleteBtnTitle` | `loc-delete-btn-title` | `删除` | 段上删除按钮的 title 提示 |
| `trackMenuHeader` | `loc-track-menu-header` | `📋 {name}` | 轨道右键菜单标题模板，`{name}`=轨道名 |
| `segmentMenuHeader` | `loc-segment-menu-header` | `🔖 {name}  {range}` | 段右键菜单标题模板，`{name}`=段名`{range}`=时间 |
| `modifyProps` | `loc-modify-props` | `修改属性` | 右键菜单项 |
| `deleteTrack` | `loc-delete-track` | `删除轨道` | 右键菜单项 |
| `clearSegments` | `loc-clear-segments` | `清空时间段` | 右键菜单项 |
| `confirmDeleteTrack` | `loc-confirm-delete-track` | `确定要删除轨道「{name}」({range}) 吗？` | 删除轨道确认模板，支持 `{name}`/`{range}` 占位符 |
| `confirmDeleteSegment` | `loc-confirm-delete-segment` | `确定要删除时间段「{name}」({range}) 吗？` | 删除段确认模板 |
| `confirmClearSegments` | `loc-confirm-clear-segments` | `确定要清空轨道「{name}」的所有时间段吗？` | 清空轨道所有段确认模板，支持 `{name}` 占位符 |
| `segmentEditTitle` | `loc-segment-edit-title` | `修改时间段属性` | 编辑段弹窗标题 |
| `trackEditTitle` | `loc-track-edit-title` | `修改轨道属性` | 编辑轨道弹窗标题 |
| `labelField` | `loc-label` | `标签` | 表单字段名 |
| `startTime` | `loc-start-time` | `开始时间` | 表单字段名（段编辑框） |
| `endTime` | `loc-end-time` | `结束时间` | 表单字段名（段编辑框） |
| `rangeStart` | `loc-range-start` | `起始` | 表单字段名（轨道编辑框 — 范围起始） |
| `rangeEnd` | `loc-range-end` | `结束` | 表单字段名（轨道编辑框 — 范围结束） |
| `color` | `loc-color` | `颜色` | 表单字段名 |
| `name` | `loc-name` | `名称` | 表单字段名 |
| `step` | `loc-step` | `步长` | 表单字段名 |
| `maxSegmentsField` | `loc-max-segments` | `最大段数` | 表单字段名 |
| `zeroUnlimited` | `loc-zero-unlimited` | `0=无限制` | placeholder 文字 |
| `cancel` | `loc-cancel` | `取消` | 按钮文字 |
| `confirm` | `loc-confirm` | `确定` | 按钮文字 |
| `confirmDelete` | `loc-confirm-delete` | `确定删除` | 按钮文字 |
| `confirmDeleteTitle` | `loc-confirm-delete-title` | `确认删除` | 删除确认弹窗标题 |
| `segmentOverlapError` | `loc-segment-overlap-error` | `时间段重叠：新段 [{start}–{end}] 与已有段「{label}」[{segStart}–{segEnd}] 冲突` | addSegment 重叠时的异常消息，支持 `{start}`/`{end}`/`{label}`/`{segStart}`/`{segEnd}` 占位符 |
| `axisRange` | `loc-axis-range` | `{start} – {end}` | 共享轴模式轴尺标签模板，`{start}`/`{end}` 为格式化后的起止值 |

### 设计要点

- locale key 驼峰命名，属性名自动映射为 `loc-` + kebab-case
- 模板字符串（`confirmDeleteTrack`/`confirmDeleteSegment`）使用 `{name}` 和 `{range}` 占位符
- 属性设置在 `time-line-container` 上，通过 `resolveLocale(el)` 函数向上查找容器并合并覆盖
- 运行时变更 `loc-*` 属性会触发子元素自动刷新文字（`_onLocaleChange()`）

## CSS 变量配置系统

组件轨道尺寸通过 `time-line-track` 上的私有 CSS 变量控制，可通过覆盖变量自定义轨道高度、宽度和间距。

### 轨道尺寸变量

| CSS 变量 | 默认值 | 作用域 | 说明 |
|---|---|---|---|
| `--tlt-row-h` | `70px` | 横向模式 | **横向轨道行最小高度** |
| `--tlt-row-w` | `150px` | 纵向模式 | **纵向轨道行宽度** |
| `--tlt-row-min-h` | `280px` | 纵向模式 | 纵向轨道行最小高度（长度方向） |
| `--tlt-header-w` | `110px` | 横/纵向 | 轨道头部标签区宽度 |
| `--tlt-seg-top` | `18px` | 横向模式 | 段区域顶部留白（为轴刻度标签） |
| `--tlt-seg-bottom` | `0px` | 横向模式 | 段区域底部留白 |
| `--tlt-axis-gap` | `36px` | 纵向模式 | 纵向模式下段区域左右边距（为轴刻度标签） |

### 容器通用变量（`:root` 或 `time-line-container`）

| CSS 变量 | 默认值 | 说明 |
|---|---|---|
| `--tlc-gap` | `10px` | 轨道之间的间距 |
| `--tlc-padding` | `14px 16px` | 容器内边距 |
| `--tlc-radius` | `0` | 容器圆角 |
| `--tlc-bg` | `#f8f9fb` | 容器背景色 |
| `--tlc-border` | `#dfe3e8` | 容器边框色 |
| `--tlc-primary` | `#4285f4` | 主色调（段默认颜色） |
| `--tlc-danger` | `#e53935` | 危险色（删除按钮） |
| `--tlc-font` | `-apple-system, ...` | 字体栈 |
| `--tlc-bg-card` | `#fff` | 轨道卡片背景 |
| `--tlc-bg-tooltip` | `rgba(30,35,42,.92)` | Tooltip 背景 |

### 使用示例

```css
/* 横向轨道更矮 */
time-line-track {
  --tlt-row-h: 50px;
  --tlt-seg-top: 12px;
}

/* 纵向轨道更窄 */
time-line-track {
  --tlt-row-w: 120px;
}

/* 通过容器内联 */
<time-line-container style="--tlt-row-h: 50px; --tlt-row-w: 120px">
```

> **关于文字显示：** 当轨道尺寸过小时，段内文字会自动隐藏（通过 `_isTruncated()` 检测 scrollWidth/clientWidth 溢出），hover 时可通过 tooltip 查看完整内容。删除按钮在段宽 < 28px 时也自动隐藏。用户无需额外配置。

## 步长继承系统

步长（`step`）控制拖拽创建/移动/调整段时的吸附粒度，通过**容器 → 轨道**的继承机制工作：

### 解析规则（`TimeTrack.step` getter）

1. **轨道自身有 `step` 属性** → 使用自身值（`0` = 显式禁用吸附）
2. **轨道无自身 `step` 属性** → 回退到容器 `step` 属性
3. **容器也无 `step`** → 返回 `0`（自由模式，无吸附）

```js
// TimeTrack.js step getter（简化逻辑）
get step() {
  if (this.hasAttribute('step')) return parse(this.getAttribute('step'))
  const c = this.closest('time-line-container')
  if (c && c.hasAttribute('step')) return parse(c.getAttribute('step'))
  return 0
}
```

### 容器步长属性

容器通过 `step` 属性提供全局默认步长，各轨道可单独覆盖：

```html
<!-- 容器设默认步长 0.5，所有无自身 step 的轨道继承 -->
<time-line-container step="0.5">
  <!-- 继承容器步长 → 吸附 0.5 -->
  <time-line-track label="默认轨道" start="0" end="24"></time-line-track>
  <!-- 自身 step=0.25 → 覆盖容器，吸附 0.25 -->
  <time-line-track label="精细轨道" start="0" end="24" step="0.25"></time-line-track>
  <!-- 自身 step=0 → 显式禁用吸附 -->
  <time-line-track label="自由轨道" start="0" end="24" step="0"></time-line-track>
</time-line-container>
```

### 控制台步长控制

控制面板（`Tab0Controls`/`Tab3Controls`）的步长选择器**只设置容器的 step**，不影响各轨道自身属性：

```js
// 只设容器步长，轨道通过继承响应
c().step = parseFloat(v) || 0
```

| 行为 | 说明 |
|---|---|
| 无自身 step 的轨道 | 跟随控制台步长变化 |
| 有自身 step 的轨道 | 保持自身值，不受控制台影响 |
| `addTrack()` 新增轨道 | 不设自身 step，继承容器步长（除非传入 `opts.step`） |

### reset 行为

调用 `reset()` 时，容器被设为默认步长，轨道 innerHTML 中的自身 step 属性保留以保持各自特性：

```js
// Tab0Controls reset
c().setAttribute('step', '0.5')
```

## CRUD 权限控制系统（creatable / editable / deletable）

三级布尔属性，控制每个元素是否可创建、可编辑、可删除。所有属性默认 `true`（不设置 = 全部允许），完全向后兼容。

### 属性概览

| 属性 | 含义 | Container | Track | Segment |
|---|---|---|---|---|
| `creatable` | 可创建新内容 | 为轨道提供默认值 | 拖拽创建新段 | —（段无子内容） |
| `editable` | 可修改已有内容 | 为轨道提供默认值 | 移动/调整段、编辑属性 | 拖拽移动/调整、编辑属性 |
| `deletable` | 可删除内容 | 为轨道提供默认值 | 删除轨道、清空段 | 删除按钮、删除菜单 |

### 继承链

下层未设属性时**继承**上层值（和 `step` / `maxSegments` 的继承机制一致）：

```
container.creatable  → track.creatable  (段无 creatable)
container.editable   → track.editable   → segment.editable
container.deletable  → track.deletable  → segment.deletable
```

### 各操作归属表

**Create — `creatable`：**
| 操作 | 守卫层级 | 守卫属性 |
|---|---|---|
| 在轨道空白区域拖拽创建新段 | Track | `track.creatable` |

**Update — `editable`：**
| 操作 | 守卫层级 | 守卫属性 |
|---|---|---|
| 拖拽段体移动 | Segment | `segment.editable` |
| 拖拽左/右手柄调整大小 | Segment | `segment.editable` |
| 右键菜单「修改属性」 | Segment / Track | 各自的 `editable` |
| 跨轨道拖拽落位 | Track（目标） | `track.editable` |

**Delete — `deletable`：**
| 操作 | 守卫层级 | 守卫属性 |
|---|---|---|
| 段上 × 按钮 | Segment | `segment.deletable` |
| 右键菜单「删除」 | Segment | `segment.deletable` |
| 右键菜单「清空时间段」 | Track | `track.deletable` |
| 右键菜单「删除轨道」 | Track | `track.deletable` |

### 使用示例

```html
<!-- 全局只读 -->
<time-line-container creatable="false" editable="false" deletable="false">
  <time-line-track label="只读轨道" start="0" end="24">
    <time-line-segment start="8" end="12" label="不可操作"></time-line-segment>
  </time-line-track>
</time-line-container>

<!-- 精细化控制：轨道级覆盖 + 片段级覆盖 -->
<time-line-container editable="true" deletable="true">
  <!-- 此轨道只可添加新段，不可编辑/删除已有段 -->
  <time-line-track label="投稿区" start="0" end="24"
    creatable="true" editable="false" deletable="false">
    <time-line-segment start="8" end="12" label="已有段"></time-line-segment>
  </time-line-track>
  <!-- 此轨道普通，但其中一段设为只读 -->
  <time-line-track label="回放区" start="0" end="24">
    <time-line-segment start="14" end="16" label="可操作"></time-line-segment>
    <time-line-segment start="17" end="19" label="只读" editable="false" deletable="false"></time-line-segment>
  </time-line-track>
</time-line-container>

<!-- 编程式 addTrack -->
<script>
  container.addTrack('动态轨道', 0, 24, {
    creatable: false,  // 不可拖拽创建新段
    editable: true,    // 可移动/调整已有段
    deletable: false   // 不可删除
  })
</script>
```

### 视觉效果

- `editable="false"` 的段：拖拽手柄不渲染、`×` 删除按钮不渲染（若同时 `deletable="false"`）
- `deletable="false"` 的轨道：右键菜单隐藏"删除轨道"和"清空时间段"项
- `creatable="false"` 的轨道：拖拽创建被扼制，指针无响应

## 共享轴轴尺标签自定义

共享轴模式（`axis-mode="shared"`）下，左上角固定的轴尺标签可通过 `loc-*` 属性自定义：

```html
<!-- 默认：显示起止范围（如 "00:00 – 24:00"） -->
<time-line-container axis-mode="shared"></time-line-container>

<!-- 自定义格式 -->
<time-line-container axis-mode="shared" loc-axis-range="{start} ~ {end}"></time-line-container>

<!-- 添加前缀 -->
<time-line-container axis-mode="shared" loc-axis-range="时间范围：{start} 至 {end}"></time-line-container>

<!-- 显示固定文字（不含时间值） -->
<time-line-container axis-mode="shared" loc-axis-range="我的日程"></time-line-container>

<!-- 完全隐藏 -->
<time-line-container axis-mode="shared" loc-axis-range=""></time-line-container>
```

| locale key | 属性名 | 默认值 | 说明 |
|---|---|---|---|
| `axisRange` | `loc-axis-range` | `{start} – {end}` | 轴尺标签模板，`{start}`/`{end}` 为格式化后的起止值 |

该 locale 属性已包含在上面的 locale 配置表中，因其专门针对共享轴模式，在此额外说明。

## 跨轨道拖拽

段（`<time-line-segment>`）支持在同一容器内的不同轨道之间拖拽迁移。

### 启用规则

| 规则 | 说明 |
|---|---|
| **仅 move 模式** | resize 左/右手柄时不触发跨轨道，仅通过段主体拖拽 |
| **同容器** | 只能在同一个 `<time-line-container>` 内的轨道间拖拽 |
| **同方向** | 横向→横向，纵向→纵向，不支持跨方向 |
| **释放时校验** | 校验目标轨道的时间范围、段数上限、段重叠，任一不通过则回退源轨道 |

### 交互细节

| 阶段 | 行为 |
|---|---|
| **进入目标轨道** | 原段隐藏，在目标轨道上创建与真实段结构一致的**浮层**（含标签+时间范围），带弹性缩放入场动画 |
| **跨越中间轨道** | 浮层高亮和目标轨道引用随指针实时切换 |
| **轨道间隙中** | 浮层保持在上次位置不动，不闪回 |
| **回到来源轨道** | 浮层淡出，原段恢复可见 |
| **离开容器** | 浮层淡出，原段恢复可见 |
| **成功落位** | 浮层播放闪光收缩动画后消失，段 DOM 迁移到目标轨道，双轨道刷新 |
| **落位失败** | 浮层淡出，段恢复源轨道原始位置和时间值 |

### 视觉反馈

- 目标轨道行显示蓝色内阴影边框（`--tlc-primary`）和浅蓝背景
- 浮层透明度 `0.7`，可透视查看下方是否存在已有段
- 浮层带阴影效果、显示完整段内容（标签 + 时间范围）

## 设计文档

重要架构变更方案在组件包根目录的 `DESIGN.md` 中记录。当前活跃方案：

| 组件 | 文档 | 说明 |
|---|---|---|
| `timeline-track` | [`DESIGN.md`](packages/timeline-track/DESIGN.md) | 通用范围标尺抽象方案 —— 从时间写死架构抽象为可插拔的 ValueFormatter 系统，支持 `type="time"` / `type="number"` 和多种 unit |
