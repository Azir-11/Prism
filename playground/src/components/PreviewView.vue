<script setup lang="ts">
// Pure presentational: everything is styled by the injected semantic tokens.
const statuses = [
  { token: "info", label: "信息" },
  { token: "success", label: "成功" },
  { token: "warning", label: "警告" },
  { token: "destructive", label: "危险" },
] as const;
</script>

<template>
  <div class="card">
    <h2 class="section-title">组件预览 Components</h2>
    <p class="section-sub">下面的真实组件全部由语义 token 着色，切换明暗或换主题色即可整体联动。</p>

    <div class="demo-grid">
      <div class="demo-block">
        <div class="demo-h">按钮 Buttons</div>
        <div class="btn-row">
          <button class="db db-primary">主要操作</button>
          <button class="db db-secondary">次要</button>
          <button class="db db-accent">强调</button>
          <button class="db db-outline">描边</button>
          <button class="db db-ghost">幽灵</button>
          <button class="db db-destructive">删除</button>
        </div>
      </div>

      <div class="demo-block">
        <div class="demo-h">状态徽章 Badges</div>
        <div class="btn-row">
          <span v-for="s in statuses" :key="s.token" class="badge" :class="`badge-${s.token}`">{{
            s.label
          }}</span>
        </div>
        <div class="alerts">
          <div v-for="s in statuses" :key="s.token" class="alert" :class="`alert-${s.token}`">
            <strong>{{ s.label }}</strong> — 语义色与品牌保持调和，同时仍然可被一眼识别。
          </div>
        </div>
      </div>

      <div class="demo-block">
        <div class="demo-h">表单 & 卡片</div>
        <div class="mini-card">
          <div class="mini-title">订阅 Prism 周报</div>
          <p class="mini-sub">每周一封，关于色彩与设计系统。</p>
          <input class="mini-input" placeholder="you@example.com" />
          <div class="btn-row" style="margin-top: 12px">
            <button class="db db-primary" style="flex: 1">订阅</button>
            <button class="db db-outline">稍后</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
}
.demo-h {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
  margin-bottom: 12px;
}
.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.db {
  border: 1px solid transparent;
  border-radius: 9px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;
}
.db:hover {
  filter: brightness(1.06);
}
.db-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}
.db-secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
}
.db-accent {
  background: var(--accent);
  color: var(--accent-foreground);
}
.db-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}
.db-outline {
  background: transparent;
  color: var(--foreground);
  border-color: var(--border);
}
.db-ghost {
  background: var(--muted);
  color: var(--foreground);
}
.badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}
.badge-info {
  background: var(--info);
  color: var(--info-foreground);
}
.badge-success {
  background: var(--success);
  color: var(--success-foreground);
}
.badge-warning {
  background: var(--warning);
  color: var(--warning-foreground);
}
.badge-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}
.alerts {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}
.alert {
  font-size: 12.5px;
  padding: 9px 12px;
  border-radius: 9px;
  border: 1px solid var(--border);
}
.alert-info {
  background: var(--prism-info-100);
  color: var(--prism-info-text);
  border-color: var(--prism-info-300);
}
.alert-success {
  background: var(--prism-success-100);
  color: var(--prism-success-text);
  border-color: var(--prism-success-300);
}
.alert-warning {
  background: var(--prism-warning-100);
  color: var(--prism-warning-text);
  border-color: var(--prism-warning-300);
}
.alert-destructive {
  background: var(--prism-error-100);
  color: var(--prism-error-text);
  border-color: var(--prism-error-300);
}
.mini-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.mini-title {
  font-weight: 700;
  font-size: 14px;
}
.mini-sub {
  color: var(--muted-foreground);
  font-size: 12.5px;
  margin: 4px 0 12px;
}
.mini-input {
  width: 100%;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--background);
  color: var(--foreground);
  font-size: 13px;
}
</style>
