import type { FrameworkSnapshot } from "./types";

// 生成方式见 ./README.md。移植 @sa/color packages/color/src/palette/{antd,index}.ts，
// 依赖 colord@2.9.3，对 #646cff 跑 getColorPalette()。500 = 种子原样。
export const soybean: FrameworkSnapshot = {
  key: "soybean",
  name: "SoybeanAdmin (soybean-admin)",
  shortName: "Soybean",
  version: "2.2.0",
  releaseDate: "2026-05-13",
  repo: "https://github.com/soybeanjs/soybean-admin",
  docDate: "2026-07-10",
  defaultPrimary: "#646cff",
  algorithm:
    "Ant Design generate 算法（HSV 空间按固定步长增减 色相/饱和/明度），内置于 @sa/color，底层依赖 colord。",
  colorSource: "@sa/color · packages/color/src/palette/antd.ts + index.ts（colord@2.9.3）",
  generatedBy: "移植 antd.ts/index.ts 跑 getColorPalette('#646cff')，colord@2.9.3",
  steps: [
    { name: "50", hex: "#F0F3FF" },
    { name: "100", hex: "#F0F3FF" },
    { name: "200", hex: "#DEE3FF" },
    { name: "300", hex: "#B5BEFF" },
    { name: "400", hex: "#8C96FF" },
    { name: "500", hex: "#646CFF" },
    { name: "600", hex: "#4A4CD9" },
    { name: "700", hex: "#3634B3" },
    { name: "800", hex: "#27228C" },
    { name: "900", hex: "#1E1766" },
    { name: "950", hex: "#0F0940" },
  ],
  solidStep: "500",
  darkNote:
    "暗色＝把浅色阶按固定不透明度叠加到 #141414 之上（Ant Design 暗色技法），并叠加 NaiveUI 暗色主题。",
  semanticNote:
    "语义色 success #52c41a / warning #faad14 / error #f5222d 各自跑同一 antd 算法出完整 50–950；info 默认跟随主色。",
  sourceUrls: [
    "https://github.com/soybeanjs/soybean-admin/blob/main/packages/color/src/palette/antd.ts",
    "https://github.com/soybeanjs/soybean-admin/blob/main/src/theme/settings.ts",
  ],
};
