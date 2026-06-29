<script setup lang="ts">
import type { Form } from "../types";
import { PRESETS } from "../types";

defineProps<{ form: Form }>();
</script>

<template>
  <div class="brand">
    <svg class="triangle" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--primary)" />
          <stop offset="1" stop-color="var(--prism-tertiary-500, var(--primary))" />
        </linearGradient>
      </defs>
      <polygon
        points="50,8 92,84 8,84"
        fill="none"
        stroke="url(#g)"
        stroke-width="7"
        stroke-linejoin="round"
      />
    </svg>
    <h1>Prism</h1>
  </div>
  <p class="tagline">一种颜色，一整套和谐的主题。</p>

  <div class="field">
    <label>主题色 Primary</label>
    <div class="color-row">
      <input
        type="color"
        :value="form.primary"
        @input="form.primary = ($event.target as HTMLInputElement).value"
      />
      <input type="text" v-model="form.primary" spellcheck="false" />
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px">
      <button
        v-for="p in PRESETS"
        :key="p.name"
        class="btn"
        style="
          padding: 4px 8px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        "
        @click="form.primary = p.primary"
      >
        <span
          :style="{ width: '10px', height: '10px', borderRadius: '3px', background: p.primary }"
        />
        {{ p.name }}
      </button>
    </div>
  </div>

  <div class="divider" />

  <div class="field">
    <label class="row">
      <span>次要色 Secondary</span>
      <span class="switch">
        <input type="checkbox" v-model="form.useSecondary" />
        <span class="muted">{{ form.useSecondary ? "自定义" : "自动调和" }}</span>
      </span>
    </label>
    <div v-if="form.useSecondary" class="color-row">
      <input
        type="color"
        :value="form.secondary"
        @input="form.secondary = ($event.target as HTMLInputElement).value"
      />
      <input type="text" v-model="form.secondary" spellcheck="false" />
    </div>
  </div>

  <div class="field">
    <label class="row">
      <span>第三色 Tertiary</span>
      <span class="switch">
        <input type="checkbox" v-model="form.useTertiary" />
        <span class="muted">{{ form.useTertiary ? "自定义" : "自动调和" }}</span>
      </span>
    </label>
    <div v-if="form.useTertiary" class="color-row">
      <input
        type="color"
        :value="form.tertiary"
        @input="form.tertiary = ($event.target as HTMLInputElement).value"
      />
      <input type="text" v-model="form.tertiary" spellcheck="false" />
    </div>
  </div>

  <div class="divider" />

  <div class="field">
    <label class="row">
      <span>语义色 Semantic</span>
      <span class="switch">
        <input type="checkbox" v-model="form.overrideSemantics" />
        <span class="muted">{{ form.overrideSemantics ? "自定义" : "从品牌合成" }}</span>
      </span>
    </label>
    <div v-if="form.overrideSemantics" style="display: grid; gap: 8px">
      <div
        v-for="key in ['info', 'success', 'warning', 'error'] as const"
        :key="key"
        class="color-row"
      >
        <input
          type="color"
          :value="form[key]"
          @input="form[key] = ($event.target as HTMLInputElement).value"
        />
        <input type="text" v-model="form[key]" spellcheck="false" />
        <span class="muted" style="width: 56px; font-size: 12px">{{ key }}</span>
      </div>
    </div>
  </div>

  <div class="divider" />

  <div class="field">
    <label>中性色 Neutral</label>
    <select v-model="form.neutralMode" style="width: 100%; margin-bottom: 8px">
      <option value="auto">自动（微染品牌色相）</option>
      <option value="custom">自定义</option>
    </select>
    <div v-if="form.neutralMode === 'custom'" class="color-row" style="margin-bottom: 8px">
      <input
        type="color"
        :value="form.neutral"
        @input="form.neutral = ($event.target as HTMLInputElement).value"
      />
      <input type="text" v-model="form.neutral" spellcheck="false" />
    </div>
    <template v-if="form.neutralMode === 'auto'">
      <div class="row">
        <span class="muted">染色强度</span
        ><span class="muted">{{ form.neutralChroma.toFixed(3) }}</span>
      </div>
      <input type="range" min="0" max="0.03" step="0.001" v-model.number="form.neutralChroma" />
    </template>
  </div>

  <div class="divider" />

  <div class="field">
    <label>对比度目标（APCA Lc）</label>
    <div class="row">
      <span class="muted">正文 text</span><span class="muted">Lc {{ form.textLc }}</span>
    </div>
    <input type="range" min="45" max="75" step="1" v-model.number="form.textLc" />
    <div class="row" style="margin-top: 8px">
      <span class="muted">强调 text-contrast</span
      ><span class="muted">Lc {{ form.textContrastLc }}</span>
    </div>
    <input type="range" min="75" max="106" step="1" v-model.number="form.textContrastLc" />
  </div>

  <div class="field">
    <label>色相扭转 Hue torsion</label>
    <div class="row">
      <span class="muted">深浅两端的色相偏移</span><span class="muted">{{ form.hueTorsion }}°</span>
    </div>
    <input type="range" min="0" max="12" step="0.5" v-model.number="form.hueTorsion" />
  </div>

  <div class="field">
    <label>色域 Gamut</label>
    <div class="seg" style="width: 100%">
      <button
        :class="{ active: form.gamut === 'srgb' }"
        style="flex: 1"
        @click="form.gamut = 'srgb'"
      >
        sRGB
      </button>
      <button :class="{ active: form.gamut === 'p3' }" style="flex: 1" @click="form.gamut = 'p3'">
        Display P3
      </button>
    </div>
  </div>
</template>
