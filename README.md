# Prism

> 没有设计师，也能配出好看的主题。

Prism 让你只挑一个喜欢的主题色，就自动配好一整套**协调、可读、明暗双全**的颜色 —— 完整的深浅色阶、次色与语义色、中性色、对比度体检，以及可直接落地的 CSS 变量、Tailwind `@theme` 或 JSON。专为没有专业设计师的团队与开发者而做。

- **OKLCH-first** —— 全程在感知均匀的色彩空间生成，色阶看起来就是均匀的。
- **对比度是解出来的** —— 用 APCA 二分求解文字色，任意品牌色相都达标。
- **品牌色不可亵渎** —— 你输入的颜色被原样钉进最接近的一阶。
- **明暗成对** —— 暗色是同一角色合约下的镜像明度阶，不是简单取反。
- **核心 + 适配器** —— 引擎只产出颜色，落地交给适配器。

```ts
import { generateTheme } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";

const theme = generateTheme({ primary: "#3b82f6" });
const css = toCssVariables(theme); // :root { … } + .dark { … }
```

## 仓库结构

```
packages/
  core/        @simple-prism/core      颜色科学与令牌生成（唯一依赖 culori）
  css/         @simple-prism/css       CSS 变量适配器
  tailwind/    @simple-prism/tailwind  Tailwind v4 @theme 适配器
  scss/        @simple-prism/scss      Sass/SCSS 变量 + map 适配器
  tokens/      @simple-prism/tokens    W3C/DTCG 设计令牌适配器
playground/    Vite + Vue 3.5   输入颜色 → 实时色板 / 组件预览 / 导出
docs/          VitePress 2      中文文档（含色彩美学理念）
```

## 包一览

| 包                       | 作用        | 入口                                               |
| ------------------------ | ----------- | -------------------------------------------------- |
| `@simple-prism/core`     | 生成引擎    | `generateTheme`、`generateScale`、调和与对比度工具 |
| `@simple-prism/css`      | CSS 变量    | `toCssVariables`、`toCssVariableMap`               |
| `@simple-prism/tailwind` | Tailwind v4 | `toTailwindCss`、`toTailwindColors`                |
| `@simple-prism/scss`     | Sass/SCSS   | `toScss`                                           |
| `@simple-prism/tokens`   | W3C/DTCG    | `toDesignTokens`、`toDesignTokensJson`             |

## 开发

依赖：Node ≥ 20.11，pnpm。工具链：**tsdown**（打包）、**vitest**（测试）、**oxlint + oxfmt**（代码风格）。

```bash
pnpm install

pnpm build         # 用 tsdown 构建所有包
pnpm test          # vitest
pnpm typecheck     # tsc --noEmit（各包）
pnpm lint          # oxlint
pnpm format        # oxfmt

pnpm play          # 启动 playground（http://localhost:5173）
pnpm docs:dev      # 启动文档站
pnpm docs:build    # 构建文档
```

## 设计取向

Prism 综合了 Tailwind、Radix、Ant Design、Arco、TDesign、shadcn 与 Material 的色彩思路：

- **色阶**：11 阶 `50–950`（Tailwind 数字）+ Radix 式语义角色合约；
- **生成**：固定明度阶 + 钟形彩度包络 + 微量色相扭转，种子色原样钉入最近阶；
- **暗色**：镜像明度阶 + 中间调彩度补偿（亥姆霍兹–科尔劳什效应）；
- **对比度**：以 APCA 为生成目标，WCAG 2.x 作为合规报告。

详见[文档站](./docs)的"色彩美学"系列。

## License

[MIT](./LICENSE) © 2026 青菜白玉汤
