<script setup lang="ts">
import type { Appearance, PrismTheme, Scale } from "@prism/core";
import { STEP_KEYS } from "@prism/core";
import { computed } from "vue";

const props = defineProps<{ theme: PrismTheme; appearance: Appearance }>();

const steps = STEP_KEYS;

function scaleOf(name: string): Scale {
  const pair = props.theme.scales[name];
  return props.appearance === "dark" ? pair.dark : pair.light;
}

const scaleNames = computed(() => Object.keys(props.theme.scales));

/** Pick a legible label color for a swatch background. */
function labelColor(l: number): string {
  return l > 0.6 ? "oklch(0.18 0 0)" : "oklch(0.98 0 0)";
}
</script>

<template>
  <div class="card">
    <h2 class="section-title">种子色 Seeds</h2>
    <p class="section-sub">输入的与自动派生的全部基色。derived = 由 Prism 调和而来。</p>
    <div class="seeds">
      <div v-for="seed in theme.seeds" :key="seed.name" class="seed-chip">
        <span class="seed-dot" :style="{ background: seed.hex }" />
        <span class="seed-name">{{ seed.name }}</span>
        <span class="seed-tag" :class="seed.source">{{
          seed.source === "input" ? "输入" : "派生"
        }}</span>
        <span class="seed-hex">{{ seed.hex }}</span>
      </div>
    </div>
  </div>

  <div class="card">
    <h2 class="section-title">色板 Scales</h2>
    <p class="section-sub">
      每个基色展开为 11 阶 50–950，外加对比度求解出的文字色与 on-solid 前景色。
    </p>
    <div class="scale-list">
      <div v-for="name in scaleNames" :key="name" class="scale-row">
        <div class="scale-label">{{ name }}</div>
        <div class="swatches">
          <div
            v-for="s in steps"
            :key="s"
            class="swatch"
            :style="{
              background: scaleOf(name).steps[s].oklch,
              color: labelColor(scaleOf(name).steps[s].value.l),
            }"
            :title="`${name}-${s}\n${scaleOf(name).steps[s].hex}\n${scaleOf(name).steps[s].oklch}`"
          >
            <span class="swatch-step">{{ s }}</span>
          </div>
        </div>
        <div class="swatches roles">
          <div
            class="swatch role"
            :style="{
              background: scaleOf(name).text.oklch,
              color: labelColor(scaleOf(name).text.value.l),
            }"
            :title="scaleOf(name).text.hex"
          >
            <span class="swatch-step">text</span>
          </div>
          <div
            class="swatch role"
            :style="{
              background: scaleOf(name).textContrast.oklch,
              color: labelColor(scaleOf(name).textContrast.value.l),
            }"
            :title="scaleOf(name).textContrast.hex"
          >
            <span class="swatch-step">text+</span>
          </div>
          <div
            class="swatch role"
            :style="{
              background: scaleOf(name).steps[500].oklch,
              color: scaleOf(name).onSolid.oklch,
            }"
            :title="`on-solid ${scaleOf(name).onSolid.hex}`"
          >
            <span class="swatch-step">Aa</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seeds {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.seed-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px 5px 6px;
  font-size: 12.5px;
}
.seed-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}
.seed-name {
  font-weight: 600;
}
.seed-tag {
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.seed-tag.input {
  background: var(--primary);
  color: var(--primary-foreground);
}
.seed-hex {
  font-family: ui-monospace, monospace;
  color: var(--muted-foreground);
  font-size: 11.5px;
}
.scale-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scale-row {
  display: grid;
  grid-template-columns: 92px 1fr auto;
  align-items: center;
  gap: 12px;
}
.scale-label {
  font-weight: 600;
  font-size: 13px;
  text-transform: capitalize;
}
.swatches {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 4px;
}
.swatches.roles {
  display: flex;
  gap: 4px;
}
.swatch {
  height: 46px;
  border-radius: 7px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 4px 5px;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  cursor: default;
  box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.12);
}
.swatch.role {
  width: 46px;
}
.swatch-step {
  opacity: 0.85;
}
@media (max-width: 920px) {
  .scale-row {
    grid-template-columns: 1fr;
  }
  .swatches.roles {
    justify-content: flex-start;
  }
}
</style>
