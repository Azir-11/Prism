---
title: "@prism/core"
---

# @prism/core

引擎包。负责颜色科学与令牌生成，唯一运行时依赖是 [culori](https://culorijs.org/)。

## generateTheme

```ts
function generateTheme(input: PrismInput): PrismTheme;
```

一步生成完整主题。这是绝大多数场景唯一需要的函数。

### PrismInput

| 字段                               | 类型                             | 默认         | 说明                                        |
| ---------------------------------- | -------------------------------- | ------------ | ------------------------------------------- |
| `primary`                          | `string`                         | ——           | **必填**。品牌主色，任意 CSS 颜色。         |
| `secondary`                        | `string`                         | 自动         | 次要色；缺省按分裂互补（色相 +150°）派生。  |
| `tertiary`                         | `string`                         | 自动         | 第三色；缺省按色相 +60°、降低彩度派生。     |
| `accents`                          | `string[]`                       | `[]`         | 额外品牌色（数据可视化 / 装饰）。           |
| `info` `success` `warning` `error` | `string`                         | 自动         | 语义色；缺省从品牌色合成。                  |
| `neutral`                          | `string \| 'auto'`               | `'auto'`     | 中性色；`'auto'` 取品牌色相微染的灰。       |
| `neutralChroma`                    | `number`                         | `0.008`      | 自动中性色的彩度（`0` = 纯灰）。            |
| `contrast`                         | `{ textLc?, textContrastLc? }`   | `{ 60, 90 }` | APCA Lc 目标。                              |
| `gamut`                            | `'srgb' \| 'p3'`                 | `'srgb'`     | 输出色域。                                  |
| `appearances`                      | `('light'\|'dark')[]`            | 两者         | 生成哪些外观。                              |
| `harmony`                          | `{ secondary?, semanticNudge? }` | ——           | 调和策略；`semanticNudge` 默认 `15`（度）。 |
| `hueTorsion`                       | `number`                         | `4`          | 色阶两端的色相扭转强度（度）。              |

### PrismTheme

```ts
interface PrismTheme {
  seeds: ResolvedSeed[]; // 解析后的全部基色（含 input/derived 标记）
  scales: Record<string, { light: Scale; dark: Scale }>;
  semantic: Record<string, SemanticRef>; // 外观无关的语义 token → 色阶引用
  appearances: Appearance[];
  gamut: Gamut;
  report: ContrastReport;
  meta: { generator: "prism"; version: string };
}
```

### Scale

```ts
interface Scale {
  name: string
  appearance: Appearance
  steps: Record<50 | 100 | … | 950, Swatch> // 11 阶
  text: Swatch // 正文文字色（APCA 求解）
  textContrast: Swatch // 强调文字色（APCA 求解）
  onSolid: Swatch // 实色步上的前景
  seedStep: StepKey // 种子被钉入的步号
}

interface Swatch {
  hex: string // sRGB 回退
  oklch: string // 真值（可能是广色域）
  value: { l: number; c: number; h: number; alpha?: number }
}
```

## generateScale

```ts
function generateScale(seed: string | Oklch, opts?: ScaleOptions): Scale;
```

只生成一条 11 阶色板。`ScaleOptions`：`{ name?, appearance?, gamut?, contrast?, hueTorsion?, lightnessRamp? }`。

```ts
const blue = generateScale("#3b82f6", { appearance: "dark" });
```

## 调和派生

```ts
deriveSecondary(primary: Oklch, strategy?): Oklch
//   strategy: 'complementary' | 'split-complementary' | 'analogous' | 'triadic'
deriveTertiary(primary: Oklch): Oklch
deriveNeutral(primary: Oklch, chroma?: number): Oklch
deriveSemantics(primary: Oklch, overrides?, nudge?): {
  info: Oklch; success: Oklch; warning: Oklch; error: Oklch
}
```

## 对比度

```ts
apcaLc(text: Oklch, bg: Oklch): number // 带符号的 APCA Lc
wcagRatio(a: Oklch, b: Oklch): number // WCAG 2.x 对比度（1..21）
solveForLc(opts: SolveOptions): Oklch // 二分求解命中目标 Lc 的颜色
pickOnSolid(solid: Oklch, gamut?): Oklch // 实色上的最佳前景
verifyContrast(theme: PrismTheme): ContrastReport
```

## 颜色工具

```ts
parseColor(input: string): Oklch // 解析任意 CSS 颜色为 OKLCH
toHex(o: Oklch): string // sRGB hex
formatOklch(o: Oklch): string // 'oklch(L C H)'
clampToGamut(o: Oklch, gamut?): Oklch // 固定 L+H、降彩度收进色域
deltaEOK(a: Oklch, b: Oklch): number // OKLab 感知距离
```

## 序列化

```ts
toJSON(theme: PrismTheme): Record<string, unknown> // 干净的可序列化视图
flattenTokens(theme, appearance): Record<string, string> // token → oklch 字符串
resolveSemantic(theme, appearance, token): Swatch // 解析某个语义 token
```
