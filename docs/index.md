---
layout: home
hero:
  name: Prism
  text: 一种颜色，一整套和谐的主题
  tagline: OKLCH-first · APCA 对比度求解 · 明暗双主题 · 一键产出 CSS / Tailwind / JSON
  image:
    src: data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%233b82f6'/%3E%3Cstop offset='0.6' stop-color='%238b5cf6'/%3E%3Cstop offset='1' stop-color='%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points='100,24 168,150 32,150' fill='none' stroke='url(%23g)' stroke-width='10' stroke-linejoin='round'/%3E%3C/svg%3E
    alt: Prism
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/getting-started
    - theme: alt
      text: 设计哲学
      link: /guide/philosophy
    - theme: alt
      text: GitHub
      link: https://github.com/Azir-11/Prism
features:
  - icon: 🎯
    title: 一即一切
    details: 给一个品牌色，就能推导出次色、第三色、四种语义色与中性色 —— 每一条都是完整的 11 阶色板。颜色之间的关系是算出来的，不是猜的。
  - icon: 🧠
    title: 感知均匀
    details: 全程在 OKLCH 空间生成。等量的明度变化看起来就是等量的变化，色相在深浅之间保持稳定，告别 HSL 那种忽明忽暗、越深越脏的色阶。
  - icon: 🔍
    title: 对比度是解出来的
    details: 文字色不靠约定，而是用 APCA 二分求解到目标 Lc。无论品牌色是什么色相，正文与强调文字都达标 —— 这是 HSV 调色系统给不了的保证。
  - icon: 🌗
    title: 明暗成对
    details: 暗色不是把亮色取反，而是在同一套角色合约下镜像明度阶，并补偿暗背景下的色彩衰减。语义层是引用，切换暗色只需重定义底层变量。
  - icon: 🧩
    title: 核心 + 适配器
    details: "@prism/core 只产出颜色与令牌；@prism/css、@prism/tailwind 等适配器负责落地。要支持 shadcn 或 Material？再写一个适配器就好。"
  - icon: 📐
    title: 品牌色不可亵渎
    details: 你输入的那个颜色会被原样钉进色板最接近的一阶 —— 一个比特都不改。其余各阶围绕它生长。
---

## 三秒钟感受一下

下面是一条由**单个**品牌色实时生成的色板。改一下颜色，看它如何重排：

<PrismPalette color="#6366f1" />

```ts
import { generateTheme } from "@prism/core";
import { toCssVariables } from "@prism/css";

const theme = generateTheme({ primary: "#6366f1" });
document.head.append(
  Object.assign(document.createElement("style"), {
    textContent: toCssVariables(theme), // :root { … } + .dark { … }
  }),
);
```

就这些。剩下的 —— 次色、语义色、暗色、对比度达标 —— Prism 都替你算好了。
