(function(A,L){typeof exports=="object"&&typeof module<"u"?L(exports):typeof define=="function"&&define.amd?define(["exports"],L):(A=typeof globalThis<"u"?globalThis:A||self,L(A.TimelineTrack={}))})(this,function(A){"use strict";const L=`
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
  time-line-container[direction="vertical"] {
    flex-direction: row;
  }
  time-line-container:not([direction="vertical"]) {
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
    overflow: visible;
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
    overflow: hidden;
    transition: filter 0.12s, box-shadow 0.12s, border-radius 0.15s;
  }
  time-line-segment:hover .tls-bar       { filter: brightness(1.06); }
  time-line-segment.dragging .tls-bar,
  time-line-segment.resizing .tls-bar    { filter: brightness(1.10); box-shadow: 0 2px 14px rgba(0,0,0,.22); }

  time-line-segment .tls-hdl {
    position: absolute;
    z-index: 3;
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
    pointer-events: none;
  }
  time-line-segment .tls-hdl-left  .tls-hdl-bar { left: 0; width: 4px; border-right: 1px solid rgba(0,0,0,0.08); }
  time-line-segment .tls-hdl-right .tls-hdl-bar { right: 0; width: 4px; border-left: 1px solid rgba(0,0,0,0.08); }
  time-line-segment:hover .tls-hdl-bar              { opacity: 1; }
  time-line-segment.dragging .tls-hdl-bar,
  time-line-segment.resizing .tls-hdl-bar           { opacity: 0; }

  time-line-track.vertical time-line-segment .tls-hdl-left  { left: 0; right: 0; top: -2px; bottom: auto; width: auto; height: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='5,18 12,7 19,18' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }
  time-line-track.vertical time-line-segment .tls-hdl-right { left: 0; right: 0; bottom: -2px; top: auto; width: auto; height: 4px; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpolygon points='5,6 12,17 19,6' fill='%23444' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, ns-resize; }

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
  time-line-segment.tls-del-hidden .tls-del { display: none; }
  time-line-segment.tls-text-hidden .tls-inner { visibility: hidden; }
  time-line-segment.tls-selected .tls-bar { box-shadow: inset 0 0 0 2px rgba(255,255,255,.65); }

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
  }
  .tls-global-tip.show { opacity: 1; }
  .tls-global-tip::after {
    content: '';
    position: absolute;
    border: 5px solid transparent;
  }
  .tls-global-tip.top::after {
    top: 100%;
    border-top-color: rgba(30,35,42,.92);
    border-bottom: none;
    left: var(--tlc-arrow-left, 50%);
    transform: translateX(-50%);
  }
  .tls-global-tip.bottom::after {
    bottom: 100%;
    border-bottom-color: rgba(30,35,42,.92);
    border-top: none;
    left: var(--tlc-arrow-left, 50%);
    transform: translateX(-50%);
  }
  .tls-global-tip.left::after {
    left: 100%;
    border-left-color: rgba(30,35,42,.92);
    border-right: none;
    top: var(--tlc-arrow-top, 50%);
    transform: translateY(-50%);
  }
  .tls-global-tip.right::after {
    right: 100%;
    border-right-color: rgba(30,35,42,.92);
    border-left: none;
    top: var(--tlc-arrow-top, 50%);
    transform: translateY(-50%);
  }
  .tls-global-tip-label { font-weight: 600; }
  .tls-global-tip-time  { opacity: .75; font-size: 10px; }

  time-line-container { --tls-global-radius: 0; }

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

  .tlt-ghost {
    position: absolute;
    background: rgba(66,133,244,.18);
    border: 2px dashed #4285f4;
    border-radius: 0;
    pointer-events: none;
    z-index: 9;
  }

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
  time-line-container[direction="vertical"] .tlc-axis-ruler {
    top: auto;
    left: 0;
    flex-direction: column;
    width: 44px;
    min-width: 44px;
  }
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-spacer {
    width: auto;
    min-width: auto;
    height: 28px;
    min-height: 28px;
    padding: 0 4px;
    border-bottom: 1px solid #e0e3e8;
  }
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-range {
    display: none;
  }
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-body {
    height: auto;
    min-height: 0;
    flex: 1;
  }
  time-line-container[direction="vertical"] .tlc-axis-ruler .tlc-axis-canvas {
    width: 100%;
    height: 100%;
  }
`;let j=!1;function G(){if(j)return;const l=document.createElement("style");l.textContent=L,document.head.appendChild(l),j=!0}const I={unnamed:"未命名",invalidTime:"--:--",deleteBtnTitle:"删除",modifyProps:"修改属性",deleteTrack:"删除轨道",clearSegments:"清空时间段",trackMenuHeader:"📋 {name}",segmentMenuHeader:"🔖 {name}  {range}",confirmDeleteTrack:"确定要删除轨道「{name}」({range}) 吗？",confirmDeleteSegment:"确定要删除时间段「{name}」({range}) 吗？",confirmClearSegments:"确定要清空轨道「{name}」的所有时间段吗？",segmentEditTitle:"修改时间段属性",trackEditTitle:"修改轨道属性",labelField:"标签",startTime:"开始时间",endTime:"结束时间",color:"颜色",name:"名称",step:"步长",maxSegmentsField:"最大段数",zeroUnlimited:"0=无限制",cancel:"取消",confirm:"确定",confirmDelete:"确定删除",confirmDeleteTitle:"确认删除",segmentOverlapError:"时间段重叠：新段 [{start}–{end}] 与已有段「{label}」[{segStart}–{segEnd}] 冲突"},D={};for(const l of Object.keys(I)){const t="loc-"+l.replace(/([A-Z])/g,"-$1").toLowerCase();D[l]=t}const ot=Object.freeze(Object.values(D));function y(l,t){const e=l&&l.closest?l.closest("time-line-container"):null,i={...I};if(e)for(const s of Object.keys(I)){const o=e.getAttribute(D[s]);o!=null&&(i[s]=o)}return i}function M(l){return String(Math.floor(l)).padStart(2,"0")}function X(l,t,e){if(l==null||isNaN(l))return e||"--:--";const i=l<0;i&&(l=-l);const s=Math.floor(l),o=Math.round((l-s)*60);if(t){const r=Math.round(l*3600),a=Math.floor(r/3600),n=Math.floor(r%3600/60),c=r%60;return`${i?"-":""}${M(a)}:${M(n)}:${M(c)}`}const h=o;return h===60?`${i?"-":""}${M(s+1)}:00`:`${i?"-":""}${M(s)}:${M(h)}`}function Y(l){const t=l.match(/^([\d.]+)\s*(h|hour|hours|min|mins|minute|minutes|sec|secs|second|seconds)$/i);if(!t)return null;const e=parseFloat(t[1]);if(isNaN(e))return null;const i=t[2].toLowerCase();let s="";return i==="h"||i==="hour"||i==="hours"?s="hour":i.startsWith("mi")?s="minute":i.startsWith("se")&&(s="second"),{val:e,unit:s}}const W={hour:1,minute:1/60,second:1/3600},K=[.1,.25,.5,1,2,3,4,6,8,12,24,48];function lt(l){if(l==="hour")return K;const t=l==="minute"?60:3600;return K.map(e=>+(e*t).toFixed(6))}const U=[.1,.2,.5,1,2,5,10,20,50,100,200,500,1e3,5e3,1e4,5e4,1e5,5e5,1e6];class Z{constructor(t=""){this._unit=t}get unit(){return this._unit}parse(t,e=0){return t==null||t===""?e:typeof t=="number"?t:this._doParse(String(t).trim(),e)}format(t,e="axis"){return t==null||isNaN(t)?"--:--":this._doFormat(t,e)}formatRange(t,e,i="axis"){return this.format(t,i)+" – "+this.format(e,i)}niceStep(t,e,i=72){if(!t||!e)return 1;const s=t/(e/i);return this._doNiceStep(s)}inputAttrs(t){return{type:this._doInputType(t),value:this._doInputValue(t),...this._doInputStep?{step:this._doInputStep(t)}:{}}}_doParse(t,e){throw new Error("must implement _doParse")}_doFormat(t,e){throw new Error("must implement _doFormat")}_doNiceStep(t){throw new Error("must implement _doNiceStep")}_doInputType(t){throw new Error("must implement _doInputType")}_doInputValue(t){throw new Error("must implement _doInputValue")}_doInputStep(t){}}class at extends Z{constructor(t="hour"){super(t),this._ticks=lt(t)}_toHours(t){return t*(W[this._unit]||1)}_fromHours(t){return t/(W[this._unit]||1)}_doParse(t,e){const i=t.match(/^(-?)(\d{1,2}):(\d{2})(?::(\d{2}))?$/);if(i){const[h,r,a,n,c]=i,d=parseInt(a,10)+parseInt(n,10)/60+(c?parseInt(c,10)/3600:0);return this._fromHours(r?-d:d)}const s=Y(t);if(s)return this._fromHours(s.val*W[s.unit]);const o=parseFloat(t);return isNaN(o)?e:o}_doFormat(t,e){return X(this._toHours(t),e==="tooltip"||e==="editor")}_doNiceStep(t){for(const i of this._ticks)if(t<=i)return i;let e=this._ticks[this._ticks.length-1];for(;e<t;)e*=2;return e}_doInputType(t){return this._unit==="second"?"text":"time"}_doInputValue(t){return X(this._toHours(t),this._unit==="second")}_doInputStep(t){if(this._unit!=="second")return"360"}}class ct extends Z{constructor(t=""){super(t)}_doParse(t,e){const i=Y(t);if(i)return i.val;const s=t.match(/^(-?[\d.]+)\s*.*$/);if(s){const h=parseFloat(s[1]);return isNaN(h)?e:h}const o=parseFloat(t);return isNaN(o)?e:o}_doFormat(t,e){const i=Math.abs(t);let s=0;i<1?s=3:i<10?s=2:i<100&&(s=1);const o=parseFloat(t.toFixed(s)).toString();return this._unit?`${o} ${this._unit}`:o}_doNiceStep(t){for(const i of U)if(t<=i)return i;let e=U[U.length-1];for(;e<t;)e*=10;return e}_doInputType(t){return"number"}_doInputValue(t){return String(t)}_doInputStep(t){const e=Math.abs(t);return e<1?"0.1":e<10?"0.5":e<100?"1":"10"}}function N(l="time",t="hour"){if(l==="number")return new ct(t);const e=["hour","minute","second"];return new at(e.includes(t)?t:"hour")}class J extends HTMLElement{constructor(){super(),this._init=!1,this._axisRuler=null,this._rulerResObs=null,this._formatter=null}connectedCallback(){G(),!this._init&&(this._init=!0,this._formatter=N(this.type,this.unit),this._applyDir(),this._syncAxisRuler())}static get observedAttributes(){return["direction","label-h","label-v","axis-mode","shared-start","shared-end","tooltip-pos","max-segments","type","unit",...ot]}attributeChangedCallback(t,e,i){if(this._init){if(t.startsWith("loc-")){this.querySelectorAll("time-line-track, time-line-segment").forEach(s=>{s._onLocaleChange&&s._onLocaleChange()});return}if(t!=="tooltip-pos"){if(t==="type"||t==="unit"){this._formatter=N(this.type,this.unit),this._onSharedConfigChange();return}t==="label-h"||t==="label-v"?this.querySelectorAll("time-line-track").forEach(s=>{s._onLabelPosChange&&s._onLabelPosChange()}):t==="axis-mode"||t==="shared-start"||t==="shared-end"?this._onSharedConfigChange():(this._applyDir(),this._syncAxisRuler(),this.querySelectorAll("time-line-track").forEach(s=>{s._onDirChange&&s._onDirChange()}))}}}get direction(){return this.getAttribute("direction")||"horizontal"}set direction(t){this.setAttribute("direction",t)}get type(){return this.getAttribute("type")||"time"}set type(t){this.setAttribute("type",t)}get unit(){return this.getAttribute("unit")||"hour"}set unit(t){t==null||t==="hour"?this.removeAttribute("unit"):this.setAttribute("unit",t)}getFormatter(){return this._formatter||(this._formatter=N(this.type,this.unit)),this._formatter}get labelH(){return this.getAttribute("label-h")||"top"}set labelH(t){this.setAttribute("label-h",t)}get labelV(){return this.getAttribute("label-v")||"left"}set labelV(t){this.setAttribute("label-v",t)}get tooltipPos(){return this.getAttribute("tooltip-pos")||"top-center"}set tooltipPos(t){t==null?this.removeAttribute("tooltip-pos"):this.setAttribute("tooltip-pos",t)}get axisMode(){return this.getAttribute("axis-mode")||"per-track"}set axisMode(t){this.setAttribute("axis-mode",t)}resolveLocale(){return y(this)}get axisRulerActive(){return this.axisMode==="shared"}get sharedStart(){const t=this.getAttribute("shared-start");if(t!=null)return this.getFormatter().parse(t,0);const e=this.allTracks();return e.length?Math.min(...e.map(i=>i.tStart)):0}set sharedStart(t){this.setAttribute("shared-start",t)}get sharedEnd(){const t=this.getAttribute("shared-end");if(t!=null)return this.getFormatter().parse(t,24);const e=this.allTracks();return e.length?Math.max(...e.map(i=>i.tEnd)):24}set sharedEnd(t){this.setAttribute("shared-end",t)}get maxSegments(){const t=this.getAttribute("max-segments");if(t!=null){const e=parseInt(t,10);return e>0?e:0}return 0}set maxSegments(t){t==null||t<=0?this.removeAttribute("max-segments"):this.setAttribute("max-segments",String(t))}allTracks(){return Array.from(this.querySelectorAll(":scope > time-line-track"))}addTrack(t,e,i,s={}){const o=document.createElement("time-line-track");return o.setAttribute("label",t||""),o.setAttribute("start",String(e??0)),o.setAttribute("end",String(i??24)),s.step&&o.setAttribute("step",String(s.step)),s.minDuration&&o.setAttribute("min-duration",String(s.minDuration)),s.maxSegments&&o.setAttribute("max-segments",String(s.maxSegments)),this.appendChild(o),o}removeTrack(t){t.remove()}setGlobalRadius(t){this._globalRadius=t,this.querySelectorAll("time-line-segment").forEach(e=>{const i=e.querySelector(":scope > .tls-bar");i&&(i.style.borderRadius=t)})}getGlobalRadius(){return this._globalRadius||"0"}_onSharedConfigChange(){this._syncAxisRuler(),this.allTracks().forEach(t=>{t._onSharedConfigChange&&t._onSharedConfigChange()})}_cleanupRuler(){this._rulerResObs&&(this._rulerResObs.disconnect(),this._rulerResObs=null),this._axisRuler&&(this._axisRuler.remove(),this._axisRuler=null)}_syncAxisRuler(){if(this.axisRulerActive){const t=this.direction==="vertical",e=this._axisRuler&&this._axisRuler.classList.contains("vertical")!==t;(!this._axisRuler||!this._axisRuler.isConnected||e)&&(this._cleanupRuler(),this._createAxisRuler()),requestAnimationFrame(()=>this._drawAxisRuler()),this.style.setProperty("--tlc-gap","0"),this.style.setProperty("--tlc-padding","0"),this.style.overflowX=t?"":"hidden"}else this._cleanupRuler(),this.style.removeProperty("overflow-x"),this.style.removeProperty("--tlc-gap"),this.style.setProperty("--tlc-padding","14px 16px")}_createAxisRuler(){this._axisRuler=document.createElement("div"),this._axisRuler.className="tlc-axis-ruler",this.direction!=="vertical"||this._axisRuler.classList.add("vertical"),this._axisRuler.innerHTML='<div class="tlc-axis-spacer"><span class="tlc-axis-range"></span></div><div class="tlc-axis-body"><canvas class="tlc-axis-canvas"></canvas></div>',this.insertBefore(this._axisRuler,this.firstChild);const e=this._axisRuler.querySelector(".tlc-axis-body");this._rulerResObs=new ResizeObserver(()=>{requestAnimationFrame(()=>this._drawAxisRuler())}),this._rulerResObs.observe(e)}_drawAxisRuler(){const t=this._axisRuler;if(!t)return;const e=this.getFormatter(),i=this.direction!=="vertical",s=t.querySelector(".tlc-axis-range");s&&(s.textContent=e.formatRange(this.sharedStart,this.sharedEnd,"axis"));const o=t.querySelector(".tlc-axis-canvas"),h=t.querySelector(".tlc-axis-body");if(!o||!h)return;const r=h.getBoundingClientRect();if(!r.width||!r.height)return;const a=window.devicePixelRatio||1;o.width=r.width*a,o.height=r.height*a,o.style.width=r.width+"px",o.style.height=r.height+"px";const n=o.getContext("2d");n.scale(a,a);const c=this.sharedEnd-this.sharedStart;if(!c)return;const d=i?r.width:r.height,u=e.niceStep(c,d);if(i){n.strokeStyle="#d0d4da",n.lineWidth=1,n.beginPath(),n.moveTo(0,r.height-.5),n.lineTo(r.width,r.height-.5),n.stroke(),n.strokeStyle="#e0e3e8",n.lineWidth=.5;for(let m=Math.floor(this.sharedStart/u)*u;m<=this.sharedEnd;m+=u/2){const p=(m-this.sharedStart)/c*d;p<2||p>d-2||(n.beginPath(),n.moveTo(p,r.height-.5),n.lineTo(p,r.height-4),n.stroke())}n.strokeStyle="#c0c5cc",n.lineWidth=1;for(let m=Math.floor(this.sharedStart/u)*u;m<=this.sharedEnd;m+=u){const p=(m-this.sharedStart)/c*d;p<1||p>d-1||(n.beginPath(),n.moveTo(p,r.height-.5),n.lineTo(p,r.height-8),n.stroke())}n.fillStyle="#6b7d8e",n.font="10px -apple-system,BlinkMacSystemFont,sans-serif",n.textAlign="center",n.textBaseline="bottom";for(let m=Math.floor(this.sharedStart/u)*u;m<=this.sharedEnd;m+=u){const p=(m-this.sharedStart)/c*d;p<20||p>d-20||n.fillText(e.format(m,"axis"),p,r.height-9)}n.textAlign="left",n.fillText(e.format(this.sharedStart,"axis"),Math.max(0,2),r.height-9),n.textAlign="right",d>d-20&&n.fillText(e.format(this.sharedEnd,"axis"),Math.min(d,d-2),r.height-9)}else{n.strokeStyle="#d0d4da",n.lineWidth=1,n.beginPath(),n.moveTo(r.width-.5,0),n.lineTo(r.width-.5,r.height),n.stroke(),n.strokeStyle="#e0e3e8",n.lineWidth=.5;for(let m=Math.floor(this.sharedStart/u)*u;m<=this.sharedEnd;m+=u/2){const p=(m-this.sharedStart)/c*d;p<2||p>d-2||(n.beginPath(),n.moveTo(r.width-.5,p),n.lineTo(r.width-5,p),n.stroke())}n.strokeStyle="#c0c5cc",n.lineWidth=1;for(let m=Math.floor(this.sharedStart/u)*u;m<=this.sharedEnd;m+=u){const p=(m-this.sharedStart)/c*d;p<1||p>d-1||(n.beginPath(),n.moveTo(r.width-.5,p),n.lineTo(r.width-9,p),n.stroke())}n.fillStyle="#6b7d8e",n.font="10px -apple-system,BlinkMacSystemFont,sans-serif",n.textAlign="right",n.textBaseline="middle";for(let m=Math.floor(this.sharedStart/u)*u;m<=this.sharedEnd;m+=u){const p=(m-this.sharedStart)/c*d;p<12||p>d-12||n.fillText(e.format(m,"axis"),r.width-11,p)}n.fillText(e.format(this.sharedStart,"axis"),r.width-11,Math.max(0,8)),d>d-12&&n.fillText(e.format(this.sharedEnd,"axis"),r.width-11,Math.min(d,d-8))}}_applyDir(){const t=this.direction==="vertical";this.style.flexDirection=t?"row":"column",this.style.overflow="auto"}}const _=(l,t,e)=>l<t?t:l>e?e:l,P=(l,t)=>t?Math.round(l/t)*t:l;function g(l){const t=document.createElement("div");return t.textContent=l!=null?String(l):"",t.innerHTML}const ht=`
/* ── Context Menu ── */
.tlc-context-menu {
  position: fixed;
  z-index: 100000;
  background: #fff;
  border: 1px solid #dfe3e8;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0,0,0,.14);
  padding: 4px 0;
  min-width: 148px;
  opacity: 0;
  transform-origin: top left;
  transform: scale(0.92);
  transition: opacity .1s ease, transform .1s ease;
  pointer-events: none;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size: 12px;
  user-select: none;
}
.tlc-context-menu.show {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.tlc-context-item {
  padding: 7px 14px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background .09s;
  white-space: nowrap;
}
.tlc-context-item:hover {
  background: #f0f2f5;
}
.tlc-context-item:active {
  background: #e5e8ec;
}
.tlc-context-header {
  padding: 7px 14px 5px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  cursor: default;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
  white-space: nowrap;
  line-height: 1.4;
}
.tlc-context-item-danger {
  color: #e53935;
}
.tlc-context-item-danger:hover {
  background: #fbe9e7;
}
.tlc-context-item-danger:active {
  background: #f5d0cc;
}
.tlc-context-divider {
  height: 1px;
  background: #e8eaed;
  margin: 4px 0;
}

/* ── Modal Overlay ── */
.tlc-modal-overlay {
  position: fixed;
  z-index: 100001;
  inset: 0;
  background: rgba(0,0,0,.32);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .18s ease;
  pointer-events: none;
}
.tlc-modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

/* ── Modal Card ── */
.tlc-modal {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  min-width: 300px;
  max-width: 420px;
  width: 90vw;
  transform: scale(0.94) translateY(8px);
  transition: transform .18s ease;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size: 13px;
  color: #333;
}
.tlc-modal-overlay.show .tlc-modal {
  transform: scale(1) translateY(0);
}
.tlc-modal-header {
  padding: 14px 18px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
.tlc-modal-body {
  padding: 8px 18px 14px;
}
.tlc-modal-body label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #555;
}
.tlc-modal-body label > span {
  min-width: 56px;
  flex-shrink: 0;
  text-align: right;
  color: #666;
}
.tlc-modal-body input {
  flex: 1;
  padding: 5px 9px;
  border: 1px solid #d0d4da;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  transition: border-color .12s, box-shadow .12s;
}
.tlc-modal-body input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66,133,244,.15);
}
.tlc-modal-body input[type="color"] {
  min-height: 30px;
  padding: 2px 3px;
  cursor: pointer;
  flex: 0 0 48px;
}
.tlc-modal-body p {
  margin: 4px 0;
  font-size: 13px;
  color: #444;
  line-height: 1.5;
}
.tlc-modal-body .tlc-modal-hint {
  font-size: 11px;
  color: #999;
  margin-top: -4px;
  margin-bottom: 8px;
}
.tlc-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 18px 14px;
}
.tlc-btn {
  padding: 6px 18px;
  border: 1px solid #d0d4da;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background .09s, border-color .09s;
  color: #444;
}
.tlc-btn:hover {
  background: #f5f6f8;
  border-color: #c0c5cc;
}
.tlc-btn:active {
  background: #e8eaed;
}
.tlc-btn-primary {
  background: #4285f4;
  color: #fff;
  border-color: #4285f4;
}
.tlc-btn-primary:hover {
  background: #3b78e7;
  border-color: #3b78e7;
}
.tlc-btn-primary:active {
  background: #3367d6;
}
.tlc-btn-danger {
  background: #e53935;
  color: #fff;
  border-color: #e53935;
}
.tlc-btn-danger:hover {
  background: #d32f2f;
  border-color: #d32f2f;
}
.tlc-btn-danger:active {
  background: #c62828;
}
`;let Q=!1,x=null,w=null,S=null,$=null,z=null;function F(){if(Q)return;const l=document.createElement("style");l.textContent=ht,document.head.appendChild(l),Q=!0}function dt(){C(),k()}function tt(l,t,e){dt(),F(),x||(x=document.createElement("div"),x.className="tlc-context-menu",document.body.appendChild(x));let i="";x.innerHTML=l.map((s,o)=>{if(s.type==="divider")return'<div class="tlc-context-divider"></div>';if(s.type==="header")return i=`<div class="tlc-context-header">${g(s.label)}</div>`,null;const h=["tlc-context-item"];return s.danger&&h.push("tlc-context-item-danger"),`<div class="${h.join(" ")}" data-idx="${o}">${g(s.label)}</div>`}).filter(Boolean).join(""),i&&(x.innerHTML=i+x.innerHTML),x.addEventListener("click",s=>{const o=s.target.closest(".tlc-context-item");if(!o)return;const h=parseInt(o.dataset.idx,10),r=l[h];r&&r.action&&r.action(),C()}),requestAnimationFrame(()=>{const s=x.offsetWidth||160,o=x.offsetHeight||40,h=window.innerWidth,r=window.innerHeight,a=Math.max(8,Math.min(t,h-s-8)),n=Math.max(8,Math.min(e,r-o-8));x.style.left=a+"px",x.style.top=n+"px",x.classList.add("show")}),$=s=>{x&&!x.contains(s.target)&&C()},requestAnimationFrame(()=>{document.addEventListener("pointerdown",$)}),z=s=>{s.key==="Escape"&&C()},document.addEventListener("keydown",z)}function C(){x&&x.classList.remove("show"),$&&(document.removeEventListener("pointerdown",$),$=null),z&&(document.removeEventListener("keydown",z),z=null)}function pt(){return w||(w=document.createElement("div"),w.className="tlc-modal-overlay",document.body.appendChild(w),w.addEventListener("click",l=>{l.target===w&&k()})),w}function O(){return S||(S=document.createElement("div"),S.className="tlc-modal",S.addEventListener("keydown",l=>{if(l.key==="Escape"&&k(),l.key==="Enter"&&l.target.tagName==="INPUT"){const t=S.querySelector('[data-action="confirm"]');t&&t.click()}})),S}function B(){C();const l=pt(),t=O();l.appendChild(t),requestAnimationFrame(()=>{l.classList.add("show")});const e=t.querySelector('input:not([type="color"])');e&&setTimeout(()=>e.focus(),120)}function k(){w&&(w.classList.remove("show"),S&&S.parentNode===w&&w.removeChild(S))}function ut(l){F();const t=y(l),e=l._formatter,i=O(),s=e.inputAttrs(l.start),o=e.inputAttrs(l.end);i.innerHTML=`
    <div class="tlc-modal-header">${g(t.segmentEditTitle)}</div>
    <div class="tlc-modal-body">
      <label><span>${g(t.labelField)}</span><input name="label" type="text" value="${g(l.label)}"></label>
      <label><span>${g(t.startTime)}</span><input name="start" type="${s.type}"${s.step?` step="${s.step}"`:""} value="${g(s.value)}"></label>
      <label><span>${g(t.endTime)}</span><input name="end" type="${o.type}"${o.step?` step="${o.step}"`:""} value="${g(o.value)}"></label>
      <label><span>${g(t.color)}</span><input name="color" type="color" value="${l.color}"></label>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${g(t.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${g(t.confirm)}</button>
    </div>`,B(),i.querySelector('[data-action="cancel"]').addEventListener("click",k),i.querySelector('[data-action="confirm"]').addEventListener("click",()=>{const h=i.querySelectorAll("input[name]"),r={};h.forEach(c=>{r[c.name]=c.value});const a=e.parse(r.start),n=e.parse(r.end);isNaN(a)||isNaN(n)||a>=n||(l.label=r.label,l.start=a,l.end=n,l.color=r.color,k())})}function mt(l){F();const t=y(l),e=l._formatter,i=O(),s=e.inputAttrs(l.tStart),o=e.inputAttrs(l.tEnd);i.innerHTML=`
    <div class="tlc-modal-header">${g(t.trackEditTitle)}</div>
    <div class="tlc-modal-body">
      <label><span>${g(t.name)}</span><input name="label" type="text" value="${g(l.label)}"></label>
      <label><span>${g(t.startTime)}</span><input name="start" type="${s.type}"${s.step?` step="${s.step}"`:""} value="${g(s.value)}"></label>
      <label><span>${g(t.endTime)}</span><input name="end" type="${o.type}"${o.step?` step="${o.step}"`:""} value="${g(o.value)}"></label>
      <label><span>${g(t.step)}</span><input name="step" type="text" value="${l.step}"></label>
      <label><span>${g(t.maxSegmentsField)}</span><input name="maxSegments" type="number" step="1" min="0" placeholder="${g(t.zeroUnlimited)}" value="${l.maxSegments||""}"></label>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${g(t.cancel)}</button>
      <button class="tlc-btn tlc-btn-primary" data-action="confirm">${g(t.confirm)}</button>
    </div>`,B(),i.querySelector('[data-action="cancel"]').addEventListener("click",k),i.querySelector('[data-action="confirm"]').addEventListener("click",()=>{const h=i.querySelectorAll("input[name]"),r={};h.forEach(u=>{r[u.name]=u.value});const a=e.parse(r.start),n=e.parse(r.end),c=e.parse(r.step),d=parseInt(r.maxSegments,10);isNaN(a)||isNaN(n)||a>=n||(l.label=r.label,l.setAttribute("start",String(a)),l.setAttribute("end",String(n)),l.step=!isNaN(c)&&c>0?c:0,!isNaN(d)&&d>0?l.maxSegments=d:l.removeAttribute("max-segments"),k())})}function q(l,t,e){F();const i=y(e),s=O();s.innerHTML=`
    <div class="tlc-modal-header">${g(i.confirmDeleteTitle)}</div>
    <div class="tlc-modal-body">
      <p>${g(l)}</p>
    </div>
    <div class="tlc-modal-footer">
      <button class="tlc-btn" data-action="cancel">${g(i.cancel)}</button>
      <button class="tlc-btn tlc-btn-danger" data-action="confirm">${g(i.confirmDelete)}</button>
    </div>`,B(),s.querySelector('[data-action="cancel"]').addEventListener("click",k),s.querySelector('[data-action="confirm"]').addEventListener("click",()=>{k(),t&&t()})}class et extends HTMLElement{constructor(){super(),this._init=!1,this._mutObs=null,this._trackMutObs=null,this._resObs=null,this._creating=!1,this._crS=0,this._crP0=0,this._ghost=null}get tStart(){return this._formatter.parse(this.getAttribute("start"),0)}get tEnd(){return this._formatter.parse(this.getAttribute("end"),24)}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t)}get step(){return this._formatter.parse(this.getAttribute("step"),0)}set step(t){this.setAttribute("step",t)}get minDur(){const t=this.getAttribute("min-duration");return t!=null?this._formatter.parse(t):(this.tEnd-this.tStart)*.005}get maxSegments(){const t=this.getAttribute("max-segments");if(t!=null){const i=parseInt(t,10);return i>0?i:0}const e=this.closest("time-line-container");return e&&e.maxSegments?e.maxSegments:0}set maxSegments(t){this.setAttribute("max-segments",t)}get isVertical(){const t=this.closest("time-line-container");return t?(t.getAttribute("direction")||"")==="vertical":!1}get _formatter(){const t=this.closest("time-line-container");return t?t.getFormatter():this._fmtFallback||(this._fmtFallback=createFormatter("time","hour"))}get labelH(){const t=this.closest("time-line-container");return t?t.labelH:"top"}get labelV(){const t=this.closest("time-line-container");return t?t.labelV:"right"}sortedSegs(){const t=Array.from(this.querySelectorAll(":scope .tlt-seg-area > time-line-segment"));return t.sort((e,i)=>e.start-i.start),t}px2Time(t){const e=this._segRect();if(!e)return 0;const i=this.isVertical?e.height:e.width;if(!i)return 0;const{start:s,end:o}=this._effRange();return t/i*(o-s)}time2Px(t){const e=this._segRect();if(!e)return 0;const i=this.isVertical?e.height:e.width,{start:s,end:o}=this._effRange();return(t-s)/(o-s)*i}addSegment(t,e,i={}){if(!this._checkSegmentLimit())return null;const{start:s,end:o}=this._effRange();t=_(t,s,o),e=_(e,s,o);const h=this.sortedSegs();for(const a of h)if(t<a.end&&e>a.start){const n=this._formatter,c=y(this),d=c.segmentOverlapError.replace("{start}",n.format(t)).replace("{end}",n.format(e)).replace("{label}",a.label||c.unnamed).replace("{segStart}",n.format(a.start)).replace("{segEnd}",n.format(a.end));throw new Error("addSegment "+d)}const r=document.createElement("time-line-segment");return r.start=t,r.end=e,i.label&&(r.label=i.label),i.color&&(r.color=i.color),i.radius&&(r.radius=i.radius),this._segArea().appendChild(r),requestAnimationFrame(()=>{this._positionOne(r),this._drawGrid()}),this.dispatchEvent(new CustomEvent("segment-created",{bubbles:!0,detail:{segment:r}})),r}clearAllSegments(){this.sortedSegs().forEach(t=>t.remove())}_deleteTrack(){this.dispatchEvent(new CustomEvent("track-before-delete",{bubbles:!0,cancelable:!0,detail:{track:this}}))&&(this.remove(),this.dispatchEvent(new CustomEvent("track-deleted",{bubbles:!0,detail:{track:this}})))}connectedCallback(){if(G(),this._init){this._onDirChange();return}this._init=!0,this._render()}disconnectedCallback(){this._mutObs&&this._mutObs.disconnect(),this._trackMutObs&&this._trackMutObs.disconnect(),this._resObs&&this._resObs.disconnect(),this._winResizeHandler&&window.removeEventListener("resize",this._winResizeHandler)}static get observedAttributes(){return["label","start","end","step","min-duration","max-segments"]}attributeChangedCallback(t,e,i){if(this._init)if(t==="label"){const s=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");if(s){const o=y(this),h=this.label||o.unnamed;s.textContent=h,s.title=h}}else requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_render(){const t=Array.from(this.children).filter(r=>r.tagName==="TIME-LINE-SEGMENT"),e=this.isVertical;this.classList.toggle("vertical",e);const i=y(this),s=this.label||i.unnamed;if(this.innerHTML=`<div class="tlt-row">
        <div class="tlt-head">
          <span class="tlt-head-label" title="${g(s)}">${g(s)}</span>
          <span class="tlt-head-range">${this._formatter.formatRange(this.tStart,this.tEnd,"axis")}</span>
        </div>
        <div class="tlt-body">
          <canvas class="tlt-grid-canvas"></canvas>
          <div class="tlt-seg-area"></div>
        </div>
      </div>`,this._isSharedMode()){const r=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");r&&(r.style.display="none")}const o=this._segArea();t.forEach(r=>o.appendChild(r));const h=this.querySelector(".tlt-body");h.addEventListener("pointerdown",r=>this._bodyDown(r)),this.addEventListener("contextmenu",r=>{if(this._creating)return;r.preventDefault();const a=y(this),n=this.label||a.unnamed;tt([{type:"header",label:a.trackMenuHeader.replace("{name}",n)},{label:a.modifyProps,action:()=>mt(this)},{label:a.clearSegments,action:()=>{q(a.confirmClearSegments.replace("{name}",n),()=>this.clearAllSegments(),this)}},{label:a.deleteTrack,danger:!0,action:()=>{q(a.confirmDeleteTrack.replace("{name}",n).replace("{range}",this._formatter.formatRange(this.tStart,this.tEnd,"axis")),()=>{this._deleteTrack()},this)}}],r.clientX,r.clientY)}),this._resObs=new ResizeObserver(()=>{this._drawGrid(),this._refreshPositions()}),this._resObs.observe(h),this._mutObs=new MutationObserver(r=>{let a=!1;for(const n of r)n.type==="childList"&&(n.addedNodes.length||n.removedNodes.length)&&(a=!0);a&&requestAnimationFrame(()=>{this._refreshPositions(),this._drawGrid()})}),this._mutObs.observe(this._segArea(),{childList:!0}),this._resizeRaf=null,this._winResizeHandler=()=>{this._resizeRaf&&cancelAnimationFrame(this._resizeRaf),this._resizeRaf=requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})},window.addEventListener("resize",this._winResizeHandler),this._trackMutObs=new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const n of a.addedNodes)n.nodeType===1&&n.tagName==="TIME-LINE-SEGMENT"&&this._segArea().appendChild(n)}),this._trackMutObs.observe(this,{childList:!0}),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_onDirChange(){const t=this.isVertical;this.classList.toggle("vertical",t),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_applyLabelPos(){const t=this._segArea();if(!t)return;const e=this.closest("time-line-container"),i=e&&e.axisMode==="shared";if(i&&e&&e.axisRulerActive){t.style.left="0",t.style.right="0",t.style.top="0",t.style.bottom="0";return}if(i&&this.isVertical){t.style.left=this.labelV==="left"?"36px":"0",t.style.right=this.labelV==="left"?"0":"36px",t.style.top="",t.style.bottom="";return}this.isVertical?(t.style.left=this.labelV==="left"?"36px":"0",t.style.right=this.labelV==="left"?"0":"36px",t.style.top="",t.style.bottom=""):(t.style.left="",t.style.right="",t.style.top=this.labelH==="bottom"?"0":"18px",t.style.bottom=this.labelH==="bottom"?"18px":"0")}_onLabelPosChange(){this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}_onLocaleChange(){const t=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-label");if(t){const e=y(this),i=this.label||e.unnamed;t.textContent=i,t.title=i}}_bodyEl(){return this.querySelector(":scope > .tlt-row > .tlt-body")}_canvasEl(){return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-grid-canvas")}_segArea(){return this.querySelector(":scope > .tlt-row > .tlt-body > .tlt-seg-area")}_segRect(){const t=this._segArea();return t?t.getBoundingClientRect():null}_bodyDown(t){if(t.button!==0||t.composedPath().some(c=>c.tagName==="TIME-LINE-SEGMENT"))return;const i=this._segRect();if(!i)return;const s=this.isVertical,o=s?t.clientY:t.clientX,h=s?i.top:i.left,r=s?i.height:i.width;if(!r)return;if(this._creating=!0,this._crS=this.tStart+(o-h)/r*(this._effRange().end-this._effRange().start),this._crP0=o,this._ghost=document.createElement("div"),this._ghost.className="tlt-ghost",this._segArea().appendChild(this._ghost),s){const c=this.time2Px(this._crS);this._ghost.style.cssText=`left:0;right:0;top:${c}px;height:2px;`}else{const c=this.time2Px(this._crS);this._ghost.style.cssText=`top:0;bottom:0;left:${c}px;width:2px;`}this.setPointerCapture(t.pointerId);const a=c=>this._createMove(c),n=c=>this._createUp(c,a,n);this.addEventListener("pointermove",a),this.addEventListener("pointerup",n),this.addEventListener("pointercancel",n),t.preventDefault()}_createMove(t){if(!this._creating||!this._ghost)return;const e=this.isVertical,i=e?t.clientY:t.clientX,s=this._crS,o=this._segRect();if(!o)return;const h=e?o.top:o.left,r=e?o.height:o.width,a=this.tStart+(i-h)/r*(this._effRange().end-this._effRange().start),n=Math.min(s,a),c=Math.max(s,a),d=this.time2Px(n),u=this.time2Px(c);e?(this._ghost.style.top=d+"px",this._ghost.style.height=Math.max(3,u-d)+"px"):(this._ghost.style.left=d+"px",this._ghost.style.width=Math.max(3,u-d)+"px")}_createUp(t,e,i){this._creating=!1,this.removeEventListener("pointermove",e),this.removeEventListener("pointerup",i),this.removeEventListener("pointercancel",i),this._ghost&&(this._ghost.remove(),this._ghost=null);const s=this.isVertical,o=s?t.clientY:t.clientX,h=this._segRect();if(!h)return;const r=s?h.top:h.left,a=s?h.height:h.width,n=this.tStart+(o-r)/a*(this._effRange().end-this._effRange().start);let c=Math.min(this._crS,n),d=Math.max(this._crS,n);this.step&&(c=P(c,this.step),d=P(d,this.step));const u=this.sortedSegs();for(const b of u)c<b.end&&d>b.start&&(this._crS<b.start?d=Math.min(d,b.start):c=Math.max(c,b.end));const{start:m,end:p}=this._effRange();if(c=_(c,m,p),d=_(d,m,p),d-c>=this.minDur){if(!this._checkSegmentLimit())return;this.addSegment(c,d)}}_checkSegmentLimit(){const t=this.maxSegments;if(t<=0)return!0;const e=this.sortedSegs().length;return e<t?!0:(this.dispatchEvent(new CustomEvent("segment-limit-reached",{bubbles:!0,detail:{track:this,current:e,max:t}})),!1)}_drawGrid(){const t=this._canvasEl(),e=this._bodyEl();if(!t||!e)return;const i=e.getBoundingClientRect();if(!i.width||!i.height)return;const s=window.devicePixelRatio||1;t.width=i.width*s,t.height=i.height*s,t.style.width=i.width+"px",t.style.height=i.height+"px";const o=t.getContext("2d");o.scale(s,s);const h=this._formatter,r=this.isVertical,{start:a,end:n}=this._effRange(),c=n-a;if(!c)return;const d=r?i.height:i.width,u=h.niceStep(c,d),m=this._segRect(),p=m?m.left-i.left:5,b=m?m.top-i.top:r?5:0;o.strokeStyle="#f0f2f5",o.lineWidth=.5;for(let f=Math.floor(a/u)*u;f<=n;f+=u/2)this._drawLine(o,i,f,r,p,b);o.strokeStyle="#dde0e4",o.lineWidth=.7;for(let f=Math.floor(a/u)*u;f<=n;f+=u)this._drawLine(o,i,f,r,p,b);if(this._isSharedMode()){const f=this.closest("time-line-container");if(f&&f.axisRulerActive)return}if(o.fillStyle="#7a8591",o.font="10px -apple-system,BlinkMacSystemFont,sans-serif",r){o.textBaseline="middle",o.textAlign=this.labelV==="left"?"left":"right";const f=this.labelV==="left"?6:i.width-6;for(let E=Math.floor(a/u)*u;E<=n;E+=u){const T=this.time2Px(E);T>14&&T<i.height-8&&o.fillText(h.format(E,"axis"),f,T+b)}const v=this.time2Px(a),H=this.time2Px(n);v<=14&&o.fillText(h.format(a,"axis"),f,v+b+10),H>=i.height-8&&o.fillText(h.format(n,"axis"),f,H+b-10)}else{o.textAlign="center",o.textBaseline=this.labelH==="bottom"?"bottom":"top";const f=this.labelH==="bottom"?i.height-4:4;for(let E=Math.floor(a/u)*u;E<=n;E+=u){const T=this.time2Px(E);T>24&&T<i.width-24&&o.fillText(h.format(E,"axis"),T+p,f)}const v=this.time2Px(a),H=this.time2Px(n);o.textAlign="left",v<=24&&o.fillText(h.format(a,"axis"),Math.max(v+p,2),f),o.textAlign="right",H>=i.width-24&&o.fillText(h.format(n,"axis"),Math.min(H+p,i.width-2),f)}}_drawLine(t,e,i,s,o,h){const r=this.time2Px(i);if(s){const a=r+h;t.beginPath(),t.moveTo(0,a),t.lineTo(e.width,a),t.stroke()}else{const a=r+o;t.beginPath(),t.moveTo(a,0),t.lineTo(a,e.height),t.stroke()}}_niceStep(t,e){return this._formatter.niceStep(t,e)}_positionOne(t,e){const i=e?null:this._segRect();if(!i&&e==null)return;const{start:s,end:o}=this._effRange(),h=o-s;if(!h)return;const r=this.isVertical,a=e??(r?i.height:i.width),n=(t.start-s)/h*a,c=(t.end-s)/h*a,d=this.sortedSegs(),u=d.indexOf(t);let m=a;if(u>=0&&u<d.length-1){const v=(d[u+1].start-s)/h*a;v>=c&&(m=v)}const p=m-n,b=Math.min(6,p),f=Math.min(Math.max(c-n,b),p);r?(t.style.top=n+"px",t.style.left="0",t.style.right="0",t.style.height=f+"px",t.style.width="",t.style.bottom=""):(t.style.left=n+"px",t.style.top="0",t.style.bottom="0",t.style.width=f+"px",t.style.height="",t.style.right=""),t.classList.toggle("tls-del-hidden",f<28)}_refreshPositions(){const t=this.sortedSegs();if(!t.length)return;const e=this._segRect();if(!e)return;const{start:i,end:s}=this._effRange(),o=s-i;if(!o)return;const h=this.isVertical,r=h?e.height:e.width,a=t.map(n=>(n.start-i)/o*r);for(let n=0;n<t.length;n++){const c=t[n],d=a[n],u=(c.end-i)/o*r;let m=r;if(n<t.length-1){const v=a[n+1];v>=u&&(m=v)}const p=m-d,b=Math.min(6,p),f=Math.min(Math.max(u-d,b),p);h?(c.style.top=d+"px",c.style.left="0",c.style.right="0",c.style.height=f+"px",c.style.width="",c.style.bottom=""):(c.style.left=d+"px",c.style.top="0",c.style.bottom="0",c.style.width=f+"px",c.style.height="",c.style.right=""),c.classList.toggle("tls-del-hidden",f<28)}this._segTextCheckRaf&&cancelAnimationFrame(this._segTextCheckRaf),this._segTextCheckRaf=requestAnimationFrame(()=>{this._segTextCheckRaf=0,t.forEach(n=>n.classList.toggle("tls-text-hidden",n._isTruncated()))})}_isSharedMode(){const t=this.closest("time-line-container");return t&&t.axisMode==="shared"}_effRange(){const t=this.closest("time-line-container");return t&&t.axisMode==="shared"?{start:t.sharedStart,end:t.sharedEnd}:{start:this.tStart,end:this.tEnd}}_onSharedConfigChange(){const t=this.querySelector(":scope > .tlt-row > .tlt-head > .tlt-head-range");this._isSharedMode()?t&&(t.style.display="none"):t&&(t.style.display=""),this._applyLabelPos(),requestAnimationFrame(()=>{this._drawGrid(),this._refreshPositions()})}}let R=null;function it(){return R||(R=document.createElement("div"),R.className="tls-global-tip",document.body.appendChild(R),R)}let st=0;function V(l){clearTimeout(st);const t=it(),e=l.getBoundingClientRect();let i="top",s="center";const o=l.getAttribute("tooltip-pos");if(o){const f=o.split("-");["top","bottom","left","right"].includes(f[0])&&(i=f[0]),["start","center","end"].includes(f[1])&&(s=f[1])}else{const f=l.closest("time-line-container");if(f){const v=(f.tooltipPos||"top-center").split("-");i=v[0]||"top",s=v[1]||"center"}}const h=l._formatter;t.innerHTML=(l.label?`<div class="tls-global-tip-label">${g(l.label)}</div>`:"")+`<div class="tls-global-tip-time">${h.formatRange(l.start,l.end,"tooltip")}</div>`,t.className="tls-global-tip",t.classList.add(i,s),t.style.removeProperty("--tlc-arrow-left"),t.style.removeProperty("--tlc-arrow-top"),t.style.left="-9999px",t.style.top="-9999px";const r=t.getBoundingClientRect(),a=r.width,n=r.height,c=6,d=8,u=window.innerWidth,m=window.innerHeight;let p,b;switch(i){case"top":b=e.top-n-c,s==="start"?(p=e.left,t.style.setProperty("--tlc-arrow-left","12px")):s==="end"?(p=e.right-a,t.style.setProperty("--tlc-arrow-left","calc(100% - 12px)")):p=e.left+e.width/2-a/2,p=_(p,d,u-a-d);break;case"bottom":b=e.bottom+c,s==="start"?(p=e.left,t.style.setProperty("--tlc-arrow-left","12px")):s==="end"?(p=e.right-a,t.style.setProperty("--tlc-arrow-left","calc(100% - 12px)")):p=e.left+e.width/2-a/2,p=_(p,d,u-a-d);break;case"left":p=e.left-a-c,s==="start"?(b=e.top,t.style.setProperty("--tlc-arrow-top","12px")):s==="end"?(b=e.bottom-n,t.style.setProperty("--tlc-arrow-top","calc(100% - 12px)")):b=e.top+e.height/2-n/2,b=_(b,d,m-n-d);break;case"right":p=e.right+c,s==="start"?(b=e.top,t.style.setProperty("--tlc-arrow-top","12px")):s==="end"?(b=e.bottom-n,t.style.setProperty("--tlc-arrow-top","calc(100% - 12px)")):b=e.top+e.height/2-n/2,b=_(b,d,m-n-d);break}t.style.left=p+"px",t.style.top=b+"px",t.classList.add("show")}function nt(){st=setTimeout(()=>{it().classList.remove("show")},120)}class rt extends HTMLElement{constructor(){super(),this._init=!1,this._ptrActive=!1,this._mode=null,this._ptr0=0,this._s0=0,this._e0=0,this._lo=0,this._hi=0,this._onMove=null,this._onUp=null}get _formatter(){const t=this.closest("time-line-container");return t?t.getFormatter():this._fmtFallback||(this._fmtFallback=N("time","hour"))}get start(){return this._formatter.parse(this.getAttribute("start"),0)}set start(t){this.setAttribute("start",String(typeof t=="number"?Math.round(t*1e4)/1e4:t))}get end(){return this._formatter.parse(this.getAttribute("end"),0)}set end(t){this.setAttribute("end",String(typeof t=="number"?Math.round(t*1e4)/1e4:t))}get label(){return this.getAttribute("label")||""}set label(t){this.setAttribute("label",t)}get color(){return this.getAttribute("color")||"#5c9ce6"}set color(t){this.setAttribute("color",t)}get radius(){return this.getAttribute("radius")||"5px"}set radius(t){this.setAttribute("radius",t)}get tooltip(){return this.getAttribute("tooltip")||"auto"}set tooltip(t){this.setAttribute("tooltip",t)}get duration(){return this.end-this.start}get _track(){let t=this.parentElement;for(;t;){if(t.tagName==="TIME-LINE-TRACK")return t;t=t.parentElement}return null}connectedCallback(){this._init||(this._init=!0,this._buildDOM(),this._bind())}static get observedAttributes(){return["start","end","label","color","radius"]}attributeChangedCallback(t,e,i){if(this._init&&((t==="label"||t==="color")&&this._buildDOM(),t==="start"||t==="end")){this._buildDOM();const s=this._track;s&&s._positionOne&&s._positionOne(this),this._updateTextVisibility()}}_buildDOM(){const t=this.color,e=this._darken(t,.18),i=this.closest("time-line-container"),s=i&&i._globalRadius!=null?i._globalRadius:"0",o=y(this);this.innerHTML=`<div class="tls-hdl tls-hdl-left" data-role="hdl-left">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-hdl tls-hdl-right" data-role="hdl-right">
        <div class="tls-hdl-bar"></div>
      </div>
      <div class="tls-bar" style="background:${t};border:1px solid ${e};border-radius:${s};">
        <div class="tls-inner">
          ${this.label?`<span class="tls-label">${g(this.label)}</span>`:""}
          <span class="tls-time">${this._formatter.formatRange(this.start,this.end,"segment")}</span>
        </div>
      </div>
      <button class="tls-del" data-role="del" title="${g(o.deleteBtnTitle)}">&times;</button>`}_bind(){this.addEventListener("pointerdown",e=>this._onDown(e)),this.addEventListener("click",e=>{if(e.target.closest('[data-role="del"]')){e.stopPropagation();const i=y(this),s=this._formatter.formatRange(this.start,this.end,"axis"),o=this.label||s;q(i.confirmDeleteSegment.replace("{name}",o).replace("{range}",s),()=>this._deleteSegment(),this)}});let t=!1;this.addEventListener("mouseenter",()=>{if(this._ptrActive)return;const e=this.tooltip;if(e==="none")return;const i=this._isTruncated();(e==="always"||i)&&(V(this),t=!0)}),this.addEventListener("mousemove",()=>{t&&V(this)}),this.addEventListener("mouseleave",()=>{nt(),t=!1}),this.addEventListener("contextmenu",e=>{if(this._ptrActive||e.target.closest('[data-role="del"]'))return;e.preventDefault(),e.stopPropagation();const i=y(this),s=this._formatter.formatRange(this.start,this.end,"axis"),o=this.label||s,h=this.label||s;tt([{type:"header",label:i.segmentMenuHeader.replace("{name}",o).replace("{range}",s)},{label:i.modifyProps,action:()=>ut(this)},{label:i.deleteBtnTitle,danger:!0,action:()=>{q(i.confirmDeleteSegment.replace("{name}",h).replace("{range}",this._formatter.formatRange(this.start,this.end,"axis")),()=>this._deleteSegment(),this)}}],e.clientX,e.clientY)})}_showTooltip(){if(this._ptrActive)return;const t=this.tooltip;if(t==="none")return;const e=this._isTruncated();(t==="always"||e)&&V(this)}_hideTooltip(){nt()}_onLocaleChange(){this._buildDOM(),this._updateTextVisibility()}_updateTextVisibility(){cancelAnimationFrame(this._tvRaf),this._tvRaf=requestAnimationFrame(()=>{this._tvRaf=0,this.classList.toggle("tls-text-hidden",this._isTruncated())})}_isTruncated(){const t=this.querySelector(":scope > .tls-bar > .tls-inner > .tls-label"),e=this.querySelector(":scope > .tls-bar > .tls-inner > .tls-time");if(t&&t.scrollWidth>t.clientWidth+1||e&&e.scrollWidth>e.clientWidth+1)return!0;const i=this.querySelector(":scope > .tls-bar > .tls-inner");if(!i)return!1;if(i.scrollWidth>i.clientWidth+1)return!0;const s=i.children;if(s.length){let o=0;for(const a of s){const n=getComputedStyle(a),c=parseFloat(n.fontSize)||11,d=n.lineHeight==="normal"?c*1.2:parseFloat(n.lineHeight)||c*1.2;o+=d}const h=getComputedStyle(i).gap;if(h&&s.length>1){const a=parseFloat(h)||0;o+=a*(s.length-1)}const r=i.parentElement;if(r&&o>r.clientHeight+1)return!0}return!1}_onDown(t){if(t.target.closest('[data-role="del"]')||t.button!==0)return;C(),this.classList.add("tls-selected");const e=t.target.closest("[data-role]");e&&e.dataset.role==="hdl-left"?this._mode="resize-left":e&&e.dataset.role==="hdl-right"?this._mode="resize-right":this._mode="move",this._ptrActive=!0,this.classList.add(this._mode.startsWith("resize")?"resizing":"dragging"),this._ptr0=this._client(t),this._s0=this.start,this._e0=this.end,this._computeBounds(),this.setPointerCapture(t.pointerId),this._onMove=i=>this._onMove_(i),this._onUp=i=>this._onUp_(i),this.addEventListener("pointermove",this._onMove),this.addEventListener("pointerup",this._onUp),this.addEventListener("pointercancel",this._onUp),this.addEventListener("lostpointercapture",this._onUp),t.preventDefault(),t.stopPropagation()}_onMove_(t){if(!this._ptrActive)return;const e=this._track;if(!e)return;const i=this._client(t)-this._ptr0,s=e.px2Time(i),o=e.step||0,h=e.minDur;if(this._mode==="resize-left"){let r=this._s0+s;r=P(r,o),r=_(r,this._lo,this._e0-h),this.start=r}else if(this._mode==="resize-right"){let r=this._e0+s;r=P(r,o),r=_(r,this._s0+h,this._hi),this.end=r}else{const r=this._e0-this._s0;let a=this._s0+s;a=P(a,o),a=_(a,this._lo,this._hi-r),this.start=a,this.end=a+r}if(e._positionOne(this),this._buildDOM(),this._updateTextVisibility(),this.tooltip!=="none"){const r=document.querySelector(".tls-global-tip");r&&r.classList.contains("show")&&V(this)}this.dispatchEvent(new CustomEvent("segment-change",{bubbles:!0,detail:{segment:this,start:this.start,end:this.end}}))}_onUp_(t){this._ptrActive&&(this._ptrActive=!1,this._mode=null,this.classList.remove("dragging","resizing","tls-selected"),this.removeEventListener("pointermove",this._onMove),this.removeEventListener("pointerup",this._onUp),this.removeEventListener("pointercancel",this._onUp),this.removeEventListener("lostpointercapture",this._onUp),this.dispatchEvent(new CustomEvent("segment-changed",{bubbles:!0,detail:{segment:this,start:this.start,end:this.end}})))}_computeBounds(){const t=this._track;if(!t){this._lo=0,this._hi=24;return}const e=t.sortedSegs(),i=e.indexOf(this),{start:s,end:o}=t._effRange?t._effRange():{start:t.tStart,end:t.tEnd};this._lo=i>0?e[i-1].end:s,this._hi=i<e.length-1?e[i+1].start:o}_client(t){const e=this._track;return e&&e.isVertical?t.clientY:t.clientX}_deleteSegment(){this.dispatchEvent(new CustomEvent("segment-before-delete",{bubbles:!0,cancelable:!0,detail:{segment:this}}))&&(this.remove(),this.dispatchEvent(new CustomEvent("segment-deleted",{bubbles:!0,detail:{segment:this}})))}_darken(t,e){let i,s,o;if(t.startsWith("#")){const h=parseInt(t.slice(1),16);i=h>>16&255,s=h>>8&255,o=h&255}else{const h=t.match(/[\d.]+/g);if(!h)return t;[i,s,o]=h.map(Number)}return`rgb(${_(i+e*255,0,255)|0},${_(s+e*255,0,255)|0},${_(o+e*255,0,255)|0})`}}customElements.get("time-line-segment")||customElements.define("time-line-segment",rt),customElements.get("time-line-track")||customElements.define("time-line-track",et),customElements.get("time-line-container")||customElements.define("time-line-container",J),A.TimeContainer=J,A.TimeSegment=rt,A.TimeTrack=et,Object.defineProperty(A,Symbol.toStringTag,{value:"Module"})});
