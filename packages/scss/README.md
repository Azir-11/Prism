# @simple-prism/scss

> 把 Prism 主题渲染为 Sass/SCSS：扁平变量 + map + 语义别名。

[Prism](https://github.com/Azir-11/Prism) 的 Sass/SCSS 适配器。

## 安装

```bash
npm i @simple-prism/core @simple-prism/scss
```

## 用法

```ts
import { generateTheme } from "@simple-prism/core";
import { toScss } from "@simple-prism/scss";

const scss = toScss(generateTheme({ primary: "#3b82f6" }));
// $prism-primary-500: #…;  （浅色 + -dark 暗色）
// $prism-primary: ("500": $prism-primary-500, "on-solid": …);  （每色板一个 map）
// $primary: $prism-primary-500;  （语义别名）
```

默认输出 hex，以便 Sass 的 `lighten` / `mix` 等颜色函数可用；也可 `format: 'oklch' | 'rgb' | 'hsl'`。

MIT · [文档](https://github.com/Azir-11/Prism)
