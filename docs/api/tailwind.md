---
title: "@simple-prism/tailwind"
---

# @simple-prism/tailwind

把 `PrismTheme` 渲染为 Tailwind CSS v4 的 `@theme` 块。

## toTailwindCss

```ts
function toTailwindCss(theme: PrismTheme, options?: TailwindOptions): string;
```

产出一个 `@theme` 块（亮色）外加一个 `.dark` 覆盖块，二者重定义同一批 `--color-*` 变量。于是 `bg-primary-500`、`text-foreground`、`border-border` 等工具类在明暗两种模式下都生效。

```ts
import { generateTheme } from "@simple-prism/core";
import { toTailwindCss } from "@simple-prism/tailwind";

const css = toTailwindCss(generateTheme({ primary: "#3b82f6" }));
```

```css
@theme {
  /* primary */
  --color-primary-50: oklch(…);
  --color-primary-500: oklch(…);
  --color-primary-950: oklch(…);
  /* … */

  /* semantic */
  --color-background: oklch(…);
  --color-foreground: oklch(…);
  --color-primary: oklch(…);
  --color-primary-foreground: oklch(…);
}

.dark {
  --color-primary-500: oklch(…);
  --color-background: oklch(…);
  /* … */
}
```

把它放进你的入口 CSS（在 `@import 'tailwindcss';` 之后）即可。

### TailwindOptions

| 选项           | 类型               | 默认      | 说明                   |
| -------------- | ------------------ | --------- | ---------------------- |
| `darkSelector` | `string`           | `'.dark'` | 暗色覆盖块选择器。     |
| `semantic`     | `boolean`          | `true`    | 是否输出语义单色别名。 |
| `format`       | `'oklch' \| 'hex'` | `'oklch'` | 取值格式。             |
| `indent`       | `string`           | `'  '`    | 缩进。                 |

## toTailwindColors

```ts
function toTailwindColors(
  theme: PrismTheme,
  appearance?: Appearance, // 默认 'light'
  format?: "oklch" | "hex", // 默认 'hex'
): Record<string, Record<string, string>>;
```

返回 `{ primary: { 50: '#…', …, 950: '#…', DEFAULT: '#…' }, … }` 形式的颜色对象，供 `tailwind.config` 或任意程序化场景使用。

```ts
const colors = toTailwindColors(theme);
colors.primary[500]; // '#3b82f6'
colors.primary.DEFAULT; // '#3b82f6'
```
