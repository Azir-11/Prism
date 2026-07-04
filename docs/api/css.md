---
title: "@simple-prism/css"
---

# @simple-prism/css

把 `PrismTheme` 渲染为 CSS 自定义属性。纯函数，零运行时依赖（仅类型依赖 `@simple-prism/core`）。

## toCssVariables

```ts
function toCssVariables(theme: PrismTheme, options?: CssOptions): string;
```

产出 `:root`（亮色）与 `.dark`（暗色）两个块。**色阶变量按外观分别写出；语义层只在亮色块里以 `var()` 引用写一次** —— 因此 `.dark` 块只需重定义底层色阶变量，整套主题即可翻转。

```ts
import { generateTheme } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";

const css = toCssVariables(generateTheme({ primary: "#3b82f6" }));
```

```css
:root {
  /* primary */
  --prism-primary-50: oklch(0.971 0.014 259.8);
  /* … */
  --prism-primary-950: oklch(0.262 0.091 259.8);
  --prism-primary-text: oklch(…);
  --prism-primary-text-contrast: oklch(…);
  --prism-primary-on-solid: oklch(…);
  /* … 其余色板 … */

  /* semantic */
  --background: var(--prism-neutral-50);
  --foreground: var(--prism-neutral-text-contrast);
  --primary: var(--prism-primary-500);
  --primary-foreground: var(--prism-primary-on-solid);
  --border: var(--prism-neutral-200);
  --ring: var(--prism-primary-500);
  /* … */
}

.dark {
  --prism-primary-50: oklch(0.18 0.03 259.8);
  /* … 仅底层色阶，语义层自动继承 … */
}
```

### CssOptions

| 选项           | 类型                                 | 默认      | 说明             |
| -------------- | ------------------------------------ | --------- | ---------------- |
| `prefix`       | `string`                             | `'prism'` | 色阶变量前缀。   |
| `rootSelector` | `string`                             | `':root'` | 亮色块选择器。   |
| `darkSelector` | `string`                             | `'.dark'` | 暗色块选择器。   |
| `semantic`     | `boolean`                            | `true`    | 是否输出语义层。 |
| `format`       | `'oklch' \| 'hex' \| 'rgb' \| 'hsl'` | `'oklch'` | 取值格式。       |
| `indent`       | `string`                             | `'  '`    | 缩进。           |

## toCssVariableMap

```ts
function toCssVariableMap(
  theme: PrismTheme,
  appearance: Appearance,
  options?: CssOptions,
): Record<string, string>;
```

返回某一外观的扁平 `{ '--变量名': '值' }` 映射，便于以内联样式注入或交给设计令牌流水线。

```ts
const vars = toCssVariableMap(theme, "dark");
el.style.cssText = Object.entries(vars)
  .map(([k, v]) => `${k}:${v}`)
  .join(";");
```
