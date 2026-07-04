---
title: "@simple-prism/scss"
---

# @simple-prism/scss

把 `PrismTheme` 导出为 **Sass/SCSS**：扁平 `$` 变量、每条色板一个 map、以及 shadcn 风格的语义别名。纯函数，仅类型依赖 `@simple-prism/core`。

## toScss

```ts
function toScss(theme: PrismTheme, options?: ScssOptions): string;
```

- **扁平变量**：`$prism-<色板>-<台阶>`，浅色直接给出，暗色带 `-dark` 后缀；
- **色板 map**：每条色板一个 `$prism-<色板>` map，键含各数字台阶与 `text` / `text-contrast` / `on-solid`；
- **语义别名**：`$primary: $prism-primary-500;` 之类，引用扁平变量。

```ts
import { generateTheme } from "@simple-prism/core";
import { toScss } from "@simple-prism/scss";

const scss = toScss(generateTheme({ primary: "#3b82f6" }));
```

```scss
// Prism — light palette
// primary
$prism-primary-50: #eff6ff;
// …
$prism-primary-500: #3b82f6;
$prism-primary-on-solid: #ffffff;

// Prism — dark palette
$prism-primary-500-dark: #4c8dff;

// Scale maps (light)
$prism-primary: (
  "50": $prism-primary-50,
  // …
  "500": $prism-primary-500,
  "on-solid": $prism-primary-on-solid,
);

// Semantic aliases (light)
$primary: $prism-primary-500;
$primary-foreground: $prism-primary-on-solid;
$background: $prism-neutral-50;
```

用 map 取值：

```scss
@use "sass:map";
.btn {
  background: map.get($prism-primary, "500");
  color: map.get($prism-primary, "on-solid");
}
```

### ScssOptions

| 选项         | 类型                                 | 默认      | 说明                                        |
| ------------ | ------------------------------------ | --------- | ------------------------------------------- |
| `prefix`     | `string`                             | `'prism'` | 变量前缀。                                  |
| `format`     | `'hex' \| 'oklch' \| 'rgb' \| 'hsl'` | `'hex'`   | 取值格式。默认 hex 以便 Sass 颜色函数可用。 |
| `darkSuffix` | `string`                             | `'-dark'` | 暗色变量后缀。                              |
| `semantic`   | `boolean`                            | `true`    | 是否输出语义别名。                          |

> **为什么默认 hex？** Sass 的 `lighten` / `darken` / `mix` 只能操作真正的颜色值；`oklch()` 字符串对它们是不透明的。若你只需现代 CSS 变量而不做 Sass 颜色运算，可传 `format: 'oklch'`。
