---
title: 快速上手
---

# 快速上手

## 安装

::: code-group

```bash [pnpm]
pnpm add @prism/core @prism/css
```

```bash [npm]
npm i @prism/core @prism/css
```

```bash [yarn]
yarn add @prism/core @prism/css
```

:::

`@prism/core` 是引擎，`@prism/css` 是 CSS 变量适配器。需要 Tailwind 输出再加 `@prism/tailwind`。

## 生成一套主题

```ts
import { generateTheme } from "@prism/core";

const theme = generateTheme({ primary: "#3b82f6" });

theme.scales.primary.light.steps[500].hex; // '#3b82f6' —— 你的颜色被原样保留
theme.scales.primary.light.steps[500].oklch; // 'oklch(0.623 0.214 259.8)'
theme.report.passes; // true —— 所有文字配对均达到 APCA 目标
```

只传一个 `primary`，Prism 会自动补全次色、第三色、四种语义色与中性色。

## 输出为 CSS 变量

```ts
import { toCssVariables } from "@prism/css";

const css = toCssVariables(theme);
// :root {
//   --prism-primary-50: oklch(…);  … ; --prism-primary-950: oklch(…);
//   --prism-primary-text: oklch(…);          /* 正文文字色，已对比度求解 */
//   --prism-primary-on-solid: oklch(…);       /* 放在实色按钮上的前景 */
//   …其余色板…
//   /* 语义层（引用上面的阶） */
//   --background: var(--prism-neutral-50);
//   --primary: var(--prism-primary-500);
//   --primary-foreground: var(--prism-primary-on-solid);
// }
// .dark { /* 仅重定义底层色阶变量，语义层自动翻转 */ }
```

把它注入页面即可：

```ts
document.head.append(Object.assign(document.createElement("style"), { textContent: css }));
```

然后在样式里直接使用语义 token：

```css
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}
.card {
  background: var(--card);
  border: 1px solid var(--border);
}
```

切换暗色，只需给 `<html>` 加上 `.dark` 类。

## 输出为 Tailwind v4

```ts
import { toTailwindCss } from "@prism/tailwind";

const css = toTailwindCss(theme);
// @theme {
//   --color-primary-500: oklch(…);
//   --color-background: oklch(…);
//   …
// }
// .dark { --color-primary-500: oklch(…); … }
```

之后 `bg-primary-500`、`text-foreground`、`border-border` 等工具类在明暗两种模式下都能用。

## 进阶：多种子与策略

```ts
const theme = generateTheme({
  primary: "#9333ea",
  secondary: "#f43f5e", // 显式指定，否则按分裂互补自动派生
  error: "#dc2626", // 覆盖某个语义色
  accents: ["#14b8a6"], // 额外的数据可视化用色
  neutral: "auto", // 取品牌色相微染的中性灰
  contrast: { textLc: 60, textContrastLc: 90 }, // APCA 目标
  gamut: "p3", // 输出更鲜艳的广色域中间调
  hueTorsion: 4, // 色相扭转强度
});
```

各参数的含义见 [API 参考](/api/core)。

## 在线调试

仓库内置一个 Vite + Vue 的 **playground**：输入颜色，实时查看完整色板、组件预览与对比度报告，并一键复制 CSS / Tailwind / JSON。

```bash
pnpm install
pnpm play   # 打开 http://localhost:5173
```
