<script setup lang="ts">
interface Palette {
  fill: string;
  onFill: string;
  tint: string;
  border: string;
  text: string;
}
defineProps<{ label: string; palette: Palette }>();
</script>

<template>
  <div class="cp">
    <div class="cp-label">{{ label }}</div>
    <div class="cp-row">
      <button class="cp-btn" :style="{ background: palette.fill, color: palette.onFill }">
        主按钮
      </button>
      <button
        class="cp-btn cp-outline"
        :style="{ borderColor: palette.border, color: palette.text }"
      >
        描边
      </button>
    </div>
    <div class="cp-card" :style="{ background: palette.tint, borderColor: palette.border }">
      <div class="cp-card-title" :style="{ color: palette.text }">卡片标题</div>
      <p class="cp-card-body" :style="{ color: palette.text }">
        在浅色底上放一段正文，检验文字与背景的可读性。
      </p>
    </div>
  </div>
</template>

<style scoped>
.cp {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 12px;
  background: var(--vp-c-bg);
}
.cp-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 10px;
}
.cp-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.cp-btn {
  border: 1px solid transparent;
  border-radius: 7px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.cp-outline {
  background: transparent;
}
.cp-card {
  border: 1px solid;
  border-radius: 8px;
  padding: 11px 12px;
}
.cp-card-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}
.cp-card-body {
  font-size: 12.5px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}
</style>
