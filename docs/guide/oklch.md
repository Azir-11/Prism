---
title: 为什么是 OKLCH
---

# 为什么是 OKLCH

颜色系统的根基,是你用来描述颜色的坐标系。坐标选错了,后面所有的"均匀""调和""对比度"都会在沙地上盖楼。Prism 把整套引擎建立在 **OKLCH** 之上——这不是赶时髦,而是一个经过深思的工程决定。

## OKLCH 是什么

OKLCH 是 OKLab 的柱坐标形式(就像 LCH 之于 Lab)。它用三个直觉清晰的轴描述颜色:

- **L(Lightness)**——感知明度,0 是纯黑,1 是纯白;
- **C(Chroma)**——彩度,从灰轴向外的距离,数值越大越鲜艳;
- **H(Hue)**——色相角,0–360°。

OKLab 由 Björn Ottosson 在 2020 年提出,目标只有一个:让欧氏距离尽可能贴近人眼的颜色差异。Prism 通过 culori 在这个空间里完成全部运算。

```ts
import { parseColor, formatOklch, toHex } from "@prism/core";

const c = parseColor("#3b5bdb");
console.log(formatOklch(c)); // oklch(0.52 0.18 264) —— L / C / H 一目了然
console.log(toHex(c)); // 回到 sRGB 十六进制
```

## 感知均匀性:让"等距"名副其实

感知均匀(perceptual uniformity)指的是:坐标上相等的距离,对应人眼相等的颜色差异变化。OKLab 在这一点上明显优于老一辈的 CIELAB,尤其在明度与彩度的协同上。

这对 Prism 至关重要。我们的明度阶按**感知间隔**排布,我们用 `deltaEOK`(在 OKLab 中计算色差)来衡量两色到底有多"不一样"。只有当坐标本身是感知均匀的,"两步之间看起来一样远"这句话才成立。

```ts
import { deltaEOK, parseColor } from "@prism/core";

const d = deltaEOK(parseColor("#3b5bdb"), parseColor("#4263eb"));
console.log(d); // OKLab 空间里的感知色差
```

## 色相稳定性:告别 CIELAB 的蓝变紫

调色板生成最经典的陷阱,是**蓝色在变亮变暗时偏向紫色**。在 CIELAB 与许多 HSL 流程里,固定"色相"调节明度,蓝色会肉眼可见地滑向紫罗兰。OKLCH 修正了这一非线性,色相在明度变化时保持稳定。Prism 因此可以沿着一条恒定(或受控)的色相线安全地拉出整条色阶——这正是 [色阶与角色合约](./scale.md) 里"色相扭转"得以精细控制的前提。

## HSL 的陷阱

HSL/HSV 直观,却不感知均匀。它的两大致命缺陷:

1. **明度是谎言。** HSL 的 L=50% 对黄色和对蓝色意味着完全不同的视觉亮度——纯黄远比纯蓝亮。于是"等明度"的色板,看上去明暗错乱。
2. **饱和度不可移植。** 同一个 S 值在不同色相上鲜艳程度迥异。

正因如此,靠 HSV 染色来配色的系统,无法保证跨色相的对比度——它们只能祈祷,而不能求解。Prism 把这条祈祷换成了工程(详见 [对比度](./contrast.md))。

## 色域映射:降彩度,而非裁剪通道

OKLCH 能描述的颜色,有些超出了 sRGB 甚至 Display-P3 的可显示范围(out of gamut)。怎么把它们拉回来,是分水岭。

- **错误做法:裁剪 RGB 通道。** 直接把超界的 R/G/B 截断到 [0,1],会同时改变明度和色相——你以为只是降了一点点鲜艳度,结果颜色"歪"了。
- **Prism 的做法:恒定 L 与 H,只降 C。** 我们用二分搜索(culori 的 clampChroma)在保持明度和色相不变的前提下,逐步收彩度,直到颜色刚好落回色域内。这样色相不漂移,明度不塌陷,只损失最少的鲜艳度。

```ts
import { clampToGamut, formatOklch } from "@prism/core";

// 把一个过界的高彩度色拉回 sRGB:只动彩度,不碰 L 与 H
const safe = clampToGamut({ mode: "oklch", l: 0.62, c: 0.4, h: 264 }, "srgb");
console.log(formatOklch(safe));
```

色域映射在 Prism 中是**逐色块**执行的。当你把目标设为 P3,可用空间随之拓宽:

```ts
import { generateTheme } from "@prism/core";

const wide = generateTheme({ primary: "#3b5bdb", gamut: "p3" });
// P3 让中高彩度的台阶保留更多鲜艳度
```

## P3,与未来

OKLCH 是 CSS Color 4 的原生公民,可以直接写进样式表,也天然伸向 Display-P3 这样的广色域。这不是孤注一掷的赌注——Tailwind v4、Radix、shadcn 都已迁向 OKLCH。Prism 站在同一条河流里。

::: info 小结
选 OKLCH,是因为它感知均匀、色相稳定、能触及 P3、且被 CSS 原生支持。坐标对了,后面的一切才站得稳。
:::
