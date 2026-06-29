---
title: 调和：从一种颜色到一整套
---

# 调和:从一种颜色到一整套

你只递给 Prism 一种颜色,它却要交还一整套配色:次要色、第三色、中性色,还有报错、警告、成功、信息这些语义色。这一跃迁如果靠"凭感觉挑几个搭配色",就成了赌博。Prism 不赌——它**计算**调和。

色彩调和(color harmony)是有结构的:特定的色相关系会让人觉得舒服、平衡、有呼吸感。我们把这些经典关系编码进算法,再用一条贯穿始终的"再平衡铁律"把它们收束成一个家族。

## 一条铁律:旋转之后,必先再平衡

整个调和系统只信奉一句话:

> **任何一次色相旋转之后,都要重新对齐明度,并把彩度重新收敛到共享目标。**

为什么?因为单纯把品牌色的色相转个角度,得到的新色往往明度不一、鲜艳度失衡——它会显得比品牌色更亮、更跳,或更闷。再平衡(re-equalize)让所有衍生色回到与品牌色相同的"音高"(明度)和"音量"(彩度),于是它们听起来像同一支乐队,而不是各唱各的。

## 次要色:分裂互补

缺省的次要色取**分裂互补**——在品牌色相上旋转 +150°。互补色(+180°)对比强烈却容易刺眼,分裂互补保留了张力,又柔和得多。旋转之后,照例再平衡。

```ts
import { deriveSecondary, formatOklch } from "@prism/core";

const secondary = deriveSecondary("#3b5bdb");
console.log(formatOklch(secondary)); // 色相 +150°,明度/彩度已与品牌对齐
```

你也可以在 `generateTheme` 里调节调和策略:

```ts
import { generateTheme } from "@prism/core";

const theme = generateTheme({
  primary: "#3b5bdb",
  harmony: { secondary: "split-complementary" },
});
```

## 第三色:Material 的 +60°

第三色按 **Material 规则**取 +60°,并在**降低彩度**后,再次重新对齐明度、把彩度收敛回共享目标。+60° 是相邻色相中一个既不冲突、又有区分度的甜点位;略压彩度让它甘当配角,不与品牌色争夺注意力。

```ts
import { deriveTertiary, formatOklch } from "@prism/core";

const tertiary = deriveTertiary("#3b5bdb");
console.log(formatOklch(tertiary)); // +60°,彩度收敛后再平衡
```

## 中性色:带一丝品牌体温的灰

纯粹的中性灰(彩度为零)放在彩色界面里会显得冷漠、割裂。Prism 的中性色从品牌色派生,带着极低、可控的彩度——一丝几乎察觉不到的"体温",让灰与品牌同源。你可以让它自动推导,也可以指定彩度强度:

```ts
import { deriveNeutral } from "@prism/core";
import { generateTheme } from "@prism/core";

const neutral = deriveNeutral("#3b5bdb");

const theme = generateTheme({
  primary: "#3b5bdb",
  neutral: "auto", // 从品牌派生;也可传入具体色值
  neutralChroma: 0.01, // 控制那一丝体温的强度
});
```

## 语义色:锚定在通用色相,有界微调

报错色必须看起来像"危险",成功色必须看起来像"通过"——语义不能因为品牌色是蓝的就让红色变得不像红色。所以 Prism 的语义色**锚定在通用色相**上:

- error ≈ 27°
- warning ≈ 75°
- success ≈ 150°
- info ≈ 250°

随后,每个语义色相被**朝品牌色相微调 ≤15°**,再**夹回安全区间**。这一点点的微调让语义色与品牌产生默契的呼应,而 15° 的硬上限与夹取保证了红仍是红、绿仍是绿——语义绝不会被品牌色绑架。

最后,语义色用**品牌自己的明度阶 + 彩度包络**生成。于是它们不是外挂上去的孤儿,而是与品牌同呼吸的兄弟。

```ts
import { deriveSemantics } from "@prism/core";

const semantics = deriveSemantics("#3b5bdb");
// { error, warning, success, info } —— 锚定通用色相,向品牌有界微调

import { generateTheme } from "@prism/core";

const theme = generateTheme({
  primary: "#3b5bdb",
  harmony: { semanticNudge: 12 }, // 调节朝品牌微调的幅度(仍受 15° 上限约束)
});
console.log(theme.semantic); // 完整语义层
```

::: tip 为什么它们像一家人
因为每一个衍生色都走过同一道工序:旋转 → 重新对齐明度 → 重新收敛彩度。共享的明度阶与彩度包络,是这个色彩家族的"血缘"。
:::

调和到此完成:从你递来的一种颜色,Prism 计算出一整套彼此呼应、各守其位的颜色。下一步,是让它们在任何背景上都清晰可读——那是[对比度](./contrast.md)的工作。
