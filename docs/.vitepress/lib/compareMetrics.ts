import { apcaLc, parseColor, wcagRatio } from "@simple-prism/core";

/** 变异系数 = 标准差 / 均值（越低越均匀）。 */
export function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/** 相邻 |ΔL| 的变异系数（越低＝明度节奏越均匀）。 */
export function lightnessEvenness(hexes: string[]): number {
  const ls = hexes.map((h) => parseColor(h).l).toSorted((a, b) => b - a);
  const deltas: number[] = [];
  for (let i = 0; i < ls.length - 1; i++) deltas.push(Math.abs(ls[i] - ls[i + 1]));
  return coefficientOfVariation(deltas);
}

/** 彩色台阶（chroma ≥ minChroma）的环形色相跨度（度）。 */
export function hueDrift(hexes: string[], minChroma = 0.02): number {
  const hues = hexes
    .map((h) => parseColor(h))
    .filter((o) => o.c >= minChroma)
    .map((o) => o.h)
    .toSorted((a, b) => a - b);
  if (hues.length < 2) return 0;
  let maxGap = 0;
  for (let i = 0; i < hues.length; i++) {
    const next = i === hues.length - 1 ? hues[0] + 360 : hues[i + 1];
    maxGap = Math.max(maxGap, next - hues[i]);
  }
  return 360 - maxGap;
}

/** 峰值彩度与最亮/最暗台阶的彩度。 */
export function chromaEnvelope(hexes: string[]): { peak: number; light: number; dark: number } {
  const arr = hexes.map((h) => parseColor(h));
  const byL = arr.toSorted((a, b) => b.l - a.l);
  return {
    peak: Math.max(...arr.map((o) => o.c)),
    light: byL[0].c,
    dark: byL[byL.length - 1].c,
  };
}

export interface Contrast {
  /** APCA |Lc|（0..~106）。 */
  apca: number;
  /** WCAG 2.x 比值（1..21）。 */
  wcag: number;
}

/** 文字色压背景色的对比度。 */
export function contrast(textHex: string, bgHex: string): Contrast {
  const t = parseColor(textHex);
  const b = parseColor(bgHex);
  return { apca: Math.abs(apcaLc(t, b)), wcag: wcagRatio(t, b) };
}

/** 实底上更优的前景（白 vs 近黑），按 APCA 量级择优。 */
export function onSolid(solidHex: string): Contrast & { fg: "light" | "dark" } {
  const light = contrast("#ffffff", solidHex);
  const dark = contrast("#111111", solidHex);
  return light.apca >= dark.apca ? { ...light, fg: "light" } : { ...dark, fg: "dark" };
}
