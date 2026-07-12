<script setup lang="ts">
import type { ColorFormat, PrismTheme } from "@simple-prism/core";
import { toJSON } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";
import { toScss } from "@simple-prism/scss";
import { toTailwindCss } from "@simple-prism/tailwind";
import { toDesignTokensJson } from "@simple-prism/tokens";
import { computed, ref } from "vue";

const props = defineProps<{ theme: PrismTheme }>();

type Tab = "css" | "unocss" | "tailwind" | "scss" | "json" | "dtcg";
const TABS: { id: Tab; label: string }[] = [
  { id: "css", label: "CSS 变量" },
  { id: "unocss", label: "UnoCSS" },
  { id: "tailwind", label: "Tailwind v4" },
  { id: "scss", label: "SCSS" },
  { id: "json", label: "JSON" },
  { id: "dtcg", label: "DTCG" },
];
const tab = ref<Tab>("css");
const format = ref<ColorFormat>("oklch");
const copied = ref(false);

const FORMATS: ColorFormat[] = ["oklch", "hex", "rgb", "rgb-channels", "hsl"];
// JSON/DTCG carry hex+oklch already and UnoCSS emits a ready config, so the
// format switch only drives CSS / Tailwind / SCSS.
const formatless = computed(
  () => tab.value === "json" || tab.value === "dtcg" || tab.value === "unocss",
);

// Rebuild the exact `presetPrism` input from the seeds the user actually supplied,
// so the exported config reproduces this theme (custom semantics included).
const seedInput = computed<Record<string, string>>(() => {
  const input: Record<string, string> = {};
  for (const s of props.theme.seeds) if (s.source === "input") input[s.name] = s.hex;
  if (!input.primary) {
    input.primary = props.theme.seeds.find((s) => s.name === "primary")?.hex ?? "#3b82f6";
  }
  return input;
});

const unocssConfig = computed(() => {
  const args = `{ ${Object.entries(seedInput.value)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ")} }`;
  return `// npm i @simple-prism/core @simple-prism/unocss

import { defineConfig, presetUno } from "unocss";
import { presetPrism } from "@simple-prism/unocss";

export default defineConfig({
  presets: [presetUno(), presetPrism(${args})],
});

// 开箱即用：bg-primary · bg-primary-600 · bg-primary/10 · text-primary-foreground · dark:bg-primary-300
`;
});

const outputs = computed<Record<Tab, string>>(() => ({
  css: toCssVariables(props.theme, { format: format.value }),
  unocss: unocssConfig.value,
  tailwind: toTailwindCss(props.theme, { format: format.value }),
  scss: toScss(props.theme, { format: format.value === "oklch" ? "hex" : format.value }),
  json: JSON.stringify(toJSON(props.theme), null, 2),
  dtcg: toDesignTokensJson(props.theme),
}));

const current = computed(() => outputs.value[tab.value]);

const FILENAMES: Record<Tab, string> = {
  css: "prism.css",
  unocss: "uno.config.ts",
  tailwind: "prism.tailwind.css",
  scss: "_prism.scss",
  json: "prism.tokens.json",
  dtcg: "prism.tokens.dtcg.json",
};

async function copy() {
  try {
    await navigator.clipboard.writeText(current.value);
  } catch {
    /* clipboard may be unavailable */
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1400);
}

function download() {
  if (typeof document === "undefined") return;
  const blob = new Blob([current.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILENAMES[tab.value];
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="card">
    <div class="row" style="margin-bottom: 14px; gap: 10px; flex-wrap: wrap">
      <div class="seg tabs">
        <button v-for="t in TABS" :key="t.id" :class="{ active: tab === t.id }" @click="tab = t.id">
          {{ t.label }}
        </button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <div v-if="!formatless" class="seg" title="颜色输出格式">
          <button
            v-for="f in FORMATS"
            :key="f"
            :class="{ active: format === f }"
            @click="format = f"
          >
            {{ f.toUpperCase() }}
          </button>
        </div>
        <button class="btn" @click="download">下载</button>
        <button class="btn" @click="copy">{{ copied ? "已复制 ✓" : "复制" }}</button>
      </div>
    </div>
    <pre class="code"><code>{{ current }}</code></pre>
  </div>
</template>

<style scoped>
.code {
  margin: 0;
  max-height: 460px;
  overflow: auto;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 12px;
  line-height: 1.55;
  color: var(--foreground);
}

/* The five format tabs are wider than a phone screen; let the pill scroll
   horizontally within its row instead of pushing the whole page sideways. */
@media (max-width: 520px) {
  .tabs {
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tabs button {
    white-space: nowrap;
  }
}
</style>
