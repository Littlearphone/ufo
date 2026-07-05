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
| **新增** `formatter.js` | ValueFormatter 基类，TimeFormatter，NumberFormatter |
| `utils.js` | 保留 `fmtTime` 委托给 TimeFormatter；新增 `parseTimeValue` |
| `TimeContainer.js` | 添加 `type` / `unit` 属性；创建 formatter 实例；暴露 `getFormatter()` |
| `TimeTrack.js` | getter 用 `formatter.parse()`；`_drawGrid` 用 `formatter.format()`；`_niceStep` 委托 formatter |
| `TimeSegment.js` | getter 用 `formatter.parse()`；`_buildDOM` 用 `formatter.format()` |
| `contextmenu.js` | 编辑框用 `formatter.inputAttrs()` 动态渲染 |
| `tooltip.js` | 时间显示用 `formatter.format(val, 'tooltip')` |

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
