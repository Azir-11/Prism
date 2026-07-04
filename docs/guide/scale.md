---
title: 色阶与角色合约
---

# 色阶与角色合约

一条色阶不只是"由浅到深的十一个格子"。在 Prism 里,每一级台阶都背负着一个**角色**——它在界面里该出现在哪、承担什么职责,都是事先约定好的。我们把这套约定叫作**角色合约**(role contract)。当颜色不再是裸露的色值,而是带语义的角色,换肤、配色、保证对比度才真正可控。

## 十一级台阶

每条色阶有 11 级,沿用 Tailwind 的编号:`50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`。但编号只是门牌,真正重要的是门后的角色(沿用 Radix 风格的合约):

| 台阶            | 角色                        |
| --------------- | --------------------------- |
| 50              | 应用背景(App background)    |
| 100             | 微妙背景(Subtle background) |
| 200 / 300 / 400 | 组件背景:常态 / 悬停 / 激活 |
| **500**         | **Solid——品牌锚点**         |
| 600             | Solid 悬停                  |
| 700             | 强边框(Strong border)       |
| 800             | 强表面(Strong surface)      |
| 900             | 柔和文字(Soft text)         |
| 950             | 强文字(Strong text)         |

500 是整条色阶的心脏——**solid 锚点**,也就是按钮填充、品牌强调最常落地的那一级。其余台阶围绕它,在背景、边框、文字三大职能间各司其职。

```ts
import { generateScale, toHex } from "@simple-prism/core";

const scale = generateScale("#3b5bdb", {});
console.log(toHex(scale["50"])); // 应用背景
console.log(toHex(scale["500"])); // solid 锚点
console.log(toHex(scale["950"])); // 强文字
```

## 三个被求解出来的别名

光有 11 级还不够。最棘手的可读性问题——"文字该用哪一级才看得清"——不应靠人肉试。于是每条色阶额外携带三个**别名**,它们不是从台阶里挑出来的,而是被算法**解**出来的:

- **`text`**——低对比正文文字;
- **`textContrast`**——高对比文字;
- **`onSolid`**——叠在 solid(500)之上的前景色。

`text` 与 `textContrast` 由 `solveForLc` 以 APCA 为目标二分求解,`onSolid` 则按 APCA 量级在白色与带色调的近黑之间择优。无论品牌色是什么色相,这三个别名都被解到位(原理详见 [对比度](./contrast.md))。

```ts
import { generateScale, toHex } from "@simple-prism/core";

const s = generateScale("#3b5bdb", {});
console.log(toHex(s.text)); // 正文文字,APCA 已达标
console.log(toHex(s.textContrast)); // 强对比文字
console.log(toHex(s.onSolid)); // 叠在 500 上的前景
```

## 明度阶:手工调校的曲线

色阶的骨架是明度。Prism 的明度阶**不是线性的**——它是手工调校、按感知间隔排布的曲线。浅色阶大致从 L≈0.97 下降到 0.26,而**最大的感知跳变留给中间调**。这正是因为人眼对中间调的明度变化最敏感(详见 [设计哲学](./philosophy.md) 中"感知均匀而非数学均匀")。等差的数字会带来不等的观感;我们要的是看上去等距。

## 彩度钟形曲线

如果让彩度一路恒定,接近白和接近黑的台阶会显得脏。因为**近白与近黑根本承载不了高彩度**——物理与感知都不允许。

Prism 的彩度沿一条**钟形曲线**分布:在 L≈0.62 附近达到峰值,向白端**急剧**收敛、向黑端**平缓**收敛。更关键的是,**钟峰的高度是从种子色自身的彩度缩放出来的**——你给一个素净的品牌色,得到的是素净的色阶;你给一个明艳的品牌色,得到的是明艳的色阶。色阶忠实于你的选择,而不是强加一种鲜艳度。

```ts
import { generateScale } from "@simple-prism/core";

const muted = generateScale("#64748b", {}); // 素净种子 → 素净色阶
const vivid = generateScale("#f50057", {}); // 明艳种子 → 明艳色阶
```

## 色相扭转

让色相在整条阶上严格恒定,两端反而会显得"死"和"浊"。Prism 故意引入几度的**色相扭转**(hue torsion,默认 4°)——让色相沿明度阶轻轻漂移,使暗端和亮端重新焕发生气。它是可配置的:

```ts
import { generateScale } from "@simple-prism/core";

const s = generateScale("#3b5bdb", { hueTorsion: 6 }); // 加大扭转
```

## 种子钉定

最后,你的精确输入色被**钉定**在它按明度最接近的那一级台阶上(Radix 的 remainInput 思想)。因为明度阶是单调的,种子永远落在它两个邻居之间,**单调性绝不会被破坏**。你交付的颜色,在成品里逐字可见。

::: tip 为什么角色合约重要
因为暗色模式只需在同一套合约下镜像明度阶,组件令牌就能原样工作——不必为深色界面重写一行组件样式(详见 [暗色模式](./dark-mode.md))。
:::
