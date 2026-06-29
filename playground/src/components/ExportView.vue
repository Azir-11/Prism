<script setup lang="ts">
import type { PrismTheme } from "@prism/core";
import { toJSON } from "@prism/core";
import { toCssVariables } from "@prism/css";
import { toTailwindCss } from "@prism/tailwind";
import { computed, ref } from "vue";

const props = defineProps<{ theme: PrismTheme }>();

type Tab = "css" | "tailwind" | "json";
const tab = ref<Tab>("css");
const copied = ref(false);

const outputs = computed<Record<Tab, string>>(() => ({
  css: toCssVariables(props.theme),
  tailwind: toTailwindCss(props.theme),
  json: JSON.stringify(toJSON(props.theme), null, 2),
}));

const current = computed(() => outputs.value[tab.value]);

async function copy() {
  await navigator.clipboard.writeText(current.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1400);
}

const report = computed(() => props.theme.report);
</script>

<template>
  <div class="card">
    <h2 class="section-title">对比度审计 Contrast report</h2>
    <p class="section-sub">
      以 APCA 为生成目标，WCAG 2.x 作为合规参考。
      <strong
        :style="{ color: report.passes ? 'var(--success, green)' : 'var(--destructive, red)' }"
      >
        {{ report.passes ? "全部通过 ✓" : "存在未达标项 ✗" }}
      </strong>
    </p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>配对</th>
            <th>模式</th>
            <th>APCA Lc</th>
            <th>WCAG</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in report.checks" :key="i">
            <td>{{ c.token }}</td>
            <td>{{ c.appearance === "dark" ? "暗色" : "亮色" }}</td>
            <td class="mono">{{ c.apcaLc }}</td>
            <td class="mono">{{ c.wcag.toFixed(2) }}</td>
            <td>
              <span class="dot" :class="c.passApca ? 'ok' : 'bad'" />
              {{ c.passApca ? "通过" : "未达标" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="row" style="margin-bottom: 14px">
      <div class="seg">
        <button :class="{ active: tab === 'css' }" @click="tab = 'css'">CSS 变量</button>
        <button :class="{ active: tab === 'tailwind' }" @click="tab = 'tailwind'">
          Tailwind v4
        </button>
        <button :class="{ active: tab === 'json' }" @click="tab = 'json'">JSON</button>
      </div>
      <button class="btn" @click="copy">{{ copied ? "已复制 ✓" : "复制" }}</button>
    </div>
    <pre class="code"><code>{{ current }}</code></pre>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
th,
td {
  text-align: left;
  padding: 7px 10px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
th {
  color: var(--muted-foreground);
  font-weight: 600;
}
.mono {
  font-family: ui-monospace, monospace;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.dot.ok {
  background: var(--success, #16a34a);
}
.dot.bad {
  background: var(--destructive, #dc2626);
}
.code {
  margin: 0;
  max-height: 460px;
  overflow: auto;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 12px;
  line-height: 1.55;
  color: var(--foreground);
}
</style>
