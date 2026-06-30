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
  try {
    await navigator.clipboard.writeText(current.value);
  } catch {
    /* clipboard may be unavailable */
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1400);
}
</script>

<template>
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
</style>
