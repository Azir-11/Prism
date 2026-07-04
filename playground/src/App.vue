<script setup lang="ts">
import type { CvdType, PrismInput, PrismTheme } from "@simple-prism/core";
import { generateTheme, STEP_KEYS } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";
import { computed, reactive, ref, shallowRef, watch, watchEffect } from "vue";
import ContrastView from "./components/ContrastView.vue";
import ControlPanel from "./components/ControlPanel.vue";
import ExportView from "./components/ExportView.vue";
import PaletteView from "./components/PaletteView.vue";
import PreviewView from "./components/PreviewView.vue";
import { readInitialForm, saveForm, shareUrl } from "./state";
import type { Form } from "./types";
import { DEFAULT_FORM } from "./types";

const form = reactive<Form>(readInitialForm());

// Persist to localStorage and keep a shareable permalink in the address bar.
watch(
  form,
  () => {
    saveForm(form);
    if (typeof history !== "undefined") {
      history.replaceState(null, "", shareUrl(form));
    }
  },
  { deep: true },
);

function reset() {
  Object.assign(form, DEFAULT_FORM);
}

// Ephemeral accessibility preview mode (not part of the theme / permalink).
const cvd = ref<CvdType | "off">("off");

const linkCopied = ref(false);
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl(form));
  } catch {
    /* clipboard may be unavailable */
  }
  linkCopied.value = true;
  setTimeout(() => (linkCopied.value = false), 1400);
}

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
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
          <button class="btn" title="复制可分享的永久链接" @click="copyLink">
            {{ linkCopied ? "链接已复制 ✓" : "🔗 复制链接" }}
          </button>
          <button class="btn" title="恢复默认设置" @click="reset">↺ 重置</button>
          <select v-model="cvd" title="色觉模拟（无障碍预览）" style="height: 34px">
            <option value="off">色觉：正常</option>
            <option value="protan">红色盲 Protan</option>
            <option value="deutan">绿色盲 Deutan</option>
            <option value="tritan">蓝色盲 Tritan</option>
          </select>
          <div class="seg">
            <button
              :class="{ active: form.appearance === 'light' }"
              @click="form.appearance = 'light'"
            >
              ☀ 亮色
            </button>
            <button
              :class="{ active: form.appearance === 'dark' }"
              @click="form.appearance = 'dark'"
            >
              ☾ 暗色
            </button>
          </div>
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

        <PaletteView
          :theme="theme"
          :appearance="form.appearance"
          :cvd="cvd === 'off' ? null : cvd"
        />
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
