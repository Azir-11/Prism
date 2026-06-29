---
title: 对比度：求解，而非祈祷
---

# 对比度:求解,而非祈祷

"这个文字放在这个背景上,应该够清楚吧?"——只要你心里冒出这个"应该",你就是在祈祷,而不是在工程。可读性是产品对每一位用户(包括低视力用户)的底线承诺,它配得上被当作一个**约束**来求解,而不是被当作一个**希望**来寄托。Prism 选择求解。

## APCA 与 WCAG:为什么用两套

WCAG 2.x 的对比度公式(那个熟悉的 21:1 比值)历史悠久,却建立在一个过于简化的亮度模型上。它对深色背景上的浅色文字判断尤其失真——常常把实际清晰的组合判为不合格,或把实际吃力的组合放行。

**APCA**(Accessible Perceptual Contrast Algorithm,WCAG 3 的研究方向,这里使用 SA98G 版本)则基于现代的感知对比模型,把文字与背景的极性、亮度都纳入考量,结果与人眼的真实体验贴合得多。

Prism 的取舍很明确:

- **生成目标用 APCA。** 所有对比度求解,以 APCA 的 Lc 值为靶心。
- **合规报告用 WCAG。** 同时算出 WCAG 比值,供你向合规清单交代。

```ts
import { apcaLc, wcagRatio } from "@prism/core";

console.log(apcaLc("#1e293b", "#ffffff")); // APCA Lc(带极性的有符号值)
console.log(wcagRatio("#1e293b", "#ffffff")); // WCAG 比值(用于合规)
```

## solveForLc:在明度轴上二分求解

文字别名 `text` 与 `textContrast` 不是从色阶里"挑"出来的,而是 `solveForLc` **解**出来的。它的工作方式是:

固定色相、沿着彩度包络,在明度轴上做**二分搜索**,不断逼近,直到该色对**第 100 级台阶**的 APCA |Lc| 恰好命中目标值。默认:

- `text` → Lc 60(低对比正文)
- `textContrast` → Lc 90(高对比文字)

```ts
import { solveForLc, generateScale } from "@prism/core";

const scale = generateScale("#3b5bdb", {});

const body = solveForLc({
  hue: 264,
  bg: scale["100"],
  textLc: 60, // 正文目标
});

// 也可在 generateTheme 里统一指定两个目标
import { generateTheme } from "@prism/core";
const theme = generateTheme({
  primary: "#3b5bdb",
  contrast: { textLc: 60, textContrastLc: 90 },
});
```

因为是"求解到目标值",而不是"取某个固定台阶碰运气",所以无论起点是哪种颜色,落点都精确达标。

## 跨色相保证:补上 HSV 染色留下的缺口

这才是关键。靠 HSV 染色的系统(如 AntD/Arco),文字颜色往往是按固定明度规则推的——在某些色相上清晰,换个色相就吃力,因为 HSV 的"明度"在不同色相间根本不等价(详见 [为什么是 OKLCH](./oklch.md))。它们留下了一个**跨色相的对比度缺口**。

Prism 因为是对 APCA 目标求解,而非套用固定明度,所以**无论种子色是什么色相,对比度都成立**。蓝、黄、洋红、青——每一种品牌色拉出的色阶,其文字别名都达到同一个 APCA 标准。这条保证,正是 Prism 与染色系统的分水岭。

## onSolid:叠在品牌色块上的前景

按钮填充用 solid(500),那么按钮上的文字该用什么色?Prism 的 `onSolid` 别名给出答案:它按 **APCA 量级**在**纯白**与**带色调的近黑**之间择优——哪一个对 solid 的对比更强,就用哪一个。带一点色调的近黑(而非纯黑),让深色前景也与品牌同源,不显突兀。

```ts
import { pickOnSolid, generateScale, toHex } from "@prism/core";

const scale = generateScale("#3b5bdb", {});
console.log(toHex(pickOnSolid(scale["500"]))); // 白 或 带色调近黑,取 APCA 更强者
console.log(toHex(scale.onSolid)); // 同一结果,已随色阶一并产出
```

## 审计报告:把对比度摊在阳光下

Prism 不要你盲信。`generateTheme` 的返回值里带一份 `report`,把每个关键配对的 APCA 与 WCAG 数据都列出来,让你审计、回归、甚至接入 CI 卡口。

```ts
import { generateTheme } from "@prism/core";

const theme = generateTheme({ primary: "#3b5bdb" });
console.log(theme.report); // 关键配对的 APCA / WCAG 审计数据
```

::: warning 别只看一个数字
APCA 是有极性的:同一对颜色,深字浅底与浅字深底的 Lc 符号不同。Prism 的求解与报告都尊重极性——这也是它比单一 WCAG 比值更诚实的地方。
:::

对比度求解到此闭环:不是"希望够清楚",而是"解到够清楚"。而当界面翻入暗色,这套求解依然成立——见 [暗色模式](./dark-mode.md)。
