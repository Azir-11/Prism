import type { ContrastTarget, StepKey } from "./types";

/**
 * Lightness ramps (OKLCH L, 0..1) for the 11 steps `50 → 950`.
 *
 * These are hand-tuned, perceptually-spaced ladders — the single most important
 * aesthetic decision in the library. The light ramp descends from near-white to
 * near-black; the dark ramp is its tuned mirror, rising from a deep surface to a
 * bright text tone while keeping mid-tone "solid" steps vivid.
 */
export const LIGHTNESS_LIGHT: readonly number[] = [
  0.971, 0.936, 0.886, 0.812, 0.715, 0.637, 0.553, 0.47, 0.398, 0.348, 0.262,
];

export const LIGHTNESS_DARK: readonly number[] = [
  0.18, 0.22, 0.265, 0.315, 0.38, 0.47, 0.56, 0.67, 0.78, 0.875, 0.96,
];

/** Lightness where chroma peaks (the "most colorful" tone). */
export const CHROMA_PEAK_L = 0.62;

/** Hard ceiling on chroma to avoid absurd out-of-gamut requests. */
export const MAX_CHROMA = 0.37;

/** Chroma multiplier applied to dark ramps (Helmholtz–Kohlrausch compensation). */
export const DARK_CHROMA_BOOST = 1.15;

/** Default hue torsion in degrees applied across a ramp. */
export const DEFAULT_HUE_TORSION = 4;

/** The numbered step used as the solid brand fill. */
export const SOLID_STEP: StepKey = 500;

/** Default chroma for the auto-generated neutral (a faint tint of the brand). */
export const DEFAULT_NEUTRAL_CHROMA = 0.008;

export const DEFAULT_CONTRAST: Required<ContrastTarget> = {
  textLc: 60,
  textContrastLc: 90,
};

/**
 * Canonical hue anchors for semantic colors (OKLCH degrees) plus the safe range
 * each is allowed to drift within. error ≈ red, warning ≈ amber, success ≈
 * green, info ≈ blue — universal across every system we studied.
 */
export const SEMANTIC_ANCHORS: Record<string, number> = {
  error: 27,
  warning: 75,
  success: 150,
  info: 250,
};

export const SEMANTIC_RANGES: Record<string, [number, number]> = {
  error: [12, 40],
  warning: [60, 95],
  success: [120, 165],
  info: [210, 265],
};

/** Default visual chroma window for synthesized semantic colors. */
export const SEMANTIC_CHROMA = { min: 0.09, max: 0.17 };

/** Lightness used as the reference tone for harmony / semantic seeds. */
export const HARMONY_REFERENCE_L = 0.62;
