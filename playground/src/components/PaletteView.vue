<script setup lang="ts">
import type { Appearance, PrismTheme, Scale } from "@prism/core";
import { STEP_KEYS } from "@prism/core";
import { computed, ref } from "vue";

const props = defineProps<{ theme: PrismTheme; appearance: Appearance }>();

const steps = STEP_KEYS;
const copied = ref("");
let timer: ReturnType<typeof setTimeout> | undefined;

function scaleOf(name: string): Scale {
  const pair = props.theme.scales[name];
  return props.appearance === "dark" ? pair.dark : pair.light;
}

const scaleNames = computed(() => Object.keys(props.theme.scales));

function labelColor(l: number): string {
  return l > 0.6 ? "oklch(0.2 0 0)" : "oklch(0.98 0 0)";
}

async function copy(hex: string) {
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    /* clipboard may be unavailable */
  }
  copied.value = hex;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => (copied.value = ""), 1300);
}
</script>

<template>
  <div class="card">
    <h2 class="section-title">种子色 Seeds</h2>
    <p class="section-sub">
      你输入的，以及 Prism 自动配好的全部基色。“派生”= 由算法调和而来，无需你操心。
    </p>
    <div class="seeds">
      <div v-for="seed in theme.seeds" :key="seed.name" class="seed-chip" @click="copy(seed.hex)">
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
      每个基色展开为 11 阶 50–950，外加对比度求解出的文字色与 on-solid 前景。点击任意色块复制色值。
    </p>
    <div class="scale-list">
      <div v-for="name in scaleNames" :key="name" class="scale-row">
        <div class="scale-label">{{ name }}</div>
        <div class="swatches">
          <button
            v-for="s in steps"
            :key="s"
            class="swatch"
            :style="{
              background: scaleOf(name).steps[s].oklch,
              color: labelColor(scaleOf(name).steps[s].value.l),
            }"
            :title="`${name}-${s} · 点击复制 ${scaleOf(name).steps[s].hex}`"
            @click="copy(scaleOf(name).steps[s].hex)"
          >
            <span class="swatch-step">{{ s }}</span>
            <span class="swatch-hex">{{ scaleOf(name).steps[s].hex.slice(1) }}</span>
          </button>
        </div>
        <div class="swatches roles">
          <button
            class="swatch role"
            :style="{
              background: scaleOf(name).text.oklch,
              color: labelColor(scaleOf(name).text.value.l),
            }"
            :title="`text · ${scaleOf(name).text.hex}`"
            @click="copy(scaleOf(name).text.hex)"
          >
            <span class="swatch-step">text</span>
          </button>
          <button
            class="swatch role"
            :style="{
              background: scaleOf(name).textContrast.oklch,
              color: labelColor(scaleOf(name).textContrast.value.l),
            }"
            :title="`text-contrast · ${scaleOf(name).textContrast.hex}`"
            @click="copy(scaleOf(name).textContrast.hex)"
          >
            <span class="swatch-step">text+</span>
          </button>
          <button
            class="swatch role"
            :style="{
              background: scaleOf(name).steps[500].oklch,
              color: scaleOf(name).onSolid.oklch,
            }"
            :title="`on-solid · ${scaleOf(name).onSolid.hex}`"
            @click="copy(scaleOf(name).onSolid.hex)"
          >
            <span class="swatch-step">Aa</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <Transition name="toast">
    <div v-if="copied" class="copy-toast">
      已复制 <code>{{ copied }}</code>
    </div>
  </Transition>
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
  padding: 5px 13px 5px 6px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.16s ease;
}
.seed-chip:hover {
  border-color: color-mix(in oklab, var(--foreground) 22%, var(--border));
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
.seed-dot {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.14);
}
.seed-name {
  font-weight: 600;
}
.seed-tag {
  font-size: 10.5px;
  padding: 1px 7px;
  border-radius: 6px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.seed-tag.input {
  background: var(--primary);
  color: var(--primary-foreground);
}
.seed-hex {
  font-family: var(--font-body), ui-monospace, monospace;
  font-feature-settings: "tnum" 1;
  color: var(--muted-foreground);
  font-size: 11.5px;
}
.scale-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.scale-row {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  align-items: center;
  gap: 14px;
}
.scale-label {
  font-weight: 600;
  font-size: 13px;
  text-transform: capitalize;
}
.swatches {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 5px;
}
.swatches.roles {
  display: flex;
  gap: 5px;
}
.swatch {
  height: 58px;
  border: none;
  border-radius: 11px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 6px 7px;
  font-family: var(--font-body), ui-monospace, monospace;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.12);
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease;
}
.swatch:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    var(--shadow-md),
    inset 0 0 0 1px rgba(128, 128, 128, 0.12);
}
.swatch.role {
  width: 58px;
  align-items: center;
  justify-content: center;
}
.swatch-step {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.9;
}
.swatch-hex {
  font-size: 8.5px;
  letter-spacing: 0.02em;
  opacity: 0.72;
  font-feature-settings: "tnum" 1;
}
.copy-toast {
  position: fixed;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--foreground);
  color: var(--background);
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 13px;
  box-shadow: var(--shadow-lg);
  z-index: 50;
}
.copy-toast code {
  font-family: ui-monospace, monospace;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
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
