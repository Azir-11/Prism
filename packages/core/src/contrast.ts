import type { Gamut, Oklch } from "./types";
import { clampToGamut, toSrgb255 } from "./color";

type Rgb255 = [number, number, number];

/* -------------------------------------------------------------------------- */
/*  WCAG 2.x                                                                   */
/* -------------------------------------------------------------------------- */

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: Rgb255): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function wcagRatioRgb(a: Rgb255, b: Rgb255): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG 2.x contrast ratio (1..21) between two OKLCH colors. */
export function wcagRatio(a: Oklch, b: Oklch): number {
  return wcagRatioRgb(toSrgb255(a), toSrgb255(b));
}

/* -------------------------------------------------------------------------- */
/*  APCA (SA98G) — the perceptual contrast target Prism generates against.     */
/*  Constants per the public APCA 0.0.98G-4g description.                      */
/* -------------------------------------------------------------------------- */

const MAIN_TRC = 2.4;
const SRGB_CO: Rgb255 = [0.2126729, 0.7151522, 0.072175];
const BLK_THRS = 0.022;
const BLK_CLMP = 1.414;
const NORM_BG = 0.56;
const NORM_TXT = 0.57;
const REV_TXT = 0.62;
const REV_BG = 0.65;
const SCALE = 1.14;
const LO_OFFSET = 0.027;
const LO_CLIP = 0.1;
const DELTA_Y_MIN = 0.0005;

function apcaY([r, g, b]: Rgb255): number {
  const lin = (c: number) => (c / 255) ** MAIN_TRC;
  return SRGB_CO[0] * lin(r) + SRGB_CO[1] * lin(g) + SRGB_CO[2] * lin(b);
}

function softClampBlack(y: number): number {
  return y >= BLK_THRS ? y : y + (BLK_THRS - y) ** BLK_CLMP;
}

/** Signed APCA lightness contrast (Lc, roughly -108..106) for text on a background. */
export function apcaContrastRgb(textRgb: Rgb255, bgRgb: Rgb255): number {
  const txtY = softClampBlack(apcaY(textRgb));
  const bgY = softClampBlack(apcaY(bgRgb));

  if (Math.abs(bgY - txtY) < DELTA_Y_MIN) return 0;

  let output: number;
  if (bgY > txtY) {
    // Normal polarity: dark text on a lighter background.
    const sapc = (bgY ** NORM_BG - txtY ** NORM_TXT) * SCALE;
    output = sapc < LO_CLIP ? 0 : sapc - LO_OFFSET;
  } else {
    // Reverse polarity: light text on a darker background.
    const sapc = (bgY ** REV_BG - txtY ** REV_TXT) * SCALE;
    output = sapc > -LO_CLIP ? 0 : sapc + LO_OFFSET;
  }
  return output * 100;
}

/** Signed APCA Lc between two OKLCH colors (text first, background second). */
export function apcaLc(text: Oklch, bg: Oklch): number {
  return apcaContrastRgb(toSrgb255(text), toSrgb255(bg));
}

/* -------------------------------------------------------------------------- */
/*  Contrast-first solver                                                      */
/* -------------------------------------------------------------------------- */

export interface SolveOptions {
  /** Hue to hold while searching. */
  hue: number;
  /** Chroma envelope as a function of lightness. */
  chromaAt: (l: number) => number;
  /** Background the result must contrast against. */
  bg: Oklch;
  /** APCA |Lc| target the result must reach. */
  targetLc: number;
  /** Search toward darker text (light bg) or lighter text (dark bg). */
  prefer: "dark" | "light";
  gamut?: Gamut;
}

/**
 * Binary-search lightness (holding hue, following the chroma envelope) until the
 * APCA contrast against `bg` reaches `targetLc`. Returns the *least extreme*
 * color that still passes — so "low-contrast text" stays soft rather than black.
 */
export function solveForLc(opts: SolveOptions): Oklch {
  const { hue, chromaAt, bg, targetLc, prefer } = opts;
  const gamut = opts.gamut ?? "srgb";

  const colorAt = (l: number): Oklch => clampToGamut({ l, c: chromaAt(l), h: hue }, gamut);

  const contrastAt = (l: number) => Math.abs(apcaContrastRgb(toSrgb255(colorAt(l)), toSrgb255(bg)));

  let lo: number;
  let hi: number;
  if (prefer === "dark") {
    // On a light bg, contrast decreases as text lightens. Find the lightest L that still passes.
    lo = 0;
    hi = bg.l;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (contrastAt(mid) >= targetLc) lo = mid;
      else hi = mid;
    }
    return colorAt(lo);
  }
  // On a dark bg, contrast increases as text lightens. Find the darkest L that still passes.
  lo = bg.l;
  hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (contrastAt(mid) >= targetLc) hi = mid;
    else lo = mid;
  }
  return colorAt(hi);
}

/**
 * Pick the better foreground (near-white or tinted near-black) to sit on a solid
 * fill, by APCA magnitude.
 */
export function pickOnSolid(solid: Oklch, gamut: Gamut = "srgb"): Oklch {
  const white: Oklch = { l: 1, c: 0, h: solid.h };
  const dark: Oklch = { l: 0.22, c: Math.min(0.05, solid.c * 0.6), h: solid.h };
  const lcWhite = Math.abs(apcaLc(white, solid));
  const lcDark = Math.abs(apcaLc(dark, solid));
  return clampToGamut(lcWhite >= lcDark ? white : dark, gamut);
}
