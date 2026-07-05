---
layout: home
hero:
  name: Prism
  text: 没有设计师，也能配出好看的主题
  tagline: 给一个你喜欢的颜色，Prism 自动生成专业、协调、明暗双全的整套配色 —— 让不懂配色的人，也能轻松拥有设计师级的视觉。
  image:
    src: data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%233b82f6'/%3E%3Cstop offset='0.6' stop-color='%238b5cf6'/%3E%3Cstop offset='1' stop-color='%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points='100,24 168,150 32,150' fill='none' stroke='url(%23g)' stroke-width='10' stroke-linejoin='round'/%3E%3C/svg%3E
    alt: Prism
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/getting-started
    - theme: alt
      text: 🎨 在线体验
      link: https://prism-playground.vercel.app/
    - theme: alt
      text: 它是怎么做到的
      link: /guide/how-it-works
    - theme: alt
      text: GitHub
      link: https://github.com/Azir-11/Prism
features:
  - icon: 🎯
    title: 只需挑一个颜色
    details: 你选一个喜欢的主题色，次色、语义色、中性色和每一档深浅都自动配好。不用一格格调，也不用懂色彩理论。
  - icon: ✨
    title: 自动就协调
    details: 背后用 OKLCH 让色阶感知均匀 —— 不会忽明忽暗，越深也不发脏。你不必理解原理，得到的结果自然耐看。
  - icon: 🔍
    title: 文字一定看得清
    details: 每一处文字、按钮的配色都用 APCA 算到达标。再也不用纠结“这个字放在这个底色上，到底够不够清楚”。
  - icon: 🌗
    title: 暗色一并配好
    details: 暗色模式不是把亮色粗暴反转，而是自动生成同样好看、同样可读的一整套，省去你重配一遍的功夫。
  - icon: 🧩
    title: 拿来即用
    details: 一键产出 CSS 变量、Tailwind v4 或 JSON，直接接进现有项目；语义令牌命名贴近 shadcn，几乎零迁移成本。
  - icon: 📐
    title: 你的颜色不会被改
    details: 你选定的那个颜色会被原样保留、钉进色板，其余颜色都围绕它生长 —— 品牌色始终是你说了算。
---

## 不需要懂配色，改个颜色就行

下面这条色板，由**一个**主题色实时生成。改一下颜色，看 Prism 怎么把它铺成一整套协调的深浅：

<PrismPalette color="#6366f1" />

```ts
import { generateTheme } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";

const theme = generateTheme({ primary: "#6366f1" });
document.head.append(
  Object.assign(document.createElement("style"), {
    textContent: toCssVariables(theme), // :root { … } + .dark { … }
  }),
);
```

这就够了。次色、语义色、暗色、文字对比度 —— 那些原本要请设计师把关的事，Prism 都替你算好了。想知道它是怎么做到的？看 [生成逻辑](/guide/how-it-works)。
