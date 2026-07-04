import type { ColorInput, Oklch, Scale, ScaleOptions, StepKey, Swatch } from "./types";
import { STEP_KEYS } from "./types";
import {
  CHROMA_PEAK_L,
  DARK_CHROMA_BOOST,
  DEFAULT_CONTRAST,
  DEFAULT_HUE_TORSION,
  LIGHTNESS_DARK,
  LIGHTNESS_LIGHT,
  MAX_CHROMA,
  SOLID_STEP,
} from "./constants";
import { clampToGamut, makeSwatch, normalizeOklch, parseColor } from "./color";
import { solveForLc, solveOnSolid } from "./contrast";
import { clamp } from "./util";

/**
 * Chroma bell curve: 1.0 at the peak tone, tapering toward white (sharply) and
 * black (gently). This is why 500/600 feel saturated while 50/950 read as tints.
 */
export function chromaBell(l: number): number {
  if (l >= CHROMA_PEAK_L) {
    const t = (1 - l) / (1 - CHROMA_PEAK_L);
    return Math.max(0, t) ** 0.9;
  }
  const t = (l - 0.08) / (CHROMA_PEAK_L - 0.08);
  return Math.max(0, t) ** 0.65;
}

/**
 * Nearest numbered step for a given L within a ramp — used to pin the seed.
 * Because the ramp is monotonic, the seed's L always falls between the chosen
 * step's neighbors, so pinning never breaks the ramp's monotonicity.
 */
export function nearestStepByLightness(
  l: number,
  ramp: readonly number[] = LIGHTNESS_LIGHT,
): StepKey {
  let best: StepKey = STEP_KEYS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  STEP_KEYS.forEach((key, i) => {
    const dist = Math.abs(ramp[i] - l);
    if (dist < bestDist) {
      bestDist = dist;
      best = key;
    }
  });
  return best;
}

/**
 * Generate one 11-step scale from a seed color.
 *
 * Pipeline: build a fixed lightness ramp at the seed's hue; modulate chroma by a
 * bell envelope scaled so the ramp passes through the seed's own chroma; apply a
 * touch of hue torsion; pin the seed verbatim at its nearest step; then
 * contrast-solve the two text tones and the on-solid foreground.
 */
export function generateScale(seedInput: ColorInput | Oklch, opts: ScaleOptions = {}): Scale {
  const seed = typeof seedInput === "string" ? parseColor(seedInput) : normalizeOklch(seedInput);
  const appearance = opts.appearance ?? "light";
  const gamut = opts.gamut ?? "srgb";
  const ramp = opts.lightnessRamp ?? (appearance === "dark" ? LIGHTNESS_DARK : LIGHTNESS_LIGHT);
  const torsion = opts.hueTorsion ?? DEFAULT_HUE_TORSION;
  const textLc = opts.contrast?.textLc ?? DEFAULT_CONTRAST.textLc;
  const textContrastLc = opts.contrast?.textContrastLc ?? DEFAULT_CONTRAST.textContrastLc;

  // Derive a chroma peak so the envelope reproduces the seed's chroma at its tone.
  const bellAtSeed = Math.max(chromaBell(seed.l), 0.15);
  let cPeak = clamp(seed.c / bellAtSeed, 0, MAX_CHROMA);
  if (appearance === "dark") cPeak = Math.min(MAX_CHROMA, cPeak * DARK_CHROMA_BOOST);

  const chromaAt = (l: number): number => Math.min(MAX_CHROMA, cPeak * chromaBell(l));
  const hueAt = (l: number): number => seed.h + torsion * (CHROMA_PEAK_L - l);

  const steps = {} as Record<StepKey, Swatch>;
  STEP_KEYS.forEach((key, i) => {
    const l = ramp[i];
    steps[key] = makeSwatch(clampToGamut({ l, c: chromaAt(l), h: hueAt(l) }, gamut), gamut);
  });

  // Pin the exact seed at its closest step within the active ramp (keeps monotonicity).
  const seedStep = nearestStepByLightness(seed.l, ramp);
  steps[seedStep] = makeSwatch(seed, gamut);

  // Contrast targets resolved against the subtle background (step 100).
  const bg = steps[100].value;
  const prefer = appearance === "dark" ? "light" : "dark";
  const text = makeSwatch(
    solveForLc({ hue: seed.h, chromaAt, bg, targetLc: textLc, prefer, gamut }),
    gamut,
  );
  const textContrast = makeSwatch(
    solveForLc({ hue: seed.h, chromaAt, bg, targetLc: textContrastLc, prefer, gamut }),
    gamut,
  );
  const onSolid = makeSwatch(solveOnSolid(steps[SOLID_STEP].value, { gamut }), gamut);

  return {
    name: opts.name ?? "color",
    appearance,
    steps,
    text,
    textContrast,
    onSolid,
    seedStep,
  };
}
