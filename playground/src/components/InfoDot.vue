<script setup lang="ts">
import { ref } from "vue";

defineProps<{ label?: string }>();
const open = ref(false);
</script>

<template>
  <span class="info-dot" @mouseenter="open = true" @mouseleave="open = false">
    <button
      type="button"
      class="info-btn"
      :aria-label="label ?? '说明'"
      :aria-expanded="open"
      @click="open = !open"
    >
      ?
    </button>
    <Transition name="pop">
      <span v-if="open" class="info-pop" role="tooltip">
        <slot />
      </span>
    </Transition>
  </span>
</template>

<style scoped>
.info-dot {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}
.info-btn {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 1.5px solid var(--muted-foreground);
  color: var(--muted-foreground);
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
}
.info-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.info-pop {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 290px;
  max-width: 76vw;
  z-index: 40;
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 13px 15px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.65;
  text-transform: none;
  letter-spacing: normal;
}
.info-pop::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 9px;
  height: 9px;
  background: var(--card);
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
}
.pop-enter-active,
.pop-leave-active {
  transition: all 0.16s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -4px);
}
</style>
