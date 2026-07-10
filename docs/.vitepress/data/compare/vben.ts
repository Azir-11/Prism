import type { FrameworkSnapshot } from "./types";

// 生成方式见 ./README.md。theme-colors@0.1.0 的 getColors(hex)，
// hex = new TinyColor('hsl(212 100% 45%)').toHexString() = #006be6。
export const vben: FrameworkSnapshot = {
  key: "vben",
  name: "Vue Vben Admin v5 (vben5)",
  shortName: "Vben5",
  version: "5.7.0",
  releaseDate: "2026",
  repo: "https://github.com/vbenjs/vue-vben-admin",
  docDate: "2026-07-10",
  defaultPrimary: "#006be6",
  defaultPrimaryRaw: "hsl(212 100% 45%)",
  algorithm:
    "theme-colors 的 getColors()：纯 sRGB 线性 tint（向白）/ shade（向黑），配 @ctrl/tinycolor 解析。",
  colorSource:
    "theme-colors@0.1.0 + @ctrl/tinycolor@4.2.0 · packages/@core/base/shared/src/color/generator.ts",
  generatedBy: "getColors(new TinyColor('hsl(212 100% 45%)').toHexString())，theme-colors@0.1.0",
  steps: [
    { name: "50", hex: "#F2F8FE" },
    { name: "100", hex: "#E6F0FD" },
    { name: "200", hex: "#BFDAF9" },
    { name: "300", hex: "#99C4F5" },
    { name: "400", hex: "#4D97EE" },
    { name: "500", hex: "#006BE6" },
    { name: "600", hex: "#0060CF" },
    { name: "700", hex: "#00408A" },
    { name: "800", hex: "#003068" },
    { name: "900", hex: "#002045" },
    { name: "950", hex: "#00152E" },
  ],
  solidStep: "500",
  darkNote:
    "暗色＝对（可能不同的）暗色主色重跑同一 getColors 算法；背景等用 shadcn 风格静态 HSL token。",
  semanticNote:
    "语义 success/warning/destructive 为硬编码 HSL 各跑同算法（各出 50–950）；info 仅静态 token、无色阶。",
  sourceUrls: [
    "https://github.com/vbenjs/vue-vben-admin/blob/main/packages/%40core/base/shared/src/color/generator.ts",
    "https://www.npmjs.com/package/theme-colors",
  ],
};
