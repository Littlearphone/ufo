# timeline-track 设计文档

## 通用范围标尺抽象方案

### 背景

`<time-line-track>` 组件最初设计为时间线场景，内部大量使用 `fmtTime()`（硬编码为 `HH:MM` 格式）和以小时为基准的刻度算法。这导致：

- 属性 `start="9.5" end="17"` 是纯数字小时，但轴显示却是 `09:30 – 17:00`，模型与视图不一致
- 无法用于纯数值场景（百分比、像素值等）\
- 无法支持秒级精度
- 自然语言输入（`"09:30"`、`"30min"`、`"2h"`）不支持

### 目标

将组件从「时间写死」架构抽象为「通用范围标尺」，支持可插拔的格式化/解析/刻度策略，同时完全向后兼容。

## 使用示例

以下示例覆盖所有模式，可直接在 HTML 中使用。

### 一、时间模式（默认）

**1. 标准时间线（兼容旧用法）**
```html
<time-line-container>
  <time-line-track label="早班" start="0" end="24" step="0.5">
    <time-line-segment start="6"  end="9"  label="早班值守" color="#27ae60"></time-line-segment>
    <time-line-segment start="14" end="17" label="中班"     color="#2980b9"></time-line-segment>
  </time-line-track>
  <time-line-track label="夜班" start="18" end="24">
    <time-line-segment start="20" end="23" label="夜巡" color="#8e44ad"></time-line-segment>
  </time-line-track>
</time-line-container>
```
`type="time" unit="hour"` 是默认值，不设置时行为与旧版完全一致。

**2. 自然时间输入**
```html
<time-line-container>
  <time-line-track label="施工" start="09:00" end="17:00" step="30min">
    <time-line-segment start="09:00" end="12:00" label="上午" color="#e67e22"></time-line-segment>
    <time-line-segment start="13:30" end="17:00" label="下午" color="#f39c12"></time-line-segment>
  </time-line-track>
</time-line-container>
```
`"09:00"`、`"30min"` 等自然格式自动识别，无需计算小数。

**3. 秒级精度**
```html
<time-line-container type="time" unit="second">
  <time-line-track label="短时测试" start="00:00" end="00:30" step="5sec">
    <time-line-segment start="00:00" end="00:15" label="前半段" color="#16a085"></time-line-segment>
    <time-line-segment start="00:15" end="00:30" label="后半段" color="#1abc9c"></time-line-segment>
  </time-line-track>
</time-line-container>
```
段内显示 `"00:00"` 短格式，Tooltip 显示 `"00:00:00 – 00:15:00"` 完整精度。

### 二、分钟模式

**4. 24 小时用分钟表示**
```html
<time-line-container type="time" unit="minute">
  <time-line-track label="日程" start="0min" end="1440min">
    <time-line-segment start="480min" end="720min" label="工作" color="#27ae60"></time-line-segment>
    <time-line-segment start="720min" end="780min" label="午休" color="#e67e22"></time-line-segment>
  </time-line-track>
</time-line-container>
```
轴显示仍为 `"08:00"` 时间格式，但输入统一用分钟。也可混合：
```html
<time-line-track label="日程" start="0" end="1440">
  <!-- 纯数字 480 等价于 "480min"，也等价于 "08:00" -->
  <time-line-segment start="480" end="720" label="工作" color="#27ae60"></time-line-segment>
</time-line-track>
```

**5. 一小时内的精细时段**
```html
<time-line-container type="time" unit="second">
  <time-line-track label="录制片段" start="0sec" end="3600sec" step="15sec">
    <time-line-segment start="0sec"    end="600sec"  label="开场"  color="#3498db"></time-line-segment>
    <time-line-segment start="600sec"  end="2400sec" label="正文"  color="#2ecc71"></time-line-segment>
    <time-line-segment start="2400sec" end="3600sec" label="收尾"  color="#e74c3c"></time-line-segment>
  </time-line-track>
</time-line-container>
```

### 三、数值模式

**6. 百分比进度**
```html
<time-line-container type="number" unit="%">
  <time-line-track label="开发进度" start="0%" end="100%" step="10%">
    <time-line-segment start="0%"  end="30%"  label="需求" color="#3498db"></time-line-segment>
    <time-line-segment start="30%" end="80%"  label="开发" color="#2ecc71"></time-line-segment>
    <time-line-segment start="80%" end="100%" label="测试" color="#e74c3c"></time-line-segment>
  </time-line-track>
</time-line-container>
```

**7. 像素坐标**
```html
<time-line-container type="number" unit="px">
  <time-line-track label="图层左" start="0px" end="800px">
    <time-line-segment start="0px"   end="200px" label="头像" color="#9b59b6"></time-line-segment>
    <time-line-segment start="250px" end="600px" label="内容" color="#2ecc71"></time-line-segment>
  </time-line-track>
</time-line-container>
```

**8. 温度计（摄氏度）**
```html
<time-line-container type="number" unit="°C">
  <time-line-track label="气温监测" start="-10°C" end="40°C" step="5°C">
    <time-line-segment start="-10°C" end="0°C"   label="严寒" color="#3498db"></time-line-segment>
    <time-line-segment start="0°C"   end="15°C"  label="凉爽" color="#2ecc71"></time-line-segment>
    <time-line-segment start="15°C"  end="30°C"  label="温暖" color="#e67e22"></time-line-segment>
    <time-line-segment start="30°C"  end="40°C"  label="炎热" color="#e74c3c"></time-line-segment>
  </time-line-track>
</time-line-container>
```
轴显示 `-10 °C`、`0 °C`、`5 °C`... 支持负数范围，段可拖拽调整区间。

### 四、API 调用

`addTrack` 和 `addSegment` 的参数直接透传给 `setAttribute`，无需限制类型：
```js
// 字符串
container.addTrack("早班", "09:00", "17:00", { step: "30min" })

// 数字（旧兼容）
container.addTrack("早班", 9, 17, { step: 0.5 })

// 混合
container.addTrack("测试", "0min", "60min")
container.addTrack("测试", 100, "200px")

// 段同理
track.addSegment("09:00", "12:00", { label: "上午", color: "#27ae60" })
track.addSegment(9, 12, { label: "上午", color: "#27ae60" })
```

### 五、右键编辑

所有模式下右键 → 修改属性 都会自动适配：
- `type="time"` → 显示 `<input type="time">` 时间选择器
- `type="number"` → 显示 `<input type="number">` 数字输入框
- 保存时统一通过 `formatter.parse()` 解析，输入 `"09:00"`、`"9"`、`"30min"` 均可

### 核心架构

```
ValueFormatter（接口，新增 formatter.js）
  ↑  implements
TimeFormatter  ──  type="time"（默认）
NumberFormatter ──  type="number"
```

- **`type` 属性**（容器级，`"time"` | `"number"`）：决定显示模式和刻度策略
- **`unit` 属性**（容器级，`"hour"` | `"minute"` | `"second"` | `""`）：决定归一化单位和自然语言解析基准

### 容器配置

```html
<!-- 时间模式，小时单位（默认，完全向后兼容） -->
<time-line-container type="time" unit="hour">
  <time-line-track start="09:00" end="17:00"></time-line-track>
</time-line-container>

<!-- 时间模式，分钟单位 -->
<time-line-container type="time" unit="minute">
  <time-line-track start="0min" end="1440min"></time-line-track>
</time-line-container>

<!-- 数值模式 -->
<time-line-container type="number" unit="px">
  <time-line-track start="0px" end="500px"></time-line-track>
</time-line-container>
```

### 解析规则（formatter.parse）

按序尝试以下格式：

| 格式 | 示例 | 说明 |
|---|---|---|
| `HH:MM` / `HH:MM:SS` | `"09:30"`, `"14:30:15"` | 仅 `type=time` |
| `Xh` / `Xmin` / `Xsec` | `"2h"`, `"30min"`, `"15sec"` | 自然单位，按 unit 转换 |
| 纯数字 | `"9.5"`, `"100"` | `parseFloat` 回退 |
| 数字+单位 | `"100px"`, `"50%"` | 提取数值，type=number 时有效 |

**转换示例**（同一输入在不同 unit 下的归一化结果）：

| 输入 | unit=hour | unit=minute | unit=second |
|---|---|---|---|
| `"09:30"` | 9.5 | 570 | 34,200 |
| `"30min"` | 0.5 | 30 | 1,800 |
| `"2h"` | 2 | 120 | 7,200 |

### 显示格式（formatter.format）

`context` 参数控制精度层级：

| type | unit | context=axis/segment | context=tooltip/editor |
|---|---|---|---|
| time | hour/min | `"09:30"` | `"09:30"` |
| time | second | `"09:30"` | `"09:30:15"` |
| number | "" | `"100"` | `"100"` |
| number | "px" | `"100 px"` | `"100 px"` |

段内空间有限时自动省略秒，Tooltip 始终完整精度。

### niceSteps 候选集

| type | unit | 刻度候选数组 |
|---|---|---|
| time | hour | `[0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 24, 48]` |
| time | minute | `[1, 2, 5, 10, 15, 30, 60, 120, 180, 360, 720, 1440]` |
| time | second | `[1, 5, 10, 15, 30, 60, 120, 300, 600, 1800, 3600, 7200, 14400, 43200, 86400]` |
| number | 任意 | `[0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, ...]` |

### 编辑框

编辑框根据 `formatter.inputAttrs(val)` 动态渲染：
- `type=time`：`<input type="time">`
- `type=number`：`<input type="number">`
- fallback：`<input type="text">`（手动输入自然单位）

保存时通过 `formatter.parse()` 统一解析。

### 文件改动清单

| 文件 | 改动内容 |
|---|---|
| **新增** `formatter.js` | ValueFormatter 基类 + TimeFormatter + NumberFormatter + createFormatter 工厂 |
| `utils.js` | `fmtTime` 标记为 `@deprecated`（保留，不再被库代码使用） |
| `TimeContainer.js` | 添加 `type` / `unit` 属性 + `getFormatter()`；轴尺用 formatter 渲染 |
| `TimeTrack.js` | getter 用 `formatter.parse()`；`_drawGrid` 用 `formatter.format()` + `formatter.niceStep()` |
| `TimeSegment.js` | getter 用 `formatter.parse()`；`_buildDOM`、确认弹窗用 `formatter.formatRange()` |
| `contextmenu.js` | 编辑框用 `formatter.inputAttrs()` 动态渲染；保存时用 `formatter.parse()` |
| `tooltip.js` | Tooltip 用 `formatter.format(val, 'tooltip')` |

### 实现阶段

#### P0：抽象层（低风险，纯新增）
- 创建 `formatter.js`
- 实现 `ValueFormatter` 接口 + `TimeFormatter`（完全等价当前行为）
- 零行为变化

#### P1：集成替换（低风险，逐文件）
- 逐文件替换为 formatter 调用
- 默认 `type="time" unit="hour"` 行为完全不变
- 每替换一个文件单独验证

#### P2：新模式（中风险，新功能）
- 实现 `NumberFormatter`
- 自然单位解析支持
- `type="number"` 和 `unit="minute"` / `unit="second"` 端到端验证
- 编辑框动态渲染

### API 兼容性

`addTrack(label, start, end, opts)` 和 `addSegment(start, end, opts)` 的参数直接 `setAttribute` 透传，无需限制类型：

```js
addTrack("早班", "09:00", "17:00")  // OK
addTrack("早班", 9, 17)             // OK
addTrack("早班", "540min", 9)       // OK（混合格式）
```

---

*方案制定日期：2026-07-05，当前代码 base：master@9c8ef70*

## 实现状态（2026-07-05）

### ✅ P0：抽象层（已完成）
- `formatter.js` — `ValueFormatter` 基类 + `TimeFormatter`（完全等价旧行为）
- 已通过 lib 和 demo 构建验证

### ✅ P1：集成替换（已完成）
| 文件 | 状态 |
|---|---|
| `TimeContainer.js` | 添加 `type`/`unit` 属性、`getFormatter()`、轴尺用 formatter |
| `TimeTrack.js` | getter 用 `formatter.parse()`、grid 用 `formatter.format()` |
| `TimeSegment.js` | getter/段内时间/确认弹窗用 formatter |
| `contextmenu.js` | 编辑框用 `formatter.inputAttrs()` 动态渲染 |
| `tooltip.js` | Tooltip 用 `formatter.format(val, 'tooltip')` |
| `utils.js` | `fmtTime` 标记为 `@deprecated`（保留向后兼容） |

> 默认 `type="time" unit="hour"` 行为零变化。

### 🔄 P2：新模式（已实现，待端到端验证）
- `NumberFormatter` — 纯数值模式，智能小数位，等比刻度
- 自然单位解析 — `"2h"`、`"30min"`、`"15sec"` 全模式通用
- `unit="minute"` / `unit="second"` 在 TimeFormatter 中支持
- 编辑框根据 formatter 动态切换 `type="time"` / `type="number"` / `type="text"`

### P2 待验证场景
- [x] Vue demo 新增第 5 标签页「模式示例」
- [ ] `type="number" unit="%"` — 百分比标尺（demo 已添加代码）
- [ ] `type="number" unit="px"` — 像素值标尺（demo 已添加代码）
- [ ] `type="time" unit="minute"` — 分钟归一化（demo 已添加代码）
- [ ] `type="time" unit="second"` — 秒级精度（demo 已添加代码）
