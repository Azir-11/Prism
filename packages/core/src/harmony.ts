import type { ColorInput, Oklch, SecondaryStrategy } from "./types";
import {
  DEFAULT_NEUTRAL_CHROMA,
  HARMONY_REFERENCE_L,
  SEMANTIC_ANCHORS,
  SEMANTIC_CHROMA,
  SEMANTIC_RANGES,
} from "./constants";
import { normalizeOklch, parseColor } from "./color";
import { clamp, hueDelta, mod360 } from "./util";

const SECONDARY_SHIFT: Record<SecondaryStrategy, number> = {
  complementary: 180,
  "split-complementary": 150,
  analogous: 30,
  triadic: 120,
};

/**
 * Derive a secondary brand color by hue rotation, re-equalized to the primary's
 * tone and chroma so the two read as siblings (the trap everyone warns about).
 */
export function deriveSecondary(
  primary: Oklch,
  strategy: SecondaryStrategy = "split-complementary",
): Oklch {
  return normalizeOklch({
    l: primary.l,
    c: primary.c,
    h: primary.h + SECONDARY_SHIFT[strategy],
  });
}

/** Derive a tertiary color (Material's hue + 60° rule) at reduced chroma. */
export function deriveTertiary(primary: Oklch): Oklch {
  return normalizeOklch({
    l: primary.l,
    c: primary.c * 0.6,
    h: primary.h + 60,
  });
}

/** Derive an auto neutral: a faint tint of the brand hue. */
export function deriveNeutral(primary: Oklch, chroma: number = DEFAULT_NEUTRAL_CHROMA): Oklch {
  return normalizeOklch({
    l: HARMONY_REFERENCE_L,
    c: Math.max(0, chroma),
    h: primary.h,
  });
}

function clampHueToRange(h: number, [min, max]: [number, number]): number {
  return clamp(mod360(h), min, max);
}

export interface SemanticOverrides {
  info?: ColorInput;
  success?: ColorInput;
  warning?: ColorInput;
  error?: ColorInput;
}

export type SemanticSeeds = Record<"info" | "success" | "warning" | "error", Oklch>;

/**
 * Synthesize info / success / warning / error seeds.
 *
 * Each starts at its universal hue anchor, is nudged up to `nudge` degrees toward
 * the brand hue (so the family feels on-brand), then clamped back into the range
 * that keeps red reading as "danger" and green as "success".
 */
export function deriveSemantics(
  primary: Oklch,
  overrides: SemanticOverrides = {},
  nudge = 15,
): SemanticSeeds {
  const keys = ["info", "success", "warning", "error"] as const;
  const out = {} as SemanticSeeds;
  for (const key of keys) {
    const override = overrides[key];
    if (override) {
      out[key] = parseColor(override);
      continue;
    }
    const anchor = SEMANTIC_ANCHORS[key];
    const delta = hueDelta(anchor, primary.h);
    const nudged = anchor + Math.sign(delta) * Math.min(Math.abs(delta), nudge);
    const h = clampHueToRange(nudged, SEMANTIC_RANGES[key]);
    const c = clamp(primary.c, SEMANTIC_CHROMA.min, SEMANTIC_CHROMA.max);
    out[key] = normalizeOklch({ l: HARMONY_REFERENCE_L, c, h });
  }
  return out;
}
