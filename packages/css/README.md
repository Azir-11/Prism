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
- 取值格式 `format: 'oklch' | 'hex' | 'rgb' | 'hsl'`；
- 另有 `toCssVariableMap(theme, appearance)` 产扁平映射。

MIT · [文档](https://github.com/Azir-11/Prism)
