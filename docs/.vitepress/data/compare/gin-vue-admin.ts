import type { FrameworkSnapshot } from "./types";

// 生成方式见 ./README.md。移植 web/src/utils/format.js 的 generateAllLightColors
// （target=[240,248,255]），对 #3b82f6 跑 times=1..10 得 light-1..10，加 base。
// 亮色模式下全部台阶都不深于主色——无深色端。此处按明→暗排列（light-10 → base）。
export const ginVueAdmin: FrameworkSnapshot = {
  key: "gin-vue-admin",
  name: "gin-vue-admin",
  shortName: "GVA",
  version: "2.9.2",
  releaseDate: "2026-05-26",
  repo: "https://github.com/flipped-aurora/gin-vue-admin",
  docDate: "2026-07-10",
  defaultPrimary: "#3b82f6",
  algorithm:
    "自写线性 RGB 插值（web/src/utils/format.js）：亮档朝 [240,248,255]≈aliceblue 混——非 Element Plus 官方 mix(白/黑)。",
  colorSource:
    "gin-vue-admin · web/src/utils/format.js（setBodyPrimaryColor / generateAllLightColors）",
  generatedBy:
    "移植 format.js 的 generateAllLightColors(target=[240,248,255])，对 #3b82f6 跑 times=1..10",
  steps: [
    { name: "light-10", hex: "#F0F8FF" },
    { name: "light-9", hex: "#DDECFE" },
    { name: "light-8", hex: "#CBE0FD" },
    { name: "light-7", hex: "#B9D4FC" },
    { name: "light-6", hex: "#A7C8FB" },
    { name: "light-5", hex: "#95BDFA" },
    { name: "light-4", hex: "#83B1F9" },
    { name: "light-3", hex: "#71A5F8" },
    { name: "light-2", hex: "#5F99F7" },
    { name: "light-1", hex: "#4D8DF6" },
    { name: "base", hex: "#3B82F6" },
  ],
  solidStep: "base",
  darkNote: "暗色＝setBodyPrimaryColor 改朝 [10,10,30] 近黑插值，把主色档整体压暗。",
  semanticNote:
    "语义色直接采用 Element Plus 官方默认（success #67c23a / warning #e6a23c / danger #f56c6c / info #909399），其档位由 EP 的 color.mix(白/黑) 在构建期生成——与主色的自写插值不是同一套算法。",
  sourceUrls: [
    "https://github.com/flipped-aurora/gin-vue-admin/blob/main/web/src/utils/format.js",
    "https://github.com/flipped-aurora/gin-vue-admin/blob/main/web/src/pinia/modules/app.js",
  ],
};
