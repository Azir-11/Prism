---
title: 暗色模式：镜像明度阶
---

# 暗色模式:镜像明度阶

暗色模式不是把界面"反相"那么粗暴。一个真正考究的深色主题,要让所有组件令牌原样工作,要补偿人眼在暗背景下对颜色的感知偏差,还要在深底上依旧保证文字清晰。Prism 把暗色模式当作一等公民来设计——它的核心,是一条**镜像的明度阶**,运行在与浅色完全相同的角色合约之下。

## 镜像明度阶,同一套合约

回忆 [色阶与角色合约](./scale.md):每一级台阶都背负固定角色——50 是应用背景,500 是 solid 锚点,950 是强文字……暗色模式做的,是把明度阶**镜像翻转**:原本浅色阶里最亮的应用背景,在暗色阶里成为最暗的应用背景;原本最深的强文字,成为最亮的强文字。

但**角色合约不变**。50 依然是"应用背景",500 依然是"solid 锚点"。于是——这是整个设计的红利——**组件令牌一行都不用改**。一个引用了"组件背景(200)""强边框(700)"的按钮,在浅色和暗色下都正确,因为它引用的是角色,而角色在两套阶里语义一致,只是明度被镜像了。

```ts
import { generateTheme, toHex } from "@prism/core";

const theme = generateTheme({
  primary: "#3b5bdb",
  appearances: ["light", "dark"],
});

// 同一个角色,在两种外观下分别取到镜像后的明度
console.log(toHex(theme.appearances.light.primary["50"])); // 浅色:最亮背景
console.log(toHex(theme.appearances.dark.primary["50"])); // 暗色:最暗背景
```

## 彩度补偿:对抗亥姆霍兹-科尔劳什效应

直接镜像明度还不够。把同一个颜色放到深色背景上,它看起来会比在浅色背景上**更暗、更闷**——这与**亥姆霍兹-科尔劳什效应**(Helmholtz–Kohlrausch effect)有关:高彩度的颜色会被感知为更亮,而当我们调暗界面,这种"彩度带来的明亮感"随之流失,颜色显得没了精神。

Prism 的对策是:在暗色阶里,把**中间调的彩度提升约 15%**。这一补偿恰好抵消深色背景下颜色显得发灰的倾向,让品牌色在暗色界面里依旧饱满、鲜活,而不是蒙了一层灰。

::: info 为什么是中间调
因为彩度本就沿钟形曲线分布,峰值在中间调(见 [色阶](./scale.md))。两端近白/近黑承载不了彩度,补偿它们没有意义;真正需要"提神"的,正是承载主要彩度的中间台阶。
:::

## 语义引用让 .dark 极其廉价

Prism 的令牌分两层:底层是各条**色阶变量**,上层是**语义令牌**——而语义令牌是**与外观无关的引用**,它们指向底层色阶,而不写死具体色值。

这带来一个优雅的结果:切换到暗色,你**只需在 `.dark` 块里重新定义底层色阶变量**,整个主题就会随之翻转。语义层因为是引用,自动跟着更新,无需复制一遍。

```css
:root {
  --prism-primary-50: oklch(0.97 0.02 264);
  --prism-primary-500: oklch(0.52 0.18 264);
  /* 语义令牌是引用,不写死色值 */
  --prism-color-bg: var(--prism-primary-50);
  --prism-color-solid: var(--prism-primary-500);
}

.dark {
  /* 只需重定义底层色阶 —— 语义引用自动翻转 */
  --prism-primary-50: oklch(0.2 0.02 264);
  --prism-primary-500: oklch(0.58 0.2 264); /* 中间调彩度已上调 */
}
```

用 CSS 适配器,这两套变量可以一并产出:

```ts
import { generateTheme } from "@prism/core";
import { toCssVariables } from "@prism/css";

const theme = generateTheme({
  primary: "#3b5bdb",
  appearances: ["light", "dark"],
});

const css = toCssVariables(theme); // 含 :root 与 .dark 两套底层色阶变量
```

## 暗色下的 APCA 诚实

这正是 [对比度](./contrast.md) 里坚持 APCA 的回报。WCAG 2.x 对深底浅字的判断尤其失真,而 APCA 把极性与亮度都纳入模型,**深色背景上的对比度它算得准**。Prism 的 `text` / `textContrast` / `onSolid` 在暗色外观下同样以 APCA 为目标求解,所以深色界面里的文字不是"看起来差不多",而是真正达标。

```ts
import { apcaLc } from "@prism/core";

// 暗背景上的浅色文字 —— APCA 给出诚实的可读性判断
console.log(apcaLc("#e2e8f0", "#0f172a"));
```

::: tip 一句话
暗色模式 = 镜像明度阶 + 不变的角色合约 + 中间调彩度补偿 + 与外观无关的语义引用。组件不改一行,主题整体翻转,深色下的对比度依旧被求解到位。
:::
