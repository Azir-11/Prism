<script setup lang="ts">
import type { Scale } from "@simple-prism/core";
import { STEP_KEYS } from "@simple-prism/core";
import { computed } from "vue";

const props = defineProps<{ scale: Scale }>();

const W = 320;
const H = 120;
const PAD = 8;

interface Series {
  key: string;
  label: string;
  color: string;
  values: number[];
  min: number;
  max: number;
  fmt: (v: number) => string;
}

const series = computed<Series[]>(() => {
  const ls = STEP_KEYS.map((k) => props.scale.steps[k].value.l);
  const cs = STEP_KEYS.map((k) => props.scale.steps[k].value.c);
  const hs = STEP_KEYS.map((k) => props.scale.steps[k].value.h);
  return [
    {
      key: "l",
      label: "L 明度",
      color: "#64748b",
      values: ls,
      min: 0,
      max: 1,
      fmt: (v) => v.toFixed(3),
    },
    {
      key: "c",
      label: "C 彩度",
      color: "var(--primary)",
      values: cs,
      min: 0,
      max: Math.max(0.05, ...cs),
      fmt: (v) => v.toFixed(3),
    },
    {
      key: "h",
      label: "H 色相",
      color: "#f59e0b",
      values: hs,
      min: Math.min(...hs),
      max: Math.max(...hs),
      fmt: (v) => `${v.toFixed(1)}°`,
    },
  ];
});

function points(s: Series): string {
  const span = s.max - s.min || 1;
  return s.values
    .map((v, i) => {
      const x = PAD + (i / (STEP_KEYS.length - 1)) * (W - 2 * PAD);
      const y = H - PAD - ((v - s.min) / span) * (H - 2 * PAD);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
</script>

<template>
  <div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="ramp-chart" preserveAspectRatio="none">
      <line
        v-for="i in STEP_KEYS.length"
        :key="i"
        :x1="PAD + ((i - 1) / (STEP_KEYS.length - 1)) * (W - 2 * PAD)"
        :y1="PAD"
        :x2="PAD + ((i - 1) / (STEP_KEYS.length - 1)) * (W - 2 * PAD)"
        :y2="H - PAD"
        class="grid"
      />
      <polyline v-for="s in series" :key="s.key" :points="points(s)" :style="{ stroke: s.color }" />
    </svg>
    <div class="ramp-legend">
      <span v-for="s in series" :key="s.key">
        <i :style="{ background: s.color }" />{{ s.label }}
        <em>{{ s.fmt(s.min) }}–{{ s.fmt(s.max) }}</em>
      </span>
    </div>
  </div>
</template>

<style scoped>
.ramp-chart {
  width: 100%;
  height: 120px;
  overflow: visible;
}
.ramp-chart polyline {
  fill: none;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.ramp-chart .grid {
  stroke: var(--border);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.ramp-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted-foreground);
}
.ramp-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ramp-legend i {
  width: 12px;
  height: 3px;
  border-radius: 2px;
}
.ramp-legend em {
  font-style: normal;
  font-feature-settings: "tnum" 1;
  opacity: 0.7;
}
</style>
