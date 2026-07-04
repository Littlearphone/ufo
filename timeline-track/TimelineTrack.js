/**
 * TimelineTrack.js — 原生自定义元素时间线轨道组件
 * ================================================================
 * 零框架依赖，基于 Custom Elements v1 + Pointer Events。
 *
 * ── 组件架构 ──────────────────────────────────────────────
 *
 *   <time-line-container>  顶层容器，管理 direction（横向 / 纵向）布局
 *   <time-line-track>      单条轨道，独立时间范围 (start / end)，网格刻度
 *   <time-line-segment>    时间段，可拖拽移动、两端调长度、悬停删除
 *
 *   继承关系：Segment 必须置于 Track 内，Track 必须置于 Container 内。
 *
 * ── 功能对照 ──────────────────────────────────────────────
 *
 *   横向 / 纵向           container 的 direction="horizontal" | "vertical"
 *   不同时间范围           每条 track 独立 start / end (如 0~24 表示一天)
 *   多段不连续             同一 track 内放多个 segment，自动碰撞检测
 *   拖拽移动               拖拽段体 → 约束在左右相邻段的空白区间内
 *   调节长度               拖拽段体两端的白色手柄（悬停时才显示）
 *   随意创建               在轨道空白处按下并拖动即可新建时间段
 *   删除                   悬停出现红色 × 按钮，点击即删
 *
 * ── 事件系统（全部冒泡至 document） ─────────────────────
 *
 *   segment-change          拖动中连续触发    detail: { segment, start, end }
 *   segment-changed         拖动结束          detail: { segment, start, end }
 *   segment-created         新段创建完成      detail: { segment }
 *   segment-before-deleted  删除前（可取消）  detail: { segment }
 *   segment-deleted         删除后            detail: { segment }
 *
 * ── 用法 ──────────────────────────────────────────────────
 *
 *   <!-- 声明式 -->
 *   <time-line-container direction="horizontal">
 *     <time-line-track label="前门摄像头" start="0" end="24" step="0.5">
 *       <time-line-segment start="8"  end="12" label="上午" color="#4caf50"></time-line-segment>
 *       <time-line-segment start="14" end="18" label="下午" color="#ff9800"></time-line-segment>
 *     </time-line-track>
 *   </time-line-container>
 *
 *   <!-- 编程式 -->
 *   <script>
 *     const container = document.querySelector('time-line-container');
 *     const track = container.addTrack('新轨道', 0, 24, { step: 0.25 });
 *     track.addSegment(10, 14, { label: '录像片段', color: '#e91e63' });
 *   </script>
 *
 *   <!-- 测试页：views/test.html — 在浏览器中直接打开即可体验 -->
 *
 * @version 1.0.0
 */
(function () {
  'use strict';

  // =============================================================
  //  默认样式（一次性注入 <head>）
  // =============================================================
  const CSS = /* css */ `
    /* ---- Container ---- */
    time-line-container {
      display: flex;
      gap: var(--tlc-gap, 10px);
      background: var(--tlc-bg, #f8f9fb);
      border: 1px solid var(--tlc-border, #dfe3e8);
      border-radius: var(--tlc-radius, 0);
      padding: var(--tlc-padding, 14px 16px);
      --tlc-bg: #f8f9fb;
      --tlc-border: #dfe3e8;
      --tlc-radius: 0;
      --tlc-padding: 14px 16px;
      --tlc-gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 13px;
      color: #333;
    }
    time-line-container[方向="vertical"],
    time-line-container[direction="vertical"] {
      flex-direction: row;
    }
    time-line-container:not([direction="vertical"]):not([方向="vertical"]) {
      flex-direction: column;
    }

    /* ---- Track ---- */
    time-line-track {
      display: block;
      --tlt-header-w: 110px;
      --tlt-row-h: 70px;
      --tlt-seg-top: 18px;
      --tlt-seg-bottom: 0px;
    }
    time-line-track .tlt-row {
      display: flex;
      align-items: stretch;
      background: #fff;
      border: 1px solid #e5e8ec;
      border-radius: 0;
      overflow: visible;
      min-height: var(--tlt-row-h);
    }
    /* vertical 模式：track 竖过来 */
    time-line-track.vertical {
      display: flex;
      flex-direction: column;
    }
    time-line-track.vertical .tlt-row {
      flex-direction: column;
      flex: 1;
      width: 150px;
      min-height: 280px;
    }

    time-line-track .tlt-head {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: var(--tlt-header-w);
      min-width: var(--tlt-header-w);
      padding: 6px 10px;
      background: #fafbfc;
      border-right: 1px solid #e5e8ec;
      gap: 2px;
      user-select: none;
    }
    time-line-track.vertical .tlt-head {
      width: auto;
      min-width: auto;
      border-right: none;
      border-bottom: 1px solid #e5e8ec;
      padding: 5px 8px;
    }

    time-line-track .tlt-head-label {
      font-weight: 600;
      font-size: 12px;
      color: #37474f;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    time-line-track .tlt-head-range {
      font-size: 10px;
      color: #90a4ae;
    }

    time-line-track .tlt-body {
      position: relative;
      flex: 1;
      min-width: 0;
      background: #fdfdfd;
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='1.8' fill='%23444'/%3E%3Cline x1='10' y1='2' x2='10' y2='6' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='10' y1='14' x2='10' y2='18' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='2' y1='10' x2='6' y2='10' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='14' y1='10' x2='18' y2='10' stroke='%23444' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 10 10, crosshair;
      touch-action: none;
    }
    time-line-track.vertical .tlt-body {
      min-width: auto;
      min-height: 0;
    }

    time-line-track .tlt-grid-canvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    time-line-track .tlt-seg-area {
      position: absolute;
      top: var(--tlt-seg-top);
      bottom: var(--tlt-seg-bottom);
      left: 0;
      right: 0;
    }
    time-line-track.vertical .tlt-seg-area {
      top: 0;
      bottom: 0;
      left: 36px;
      right: 0;
    }

    /* ---- Segment ---- */
    time-line-segment {
      position: absolute;
      display: block;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      z-index: 2;
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23444' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E") 10 10, grab;
      overflow: visible;              /* 允许删除按钮/tooltip 超出边界 */
    }
    time-line-segment:hover { z-index: 4; }
    time-line-segment.dragging,
    time-line-segment.resizing { z-index: 12; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' stroke='%23fff' stroke-width='3.5' fill='none' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M10 2l-4 4h3v3H6V6L2 10l4 4v-3h3v3H6l4 4 4-4h-3v-3h3v3l4-4-4-4v3h-3V6h3z' fill='%23444' stroke='none'/%3E%3C/svg%3E") 10 10, grabbing; }

    time-line-segment .tls-bar {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;               /* 只裁剪 bar 内文字，不影响手柄/按钮 */
      transition: filter 0.12s, box-shadow 0.12s, border-radius 0.15s;
    }
    time-line-segment:hover .tls-bar       { filter: brightness(1.06); }
    time-line-segment.dragging .tls-bar,
    time-line-segment.resizing .tls-bar    { filter: brightness(1.10); box-shadow: 0 2px 14px rgba(0,0,0,.22); }

    /* ── 拖拽手柄：热区 14px（透明） → 内含 4px 视觉条 ── */
    time-line-segment .tls-hdl {
      position: absolute;
      z-index: 3;
      /* 热区完全透明，仅通过子元素 .tls-hdl-bar 展示视觉条 */
    }
    time-line-segment .tls-hdl-left  { left: -2px; top: 0; bottom: 0; width: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='18,5 7,12 18,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }
    time-line-segment .tls-hdl-right { right: -2px; top: 0; bottom: 0; width: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='6,5 17,12 6,19' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ew-resize; }

    time-line-segment .tls-hdl-bar {
      position: absolute;
      top: 20%;
      bottom: 20%;
      width: 4px;
      background: linear-gradient(to right, rgba(0,0,0,0.04), rgba(255,255,255,0.10));
      border-radius: 0;
      opacity: 0;
      transition: opacity .14s;
      pointer-events: none;           /* 点击穿透到父级 .tls-hdl */
    }
    time-line-segment .tls-hdl-left  .tls-hdl-bar { left: 0; width: 4px; border-right: 1px solid rgba(0,0,0,0.08); }
    time-line-segment .tls-hdl-right .tls-hdl-bar { right: 0; width: 4px; border-left: 1px solid rgba(0,0,0,0.08); }
    time-line-segment:hover .tls-hdl-bar              { opacity: 1; }
    time-line-segment.dragging .tls-hdl-bar,
    time-line-segment.resizing .tls-hdl-bar           { opacity: 0; }

    /* 纵向模式手柄：显式覆盖 top/bottom 防止基础选择器导致两个手柄都贴在 top:0 处重叠 */
    time-line-track.vertical time-line-segment .tls-hdl-left  { left: 0; right: 0; top: -2px; bottom: auto; width: auto; height: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='5,18 12,7 19,18' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }
    time-line-track.vertical time-line-segment .tls-hdl-right { left: 0; right: 0; bottom: -2px; top: auto; width: auto; height: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='5,6 12,17 19,6' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }

    /* ── 内容 ── */
    time-line-segment .tls-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 11px;
      line-height: 1.25;
      text-shadow: 0 1px 2px rgba(0,0,0,.25);
      pointer-events: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 14px;
      min-width: 0;
    }
    time-line-segment .tls-label { font-weight: 600; }
    time-line-segment .tls-time  { font-size: 10px; opacity: .82; }

    /* ── 删除按钮（在 .tls-bar 外部，不受 overflow:hidden 裁剪） ── */
    time-line-segment .tls-del {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ef5350;
      color: #fff;
      border: 2px solid #fff;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity .14s, transform .14s;
      z-index: 15;
      padding: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,.2);
    }
    time-line-segment .tls-del:hover { transform: scale(1.15); }
    time-line-segment:hover .tls-del { opacity: 1; }
    time-line-segment.dragging .tls-del,
    time-line-segment.resizing .tls-del { opacity: 0; }

    /* ── Tooltip（全局 portal，append 到 body，position:fixed 避免被祖先裁剪） ── */
    .tls-global-tip {
      position: fixed;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s;
      background: rgba(30,35,42,.92);
      color: #fff;
      padding: 5px 9px;
      border-radius: 0;
      font-size: 11px;
      line-height: 1.3;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
      transform: translate(-50%, -100%);
    }
    .tls-global-tip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: rgba(30,35,42,.92);
    }
    .tls-global-tip.show { opacity: 1; }
    .tls-global-tip-label { font-weight: 600; }
    .tls-global-tip-time  { opacity: .75; font-size: 10px; }
    /* 圆角全局默认值 */
    time-line-container { --tls-global-radius: 0; }
    /* 保留旧 .tls-tip 选择器以防引用，但实际改用 global portal */
    time-line-segment .tls-tip {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30,35,42,.92);
      color: #fff;
      padding: 5px 9px;
      border-radius: 0;
      font-size: 11px;
      line-height: 1.3;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s;
      z-index: 20;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
    }
    time-line-segment .tls-tip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: rgba(30,35,42,.92);
    }
    time-line-segment .tls-tip.show { opacity: 1; }
    time-line-segment.dragging .tls-tip,
    time-line-segment.resizing .tls-tip { opacity: 0 !important; }
    time-line-segment .tls-tip-label { font-weight: 600; }
    time-line-segment .tls-tip-time  { opacity: .75; font-size: 10px; }

    
    /* ---- Ghost（拖拽创建时的半透明预览） ---- */
    .tlt-ghost {
      position: absolute;
      background: rgba(66,133,244,.18);
      border: 2px dashed #4285f4;
      border-radius: 0;
      pointer-events: none;
      z-index: 9;
    }

	  
    /* ---- Shared-axis ruler（粘性轴尺，横向共享模式时显示在容器顶部） ---- */
    .tlc-axis-ruler {
      display: flex;
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--tlc-bg, #f8f9fb);
      border-radius: 0;
      margin-bottom: 0;
    }
    .tlc-axis-ruler .tlc-axis-spacer {
      width: var(--tlt-header-w, 110px);
      min-width: var(--tlt-header-w, 110px);
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
    .tlc-axis-ruler .tlc-axis-range {
      font-size: 10px;
      color: #90a4ae;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tlc-axis-ruler .tlc-axis-body {
      flex: 1;
      min-width: 0;
      position: relative;
      height: 22px;
    }
    .tlc-axis-ruler .tlc-axis-canvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
      width: 100%;
      height: 100%;
    }
    /* ---- 纵向模式轴尺（贴在左侧，标签朝右） ---- */
    time-line-container[方向="vertical"] .tlc-axis-ruler,
    time-line-container[direction="vertical"] .tlc-axis-ruler {
      top: auto;
      left: 0;
      flex-direction: column;
      width: 44px;
      min-width: 44px;
    }
    time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-spacer,
    time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-spacer {
      width: auto;
      min-width: auto;
      height: 28px;
      min-height: 28px;
      padding: 0 4px;
      border-bottom: 1px solid #e0e3e8;
    }
    time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-range,
    time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-range {
      display: none;
    }
    time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-body,
    time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-body {
      height: auto;
      min-height: 0;
      flex: 1;
    }
    time-line-container[方向="vertical"] .tlc-axis-ruler .tlc-axis-canvas,
    time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-canvas {
      width: 100%;
      height: 100%;
    }
`;

  let _cssInjected = false;
  function ensureCSS() {
    if (_cssInjected) return;
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    _cssInjected = true;
  }

  // =============================================================
  //  全局 Tooltip（portal 到 body，position:fixed 避免祖先 overflow 裁剪）
  // =============================================================
  let _globalTip = null;
  function _getGlobalTip() {
    if (_globalTip) return _globalTip;
    _globalTip = document.createElement('div');
    _globalTip.className = 'tls-global-tip';
    document.body.appendChild(_globalTip);
    return _globalTip;
  }
  let _tipHideTimer = 0;
  function _showGlobalTip(seg) {
    clearTimeout(_tipHideTimer);
    const tip = _getGlobalTip();
    const rect = seg.getBoundingClientRect();
    tip.innerHTML =
      `<div class="tls-global-tip-label">${esc(seg.label) || '未命名'}</div>
       <div class="tls-global-tip-time">${fmtTime(seg.start)} – ${fmtTime(seg.end)}</div>`;
    // 定位在段上方居中
    tip.style.left = (rect.left + rect.width / 2) + 'px';
    tip.style.top  = (rect.top - 6) + 'px';
    tip.classList.add('show');
  }
  function _hideGlobalTip() {
    _tipHideTimer = setTimeout(() => {
      const tip = _getGlobalTip();
      tip.classList.remove('show');
    }, 120);
  }

  // =============================================================
  //  工具
  // =============================================================
  const clamp  = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const snap   = (v, step) => step ? Math.round(v / step) * step : v;

  function fmtTime(th, showMin) {
    if (th == null || isNaN(th)) return '--:--';
    const neg = th < 0;
    if (neg) th = -th;
    const h = Math.floor(th);
    const m = Math.round((th - h) * 60);
    if (m === 60) return `${neg ? '-' : ''}${String(h + 1).padStart(2, '0')}:00`;
    return `${neg ? '-' : ''}${String(h).padStart(2, '0')}:${showMin === false ? '00' : String(m).padStart(2, '0')}`;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s != null ? String(s) : '';
    return d.innerHTML;
  }

  // =============================================================
  //  TimeSegment  — 时间段
  // =============================================================
  class TimeSegment extends HTMLElement {
    constructor() {
      super();
      this._init = false;
      this._ptrActive = false;
      this._mode = null;        // 'move' | 'resize-left' | 'resize-right'
      this._ptr0 = 0;
      this._s0 = 0;
      this._e0 = 0;
      this._lo = 0;            // 左边界（时间值）
      this._hi = 0;            // 右边界（时间值）
      this._onMove = null;
      this._onUp = null;
    }

    /* ---- 属性 ---- */
    get start()    { return parseFloat(this.getAttribute('start')) || 0; }
    set start(v)   { this.setAttribute('start', String(Math.round(v * 1e4) / 1e4)); }
    get end()      { return parseFloat(this.getAttribute('end')) || 0; }
    set end(v)     { this.setAttribute('end',   String(Math.round(v * 1e4) / 1e4)); }
    get label()    { return this.getAttribute('label') || ''; }
    set label(v)   { this.setAttribute('label', v); }
    get color()    { return this.getAttribute('color') || '#5c9ce6'; }
    set color(v)   { this.setAttribute('color', v); }
    get radius()  { return this.getAttribute('radius') || '5px'; }
    set radius(v) { this.setAttribute('radius', v); }
    get tooltip() { return this.getAttribute('tooltip') || 'auto'; }
    set tooltip(v){ this.setAttribute('tooltip', v); }
    get duration() { return this.end - this.start; }

    get _track() {
      // 段落在 .tlt-seg-area 内，往上找 track
      let p = this.parentElement;
      while (p) {
        if (p.tagName === 'TIME-LINE-TRACK') return p;
        p = p.parentElement;
      }
      return null;
    }

    /* ---- 生命周期 ---- */
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this._buildDOM();
      this._bind();
    }

    static get observedAttributes() { return ['start', 'end', 'label', 'color', 'radius']; }

    attributeChangedCallback(name, _ov, nv) {
      if (!this._init) return;
      if (name === 'label' || name === 'color') {
        this._buildDOM();
      }
      if (name === 'radius') {
        // no-op: 全局圆角由容器 setGlobalRadius 统一控制
      }
      if (name === 'start' || name === 'end') {
        this._buildDOM();
        const t = this._track;
        if (t && t._positionOne) t._positionOne(this);
      }
    }

    /* ---- DOM ---- */
    _buildDOM() {
      const col = this.color;
      const darker = this._darken(col, 0.18);
      const c = this.closest('time-line-container');
      const r = (c && c._globalRadius != null) ? c._globalRadius : '0';
      this.innerHTML =
        `<div class="tls-hdl tls-hdl-left" data-role="hdl-left">
          <div class="tls-hdl-bar"></div>
        </div>
        <div class="tls-hdl tls-hdl-right" data-role="hdl-right">
          <div class="tls-hdl-bar"></div>
        </div>
        <div class="tls-bar" style="background:${col};border:1px solid ${darker};border-radius:${r};">
          <div class="tls-inner">
            ${this.label ? `<span class="tls-label">${esc(this.label)}</span>` : ''}
            <span class="tls-time">${fmtTime(this.start)} – ${fmtTime(this.end)}</span>
          </div>
        </div>
        <button class="tls-del" data-role="del" title="删除">&times;</button>`;
    }

    _bind() {
      this.addEventListener('pointerdown', e => this._onDown(e));
      this.addEventListener('click', e => {
        if (e.target.closest('[data-role="del"]')) {
          this._emitDelete(e);
        }
      });

      // Tooltip — 全局 portal，不受祖先 overflow 裁剪
      let _tipShown = false;
      this.addEventListener('mouseenter', () => {
        if (this._ptrActive) return;
        const mode = this.tooltip;
        if (mode === 'none') return;
        const truncated = this._isTruncated();
        if (mode === 'always' || truncated) {
          _showGlobalTip(this);
          _tipShown = true;
        }
      });
      this.addEventListener('mousemove', () => {
        if (_tipShown) _showGlobalTip(this);
      });
      this.addEventListener('mouseleave', () => {
        _hideGlobalTip();
        _tipShown = false;
      });
    }

    /* ---- Tooltip ---- */
    _showTooltip() {
      // 保留方法签名（兼容外部调用），委托给全局 portal
      if (this._ptrActive) return;
      const mode = this.tooltip;
      if (mode === 'none') return;
      const truncated = this._isTruncated();
      if (mode === 'always' || truncated) _showGlobalTip(this);
    }

    _hideTooltip() {
      _hideGlobalTip();
    }

    _isTruncated() {
      const label = this.querySelector(':scope > .tls-bar > .tls-inner > .tls-label');
      const time  = this.querySelector(':scope > .tls-bar > .tls-inner > .tls-time');
      // 任一文本溢出即认为截断
      if (label && label.scrollWidth > label.clientWidth + 1) return true;
      if (time  && time.scrollWidth  > time.clientWidth  + 1) return true;
      // .tls-inner 整体溢出检测
      const inner = this.querySelector(':scope > .tls-bar > .tls-inner');
      if (inner && inner.scrollWidth > inner.clientWidth + 1) return true;
      return false;
    }

    /* ---- 拖拽 ---- */
    _onDown(e) {
      if (e.target.closest('[data-role="del"]')) return; // 让 click 处理
      if (e.button !== 0) return;

      const hdl = e.target.closest('[data-role]');
      if (hdl && hdl.dataset.role === 'hdl-left')  this._mode = 'resize-left';
      else if (hdl && hdl.dataset.role === 'hdl-right') this._mode = 'resize-right';
      else this._mode = 'move';

      this._ptrActive = true;
      this.classList.add(this._mode.startsWith('resize') ? 'resizing' : 'dragging');
      this._ptr0 = this._client(e);
      this._s0 = this.start;
      this._e0 = this.end;
      this._computeBounds();
      this.setPointerCapture(e.pointerId);

      this._onMove = ev => this._onMove_(ev);
      this._onUp   = ev => this._onUp_(ev);
      this.addEventListener('pointermove', this._onMove);
      this.addEventListener('pointerup',   this._onUp);
      this.addEventListener('pointercancel', this._onUp);
      this.addEventListener('lostpointercapture', this._onUp);

      e.preventDefault();
      e.stopPropagation();
    }

    _onMove_(e) {
      if (!this._ptrActive) return;
      const t = this._track;
      if (!t) return;

      const dp = this._client(e) - this._ptr0;
      const dt = t.px2Time(dp);
      const step = t.step || 0;
      const minW = t.minDur;

      if (this._mode === 'resize-left') {
        let s = this._s0 + dt;
        s = snap(s, step);
        s = clamp(s, this._lo, this._e0 - minW);
        this.start = s;
      } else if (this._mode === 'resize-right') {
        let e = this._e0 + dt;
        e = snap(e, step);
        e = clamp(e, this._s0 + minW, this._hi);
        this.end = e;
      } else {
        const w = this._e0 - this._s0;
        let s = this._s0 + dt;
        s = snap(s, step);
        s = clamp(s, this._lo, this._hi - w);
        this.start = s;
        this.end = s + w;
      }

      t._positionOne(this);
      this._buildDOM();

      // 拖拽/缩放期间同步更新 tooltip 内容和位置（mousemove 在 pointer capture 下不一定可靠）
      if (this.tooltip !== 'none') {
        const tip = _getGlobalTip();
        if (tip.classList.contains('show')) _showGlobalTip(this);
      }

      this.dispatchEvent(new CustomEvent('segment-change', {
        bubbles: true, detail: { segment: this, start: this.start, end: this.end }
      }));
    }

    _onUp_(e) {
      if (!this._ptrActive) return;
      this._ptrActive = false;
      this._mode = null;
      this.classList.remove('dragging', 'resizing');
      this.removeEventListener('pointermove', this._onMove);
      this.removeEventListener('pointerup',   this._onUp);
      this.removeEventListener('pointercancel', this._onUp);
      this.removeEventListener('lostpointercapture', this._onUp);

      this.dispatchEvent(new CustomEvent('segment-changed', {
        bubbles: true, detail: { segment: this, start: this.start, end: this.end }
      }));
    }

    _computeBounds() {
      const t = this._track;
      if (!t) { this._lo = 0; this._hi = 24; return; }
      const segs = t.sortedSegs();
      const idx  = segs.indexOf(this);
      const { start: ts, end: te } = t._effRange ? t._effRange() : { start: t.tStart, end: t.tEnd };
      this._lo = idx > 0 ? segs[idx - 1].end : ts;
      this._hi = idx < segs.length - 1 ? segs[idx + 1].start : te;
    }

    _client(e) {
      const t = this._track;
      if (!t) return e.clientX;
      return t.isVertical ? e.clientY : e.clientX;
    }

    _emitDelete(origEvent) {
      const ok = this.dispatchEvent(new CustomEvent('segment-before-delete', {
        bubbles: true, cancelable: true, detail: { segment: this }
      }));
      if (!ok) return;
      this.remove();
      this.dispatchEvent(new CustomEvent('segment-deleted', {
        bubbles: true, detail: { segment: this }
      }));
      origEvent.preventDefault();
      origEvent.stopPropagation();
    }

    _darken(hex, amt) {
      let r, g, b;
      if (hex.startsWith('#')) {
        const n = parseInt(hex.slice(1), 16);
        r = (n >> 16) & 0xff; g = (n >> 8) & 0xff; b = n & 0xff;
      } else {
        const m = hex.match(/[\d.]+/g);
        if (!m) return hex;
        [r, g, b] = m.map(Number);
      }
      return `rgb(${clamp(r + amt * 255, 0, 255) | 0},${clamp(g + amt * 255, 0, 255) | 0},${clamp(b + amt * 255, 0, 255) | 0})`;
    }
  }

  // =============================================================
  //  TimeTrack  — 单条轨道
  // =============================================================
  class TimeTrack extends HTMLElement {
    constructor() {
      super();
      this._init = false;
      this._mutObs = null;
      this._trackMutObs = null;
      this._resObs = null;

      // 拖拽创建状态
      this._creating = false;
      this._crS = 0;
      this._crP0 = 0;
      this._ghost = null;
    }

    /* ---- 属性 ---- */
    get tStart() { return parseFloat(this.getAttribute('start')) || 0; }
    get tEnd()   { return parseFloat(this.getAttribute('end'))   || 24; }
    get label()  { return this.getAttribute('label') || ''; }
    get step()   { return parseFloat(this.getAttribute('step'))  || 0; }
    get minDur() {
      const a = this.getAttribute('min-duration');
      if (a != null) return parseFloat(a);
      return (this.tEnd - this.tStart) * 0.005; // 0.5% 范围
    }
    get isVertical() {
      const c = this.closest('time-line-container');
      if (!c) return false;
      const d = c.getAttribute('direction') || c.getAttribute('方向') || '';
      return d === 'vertical' || d === '纵向';
    }
    /** 横向模式轴标签位置：从容器读取（top=上方 / bottom=下方） */
    get labelH() { const c = this.closest('time-line-container'); return c ? c.labelH : 'top'; }
    /** 纵向模式轴标签位置：从容器读取（right=右侧 / left=左侧） */
    get labelV() { const c = this.closest('time-line-container'); return c ? c.labelV : 'right'; }

    /* ---- 公共 API ---- */
    sortedSegs() {
      const arr = Array.from(this.querySelectorAll(':scope .tlt-seg-area > time-line-segment'));
      arr.sort((a, b) => a.start - b.start);
      return arr;
    }

    px2Time(px) {
      const r = this._segRect();
      if (!r) return 0;
      const dim = this.isVertical ? r.height : r.width;
      if (!dim) return 0;
      const { start: ts, end: te } = this._effRange();
      return (px / dim) * (te - ts);
    }

    time2Px(t) {
      const r = this._segRect();
      if (!r) return 0;
      const dim = this.isVertical ? r.height : r.width;
      const { start: ts, end: te } = this._effRange();
      return ((t - ts) / (te - ts)) * dim;
    }

    /** 编程式创建时间段 */
    addSegment(start, end, opts = {}) {
      const seg = document.createElement('time-line-segment');
      const { start: ts, end: te } = this._effRange();
      seg.start = clamp(start, ts, te);
      seg.end   = clamp(end,   ts, te);
      if (opts.label)  seg.label  = opts.label;
      if (opts.color)  seg.color  = opts.color;
      if (opts.radius) seg.radius = opts.radius;
      this._segArea().appendChild(seg);
      requestAnimationFrame(() => {
        this._positionOne(seg);
        this._drawGrid();
      });
      this.dispatchEvent(new CustomEvent('segment-created', {
        bubbles: true, detail: { segment: seg }
      }));
      return seg;
    }

    /* ---- 生命周期 ---- */
    connectedCallback() {
      ensureCSS();
      if (this._init) { this._onDirChange(); return; }
      this._init = true;
      this._render();
    }

    disconnectedCallback() {
      if (this._mutObs) this._mutObs.disconnect();
      if (this._trackMutObs) this._trackMutObs.disconnect();
      if (this._resObs) this._resObs.disconnect();
    }

    static get observedAttributes() { return ['label', 'start', 'end', 'step', 'min-duration']; }

    attributeChangedCallback(name, _ov, nv) {
      if (!this._init) return;
      if (name === 'label') {
        const el = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-label');
        if (el) { el.textContent = this.label || '未命名'; el.title = this.label || '未命名'; }
      } else {
        requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions(); });
      }
    }

    /* ---- 初次渲染 ---- */
    _render() {
      // 暂存已有 segment 元素
      const chips = Array.from(this.children).filter(c => c.tagName === 'TIME-LINE-SEGMENT');

      const v = this.isVertical;
      this.classList.toggle('vertical', v);
      this.innerHTML =
        `<div class="tlt-row">
          <div class="tlt-head">
            <span class="tlt-head-label" title="${esc(this.label) || '未命名'}">${esc(this.label) || '未命名'}</span>
            <span class="tlt-head-range">${fmtTime(this.tStart, false)} – ${fmtTime(this.tEnd, false)}</span>
          </div>
          <div class="tlt-body">
            <canvas class="tlt-grid-canvas"></canvas>
            <div class="tlt-seg-area"></div>
          </div>
        </div>`;

      // 共享轴模式：所有轨道头部隐藏时间范围（由轴尺统一显示）
      if (this._isSharedMode()) {
        const headRange = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-range');
        if (headRange) headRange.style.display = 'none';
      }

      // 把暂存的 segment 放回 .tlt-seg-area
      const area = this._segArea();
      chips.forEach(c => area.appendChild(c));

      // 事件绑定
      const body = this.querySelector('.tlt-body');
      body.addEventListener('pointerdown', e => this._bodyDown(e));

      // 观测器
      this._resObs = new ResizeObserver(() => { this._drawGrid(); this._refreshPositions(); });
      this._resObs.observe(body);

      // 观测 .tlt-seg-area 子节点变更（新增/删除 segment）
      this._mutObs = new MutationObserver(muts => {
        let dirty = false;
        for (const m of muts) {
          if (m.type !== 'childList') continue;
          if (m.addedNodes.length || m.removedNodes.length) dirty = true;
        }
        if (dirty) {
          requestAnimationFrame(() => { this._refreshPositions(); this._drawGrid(); });
        }
      });
      this._mutObs.observe(this._segArea(), { childList: true });

      // 额外监听 track 自身：segment 可能被直接 append 到 track 上，需移入 seg-area
      this._trackMutObs = new MutationObserver(muts => {
        for (const m of muts) {
          if (m.type !== 'childList') continue;
          for (const n of m.addedNodes) {
            if (n.nodeType === 1 && n.tagName === 'TIME-LINE-SEGMENT') {
              this._segArea().appendChild(n);
            }
          }
        }
      });
      this._trackMutObs.observe(this, { childList: true });

      // 根据 label-h/label-v 调整 seg-area 间距（为轴标签留空）
      this._applyLabelPos();

      requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions(); });
    }

    _onDirChange() {
      const v = this.isVertical;
      this.classList.toggle('vertical', v);
      this._applyLabelPos();
      requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions(); });
    }

    /** 根据容器 label-h/label-v 属性调整 seg-area 间距，为轴标签留空 */
    _applyLabelPos() {
      const area = this._segArea();
      if (!area) return;
      const c = this.closest('time-line-container');
      const isShared = c && c.axisMode === 'shared';

      // 共享模式（有粘性轴尺）：seg-area 完全填满，轴尺提供标签
      if (isShared && c && c.axisRulerActive) {
        area.style.left   = '0';
        area.style.right  = '0';
        area.style.top    = '0';
        area.style.bottom = '0';
        return;
      }

      // 纵向共享模式（兼容旧版，无轴尺情况）
      if (isShared && this.isVertical) {
        area.style.left   = this.labelV === 'left' ? '36px' : '0';
        area.style.right  = this.labelV === 'left' ? '0' : '36px';
        area.style.top    = '';
        area.style.bottom = '';
        return;
      }

      // 独立轴模式：按 labelH/labelV 为轴标签留空
      if (this.isVertical) {
        area.style.left   = this.labelV === 'left' ? '36px' : '0';
        area.style.right  = this.labelV === 'left' ? '0' : '36px';
        area.style.top    = '';
        area.style.bottom = '';
      } else {
        area.style.left   = '';
        area.style.right  = '';
        area.style.top    = this.labelH === 'bottom' ? '0' : '18px';
        area.style.bottom = this.labelH === 'bottom' ? '18px' : '0';
      }
    }
    /** 轴标签位置属性变更后的响应：重绘网格 + 重定位 */
    _onLabelPosChange() {
      this._applyLabelPos();
      requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions(); });
    }

    /* ---- 内部 DOM 快捷方法 ---- */
    _bodyEl()   { return this.querySelector(':scope > .tlt-row > .tlt-body'); }
    _canvasEl() { return this.querySelector(':scope > .tlt-row > .tlt-body > .tlt-grid-canvas'); }
    _segArea()  { return this.querySelector(':scope > .tlt-row > .tlt-body > .tlt-seg-area'); }
    _segRect()  { const a = this._segArea(); return a ? a.getBoundingClientRect() : null; }

    /* ---- 拖拽创建 ---- */
    _bodyDown(e) {
      if (e.button !== 0) return;
      // 是否点在了已有 segment 上？
      const path = e.composedPath();
      if (path.some(el => el.tagName === 'TIME-LINE-SEGMENT')) return;

      const rect = this._segRect();
      if (!rect) return;
      const v = this.isVertical;
      const cp = v ? e.clientY : e.clientX;
      const orig = v ? rect.top : rect.left;
      const dim  = v ? rect.height : rect.width;
      if (!dim) return;

      this._creating = true;
      this._crS  = this.tStart + ((cp - orig) / dim) * (this._effRange().end - this._effRange().start);
      this._crP0 = cp;

      // 创建半透明预览条
      this._ghost = document.createElement('div');
      this._ghost.className = 'tlt-ghost';
      this._segArea().appendChild(this._ghost);
      if (v) {
        const y = this.time2Px(this._crS);
        this._ghost.style.cssText = `left:0;right:0;top:${y}px;height:2px;`;
      } else {
        const x = this.time2Px(this._crS);
        this._ghost.style.cssText = `top:0;bottom:0;left:${x}px;width:2px;`;
      }

      this.setPointerCapture(e.pointerId);
      const onM = ev => this._createMove(ev);
      const onU = ev => this._createUp(ev, onM, onU);
      this.addEventListener('pointermove', onM);
      this.addEventListener('pointerup', onU);
      this.addEventListener('pointercancel', onU);
      e.preventDefault();
    }

    _createMove(e) {
      if (!this._creating || !this._ghost) return;
      const v = this.isVertical;
      const cp = v ? e.clientY : e.clientX;
      const t1 = this._crS;
      const rect = this._segRect(); if (!rect) return;
      const orig = v ? rect.top : rect.left;
      const dim  = v ? rect.height : rect.width;
      const t2 = this.tStart + ((cp - orig) / dim) * (this._effRange().end - this._effRange().start);
      const lo = Math.min(t1, t2), hi = Math.max(t1, t2);
      const p1 = this.time2Px(lo), p2 = this.time2Px(hi);

      if (v) {
        this._ghost.style.top    = p1 + 'px';
        this._ghost.style.height = Math.max(3, p2 - p1) + 'px';
      } else {
        this._ghost.style.left  = p1 + 'px';
        this._ghost.style.width = Math.max(3, p2 - p1) + 'px';
      }
    }

    _createUp(e, onM, onU) {
      this._creating = false;
      this.removeEventListener('pointermove', onM);
      this.removeEventListener('pointerup', onU);
      this.removeEventListener('pointercancel', onU);
      if (this._ghost) { this._ghost.remove(); this._ghost = null; }

      const v = this.isVertical;
      const cp = v ? e.clientY : e.clientX;
      const rect = this._segRect(); if (!rect) return;
      const orig = v ? rect.top : rect.left;
      const dim  = v ? rect.height : rect.width;
      const t2 = this.tStart + ((cp - orig) / dim) * (this._effRange().end - this._effRange().start);
      let lo = Math.min(this._crS, t2), hi = Math.max(this._crS, t2);

      if (this.step) { lo = snap(lo, this.step); hi = snap(hi, this.step); }

      // 确保不与其他段重叠
      const exist = this.sortedSegs();
      for (const seg of exist) {
        if (lo < seg.end && hi > seg.start) {
          if (this._crS < seg.start) hi = Math.min(hi, seg.start);
          else lo = Math.max(lo, seg.end);
        }
      }
      const { start: ts, end: te } = this._effRange();
      lo = clamp(lo, ts, te);
      hi = clamp(hi, ts, te);
      if (hi - lo >= this.minDur) this.addSegment(lo, hi);
    }

    /* ---- 网格绘制 ---- */
    _drawGrid() {
      const canvas = this._canvasEl();
      const body   = this._bodyEl();
      if (!canvas || !body) return;
      const rect = body.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width  = rect.width  + 'px';
      canvas.style.height = rect.height + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const v = this.isVertical;
      const { start: gridStart, end: gridEnd } = this._effRange();
      const range = gridEnd - gridStart;
      if (!range) return;
      const dim  = v ? rect.height : rect.width;
      const step = this._niceStep(range, dim);

      // 计算 seg-area 相对于 body 的偏移量（seg-area 有 left/top 内边距，canvas 以 body 为原点）
      const segRect = this._segRect();
      const offX = segRect ? segRect.left - rect.left : 5;
      const offY = segRect ? segRect.top  - rect.top  : (v ? 5 : 0);

      // 所有轨道都绘制网格线（共享模式下使用共享轴范围，所有轨道刻度线对齐）
      ctx.strokeStyle = '#f0f2f5'; ctx.lineWidth = 0.5;
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step / 2) {
        this._drawLine(ctx, rect, t, v, offX, offY);
      }
      ctx.strokeStyle = '#dde0e4'; ctx.lineWidth = 0.7;
      for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
        this._drawLine(ctx, rect, t, v, offX, offY);
      }

      // 共享模式（有粘性轴尺）所有轨道不画标签，由轴尺统一提供
      if (this._isSharedMode()) {
        const c = this.closest('time-line-container');
        if (c && c.axisRulerActive) return;
      }

      // 标签（按 labelH/labelV 配置定位）
      ctx.fillStyle = '#7a8591'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif';
      if (v) {
        ctx.textBaseline = 'middle';
        ctx.textAlign = this.labelV === 'left' ? 'left' : 'right';
        const labelX = this.labelV === 'left' ? 6 : rect.width - 6;
        for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
          const px = this.time2Px(t);
          if (px > 14 && px < rect.height - 8) ctx.fillText(fmtTime(t, step < 1), labelX, px + offY);
        }
        // 强制显示首尾时间点
        const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd);
        if (sp <= 14) ctx.fillText(fmtTime(gridStart, step < 1), labelX, sp + offY + 10);
        if (ep >= rect.height - 8) ctx.fillText(fmtTime(gridEnd, step < 1), labelX, ep + offY - 10);
      } else {
        ctx.textAlign = 'center';
        ctx.textBaseline = this.labelH === 'bottom' ? 'bottom' : 'top';
        const labelY = this.labelH === 'bottom' ? rect.height - 4 : 4;
        for (let t = Math.floor(gridStart / step) * step; t <= gridEnd; t += step) {
          const px = this.time2Px(t);
          if (px > 24 && px < rect.width - 24) ctx.fillText(fmtTime(t, step < 1), px + offX, labelY);
        }
        // 强制显示首尾时间点（用 left/right 对齐避免边缘裁切）
        const sp = this.time2Px(gridStart), ep = this.time2Px(gridEnd);
        ctx.textAlign = 'left';
        if (sp <= 24) ctx.fillText(fmtTime(gridStart, step < 1), Math.max(sp + offX, 2), labelY);
        ctx.textAlign = 'right';
        if (ep >= rect.width - 24) ctx.fillText(fmtTime(gridEnd, step < 1), Math.min(ep + offX, rect.width - 2), labelY);
      }
    }

    _drawLine(ctx, bodyRect, t, vertical, offX, offY) {
      const px = this.time2Px(t);
      if (vertical) {
        const y = px + offY;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(bodyRect.width, y); ctx.stroke();
      } else {
        const x = px + offX;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, bodyRect.height); ctx.stroke();
      }
    }

    _niceStep(range, pxSize) {
      const targetPx = 72;
      const raw = range / (pxSize / targetPx);
      const ticks = [0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 24, 48];
      for (const t of ticks) if (raw <= t) return t;
      let p = 1; while (p < raw) p *= 2; return p;
    }

    /* ---- 段定位 ---- */
    _positionOne(seg) {
      const r = this._segRect();
      if (!r) return;
      const { start: ts, end: te } = this._effRange();
      const range = te - ts;
      if (!range) return;
      const v = this.isVertical;
      const dim = v ? r.height : r.width;
      const p1  = ((seg.start - ts) / range) * dim;
      const p2  = ((seg.end   - ts) / range) * dim;
      if (v) {
        seg.style.top    = p1 + 'px';
        seg.style.left   = '0';
        seg.style.right  = '0';
        seg.style.height = Math.max(6, p2 - p1) + 'px';
        seg.style.width  = '';
        seg.style.bottom = '';
      } else {
        seg.style.left   = p1 + 'px';
        seg.style.top    = '0';
        seg.style.bottom = '0';
        seg.style.width  = Math.max(6, p2 - p1) + 'px';
        seg.style.height = '';
        seg.style.right  = '';
      }
    }

        _refreshPositions() { this.sortedSegs().forEach(s => this._positionOne(s)); }

    /** 是否处于共享轴模式 */
    _isSharedMode() {
      const c = this.closest('time-line-container');
      return c && c.axisMode === 'shared';
    }
    /** 有效时间范围（共享轴 → 容器范围；独立轴 → 自身范围） */
    _effRange() {
      const c = this.closest('time-line-container');
      if (c && c.axisMode === 'shared') return { start: c.sharedStart, end: c.sharedEnd };
      return { start: this.tStart, end: this.tEnd };
    }
    /** 共享轴配置变更时回调 */
    _onSharedConfigChange() {
      const headRange = this.querySelector(':scope > .tlt-row > .tlt-head > .tlt-head-range');
      if (this._isSharedMode()) {
        // 共享模式：所有轨道头部隐藏时间范围（由轴尺统一显示）
        if (headRange) headRange.style.display = 'none';
      } else {
        if (headRange) headRange.style.display = '';
      }
      this._applyLabelPos();
      requestAnimationFrame(() => { this._drawGrid(); this._refreshPositions(); });
    }
  }

  // =============================================================
  //  TimeContainer  — 顶层容器
  // =============================================================
  class TimeContainer extends HTMLElement {
    constructor() {
      super();
      this._init = false;
      this._axisRuler = null;
      this._rulerResObs = null;
    }

    connectedCallback() {
      ensureCSS();
      if (this._init) return;
      this._init = true;
      this._applyDir();
      this._syncAxisRuler(); // 处理初始共享模式
    }

    static get observedAttributes() { return ['direction', '方向', 'label-h', 'label-v', 'axis-mode', 'shared-start', 'shared-end']; }
    attributeChangedCallback(name, _ov, nv) {
      if (!this._init) return;
      if (name === 'label-h' || name === 'label-v') {
        this.querySelectorAll('time-line-track').forEach(t => {
          if (t._onLabelPosChange) t._onLabelPosChange();
        });
      } else if (name === 'axis-mode' || name === 'shared-start' || name === 'shared-end') {
        this._onSharedConfigChange();
      } else {
        this._applyDir();
        this._syncAxisRuler(); // 方向变更时同步轴尺
        this.querySelectorAll('time-line-track').forEach(t => {
          if (t._onDirChange) t._onDirChange();
        });
      }
    }

    get direction() { return this.getAttribute('direction') || this.getAttribute('方向') || 'horizontal'; }

    /** 横向模式轴标签位置：top(上方/默认) | bottom(下方) */
    get labelH() { return this.getAttribute('label-h') || 'top'; }
    /** 纵向模式轴标签位置：right(右侧/默认) | left(左侧) */
    get labelV() { return this.getAttribute('label-v') || 'left'; }

    /* ---- 共享轴模式 ---- */
    /** 轴模式：per-track(默认独立轴) | shared(共享轴) */
    get axisMode() { return this.getAttribute('axis-mode') || 'per-track'; }
    set axisMode(v) { this.setAttribute('axis-mode', v); }

    /** 是否启用粘性轴尺 */
    get axisRulerActive() {
      return this.axisMode === 'shared';
    }

    /** 共享轴起始时间 */
    get sharedStart() {
      const v = this.getAttribute('shared-start');
      if (v != null) return parseFloat(v);
      const tracks = this.allTracks();
      if (!tracks.length) return 0;
      return Math.min(...tracks.map(t => t.tStart));
    }
    /** 共享轴结束时间 */
    get sharedEnd() {
      const v = this.getAttribute('shared-end');
      if (v != null) return parseFloat(v);
      const tracks = this.allTracks();
      if (!tracks.length) return 24;
      return Math.max(...tracks.map(t => t.tEnd));
    }

    /* ---- 公共 API ---- */
    allTracks() { return Array.from(this.querySelectorAll(':scope > time-line-track')); }

    addTrack(label, start, end, opts = {}) {
      const t = document.createElement('time-line-track');
      t.setAttribute('label', label || '');
      t.setAttribute('start', String(start ?? 0));
      t.setAttribute('end',   String(end ?? 24));
      if (opts.step)        t.setAttribute('step',        String(opts.step));
      if (opts.minDuration) t.setAttribute('min-duration',String(opts.minDuration));
      this.appendChild(t);
      return t;
    }

    removeTrack(track) { track.remove(); }

    /** 设置全局段圆角，直接应用到所有无显式 radius 属性的段 */
    setGlobalRadius(val) {
      this._globalRadius = val;
      this.querySelectorAll('time-line-segment').forEach(seg => {
        const bar = seg.querySelector(':scope > .tls-bar');
        if (bar) bar.style.borderRadius = val;
      });
    }
    getGlobalRadius() {
      return this._globalRadius || '0';
    }

    /* ---- 共享轴模式 ---- */
    _onSharedConfigChange() {
      this._syncAxisRuler();
      this.allTracks().forEach(t => {
        if (t._onSharedConfigChange) t._onSharedConfigChange();
      });
    }

    /* ---- 粘性轴尺管理（仅横向共享模式） ---- */
    _syncAxisRuler() {
      if (this.axisRulerActive) {
        if (!this._axisRuler) this._createAxisRuler();
        requestAnimationFrame(() => this._drawAxisRuler());
        this.style.setProperty('--tlc-gap', '0');
        this.style.setProperty('--tlc-padding', '0');
        // 横向：隐藏横向滚动条；纵向：保留以便轨道列横滚
        const isHorizontal = this.direction !== 'vertical' && this.direction !== '纵向';
        this.style.overflowX = isHorizontal ? 'hidden' : '';
      } else {
        if (this._axisRuler) {
          if (this._rulerResObs) { this._rulerResObs.disconnect(); this._rulerResObs = null; }
          this._axisRuler.remove();
          this._axisRuler = null;
        }
        this.style.removeProperty('overflow-x');
        this.style.removeProperty('--tlc-gap');
        this.style.setProperty('--tlc-padding', '14px 16px');
      }
    }

    _createAxisRuler() {
      this._axisRuler = document.createElement('div');
      this._axisRuler.className = 'tlc-axis-ruler';
      const isHorizontal = this.direction !== 'vertical' && this.direction !== '纵向';
      if (!isHorizontal) this._axisRuler.classList.add('vertical');
      this._axisRuler.innerHTML =
        '<div class="tlc-axis-spacer"><span class="tlc-axis-range"></span></div>' +
        '<div class="tlc-axis-body"><canvas class="tlc-axis-canvas"></canvas></div>';
      this.insertBefore(this._axisRuler, this.firstChild);

      // 监听轴尺体尺寸变化，重绘刻度
      const body = this._axisRuler.querySelector('.tlc-axis-body');
      this._rulerResObs = new ResizeObserver(() => {
        requestAnimationFrame(() => this._drawAxisRuler());
      });
      this._rulerResObs.observe(body);
    }

    _drawAxisRuler() {
      const ruler = this._axisRuler;
      if (!ruler) return;

      const isHorizontal = this.direction !== 'vertical' && this.direction !== '纵向';
      const rangeEl = ruler.querySelector('.tlc-axis-range');
      if (rangeEl) rangeEl.textContent = fmtTime(this.sharedStart, false) + ' – ' + fmtTime(this.sharedEnd, false);

      const canvas = ruler.querySelector('.tlc-axis-canvas');
      const body   = ruler.querySelector('.tlc-axis-body');
      if (!canvas || !body) return;
      const rect = body.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width  = rect.width  + 'px';
      canvas.style.height = rect.height + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const range = this.sharedEnd - this.sharedStart;
      if (!range) return;

      const dim  = isHorizontal ? rect.width : rect.height;
      const step = this._niceStepForAxis(range, dim);

      if (isHorizontal) {
        // ═══ 横向轴尺（顶部，刻度朝下） ═══
        // 底部边框线
        ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, rect.height - 0.5); ctx.lineTo(rect.width, rect.height - 0.5); ctx.stroke();

        // 次刻度
        ctx.strokeStyle = '#e0e3e8'; ctx.lineWidth = 0.5;
        for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step / 2) {
          const px = ((t - this.sharedStart) / range) * dim;
          if (px < 2 || px > dim - 2) continue;
          ctx.beginPath(); ctx.moveTo(px, rect.height - 0.5); ctx.lineTo(px, rect.height - 4); ctx.stroke();
        }

        // 主刻度
        ctx.strokeStyle = '#c0c5cc'; ctx.lineWidth = 1;
        for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
          const px = ((t - this.sharedStart) / range) * dim;
          if (px < 1 || px > dim - 1) continue;
          ctx.beginPath(); ctx.moveTo(px, rect.height - 0.5); ctx.lineTo(px, rect.height - 8); ctx.stroke();
        }

        // 时间文字
        ctx.fillStyle = '#6b7d8e'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
          const px = ((t - this.sharedStart) / range) * dim;
          if (px < 20 || px > dim - 20) continue;
          ctx.fillText(fmtTime(t, step < 1), px, rect.height - 9);
        }
        // 强制显示首尾时间点
        const hsp = 0, hep = dim;
        ctx.textAlign = 'left';
        if (hsp < 20) ctx.fillText(fmtTime(this.sharedStart, step < 1), Math.max(hsp, 2), rect.height - 9);
        ctx.textAlign = 'right';
        if (hep > dim - 20) ctx.fillText(fmtTime(this.sharedEnd, step < 1), Math.min(hep, dim - 2), rect.height - 9);
      } else {
        // ═══ 纵向轴尺（左侧，刻度朝右） ═══
        // 右侧边框线
        ctx.strokeStyle = '#d0d4da'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(rect.width - 0.5, 0); ctx.lineTo(rect.width - 0.5, rect.height); ctx.stroke();

        // 次刻度（水平短横线）
        ctx.strokeStyle = '#e0e3e8'; ctx.lineWidth = 0.5;
        for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step / 2) {
          const py = ((t - this.sharedStart) / range) * dim;
          if (py < 2 || py > dim - 2) continue;
          ctx.beginPath(); ctx.moveTo(rect.width - 0.5, py); ctx.lineTo(rect.width - 5, py); ctx.stroke();
        }

        // 主刻度
        ctx.strokeStyle = '#c0c5cc'; ctx.lineWidth = 1;
        for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
          const py = ((t - this.sharedStart) / range) * dim;
          if (py < 1 || py > dim - 1) continue;
          ctx.beginPath(); ctx.moveTo(rect.width - 0.5, py); ctx.lineTo(rect.width - 9, py); ctx.stroke();
        }

        // 时间文字（在刻度左侧，右对齐）
        ctx.fillStyle = '#6b7d8e'; ctx.font = '10px -apple-system,BlinkMacSystemFont,sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let t = Math.floor(this.sharedStart / step) * step; t <= this.sharedEnd; t += step) {
          const py = ((t - this.sharedStart) / range) * dim;
          if (py < 12 || py > dim - 12) continue;
          ctx.fillText(fmtTime(t, step < 1), rect.width - 11, py);
        }
        // 强制显示首尾时间点
        const vsp = 0, vep = dim;
        if (vsp < 12) ctx.fillText(fmtTime(this.sharedStart, step < 1), rect.width - 11, Math.max(vsp, 8));
        if (vep > dim - 12) ctx.fillText(fmtTime(this.sharedEnd, step < 1), rect.width - 11, Math.min(vep, dim - 8));
      }
    }

    _niceStepForAxis(range, pxSize) {
      const targetPx = 72;
      const raw = range / (pxSize / targetPx);
      const ticks = [0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 24, 48];
      for (const t of ticks) if (raw <= t) return t;
      let p = 1; while (p < raw) p *= 2;
      return p;
    }

    /* ---- 内部 ---- */
    _applyDir() {
      const v = this.direction === 'vertical' || this.direction === '纵向';
      this.style.flexDirection = v ? 'row' : 'column';
      this.style.overflow = 'auto';
    }
  }

  // =============================================================
  //  注册
  // =============================================================
  if (!customElements.get('time-line-segment'))  customElements.define('time-line-segment',  TimeSegment);
  if (!customElements.get('time-line-track'))    customElements.define('time-line-track',    TimeTrack);
  if (!customElements.get('time-line-container'))customElements.define('time-line-container',TimeContainer);

  // 调试导出
  if (typeof window !== 'undefined') {
    window.TimelineTrack = { TimeContainer, TimeTrack, TimeSegment };
  }
})();
