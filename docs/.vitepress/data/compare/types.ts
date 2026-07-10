export interface CompareStep {
  /** 该框架的原生台阶名，如 "500" 或 "light-3" 或 "base"。 */
  name: string;
  /** sRGB hex。 */
  hex: string;
}

export interface FrameworkSnapshot {
  key: string;
  /** 展示全名。 */
  name: string;
  /** 短名（用于组件预览标签）。 */
  shortName: string;
  /** 版本号。 */
  version: string;
  /** 版本发布日期。 */
  releaseDate: string;
  /** 仓库地址。 */
  repo: string;
  /** 本页数据的编写日期。 */
  docDate: string;
  /** 喂给两侧的输入色（= 该框架默认主色）。 */
  defaultPrimary: string;
  /** 源码里主色的原始写法（若与 hex 不同）。 */
  defaultPrimaryRaw?: string;
  /** 一句话算法概述。 */
  algorithm: string;
  /** 真实调色逻辑所在的包/文件。 */
  colorSource: string;
  /** 生成方式（精确复现摘要）。 */
  generatedBy: string;
  /** 派生主色阶，按明→暗排列。 */
  steps: CompareStep[];
  /** 品牌锚点（solid）对应的台阶名。 */
  solidStep: string;
  /** 暗色策略（用于点评）。 */
  darkNote: string;
  /** 语义色策略（用于点评）。 */
  semanticNote: string;
  /** 一手来源。 */
  sourceUrls: string[];
}
