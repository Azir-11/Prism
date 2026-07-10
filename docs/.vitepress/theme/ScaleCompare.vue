<script setup lang="ts">
import { generateTheme, type PrismTheme } from "@simple-prism/core";
import { computed } from "vue";
import type { FrameworkSnapshot } from "../data/compare/types";
import {
  chromaEnvelope,
  contrast,
  hueDrift,
  lightnessEvenness,
  onSolid,
} from "../lib/compareMetrics";
import ComponentPreview from "./ComponentPreview.vue";

const props = defineProps<{ framework: FrameworkSnapshot }>();

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const prismTheme = computed<PrismTheme | null>(() => {
  try {
    return generateTheme({ primary: props.framework.defaultPrimary });
  } catch {
    return null;
  }
});

const prismSteps = computed(() => {
  const t = prismTheme.value;
  if (!t) return [];
  const s = t.scales.primary.light;
  return STEPS.map((k) => ({ name: String(k), hex: s.steps[k].hex }));
});

function labelColor(hex: string): string {
  // 深色底用浅字，浅色底用深字（粗略按 parseColor 明度）。
  return contrast("#ffffff", hex).apca >= contrast("#111111", hex).apca ? "#fafafa" : "#18181b";
}

interface Metrics {
  evenness: number;
  drift: number;
  chromaPeak: number;
  textApca: number;
  textWcag: number;
  solidApca: number;
  solidWcag: number;
}

function metricsFor(steps: { name: string; hex: string }[], solidHex: string): Metrics {
  const hexes = steps.map((s) => s.hex);
  const lightest = steps[0].hex;
  const darkest = steps[steps.length - 1].hex;
  const env = chromaEnvelope(hexes);
  const text = contrast(darkest, lightest);
  const solid = onSolid(solidHex);
  return {
    evenness: lightnessEvenness(hexes),
    drift: hueDrift(hexes),
    chromaPeak: env.peak,
    textApca: text.apca,
    textWcag: text.wcag,
    solidApca: solid.apca,
    solidWcag: solid.wcag,
  };
}

const compSolid = computed(
  () =>
    props.framework.steps.find((s) => s.name === props.framework.solidStep)?.hex ??
    props.framework.defaultPrimary,
);

const compMetrics = computed(() => metricsFor(props.framework.steps, compSolid.value));
const prismMetrics = computed(() => {
  const t = prismTheme.value;
  if (!t || prismSteps.value.length === 0) return null;
  return metricsFor(prismSteps.value, t.scales.primary.light.steps[500].hex);
});

function pick(steps: { name: string; hex: string }[], i: number): string {
  return steps[Math.min(i, steps.length - 1)].hex;
}

const compPalette = computed(() => {
  const s = props.framework.steps;
  return {
    fill: compSolid.value,
    onFill: onSolid(compSolid.value).fg === "light" ? "#ffffff" : "#111111",
    tint: s[0].hex,
    border: pick(s, 3),
    text: s[s.length - 1].hex,
  };
});

const prismPalette = computed(() => {
  const t = prismTheme.value;
  if (!t) return null;
  const sc = t.scales.primary.light;
  return {
    fill: sc.steps[500].hex,
    onFill: sc.onSolid.hex,
    tint: sc.steps[50].hex,
    border: sc.steps[300].hex,
    // 与竞品侧一致：都用最强文字阶（competitor 用最深阶，Prism 用 950=text-strong），保证对等。
    text: sc.steps[950].hex,
  };
});

const fmt = (n: number, d = 2) => n.toFixed(d);
</script>

<template>
  <div class="sc">
    <div class="sc-meta">
      <span class="sc-seed" :style="{ background: framework.defaultPrimary }" />
      <span class="sc-seed-code">{{
        framework.defaultPrimaryRaw ?? framework.defaultPrimary
      }}</span>
      <span class="sc-badge">{{ framework.shortName }} v{{ framework.version }}</span>
      <span class="sc-badge sc-prism">Prism（同一输入）</span>
    </div>

    <!-- 色阶并排 -->
    <div class="sc-block">
      <div class="sc-rowlabel">{{ framework.shortName }}</div>
      <div class="sc-row">
        <div
          v-for="s in framework.steps"
          :key="'c-' + s.name"
          class="sc-sw"
          :style="{ background: s.hex, color: labelColor(s.hex) }"
          :title="`${s.name} · ${s.hex}`"
        >
          {{ s.name }}
        </div>
      </div>
    </div>
    <div class="sc-block">
      <div class="sc-rowlabel">Prism</div>
      <div class="sc-row">
        <div
          v-for="s in prismSteps"
          :key="'p-' + s.name"
          class="sc-sw"
          :style="{ background: s.hex, color: labelColor(s.hex) }"
          :title="`${s.name} · ${s.hex}`"
        >
          {{ s.name }}
        </div>
      </div>
    </div>

    <!-- 客观指标 -->
    <table v-if="prismMetrics" class="sc-metrics">
      <thead>
        <tr>
          <th>指标</th>
          <th>{{ framework.shortName }}</th>
          <th>Prism</th>
          <th class="sc-hint">说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>明度节奏均匀度 (CV)</td>
          <td>{{ fmt(compMetrics.evenness) }}</td>
          <td>{{ fmt(prismMetrics.evenness) }}</td>
          <td class="sc-hint">越低越均匀</td>
        </tr>
        <tr>
          <td>色相漂移 (°)</td>
          <td>{{ fmt(compMetrics.drift, 1) }}</td>
          <td>{{ fmt(prismMetrics.drift, 1) }}</td>
          <td class="sc-hint">彩色台阶的环形跨度</td>
        </tr>
        <tr>
          <td>峰值彩度</td>
          <td>{{ fmt(compMetrics.chromaPeak, 3) }}</td>
          <td>{{ fmt(prismMetrics.chromaPeak, 3) }}</td>
          <td class="sc-hint">OKLCH chroma</td>
        </tr>
        <tr>
          <td>最深压最浅 · APCA Lc</td>
          <td>{{ fmt(compMetrics.textApca, 0) }}</td>
          <td>{{ fmt(prismMetrics.textApca, 0) }}</td>
          <td class="sc-hint">正文 ≥ 75</td>
        </tr>
        <tr>
          <td>最深压最浅 · WCAG</td>
          <td>{{ fmt(compMetrics.textWcag) }}:1</td>
          <td>{{ fmt(prismMetrics.textWcag) }}:1</td>
          <td class="sc-hint">AA ≥ 4.5</td>
        </tr>
        <tr>
          <td>前景压 solid · APCA Lc</td>
          <td>{{ fmt(compMetrics.solidApca, 0) }}</td>
          <td>{{ fmt(prismMetrics.solidApca, 0) }}</td>
          <td class="sc-hint">白/近黑择优</td>
        </tr>
      </tbody>
    </table>

    <!-- 组件预览 -->
    <div v-if="prismPalette" class="sc-preview">
      <ComponentPreview :label="framework.shortName" :palette="compPalette" />
      <ComponentPreview label="Prism" :palette="prismPalette" />
    </div>
  </div>
</template>

<style scoped>
.sc {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  margin: 18px 0;
  background: var(--vp-c-bg-soft);
}
.sc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.sc-seed {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  box-shadow: inset 0 0 0 1px rgba(127, 127, 127, 0.25);
}
.sc-seed-code {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
}
.sc-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}
.sc-badge.sc-prism {
  background: color-mix(in oklab, var(--vp-c-brand-1) 18%, transparent);
  color: var(--vp-c-brand-1);
}
.sc-block {
  margin-bottom: 10px;
}
.sc-rowlabel {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}
.sc-row {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 3px;
}
.sc-sw {
  height: 44px;
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  padding: 3px 4px;
  font-size: 9px;
  font-family: var(--vp-font-family-mono);
  box-shadow: inset 0 0 0 1px rgba(127, 127, 127, 0.12);
}
.sc-metrics {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0 6px;
  font-size: 12.5px;
}
.sc-metrics th,
.sc-metrics td {
  border: 1px solid var(--vp-c-divider);
  padding: 6px 9px;
  text-align: left;
}
.sc-metrics thead th {
  background: var(--vp-c-bg);
  font-weight: 600;
}
.sc-metrics td:nth-child(2),
.sc-metrics td:nth-child(3) {
  font-family: var(--vp-font-family-mono);
}
.sc-hint {
  color: var(--vp-c-text-3);
  font-size: 11px;
}
.sc-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}
@media (max-width: 640px) {
  .sc-sw {
    height: 34px;
    font-size: 8px;
  }
  .sc-preview {
    grid-template-columns: 1fr;
  }
}
</style>
