# @simple-prism/core

> 从一个（或几个）种子色，生成协调、可读、明暗双全的设计令牌系统。OKLCH-first，APCA 对比度求解。

[Prism](https://github.com/Azir-11/Prism) 的核心引擎 —— 只产颜色，落地交给适配器。

## 安装

```bash
npm i @simple-prism/core
```

## 用法

```ts
import { generateTheme } from "@simple-prism/core";

const theme = generateTheme({ primary: "#3b82f6" });
theme.scales.primary.light.steps[500].hex; // "#3b82f6"
```

- 11 阶色板（`50–950`）+ Radix 式角色合约；
- 种子色原样钉入最近一阶，暗色是镜像明度阶，文字色用 APCA 求解；
- 另含 `generateScale`、调和、对比度、`simulateCvd`、`formatRgb/formatHsl` 等工具。

**适配器**：[`@simple-prism/css`](https://www.npmjs.com/package/@simple-prism/css) · [`@simple-prism/tailwind`](https://www.npmjs.com/package/@simple-prism/tailwind) · [`@simple-prism/scss`](https://www.npmjs.com/package/@simple-prism/scss) · [`@simple-prism/tokens`](https://www.npmjs.com/package/@simple-prism/tokens)

完整文档见[仓库](https://github.com/Azir-11/Prism)。MIT。
