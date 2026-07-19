# UFO — 自定义元素组件库

## 开发规则

- 禁止自动运行开发服务器（如 `npm run dev`、`vite`）。
- 不要运行任何长时间执行或不终止的后台进程。
- 仅在需要验证代码时运行构建（`npm run build`）或 lint/测试命令。
- **修改 lib（Custom Elements）包时，必须同步检查 vue 包的行为一致性；反之亦然。** 重点关注交互行为（点击、聚焦、失焦、键盘导航）、下拉面板定位与文字对齐、右键菜单/模态框行为。确保两个包的体验完全一致。

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
    │   ├── lib/                  #   Custom Elements 源码（框架无关）
    │   │   ├── index.js          #   入口 & 注册
    │   │   ├── TimeContainer.js  #   <time-line-container>
    │   │   ├── TimeTrack.js      #   <time-line-track>
    │   │   ├── TimeSegment.js    #   <time-line-segment>
    │   │   ├── contextmenu.js    #   右键菜单与编辑弹窗
    │   │   ├── tooltip.js        #   全局 Tooltip
    │   │   ├── clipboard.js      #   内部剪贴板
    │   │   └── css.js            #   样式注入
    │   ├── vue/                  #   Vue 3 包装组件（可复制到 Vue 项目直接使用）
    │   │   ├── index.js          #   导出 VTimelineContainer/Track/Segment
    │   │   ├── VTimelineContainer.vue
    │   │   ├── VTimelineTrack.vue
    │   │   └── VTimelineSegment.vue
    │   ├── shared/               #   共享逻辑（lib 与 vue 共同引用）
    │   │   ├── formatter.js      #   可插拔的值格式化/解析/刻度系统
    │   │   ├── locale.js         #   用户可见文字配置系统
    │   │   └── utils.js          #   工具函数（clamp/snap）
    │   ├── src/                  #   Vue 3 演示应用
    │   │   ├── main.js
    │   │   ├── App.vue
    │   │   ├── components/       #   控制面板、事件日志等
    │   │   ├── composables/      #   Vue composables
    │   │   └── stores/           #   响应式事件日志
    │   ├── dist/
    │   │   ├── TimelineTrack.js  #   构建产物（UMD 库）
    │   │   └── index.html        #   构建产物（自包含 demo）
    │   ├── index.html            #   Vite 唯一入口（开发/构建共用）
    │   ├── vite.config.js        #   构建配置
    │   └── package.json          #   @ufo/timeline-track
    │
    └── 其他组件/                   # ▸ 未来新增组件（相同结构）
        ├── lib/
        ├── vue/                  #   Vue 3 包装组件（如有）
        ├── shared/               #   共享逻辑（如有）
        ├── src/                  #   演示应用
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
| `lib/` | Custom Elements 源码，纯原生、零框架依赖 |
| `vue/` | Vue 3 包装组件，可复制到 Vue 项目直接使用 |
| `shared/` | formatter/locale/utils 共享逻辑，lib 与 vue 共同引用 |
| `dist/TimelineTrack.js` | 构建产出的 UMD 独立库，**由 Actions 构建发布** |
| `dist/index.html` | 构建产出的自包含 demo 页面，**可 GH Pages / 直接打开** |
| `index.html` | Vite 唯一入口（开发 HMR + 构建共用） |
| `src/` | Vue 3 演示应用源码 |
| `vite.config.js` | `mode=lib` 输出 UMD 库；默认模式输出单文件 demo |
| `package.json` | 独立版本号，`build:all` 一次产出库 + demo；含 `exports` 配置支持 `@ufo/timeline-track/vue` |

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

> 此外，**拖拽创建新段时** ghost 虚线框上会实时显示当前拖拽范围（起止值），帮助精确定位。该 tooltip 与段 tooltip 共享同一全局 portal，样式一致。

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
| `--tls-height` | `100%` | 横向模式 | **段元素高度**（设为具体 px 值可控制段条厚度，配合 `auto 0` margin 自动垂直居中） |
| `--tls-width` | `100%` | 纵向模式 | **段元素宽度**（设为具体 px 值可控制段条厚度，配合 `0 auto` margin 自动水平居中） |

### 容器通用变量（`:root` 或 `time-line-container`）

| CSS 变量 | 默认值 | 说明 |
|---|---|---|
| `--tlc-gap` | `10px` | 轨道之间的间距 |
| `--tlc-padding` | `14px 16px` | 容器内边距 |
| `--tlc-radius` | `0` | 容器圆角 |
| `--tlc-bg` | `#f8f9fb` | 容器背景色 |
| `--tlc-axis-bg` | `var(--tlc-bg)` | 共享轴尺行背景色 |
| `--tlc-border` | `#dfe3e8` | 容器边框色 |
| `--tlc-primary` | `#4285f4` | 主色调（段默认颜色） |
| `--tlc-danger` | `#e53935` | 危险色（删除按钮） |
| `--tlc-font` | `-apple-system, ...` | 字体栈 |
| `--tlc-bg-card` | `#fff` | 轨道卡片背景 |
| `--tlc-bg-tooltip` | `rgba(30,35,42,.92)` | Tooltip 背景 |
| `--tlc-modal-radius` | `0` | 模态框圆角（编辑弹窗、确认弹窗） |

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

## CRUD 权限控制系统（creatable / editable / deletable / clearable / copyable）

五级布尔属性，控制每个元素是否可创建、可编辑、可删除、可清空、可复制。所有属性默认 `true`（不设置 = 全部允许），完全向后兼容。

### 属性概览

| 属性 | 含义 | Container | Track | Segment |
|---|---|---|---|---|
| `creatable` | 可创建新内容 | 为轨道提供默认值 | 拖拽创建新段 | —（段无子内容） |
| `editable` | 可修改已有内容 | 为轨道提供默认值 | 移动/调整段、编辑属性 | 拖拽移动/调整、编辑属性 |
| `deletable` | 可删除内容 | 为轨道提供默认值 | 删除轨道 | 删除按钮、删除菜单 |
| `clearable` | 可清空段 | 为轨道提供默认值 | 右键菜单"清空时间段" | —（轨道级操作） |
| `copyable` | 可复制 | 为轨道提供默认值 | 右键"复制段/轨道"、Ctrl+拖拽复制 | 右键"复制段"、Ctrl+拖拽复制 |

### 继承链

下层未设属性时**继承**上层值（和 `step` / `maxSegments` 的继承机制一致）：

```
container.creatable  → track.creatable  (段无 creatable)
container.editable   → track.editable   → segment.editable
container.deletable  → track.deletable  → segment.deletable
container.clearable  → track.clearable  (段无 clearable)
container.copyable   → track.copyable   → segment.copyable
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
| 右键菜单「删除」段 | Segment | `segment.deletable` |
| 右键菜单「删除轨道」 | Track | `track.deletable` |

**Clear — `clearable`：**
| 操作 | 守卫层级 | 守卫属性 |
|---|---|---|
| 右键菜单「清空时间段」 | Track | `track.clearable` |

**Copy — `copyable`：**
| 操作 | 源端守卫 | 目标端守卫 |
|---|---|---|
| Ctrl+拖拽复制段 | `segment.copyable` + `track.copyable` | `track.creatable` |
| 右键菜单「复制段」 | `segment.copyable` | — |
| 右键菜单「复制轨道」 | `track.copyable` | — |
| 右键菜单「复制到其他轨道…」 | `track.copyable` | 各勾选轨道的 `deletable` |
| 右键菜单「粘贴段」 | — | `track.creatable` |
| 右键菜单「覆盖粘贴到本轨道」 | — | `track.deletable` |
| 右键菜单「粘贴为新轨道」 | — | `container.creatable` |

### 使用示例

```html
<!-- 全局只读 -->
<time-line-container creatable="false" editable="false" deletable="false" clearable="false">
  <time-line-track label="只读轨道" start="0" end="24">
    <time-line-segment start="8" end="12" label="不可操作"></time-line-segment>
  </time-line-track>
</time-line-container>

<!-- 精细化控制：轨道级覆盖 + 片段级覆盖 -->
<time-line-container editable="true" deletable="true" clearable="true">
  <!-- 此轨道只可添加新段，不可编辑/删除已有段，也不可清空 -->
  <time-line-track label="投稿区" start="0" end="24"
    creatable="true" editable="false" deletable="false" clearable="false">
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
    deletable: false,  // 不可删除
    clearable: false,  // 不可清空段
    copyable: true     // 可复制段
  })
</script>
```

### 视觉效果

- `editable="false"` 的段：拖拽手柄不渲染、`×` 删除按钮不渲染（若同时 `deletable="false"`）
- `deletable="false"` 的轨道：右键菜单隐藏"删除轨道"项
- `clearable="false"` 的轨道：右键菜单隐藏"清空时间段"项
- `copyable="false"` 的轨道/段：右键菜单隐藏"复制段/复制轨道"项；Ctrl+拖拽不触发复制
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

### 共享轴无边框模式

在共享轴模式下，轨道默认带有独立边框。通过添加 `borderless` 属性可移除轨道边框，呈现无缝连续的外观：

```html
<time-line-container axis-mode="shared" borderless>
  <time-line-track label="轨道A" start="0" end="24"></time-line-track>
  <time-line-track label="轨道B" start="0" end="24"></time-line-track>
</time-line-container>
```

无边框模式下，各轨道之间以细分割线（`--tlc-border-light`）区分，最后一条轨道无底部/右侧分割线。

### 共享轴轨道 hover 效果

共享轴模式下，鼠标悬停轨道时显示蓝色左（上）边框高亮和浅色背景。hover 效果在轨道间连续过渡（过渡时长 0.18s），鼠标在不同轨道间移动时视觉连贯无跳变。

```css
/* 自定义 hover 背景色 */
time-line-container[axis-mode="shared"] time-line-track:hover .tlt-row {
  background: rgba(66,133,244,.08);
}
```

## 段默认颜色

新建段默认颜色为 `#5c9ce6`。可通过 `default-color` 属性在容器或轨道上自定义：

```html
<!-- 容器设置默认颜色，所有未显式设置 color 的子轨道继承 -->
<time-line-container default-color="#e67e22">
  <!-- 继承容器默认色 -->
  <time-line-track label="轨道A" start="0" end="24"></time-line-track>
  <!-- 自身 default-color 覆盖容器 -->
  <time-line-track label="轨道B" start="0" end="24" default-color="#2ecc71"></time-line-track>
</time-line-container>
```

| 层级 | 优先级 | 说明 |
|---|---|---|
| 段自身 `color` 属性 | 最高 | 显式设置在 `<time-line-segment>` 上的 `color` 属性 |
| 轨道 `default-color` | 中 | 轨道上的 `default-color` 属性值 |
| 容器 `default-color` | 低 | 容器上的 `default-color` 属性值 |
| 内置默认值 | 最低 | `#5c9ce6` |

## 段尺寸控制

通过 CSS 变量控制段在横轴/纵轴模式下的厚度：

| CSS 变量 | 默认值 | 作用域 | 说明 |
|---|---|---|---|
| `--tls-height` | `100%` | 横向模式 | 段元素高度，设为具体 px 值（如 `30px`）可控制段条厚度，自动垂直居中 |
| `--tls-width` | `100%` | 纵向模式 | 段元素宽度，设为具体 px 值（如 `24px`）可控制段条厚度，自动水平居中 |

```html
<time-line-container style="--tls-height: 30px; --tls-width: 24px" direction="horizontal">
```

## 拖拽创建 tooltip

在轨道空白区域拖拽创建新段时，鼠标指针旁会实时显示当前拖拽范围（起止值），帮助精确定位。该 tooltip 跟随 ghost 虚线框一同出现和消失，样式与全局 tooltip 一致。**无需额外配置**。

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

## Vue 3 纯组件包装（`packages/*/vue/`）

`vue/` 目录提供纯 Vue 3 组件，**不依赖 Custom Elements**，使用 Vue template 渲染，完全支持 `v-for` / `v-model` / `@event` 等 Vue 特性。每个组件包独立提供。

**核心优势：** Props → 数据驱动的声明式渲染、事件向上冒泡、Teleport 全局门户（Tooltip / ContextMenu / Modal）。

> ⚠️ 与 `lib/` Custom Elements 是**两套独立实现**，功能完全对齐。使用同一套 `shared/` 工具（`formatter.js` / `locale.js` / `utils.js`）。

### 组件列表

| 组件 | 文件 | 对应 CE | 功能 |
|---|---|---|---|
| `VTimelineContainer` | `vue/VTimelineContainer.vue` | `<time-line-container>` | 容器、布局、共享轴、缩放、CRUD 权限、locale、Tooltip/ContextMenu/Modal 门户 |
| `VTimelineTrack` | `vue/VTimelineTrack.vue` | `<time-line-track>` | 轨道、网格 Canvas、拖拽创建新段、右键菜单、复制/粘贴/清空 |
| `VTimelineSegment` | `vue/VTimelineSegment.vue` | `<time-line-segment>` | 段、拖拽移动/调整大小（含把手交换）、跨轨道拖拽、Ctrl+拖拽复制、Tooltip、右键菜单、选中模式、文字截断检测 |

### 门户组件（Portal）

通过 `<Teleport to="body">` 渲染的全局 UI，与 lib 包行为一致：

| 组件 | 文件 | 功能 |
|---|---|---|
| `TooltipPortal` | `vue/TooltipPortal.vue` | 全局 Tooltip，避免祖先 overflow 裁剪 |
| `ContextMenuPortal` | `vue/ContextMenuPortal.vue` | 右键菜单，自动视口边界修正 |
| `ModalPortal` | `vue/ModalPortal.vue` | 模态框（信息/确认/表单） |

> 这三个门户由 `VTimelineContainer` 内部自动渲染，使用者无需手动添加。

### Composables（可组合式 API）

| Composable | 文件 | 功能 |
|---|---|---|
| `useLocale()` | `vue/useLocale.js` | 注入容器提供的 locale 对象（响应式） |
| `useTooltip()` | `vue/useTooltip.js` | 全局 Tooltip 控制器（show/hide + 响应式 state） |
| `useContextMenu()` | `vue/useContextMenu.js` | 右键菜单控制器（show/hide + 响应式 state） |
| `useModal()` | `vue/useModal.js` | 模态框控制器（show/hide + 响应式 state） |
| `useClipboard()` | `vue/useClipboard.js` | 内部剪贴板（copyToClipboard / clearClipboard / hasClipboard） |
| `resolveLocaleFromProps(props)` | `vue/useLocale.js` | 从组件 props 解析 locale 对象 |
| `formatLocale(tpl, params)` | `vue/useLocale.js` | 模板字符串替换 `{key}` 占位符 |

### 值解析（Formatter）

Vue 中通过 `formatter` prop（容器自动创建）或 `formatter.resolveSegment()` 获取段数据的完整解析：

```vue
<script setup>
import { useInject } from 'vue'
// 通过 VTimelineContainer 注入的 formatter 访问值解析
</script>

<template>
  <VTimelineContainer
    @seg-changed="({ startSeconds, endSeconds, startFormatted, startFormattedSec }) => {
      console.log(startFormattedSec, '→', endSeconds, '秒')
    }"
  />
</template>
```

见下方「值解析系统」章节中 `resolve()` / `resolveSegment()` 的详细说明。

### 使用方式

```vue
<script setup>
import { ref } from 'vue'
import { VTimelineContainer } from '@ufo/timeline-track/vue'

const tracks = ref([
  {
    id: 'track1', label: '功能开发', start: '0', end: '24',
    segments: [
      { id: 'seg1', start: 8, end: 12, label: '前端', color: '#3498db' },
      { id: 'seg2', start: 13, end: 17, label: '后端', color: '#2ecc71' },
    ],
  },
])
</script>

<template>
  <VTimelineContainer
    v-model="tracks"
    direction="horizontal"
    :step="0.5"
    type="time"
  />
</template>
```

### VTimelineContainer Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `Array` | `[]` | v-model 绑定的轨道数据 |
| `direction` | `'horizontal'\|'vertical'` | `'horizontal'` | 布局方向 |
| `axisMode` | `'per-track'\|'shared'` | `'per-track'` | 轴模式 |
| `type` | `'time'\|'number'` | `'time'` | 值类型 |
| `unit` | `string` | `'hour'` | 单位（hour/min/sec 或自定义 %/px 等） |
| `step` | `Number\|String` | `undefined` | 容器级默认步长 |
| `sharedStart` | `Number\|String` | `undefined` | 共享轴起始 |
| `sharedEnd` | `Number\|String` | `undefined` | 共享轴结束 |
| `sharedClipRange` | `Boolean` | `false` | 共享轴裁剪模式 |
| `zoomStart` | `Number\|String` | `undefined` | 缩放起始 |
| `zoomEnd` | `Number\|String` | `undefined` | 缩放结束 |
| `editable` | `Boolean` | `true` | 可编辑 |
| `deletable` | `Boolean` | `true` | 可删除 |
| `creatable` | `Boolean` | `true` | 可创建 |
| `clearable` | `Boolean` | `true` | 可清空 |
| `copyable` | `Boolean` | `true` | 可复制 |
| `borderless` | `Boolean` | `false` | 共享轴无边框模式 |
| `defaultColor` | `String` | `'#5c9ce6'` | 段默认颜色 |
| `globalRadius` | `String` | `'0'` | 全局圆角 |
| `selectionMode` | `Boolean` | `false` | 点击选中模式 |
| `tooltipPos` | `String` | `'top-center'` | Tooltip 位置（side-align） |
| `labelH` | `'top'\|'bottom'` | `'top'` | 横向轴标签位置 |
| `labelV` | `'left'\|'right'` | `'left'` | 纵向轴标签位置 |
| `axisLabel` | `String` | `undefined` | 共享轴自定义标签 |
| `loc-*` | `String` | locale 默认值 | 所有 `loc-*` 属性，如 `loc-unnamed`, `loc-cancel` |

### VTimelineContainer Events

| Event | Payload | 说明 |
|---|---|---|
| `update:modelValue` | `tracks[]` | v-model 同步 |
| `seg-changed` | `{ trackId, id, start, end, startSeconds, endSeconds, startFormatted, startFormattedSec, durationSeconds, … }` | 段变更完成（detail 含完整解析字段） |
| `seg-created` | `{ trackId, segment: { id, start, end, label, color, startSeconds, endSeconds, startFormatted, … } }` | 新段创建（segment 对象含完整解析字段） |
| `seg-deleted` | `{ trackId, id }` | 段删除 |

### VTimelineTrack Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `track` | `Object` | required | 轨道数据 |
| `vertical` | `Boolean` | `false` | 纵向模式 |
| `step` | `Number` | `0` | 步长 |
| `minDuration` | `Number` | `0` | 最小段长度 |
| `rangeStart` | `Number` | `0` | 范围起始 |
| `rangeEnd` | `Number` | `24` | 范围结束 |
| `formatter` | `Object` | `null` | Formatter 实例 |
| `locale` | `Object` | `null` | Locale 对象（不传则从容器 inject） |
| `editable/deletable/creatable/clearable/copyable` | `Boolean` | `true` | CRUD 权限 |
| `maxSegments` | `Number` | `0` | 最大段数（0=无限制） |
| `defaultColor` | `String` | `'#5c9ce6'` | 默认段颜色 |
| `labelH/labelV` | `String` | `'top'/'left'` | 标签位置 |
| `tooltipPos` | `String` | `'top-center'` | Tooltip 位置 |
| `globalRadius` | `String` | `'0'` | 段圆角 |
| `selectionMode` | `Boolean` | `false` | 选中模式 |
| `sharedClipRange` | `Boolean` | `false` | 共享轴裁剪 |
| `sharedStart/sharedEnd` | `Number` | `0/24` | 共享轴范围 |
| `zoomStart/zoomEnd` | `Number` | `null` | 缩放范围 |

### VTimelineTrack Events

| Event | Payload | 说明 |
|---|---|---|
| `seg-change` | `{ trackId, id, start, end }` | 段变更 |
| `seg-delete` | `{ trackId, id }` | 段删除 |
| `seg-create` | `{ trackId, start, end, color? }` | 段创建 |

### VTimelineSegment Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `segment` | `Object` | required | 段数据 `{ id, start, end, label, color, tooltip }` |
| `pixelLeft/Top/Width/Height` | `Number` | `0` | 像素位置（由父轨道计算） |
| `hidden` | `Boolean` | `false` | 视觉隐藏 |
| `step` | `Number` | `0` | 步长吸附 |
| `minDuration` | `Number` | `0` | 最小持续长度 |
| `editable/deletable/copyable` | `Boolean` | `true` | CRUD 权限 |
| `vertical` | `Boolean` | `false` | 纵向模式 |
| `rangeStart/rangeEnd` | `Number` | `0/24` | 轨道范围 |
| `formatter` | `Object` | `null` | Formatter |
| `locale` | `Object` | `null` | Locale（不传则 inject） |
| `tooltipPos` | `String` | `'top-center'` | Tooltip 位置 |
| `globalRadius` | `String` | `'0'` | 圆角 |
| `selectionMode` | `Boolean` | `false` | 选中模式 |

### VTimelineSegment Events

| Event | Payload | 说明 |
|---|---|---|
| `change` | `{ id, start, end }` | 拖拽结束后最终位置 |
| `delete` | `id` | 删除按钮点击 |
| `segment-change` | `{ id, start, end }` | 拖拽中实时位置 |
| `context-menu` | `{ action, segment, ... }` | 右键菜单操作 |

### 使用快捷键

| 操作 | Windows/Linux | macOS |
|---|---|---|
| 缩放 | Ctrl + 滚轮 | ⌘ + 滚轮 |
| 复制拖拽 | Ctrl + 拖拽段 | ⌘ + 拖拽段 |

### 右键菜单功能

| 菜单项 | 作用范围 | 权限守卫 |
|---|---|---|
| 修改属性 | 轨道/段 | 对应 `editable` |
| 复制段 | 段 | `segment.copyable` |
| 复制轨道 | 轨道 | `track.copyable` |
| 清空时间段 | 轨道 | `track.clearable` |
| 删除轨道/段 | 轨道/段 | 对应 `deletable` |
| 粘贴段 | 轨道（右键位置） | `track.creatable` |
| 粘贴为新轨道 | 轨道 | `container.creatable` |
| 覆盖粘贴到本轨道 | 轨道 | `track.deletable` |

### 多容器注意事项

Tooltip / ContextMenu / Modal 使用 **模块级单例**（与 lib 包一致），同一页面有多个 `VTimelineContainer` 实例时共享同一套弹出层。行为与 Custom Elements 版本完全相同。

## 设计文档

重要架构变更方案在组件包根目录的 `DESIGN.md` 中记录。当前活跃方案：

| 组件 | 文档 | 说明 |
|---|---|---|
| `timeline-track` | [`DESIGN.md`](packages/timeline-track/DESIGN.md) | 通用范围标尺抽象方案 —— 从时间写死架构抽象为可插拔的 ValueFormatter 系统，支持 `type="time"` / `type="number"` 和多种 unit |
