<script setup lang="ts">
import type { PrismInput, PrismTheme } from "@prism/core";
import { generateTheme } from "@prism/core";
import { toCssVariables } from "@prism/css";
import { reactive, ref, shallowRef, watchEffect } from "vue";
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
          <div class="section-title" style="font-size: 18px">主题预览</div>
          <div class="muted" style="font-size: 12.5px">
            从 1 个主题色出发，自动生成
            {{ theme ? Object.keys(theme.scales).length : 0 }} 条和谐色板。
          </div>
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

      <div v-if="error" class="card" style="border-color: var(--destructive, red)">
        <strong>无法解析颜色：</strong> {{ error }}
      </div>

      <template v-if="theme">
        <PaletteView :theme="theme" :appearance="form.appearance" />
        <PreviewView />
        <ExportView :theme="theme" />
      </template>

      <footer class="muted" style="font-size: 12px; margin-top: 8px">
        Prism · OKLCH-first，APCA 对比度求解 · MIT
      </footer>
    </main>
  </div>
</template>
