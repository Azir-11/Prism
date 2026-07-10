# 对比快照生成留痕

> 本目录的 `*.ts` 为**一次性生成、就地固化**的静态数据。docs 运行时**不**计算、**不**依赖任何三方调色库。
> 数据编写日期 2026-07-10；预期这段时间内三家框架不变。要复算，照本文手动执行即可。

## soybean-admin（v2.2.0，2026-05-13）

- 默认主色：`#646cff`（`src/theme/settings.ts` themeColor）。
- 算法：Ant Design generate（HSV 步进），内置于私有工作区包 `@sa/color`，依赖 `colord@2.9.3`。
- 复现：在临时目录 `pnpm add colord@2.9.3`，移植 `packages/color/src/palette/antd.ts` 与 `index.ts`（`getColorPalette`）后运行：
  ```
  getColorPalette("#646cff") // → 50..950
  ```
- 本次落库（亮色）：`50 #F0F3FF, 100 #F0F3FF, 200 #DEE3FF, 300 #B5BEFF, 400 #8C96FF, 500 #646CFF, 600 #4A4CD9, 700 #3634B3, 800 #27228C, 900 #1E1766, 950 #0F0940`。
  - 注：种子 HSV=(237,61,100)，明度极高，故 50 与 100 收敛为同一色 `#F0F3FF`（真实产物，非错误）。
- 暗色档（叠 #141414，仅供说明）：`50 #1C1929, 100 #25213F, 200 #2F2C51, 300 #3B3974, 400 #4A4BA4, 500 #595ED7, 600 #5D62E4, 700 #838CEC, 800 #ACB4F2, 900 #D7DCF7, 950 #EBEEFA`。

## vben5（vue-vben-admin v5.7.0）

- 默认主色：`hsl(212 100% 45%)` → `#006be6`（`packages/@core/preferences/src/config.ts`）。
- 算法：`theme-colors@0.1.0` 的 `getColors()`，纯 sRGB 线性 tint/shade；`@ctrl/tinycolor@4.2.0` 解析。
- 复现：`pnpm add theme-colors@0.1.0 @ctrl/tinycolor@4.2.0`，运行：
  ```
  getColors(new TinyColor("hsl(212 100% 45%)").toHexString()) // hex=#006be6 → 50..950
  ```
- 本次落库：`50 #F2F8FE, 100 #E6F0FD, 200 #BFDAF9, 300 #99C4F5, 400 #4D97EE, 500 #006BE6, 600 #0060CF, 700 #00408A, 800 #003068, 900 #002045, 950 #00152E`。

## gin-vue-admin（v2.9.2，2026-05-26）

- 默认主色：`#3b82f6`（`web/src/pinia/modules/app.js` config.primaryColor，运行时实际生效）。
- 算法：自写线性 RGB 插值 `web/src/utils/format.js`，亮档朝 `[240,248,255]` 混（**非** Element Plus 官方 `mix(白/黑)`）。
- 复现（纯 JS，无依赖）：
  ```js
  const T = [240, 248, 255];
  const lerp = (ch, t, e) => Math.floor(ch * (1 - e) + t * e);
  // 对 #3b82f6 的每个通道，times=1..10、e=times/10 → light-1..10
  ```
- 本次落库（亮色 base + light-1..10）：`base #3B82F6; light-1 #4D8DF6, light-2 #5F99F7, light-3 #71A5F8, light-4 #83B1F9, light-5 #95BDFA, light-6 #A7C8FB, light-7 #B9D4FC, light-8 #CBE0FD, light-9 #DDECFE, light-10 #F0F8FF`。
  - 注：亮色模式下 `light-*` 全部**不深于**主色——无深色端；暗色模式才改朝近黑插值。
