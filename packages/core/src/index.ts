/**
 * @prism/core — generate a harmonious, contrast-aware design-token system from
 * one or a few seed colors. OKLCH-first, perceptually even, APCA-solved.
 */

export * from "./types";

export {
  parseColor,
  normalizeOklch,
  clampToGamut,
  formatOklch,
  toHex,
  makeSwatch,
  deltaEOK,
  toSrgb255,
} from "./color";

export {
  wcagRatio,
  wcagRatioRgb,
  apcaLc,
  apcaContrastRgb,
  solveForLc,
  pickOnSolid,
  type SolveOptions,
} from "./contrast";

export { chromaBell, nearestStepByLightness, generateScale } from "./scale";

export {
  deriveSecondary,
  deriveTertiary,
  deriveNeutral,
  deriveSemantics,
  type SemanticOverrides,
  type SemanticSeeds,
} from "./harmony";

export {
  generateTheme,
  verifyContrast,
  resolveRef,
  resolveSemantic,
  flattenTokens,
  toJSON,
  VERSION,
} from "./theme";

export {
  LIGHTNESS_LIGHT,
  LIGHTNESS_DARK,
  SEMANTIC_ANCHORS,
  SEMANTIC_RANGES,
  DEFAULT_CONTRAST,
} from "./constants";
