<script setup lang="ts">
import { generateTheme } from "@prism/core";
import { computed, ref } from "vue";

const props = withDefaults(defineProps<{ color?: string; name?: string; editable?: boolean }>(), {
  color: "#3b82f6",
  name: "primary",
  editable: true,
});

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const appearance = ref<"light" | "dark">("light");
const seed = ref(props.color);

const theme = computed(() => {
  try {
    return generateTheme({ primary: seed.value });
  } catch {
    return null;
  }
});

const scale = computed(() => {
  const t = theme.value;
  if (!t) return null;
  const pair = t.scales[props.name] ?? t.scales.primary;
  return appearance.value === "dark" ? pair.dark : pair.light;
});

function labelColor(l: number): string {
  return l > 0.6 ? "#18181b" : "#fafafa";
}
</script>

<template>
  <div class="prism-palette">
    <div class="pp-head">
      <span class="pp-swatch-seed" :style="{ background: seed }" />
      <input v-if="editable" v-model="seed" class="pp-input" spellcheck="false" />
      <code v-else>{{ seed }}</code>
      <span class="pp-spacer" />
      <button class="pp-toggle" @click="appearance = appearance === 'light' ? 'dark' : 'light'">
        {{ appearance === "light" ? "☀ 亮色" : "☾ 暗色" }}
      </button>
    </div>
    <div v-if="scale" class="pp-row">
      <div
        v-for="s in steps"
        :key="s"
        class="pp-sw"
        :style="{ background: scale.steps[s].oklch, color: labelColor(scale.steps[s].value.l) }"
        :title="`${name}-${s} · ${scale.steps[s].hex}`"
      >
        {{ s }}
      </div>
    </div>
    <p v-else class="pp-err">无法解析颜色：{{ seed }}</p>
  </div>
</template>

<style scoped>
.prism-palette {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
  margin: 18px 0;
  background: var(--vp-c-bg-soft);
}
.pp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.pp-swatch-seed {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(127, 127, 127, 0.25);
}
.pp-input {
  width: 110px;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  padding: 0 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}
.pp-spacer {
  flex: 1;
}
.pp-toggle {
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  padding: 5px 11px;
  font-size: 13px;
  cursor: pointer;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.pp-row {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 4px;
}
.pp-sw {
  height: 50px;
  border-radius: 7px;
  display: flex;
  align-items: flex-end;
  padding: 4px 5px;
  font-size: 10px;
  font-family: var(--vp-font-family-mono);
  box-shadow: inset 0 0 0 1px rgba(127, 127, 127, 0.12);
}
.pp-err {
  color: var(--vp-c-danger-1);
  font-size: 13px;
}
@media (max-width: 640px) {
  .pp-sw {
    height: 38px;
    font-size: 9px;
  }
}
</style>
