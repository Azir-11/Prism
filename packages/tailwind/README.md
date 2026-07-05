# @simple-prism/tailwind

> 把 Prism 主题渲染为 Tailwind CSS v4 的 `@theme` 块。

[Prism](https://github.com/Azir-11/Prism) 的 Tailwind v4 适配器。

## 安装

```bash
npm i @simple-prism/core @simple-prism/tailwind
```

## 用法

```ts
import { generateTheme } from "@simple-prism/core";
import { toTailwindCss } from "@simple-prism/tailwind";

const theme = toTailwindCss(generateTheme({ primary: "#3b82f6" }));
// @theme { --color-primary-500: …; … } + .dark 覆盖块
```

- `bg-primary-500`、`text-foreground`、`border-border` 等工具类在明暗两态都可用；
- 取值格式 `format: 'oklch' | 'hex' | 'rgb' | 'hsl'`；
- 另有 `toTailwindColors(theme, appearance)` 产 `{ primary: { 500: '#…' }, … }` 色对象。

MIT · [文档](https://github.com/Azir-11/Prism)
