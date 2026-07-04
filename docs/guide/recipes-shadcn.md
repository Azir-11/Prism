---
title: 无缝接入 shadcn/ui
---

# 无缝接入 shadcn/ui

Prism 的语义层不是另起炉灶——它用的**就是 shadcn/ui 的 token 命名**。所以把 Prism 接进一个 shadcn 项目，本质上是「用你的品牌色重新生成那套变量，然后覆盖进去」。

## 命名本来就对齐

Prism 的 `toCssVariables` 会输出这一层与外观无关的语义令牌，逐个对应 shadcn 组件读取的变量：

| shadcn 变量                          | Prism 指向                     |
| ------------------------------------ | ------------------------------ |
| `--background` / `--foreground`      | 中性 50 / 中性强文字           |
| `--card` / `--card-foreground`       | 中性 50 / 中性强文字           |
| `--popover` / `--popover-foreground` | 中性 50 / 中性强文字           |
| `--primary` / `--primary-foreground` | 主色 500 / on-solid 前景       |
| `--secondary` / `--accent`           | 次色 / 第三色 500              |
| `--muted` / `--muted-foreground`     | 中性 100 / 中性正文            |
| `--border` / `--input` / `--ring`    | 中性 200 / 中性 200 / 主色 500 |
| `--destructive`                      | error 500                      |

`--primary-foreground` 用的是 Prism [对比度求解](./contrast)出来的 on-solid 前景，而不是写死的白色——所以任意品牌色相都能读得清。

## 三步接入

1. 用你的品牌色生成主题并产出 CSS：

   ```ts
   import { generateTheme } from "@simple-prism/core";
   import { toCssVariables } from "@simple-prism/css";

   const css = toCssVariables(generateTheme({ primary: "#3b82f6" }));
   ```

2. 用产物覆盖 shadcn 项目里 `globals.css` 的 `:root { … }` 与 `.dark { … }`。
3. 组件不用动——它们引用的是**角色**，主题一换整体联动。

## Tailwind v4

若你在 Tailwind v4 上跑 shadcn，直接产 `@theme` 更顺手：

```ts
import { toTailwindCss } from "@simple-prism/tailwind";

const theme = toTailwindCss(generateTheme({ primary: "#3b82f6" }));
// 写进你的入口 CSS，bg-primary / text-foreground / border-border 立即可用
```

## 老版 shadcn（Tailwind v3）注意

Tailwind v3 时代的 shadcn 用的是 `hsl(var(--background))` 写法，期望变量里存的是**裸 HSL 通道值**（如 `0 0% 100%`），而不是完整颜色。Prism 默认产完整颜色（`oklch()` 或 `var()` 引用）。两条路：

- **推荐**：迁移到 Tailwind v4 的「变量即完整颜色」写法（`background: var(--background)`），这也是 shadcn 自己的方向；
- 或者：绕开 shadcn 的语义层，直接用 Prism 的 `--prism-*` 阶变量给组件着色（`--prism-primary-500` 等），把 shadcn 当作纯组件库用。

想要标准化的令牌产物（Style Dictionary / Tokens Studio / Figma），见 [`@simple-prism/tokens`](../api/tokens)。
