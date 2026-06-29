import { clampChroma, converter, differenceEuclidean, formatHex, parse } from "culori";
import type { ColorInput, Gamut, Oklch, Swatch } from "./types";
import { clamp, mod360, round } from "./util";

const toOklch = converter("oklch");
const toRgb = converter("rgb");
const diffOklab = differenceEuclidean("oklab");

/** Parse any CSS color into normalized OKLCH. Throws on unparseable input. */
export function parseColor(input: ColorInput): Oklch {
  const parsed = parse(input);
  if (!parsed) throw new Error(`Prism: cannot parse color "${input}"`);
  const o = toOklch(parsed);
  return normalizeOklch({
    l: o.l ?? 0,
    c: o.c ?? 0,
    h: o.h ?? 0,
    alpha: o.alpha,
  });
}

/** Clamp components into valid ranges and normalize the hue. */
export function normalizeOklch(o: Oklch): Oklch {
  const out: Oklch = {
    l: clamp(o.l, 0, 1),
    c: Math.max(0, o.c),
    h: Number.isFinite(o.h) ? mod360(o.h) : 0,
  };
  if (o.alpha != null && o.alpha < 1) out.alpha = clamp(o.alpha, 0, 1);
  return out;
}

/** Reduce chroma (holding L + H) until the color fits the target gamut. */
export function clampToGamut(o: Oklch, gamut: Gamut = "srgb"): Oklch {
  const rgbGamut = gamut === "p3" ? "p3" : "rgb";
  const clamped = clampChroma({ mode: "oklch", l: o.l, c: o.c, h: o.h }, "oklch", rgbGamut);
  return normalizeOklch({
    l: clamped.l ?? o.l,
    c: clamped.c ?? 0,
    h: clamped.h ?? o.h,
    alpha: o.alpha,
  });
}

/** Format OKLCH as a CSS `oklch()` string. */
export function formatOklch(o: Oklch): string {
  const l = round(o.l, 4);
  const c = round(o.c, 4);
  const h = round(o.h, 2);
  if (o.alpha != null && o.alpha < 1) {
    return `oklch(${l} ${c} ${h} / ${round(o.alpha, 3)})`;
  }
  return `oklch(${l} ${c} ${h})`;
}

/** sRGB hex (always renderable). */
export function toHex(o: Oklch): string {
  const safe = clampToGamut(o, "srgb");
  return (
    formatHex({ mode: "oklch", l: safe.l, c: safe.c, h: safe.h, alpha: safe.alpha }) ?? "#000000"
  );
}

/** Build a Swatch: gamut-mapped oklch string + sRGB hex fallback. */
export function makeSwatch(o: Oklch, gamut: Gamut = "srgb"): Swatch {
  const display = clampToGamut(o, gamut);
  return {
    value: display,
    oklch: formatOklch(display),
    hex: toHex(o),
  };
}

/** Perceptual distance in OKLab (ΔEOK). */
export function deltaEOK(a: Oklch, b: Oklch): number {
  return diffOklab(
    { mode: "oklch", l: a.l, c: a.c, h: a.h },
    { mode: "oklch", l: b.l, c: b.c, h: b.h },
  );
}

/** Convert OKLCH to sRGB byte triplet (0..255), gamut-clamped — for contrast math. */
export function toSrgb255(o: Oklch): [number, number, number] {
  const safe = clampToGamut(o, "srgb");
  const rgb = toRgb({ mode: "oklch", l: safe.l, c: safe.c, h: safe.h });
  return [
    clamp(rgb.r ?? 0, 0, 1) * 255,
    clamp(rgb.g ?? 0, 0, 1) * 255,
    clamp(rgb.b ?? 0, 0, 1) * 255,
  ];
}
