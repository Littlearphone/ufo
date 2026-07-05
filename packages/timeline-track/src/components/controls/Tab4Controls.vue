<template>
  <div>
    <div class="ctrl-group">
      <div class="ctrl-header" :class="{ collapsed: !state[0] }" @click="toggle(0)">🎯 <code>type</code> / <code>unit</code> 模式说明</div>
      <div class="ctrl-body" v-show="state[0]" style="font-size:11px;line-height:1.7;color:#444">
        <p>每个示例使用独立 <code>time-line-container</code>，互不影响。</p>
        <br>
        <p><strong>① 自然时间输入</strong></p>
        <p style="color:#6b7d8e;font-size:10px">
          <code>type="time"</code>（默认）<br>
          <code>start="09:00"</code> <code>step="30min"</code>
        </p>
        <br>
        <p><strong>② 秒级精度</strong></p>
        <p style="color:#6b7d8e;font-size:10px">
          <code>type="time" unit="second"</code><br>
          段内简化为 <code>HH:MM</code>，Tooltip 显示 <code>HH:MM:SS</code>
        </p>
        <br>
        <p><strong>③ 分钟模式</strong></p>
        <p style="color:#6b7d8e;font-size:10px">
          <code>type="time" unit="minute"</code><br>
          归一化单位为分钟，轴显示仍为时间格式
        </p>
        <br>
        <p><strong>④ 百分比</strong></p>
        <p style="color:#6b7d8e;font-size:10px">
          <code>type="number" unit="%"</code><br>
          纯数值模式，显示 <code>0 %</code> <code>100 %</code>
        </p>
        <br>
        <p><strong>⑤ 像素坐标</strong></p>
        <p style="color:#6b7d8e;font-size:10px">
          <code>type="number" unit="px"</code><br>
          数值范围标尺，可拖拽操作
        </p>
        <br>
        <p style="color:#999;font-size:10px;border-top:1px solid #eee;padding-top:6px">
          右键点击轨道/段可编辑属性，<br>编辑框自动适配对应输入类型。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAccordion } from '../../composables/useAccordion.js'

const { state, toggle } = useAccordion(1, 0)
</script>
