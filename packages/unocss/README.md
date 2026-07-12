# @simple-prism/unocss

> 把 Prism 主题接入 UnoCSS —— 一个预设搞定变量注入 + 颜色映射 + 明暗。

[Prism](https://github.com/Azir-11/Prism) 的 UnoCSS 适配器。

## 安装

```bash
npm i @simple-prism/core @simple-prism/unocss
```

## 用法：`presetPrism`（推荐，零 shim）

```ts
// uno.config.ts
import { defineConfig, presetUno } from "unocss";
import { presetPrism } from "@simple-prism/unocss";

export default defineConfig({
  presets: [presetUno(), presetPrism({ primary: "#3b82f6" })],
});
```

`presetPrism` 会：

- 用 **preflights** 注入 `:root` / `.dark` 的**裸通道**变量（`--prism-primary-500-color: 59 130 246`）；
- 把 `theme.colors` 接成 `rgb(var(--…) / <alpha-value>)`，于是 `bg-primary`、`bg-primary-600`、`bg-primary/10` 全都可用；
- 暗色走 `.dark`（与 `presetWind3({ dark: 'class' })` 一致）。

入参可以是 `PrismInput`（内部自动 `generateTheme`）或已建好的 `PrismTheme`。

## 用法：`toUnoTheme`（只要 theme 对象）

若你已用别的方式注入变量（例如自有运行时或 `@simple-prism/css`），只取颜色映射：

```ts
import { generateTheme } from "@simple-prism/core";
import { toUnoTheme } from "@simple-prism/unocss";

export default defineConfig({
  theme: toUnoTheme(generateTheme({ primary: "#3b82f6" })),
  // { colors: { primary: 'rgb(var(--prism-primary-500-color) / <alpha-value>)', 'primary-500': …, … } }
});
```

## 选项

| 选项               | 默认            | 说明                                           |
| ------------------ | --------------- | ---------------------------------------------- |
| `prefix`           | `prism`         | 变量名前缀，空串则省略该段                     |
| `suffix`           | `color`         | 变量名后缀 → `--primary-500-color`             |
| `alphaPlaceholder` | `<alpha-value>` | 颜色值里的透明度占位符                         |
| `darkSelector`     | `.dark`         | 仅 `presetPrism`：暗色块选择器                 |
| `semantic`         | `false`         | 仅 `presetPrism`：是否把 shadcn 语义层一起注入 |

> 裸通道（`59 130 246`）是关键：UnoCSS 会把带透明度的用法重写成 `rgb(var(--…) / 0.1)`，只有变量里存的是裸通道才成立。这也是 soybean-admin / gin-vue-admin 一类模板的事实标准。

MIT · [文档](https://prism-docs-gamma.vercel.app/api/unocss)
