---
title: Prism 是什么
---

# Prism 是什么

不是每个团队都有设计师。但每个产品都需要一套**协调、好看、各处文字都看得清**的颜色。

Prism 就是为这种情况做的：**你只挑一个喜欢的主题色，它替你把剩下的整套配色都配好** —— 完整的深浅色阶、次色、语义色（成功/警告/危险/信息）、中性色，以及明暗两套主题，还顺带保证了对比度。产出可以直接落地为 CSS 变量、Tailwind 或 JSON。

简单说：**把"需要懂配色才能做好"的事，变成"挑个颜色就行"。**

<PrismPalette color="#10b981" />

## 它解决的问题

手工维护一套颜色其实很难：你要为主题色调出十来档深浅、要让它们看起来均匀过渡，要保证暗色模式不糊、文字处处可读，还要让"成功绿""警告黄"既能被一眼认出、又和品牌色像一家人。这些通常是设计师的活儿。

没有设计师时，大多数人要么手动一格格试，要么用简单的"变亮/变暗"工具 —— 结果往往不够协调，对比度也没人把关。Prism 把这些都变成自动、可靠的计算：

| 你给的                               | Prism 替你配好的                                |
| ------------------------------------ | ----------------------------------------------- |
| `primary` 一个主题色                 | 11 档深浅的主色板 + 文字色 + 实色按钮上的前景色 |
| （可选）`secondary` / `tertiary`     | 不填就按配色规则自动调和出来                    |
| （可选）`info/success/warning/error` | 不填就从主题色合成，并固定在能被认出的色相上    |
| （可选）`neutral`                    | 不填就用带一点主题色味道的中性灰                |
| ——                                   | 亮色 + 暗色两套，外加一份对比度体检报告         |

你想多管，就多给几个颜色；什么都不想管，就只给一个 `primary`。

## 怎么用

```ts
import { generateTheme } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";

const theme = generateTheme({ primary: "#3b82f6" });
const css = toCssVariables(theme); // 直接注入页面即可
```

更完整的接入见 [快速上手](/guide/getting-started)；想理解它内部怎么把一个颜色变成一套主题，见 [生成逻辑](/guide/how-it-works)。

## 它是怎么组织的

```
@simple-prism/core        颜色计算与令牌生成（唯一依赖 culori）
   ├── @simple-prism/css        → :root { … } + .dark { … }
   └── @simple-prism/tailwind   → @theme { … } + .dark 覆盖
```

引擎只负责"算颜色"，不关心输出成什么格式；适配器只负责"把结果翻译成 CSS / Tailwind / JSON"。所以无论你的项目用什么技术栈，接进来都很轻；要支持新的格式，再写一个适配器即可。

## 下一步

- [快速上手](/guide/getting-started) —— 安装与第一段代码
- [生成逻辑](/guide/how-it-works) —— 一个颜色如何变成一套主题
- [设计理念](/guide/philosophy) —— Prism 替你把关的几件事
