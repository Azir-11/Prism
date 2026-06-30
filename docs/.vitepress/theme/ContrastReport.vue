<script setup lang="ts">
import { generateTheme } from "@prism/core";
import { computed, ref } from "vue";

const props = withDefaults(defineProps<{ color?: string }>(), { color: "#3b82f6" });

const seed = ref(props.color);
const appearance = ref<"light" | "dark">("light");
const APCA_MAX = 106;
const AA_PCT = (4.5 / 21) * 100;
const AAA_PCT = (7 / 21) * 100;

const theme = computed(() => {
  try {
    return generateTheme({ primary: seed.value });
  } catch {
    return null;
  }
});

function apcaLevel(abs: number): string {
  if (abs >= 90) return "优秀";
  if (abs >= 75) return "正文达标";
  if (abs >= 60) return "大号文本";
  if (abs >= 45) return "大号粗体";
  if (abs >= 30) return "仅非正文";
  return "不足";
}

const rows = computed(() => {
  const t = theme.value;
  if (!t) return [];
  return t.report.checks
    .filter((c) => c.appearance === appearance.value)
    .map((c) => {
      const abs = Math.abs(c.apcaLc);
      return {
        token: c.token,
        passApca: c.passApca,
        apcaAbs: Math.round(abs),
        apcaTarget: c.apcaTarget,
        apcaPct: Math.min(100, (abs / APCA_MAX) * 100),
        targetPct: Math.min(100, (c.apcaTarget / APCA_MAX) * 100),
        level: apcaLevel(abs),
        wcag: c.wcag.toFixed(2),
        wcagPct: Math.min(100, (c.wcag / 21) * 100),
        aa: c.wcag >= 4.5,
        aaa: c.wcag >= 7,
      };
    });
});
</script>

<template>
  <div class="cr">
    <div class="cr-head">
      <span class="cr-swatch" :style="{ background: seed }" />
      <input v-model="seed" class="cr-input" spellcheck="false" />
      <span class="cr-spacer" />
      <span class="cr-seg">
        <button :class="{ on: appearance === 'light' }" @click="appearance = 'light'">
          ☀ 亮色
        </button>
        <button :class="{ on: appearance === 'dark' }" @click="appearance = 'dark'">☾ 暗色</button>
      </span>
    </div>

    <div class="cr-legend">
      <span><b>APCA Lc</b> · 满分 ≈ 106 · 正文 60 / 强调 90</span>
      <span><b>WCAG</b> · 满分 21:1 · AA ≥ 4.5 / AAA ≥ 7</span>
    </div>

    <div v-for="r in rows" :key="r.token" class="cr-check">
      <div class="cr-name">
        <span class="cr-dot" :class="r.passApca ? 'ok' : 'bad'" />{{ r.token }}
      </div>
      <div class="cr-meter">
        <span class="cr-ml">APCA</span>
        <span class="cr-bar">
          <i
            class="cr-fill"
            :style="{
              width: r.apcaPct + '%',
              background: r.passApca ? 'var(--vp-c-green-1)' : 'var(--vp-c-red-1)',
            }"
          />
          <i
            class="cr-mark"
            :style="{ left: r.targetPct + '%' }"
            :title="`目标 Lc ${r.apcaTarget}`"
          />
        </span>
        <span class="cr-val">Lc {{ r.apcaAbs }} <em>/ 106</em></span>
        <span class="cr-tag">{{ r.level }}</span>
      </div>
      <div class="cr-meter">
        <span class="cr-ml">WCAG</span>
        <span class="cr-bar">
          <i
            class="cr-fill"
            :style="{
              width: r.wcagPct + '%',
              background: r.aa ? 'var(--vp-c-green-1)' : 'var(--vp-c-yellow-1)',
            }"
          />
          <i class="cr-mark" :style="{ left: AA_PCT + '%' }" title="AA 4.5:1" />
          <i class="cr-mark dim" :style="{ left: AAA_PCT + '%' }" title="AAA 7:1" />
        </span>
        <span class="cr-val">{{ r.wcag }} : 1 <em>/ 21</em></span>
        <span class="cr-tag">
          <b :class="{ on: r.aa }">AA</b><b :class="{ on: r.aaa }">AAA</b>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cr {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  margin: 18px 0;
  background: var(--vp-c-bg-soft);
}
.cr-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.cr-swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(127, 127, 127, 0.25);
}
.cr-input {
  width: 108px;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  padding: 0 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}
.cr-spacer {
  flex: 1;
}
.cr-seg button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  padding: 5px 10px;
  font-size: 12.5px;
  cursor: pointer;
}
.cr-seg button:first-child {
  border-radius: 7px 0 0 7px;
}
.cr-seg button:last-child {
  border-radius: 0 7px 7px 0;
  border-left: none;
}
.cr-seg button.on {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}
.cr-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  padding: 9px 11px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  margin-bottom: 14px;
}
.cr-check {
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cr-check:last-child {
  border-bottom: none;
}
.cr-name {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 6px;
}
.cr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.cr-dot.ok {
  background: var(--vp-c-green-1);
}
.cr-dot.bad {
  background: var(--vp-c-red-1);
}
.cr-meter {
  display: grid;
  grid-template-columns: 44px 1fr 116px 62px;
  align-items: center;
  gap: 9px;
  margin: 3px 0;
}
.cr-ml {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.cr-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
}
.cr-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
}
.cr-mark {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 14px;
  background: var(--vp-c-text-1);
  opacity: 0.5;
  border-radius: 1px;
}
.cr-mark.dim {
  opacity: 0.28;
}
.cr-val {
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  white-space: nowrap;
}
.cr-val em {
  color: var(--vp-c-text-3);
  font-style: normal;
  font-size: 11px;
}
.cr-tag {
  font-size: 11px;
  color: var(--vp-c-text-2);
  text-align: right;
}
.cr-tag b {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 3px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-3);
}
.cr-tag b.on {
  background: color-mix(in oklab, var(--vp-c-green-1) 22%, transparent);
  color: var(--vp-c-green-1);
}
@media (max-width: 640px) {
  .cr-meter {
    grid-template-columns: 40px 1fr;
  }
  .cr-val,
  .cr-tag {
    grid-column: 2;
    text-align: left;
  }
}
</style>
