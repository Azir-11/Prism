# @simple-prism/css

> 把 Prism 主题渲染为 CSS 自定义属性（`:root` + `.dark`）。

[Prism](https://github.com/Azir-11/Prism) 的 CSS 变量适配器。

## 安装

```bash
npm i @simple-prism/core @simple-prism/css
```

## 用法

```ts
import { generateTheme } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";

const css = toCssVariables(generateTheme({ primary: "#3b82f6" }));
// :root { --prism-primary-500: …; … } + .dark { … } + 语义层
```

- 色阶按外观分别写出，语义层只写一次（`var()` 引用），`.dark` 只需重定义底层色阶即可整体翻转；
- 取值格式 `format: 'oklch' | 'hex' | 'rgb' | 'rgb-channels' | 'hsl'`；`rgb-channels` 产出裸通道 `59 130 246`，供 `rgb(var(--x) / α)` 使用；
- 命名可配：`prefix`（空串则省略前缀段）+ `suffix`。如 `{ prefix: '', suffix: 'color' }` → `--primary-500-color`，正是 UnoCSS admin 模板（soybean/gin-vue-admin）期望的形状；
- 另有 `toCssVariableMap(theme, appearance)` 产扁平映射。

```ts
// UnoCSS / rgb(var()) 惯用法项目的一键形状：
toCssVariables(theme, { format: "rgb-channels", prefix: "", suffix: "color", semantic: false });
// :root { --primary-500-color: 59 130 246; … } + .dark { … }
```

> 若目标是 UnoCSS，`@simple-prism/unocss` 的 `presetPrism` 能连注入带 alpha 的 `theme.colors` 一起做掉。

MIT · [文档](https://github.com/Azir-11/Prism)
