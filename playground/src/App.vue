<script setup lang="ts">
import type { PrismInput, PrismTheme } from "@prism/core";
import { generateTheme, STEP_KEYS } from "@prism/core";
import { toCssVariables } from "@prism/css";
import { computed, reactive, ref, shallowRef, watchEffect } from "vue";
import ContrastView from "./components/ContrastView.vue";
import ControlPanel from "./components/ControlPanel.vue";
import ExportView from "./components/ExportView.vue";
import PaletteView from "./components/PaletteView.vue";
import PreviewView from "./components/PreviewView.vue";
import type { Form } from "./types";

const form = reactive<Form>({
  primary: "#3b82f6",
  useSecondary: false,
  secondary: "#f43f5e",
  useTertiary: false,
  tertiary: "#14b8a6",
  overrideSemantics: false,
  info: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  neutralMode: "auto",
  neutral: "#71717a",
  neutralChroma: 0.008,
  textLc: 60,
  textContrastLc: 90,
  gamut: "srgb",
  hueTorsion: 4,
  appearance: "light",
});

const theme = shallowRef<PrismTheme | null>(null);
const error = ref("");

function buildInput(f: Form): PrismInput {
  return {
    primary: f.primary,
    secondary: f.useSecondary ? f.secondary : undefined,
    tertiary: f.useTertiary ? f.tertiary : undefined,
    ...(f.overrideSemantics
      ? { info: f.info, success: f.success, warning: f.warning, error: f.error }
      : {}),
    neutral: f.neutralMode === "auto" ? "auto" : f.neutral,
    neutralChroma: f.neutralChroma,
    contrast: { textLc: f.textLc, textContrastLc: f.textContrastLc },
    gamut: f.gamut,
    hueTorsion: f.hueTorsion,
  };
}

watchEffect(() => {
  try {
    theme.value = generateTheme(buildInput(form));
    error.value = "";
  } catch (e) {
    error.value = (e as Error).message;
  }
});

const stepKeys = STEP_KEYS;
const primaryScale = computed(() => {
  const t = theme.value;
  if (!t) return null;
  return form.appearance === "dark" ? t.scales.primary.dark : t.scales.primary.light;
});
const scaleCount = computed(() => (theme.value ? Object.keys(theme.value.scales).length : 0));
const tokenCount = computed(() => (theme.value ? Object.keys(theme.value.semantic).length : 0));
const checkCount = computed(() => theme.value?.report.checks.length ?? 0);

const STYLE_ID = "prism-live-theme";
watchEffect(() => {
  const t = theme.value;
  if (!t || typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = toCssVariables(t);
  document.documentElement.classList.toggle("dark", form.appearance === "dark");
});
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <ControlPanel :form="form" />
    </aside>

    <main class="main">
      <div class="topbar">
        <div>
          <div class="section-title" style="font-size: 19px">主题预览</div>
          <div class="muted" style="font-size: 12.5px">一个主题色 → 一整套可直接落地的配色。</div>
        </div>
        <div class="seg">
          <button
            :class="{ active: form.appearance === 'light' }"
            @click="form.appearance = 'light'"
          >
            ☀ 亮色
          </button>
          <button :class="{ active: form.appearance === 'dark' }" @click="form.appearance = 'dark'">
            ☾ 暗色
          </button>
        </div>
      </div>

      <div v-if="error" class="card" style="border-color: var(--destructive, #ef4444)">
        <strong>无法解析颜色：</strong> {{ error }}
      </div>

      <template v-if="theme && primaryScale">
        <section class="hero">
          <div class="hero-ramp">
            <span
              v-for="s in stepKeys"
              :key="s"
              :style="{ background: primaryScale.steps[s].oklch }"
            />
          </div>
          <div class="hero-body">
            <div class="hero-chip" :style="{ background: form.primary }" />
            <div class="hero-meta">
              <span class="muted" style="font-size: 12px">主题色</span>
              <span class="hero-seed">{{ form.primary.toUpperCase() }}</span>
            </div>
            <div class="hero-stats">
              <div class="hero-stat">
                <b>{{ scaleCount }}</b
                ><span>条色板</span>
              </div>
              <div class="hero-stat">
                <b>{{ tokenCount }}</b
                ><span>语义令牌</span>
              </div>
              <div class="hero-stat">
                <b>{{ checkCount }}</b
                ><span>对比度检查</span>
              </div>
              <div class="hero-stat" style="justify-content: center">
                <span v-if="theme.report.passes" class="badge-pass">✓ 全部达标</span>
              </div>
            </div>
          </div>
        </section>

        <PaletteView :theme="theme" :appearance="form.appearance" />
        <PreviewView />
        <ContrastView :theme="theme" :appearance="form.appearance" />
        <ExportView :theme="theme" />
      </template>

      <footer class="muted" style="font-size: 12px; margin-top: 8px">
        Prism · OKLCH-first，APCA 对比度求解 · MIT
      </footer>
    </main>
  </div>
</template>
