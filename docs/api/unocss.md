---
title: "@simple-prism/unocss"
---

# @simple-prism/unocss

把 `PrismTheme` 接入 UnoCSS。纯函数 + 一个预设，运行时仅依赖 `@simple-prism/core` 与 `@simple-prism/css`，对 `unocss` 只是可选的类型级 peer。

为什么单独做一个包，而不是复用 `@simple-prism/css`？因为 UnoCSS 生态（soybean-admin、gin-vue-admin 等）有一套特有惯用法：**CSS 变量存裸通道**（`--primary-500-color: 59 130 246`），`theme.colors` 里用 `rgb(var(--…) / <alpha-value>)` 引用，于是 `bg-primary` 与 `bg-primary/10` 都能工作。这套「变量 + 引用 + 透明度占位」是 css 适配器（直接出色值）与 tailwind 适配器（v4 `@theme`，presetWind3 不认）都给不了的。

## presetPrism

```ts
function presetPrism(input: PrismInput | PrismTheme, options?: PresetPrismOptions): Preset;
```

一行接入：注入变量 + 接好颜色 + 明暗。入参可以是 `PrismInput`（内部自动 `generateTheme`）或已建好的 `PrismTheme`。

```ts
// uno.config.ts
import { defineConfig, presetUno } from "unocss";
import { presetPrism } from "@simple-prism/unocss";

export default defineConfig({
  presets: [presetUno(), presetPrism({ primary: "#3b82f6" })],
});
```

预设做了三件事：

1. **preflights** 注入 `:root` / `.dark` 的裸通道变量（复用 `@simple-prism/css` 的 `rgb-channels` 格式）；
2. **theme.colors** 接成 `rgb(var(--…) / <alpha-value>)`；
3. 暗色走 `.dark`（与 `presetWind3({ dark: 'class' })` 一致）。

于是这些原子类开箱即用：

```html
<div class="bg-primary text-primary-foreground" />
<button class="bg-primary-600 hover:bg-primary-700" />
<div class="bg-primary/10 dark:bg-primary-300" />
```

UnoCSS 会把带透明度的用法重写成 `rgb(var(--prism-primary-500-color) / 0.1)` —— 这正是「变量里存裸通道」的意义。

### PresetPrismOptions

| 选项               | 类型      | 默认              | 说明                                                  |
| ------------------ | --------- | ----------------- | ----------------------------------------------------- |
| `prefix`           | `string`  | `'prism'`         | 变量名前缀；空串则省略该段。                          |
| `suffix`           | `string`  | `'color'`         | 变量名后缀 → `--primary-500-color`。                  |
| `alphaPlaceholder` | `string`  | `'<alpha-value>'` | 颜色值里的透明度占位符（`%alpha` 亦可）。             |
| `darkSelector`     | `string`  | `'.dark'`         | 暗色块选择器。                                        |
| `semantic`         | `boolean` | `false`           | 是否把 shadcn 语义层（`--background` 等）也注入 CSS。 |

## toUnoTheme

```ts
function toUnoTheme(
  theme: PrismTheme,
  options?: UnoThemeOptions,
): { colors: Record<string, string> };
```

只取颜色映射，不注入变量 —— 适合你已用别的方式（自有运行时、或 `@simple-prism/css`）注入了变量，只想把 `theme.colors` 接上。

```ts
import { generateTheme } from "@simple-prism/core";
import { toUnoTheme } from "@simple-prism/unocss";

export default defineConfig({
  theme: toUnoTheme(generateTheme({ primary: "#3b82f6" })),
});
```

产出（扁平键，`name` 为 DEFAULT 指向 500 步）：

```ts
{
  colors: {
    primary: "rgb(var(--prism-primary-500-color) / <alpha-value>)",
    "primary-50": "rgb(var(--prism-primary-50-color) / <alpha-value>)",
    // … 50–950，以及 secondary / neutral / info / success / warning / error 各色板
  }
}
```

`UnoThemeOptions` 为 `PresetPrismOptions` 中 `prefix` / `suffix` / `alphaPlaceholder` 三项。

> **裸通道是前提**：`rgb(var(--x) / α)` 只有当 `--x` 存的是 `59 130 246` 这样的裸通道时才合法。`presetPrism` 已用 `rgb-channels` 注入；若你自行注入，请确保用 `@simple-prism/css` 的 `format: 'rgb-channels'`。
