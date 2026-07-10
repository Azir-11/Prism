<script setup lang="ts">
import type { Appearance, PrismTheme } from "@simple-prism/core";
import { computed } from "vue";
import InfoDot from "./InfoDot.vue";

const props = defineProps<{ theme: PrismTheme; appearance: Appearance }>();

const APCA_MAX = 106;
const AA_PCT = (4.5 / 21) * 100;
const AAA_PCT = (7 / 21) * 100;

const APCA_DESC =
  "APCA（SA98G）是 WCAG 3 草案采用的新一代对比度算法，输出 Lc 值，范围约 0–106（深字浅底）/ 108（浅字深底），越高对比越强。它会把文字与背景的明暗极性、字号字重一并纳入，比 WCAG 2 更贴近人眼实际感受，尤其在暗色模式和中间色调上明显更准。参考线：Lc 90 ≈ 正文首选，75 ≈ 正文最低，60 ≈ 大号/流畅文本，45 ≈ 大号粗体。Prism 以它作为生成目标。";
const WCAG_DESC =
  "WCAG 2.x 是现行无障碍标准，也是多数法规引用的标准。它把两种颜色的相对亮度算成一个比值，范围从 1:1（无对比）到 21:1（纯黑配纯白，满分）。达标线：正文 AA 需 ≥ 4.5，大号文本 ≥ 3；AAA 更严，正文 ≥ 7。它计算简单、引用广泛，但只看亮度比、不分极性，在暗色配对和中间色调上会高估可读性。Prism 一并报告它以便满足合规。";

function apcaLevel(abs: number): string {
  if (abs >= 90) return "优秀";
  if (abs >= 75) return "正文达标";
  if (abs >= 60) return "大号文本";
  if (abs >= 45) return "大号粗体";
  if (abs >= 30) return "仅非正文";
  return "不足";
}

const rows = computed(() =>
  props.theme.report.checks
    .filter((c) => c.appearance === props.appearance)
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
    }),
);

const total = computed(() => rows.value.length);
const apcaPass = computed(() => rows.value.filter((r) => r.passApca).length);
const aaPass = computed(() => rows.value.filter((r) => r.aa).length);
const aaaPass = computed(() => rows.value.filter((r) => r.aaa).length);
</script>

<template>
  <div class="card">
    <div class="cv-head">
      <div>
        <h2 class="section-title">可访问性 · 对比度</h2>
        <p class="section-sub">
          Prism 以 APCA 为生成目标，WCAG 2.x 作为合规参考。下面是当前外观下每一对前景/背景的体检。
        </p>
      </div>
      <span v-if="theme.report.passes" class="badge-pass">✓ 全部达标</span>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-name">APCA <span class="muted">Lc</span></span>
        <InfoDot label="什么是 APCA">{{ APCA_DESC }}</InfoDot>
        <span class="legend-sub">满分 ≈ 106 · 正文目标 Lc 60、强调 Lc 90</span>
      </div>
      <div class="legend-item">
        <span class="legend-name">WCAG 2.x</span>
        <InfoDot label="什么是 WCAG">{{ WCAG_DESC }}</InfoDot>
        <span class="legend-sub">满分 21:1 · AA ≥ 4.5、AAA ≥ 7</span>
      </div>
    </div>

    <div class="checks">
      <div v-for="r in rows" :key="r.token" class="check">
        <div class="check-top">
          <span class="check-name">{{ r.token }}</span>
          <span class="dot" :class="r.passApca ? 'ok' : 'bad'" />
        </div>

        <div class="meter">
          <span class="m-label">APCA</span>
          <div class="bar">
            <i
              class="fill"
              :style="{
                width: r.apcaPct + '%',
                background: r.passApca ? 'var(--success, #16a34a)' : 'var(--destructive, #dc2626)',
              }"
            />
            <i
              class="mark"
              :style="{ left: r.targetPct + '%' }"
              :title="`目标 Lc ${r.apcaTarget}`"
            />
          </div>
          <span class="m-val">Lc {{ r.apcaAbs }} <em>/ 106</em></span>
          <span class="m-tag">{{ r.level }}</span>
        </div>

        <div class="meter">
          <span class="m-label">WCAG</span>
          <div class="bar">
            <i
              class="fill"
              :style="{
                width: r.wcagPct + '%',
                background: r.aa ? 'var(--success, #16a34a)' : 'var(--warning, #d97706)',
              }"
            />
            <i class="mark" :style="{ left: AA_PCT + '%' }" title="AA 4.5:1" />
            <i class="mark aaa" :style="{ left: AAA_PCT + '%' }" title="AAA 7:1" />
          </div>
          <span class="m-val">{{ r.wcag }} : 1 <em>/ 21</em></span>
          <span class="m-badges"
            ><b :class="{ on: r.aa }">AA</b><b :class="{ on: r.aaa }">AAA</b></span
          >
        </div>
      </div>
    </div>

    <div class="cv-summary">
      <span
        >APCA 目标 <b>{{ apcaPass }}/{{ total }}</b></span
      >
      <span
        >WCAG AA <b>{{ aaPass }}/{{ total }}</b></span
      >
      <span
        >WCAG AAA <b>{{ aaaPass }}/{{ total }}</b></span
      >
    </div>
  </div>
</template>

<style scoped>
.cv-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--muted);
  margin-bottom: 18px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.legend-name {
  font-weight: 700;
}
.legend-sub {
  color: var(--muted-foreground);
  font-size: 11.5px;
}
.checks {
  display: grid;
  gap: 14px;
}
.check {
  display: grid;
  grid-template-columns: 1fr;
  gap: 7px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--border);
}
.check:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.check-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.check-name {
  font-size: 12.5px;
  font-weight: 600;
  font-family: var(--font-body);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot.ok {
  background: var(--success, #16a34a);
}
.dot.bad {
  background: var(--destructive, #dc2626);
}
.meter {
  display: grid;
  grid-template-columns: 46px 1fr 120px 64px;
  align-items: center;
  gap: 10px;
}
.m-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted-foreground);
}
.bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--muted-foreground) 18%, transparent);
  overflow: visible;
}
.fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  transition: width 0.3s ease;
}
.mark {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 14px;
  background: var(--foreground);
  opacity: 0.55;
  border-radius: 1px;
}
.mark.aaa {
  opacity: 0.3;
}
.m-val {
  font-size: 12px;
  font-family: var(--font-body);
  font-feature-settings: "tnum" 1;
  white-space: nowrap;
}
.m-val em {
  color: var(--muted-foreground);
  font-style: normal;
  font-size: 11px;
}
.m-tag {
  font-size: 11px;
  color: var(--muted-foreground);
  text-align: right;
}
.m-badges {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}
.m-badges b {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 5px;
  background: color-mix(in oklab, var(--muted-foreground) 16%, transparent);
  color: var(--muted-foreground);
}
.m-badges b.on {
  background: color-mix(in oklab, var(--success, #16a34a) 22%, transparent);
  color: var(--success, #16a34a);
}
.cv-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  font-size: 12.5px;
  color: var(--muted-foreground);
}
.cv-summary b {
  color: var(--foreground);
  font-family: var(--font-body);
}
@media (max-width: 720px) {
  .meter {
    grid-template-columns: 40px 1fr;
    grid-auto-rows: auto;
  }
  .m-val,
  .m-tag,
  .m-badges {
    grid-column: 2;
    text-align: left;
    justify-content: flex-start;
  }
}

/* On wide screens the checklist is a tall single column with lots of empty
   space beside it — lay the token checks out in two columns instead. */
@media (min-width: 1500px) {
  .checks {
    grid-template-columns: 1fr 1fr;
    column-gap: 44px;
  }
  /* With two columns the built-in border-per-row reads as a clean grid;
     drop the divider under the bottom-most cell of each column. Removing the
     last two items covers both an even count (final row) and an odd count
     (bottom-left + the dangling bottom-right cell). */
  .check:last-child,
  .check:nth-last-child(2) {
    border-bottom: none;
    padding-bottom: 0;
  }
}
</style>
