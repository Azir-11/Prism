/** Any CSS color string parseable by culori (hex, `rgb()`, `oklch()`, `hsl()`, named, …). */
export type ColorInput = string;

/** OKLCH color — Prism's canonical working representation. */
export interface Oklch {
  /** Perceptual lightness, 0..1. */
  l: number;
  /** Chroma, 0..~0.4. */
  c: number;
  /** Hue angle in degrees, 0..360 (0 for achromatic colors). */
  h: number;
  /** Optional alpha, 0..1. */
  alpha?: number;
}

export type Appearance = "light" | "dark";
export type Gamut = "srgb" | "p3";

/** Output color notation an adapter can emit a value in. */
export type ColorFormat = "oklch" | "hex" | "rgb" | "hsl";

/** A color-vision deficiency Prism can simulate for accessibility previews. */
export type CvdType = "protan" | "deutan" | "tritan";

/** The 11 numbered steps of a Prism scale (Tailwind numbering). */
export const STEP_KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type StepKey = (typeof STEP_KEYS)[number];

/**
 * The semantic role each numbered step plays — a Radix-style contract laid
 * over Tailwind numbering, so re-theming swaps ramps without touching markup.
 */
export const STEP_ROLES: Record<StepKey, string> = {
  50: "app-background",
  100: "subtle-background",
  200: "component",
  300: "component-hover",
  400: "component-active",
  500: "solid",
  600: "solid-hover",
  700: "border-strong",
  800: "surface-strong",
  900: "text-soft",
  950: "text-strong",
};

/** A single resolved color, carried in three forms. */
export interface Swatch {
  /** sRGB hex fallback, e.g. `#3b82f6`. Always renderable everywhere. */
  hex: string;
  /** CSS `oklch()` string — the source of truth (may be wide-gamut when `gamut: 'p3'`). */
  oklch: string;
  /** Raw OKLCH components (after gamut mapping). */
  value: Oklch;
}

/** Reference into a generated scale — how a semantic token points at a step. */
export type StepRef = StepKey | "text" | "textContrast" | "onSolid";

export interface SemanticRef {
  /** Scale name, e.g. `primary`, `neutral`, `error`. */
  scale: string;
  /** Which swatch within that scale. */
  step: StepRef;
}

/** A full generated scale for one color in one appearance. */
export interface Scale {
  /** Color name this scale was generated for (e.g. `primary`, `error`). */
  name: string;
  /** Appearance this scale targets. */
  appearance: Appearance;
  /** The 11 numbered steps. */
  steps: Record<StepKey, Swatch>;
  /** Low-contrast body text, contrast-solved against step 100. */
  text: Swatch;
  /** High-contrast text, contrast-solved against step 100. */
  textContrast: Swatch;
  /** Best foreground (near-white / tinted near-black) to place on the solid step. */
  onSolid: Swatch;
  /** Step that holds the (closest) pinned seed color. */
  seedStep: StepKey;
}

export interface ContrastTarget {
  /** APCA Lc target for low-contrast body text. Default 60. */
  textLc?: number;
  /** APCA Lc target for high-contrast text. Default 90. */
  textContrastLc?: number;
}

export type SecondaryStrategy = "complementary" | "split-complementary" | "analogous" | "triadic";

export interface HarmonyOptions {
  /** Strategy used to derive a missing secondary color. Default `split-complementary`. */
  secondary?: SecondaryStrategy;
  /** Max degrees a semantic hue may be nudged toward the brand hue. Default 15. */
  semanticNudge?: number;
}

export interface ScaleOptions {
  name?: string;
  appearance?: Appearance;
  gamut?: Gamut;
  contrast?: ContrastTarget;
  /** Degrees of hue torsion across the ramp. Default 4. */
  hueTorsion?: number;
  /** Override the 11-entry lightness ramp (values 0..1). */
  lightnessRamp?: readonly number[];
}

export interface PrismInput {
  /** The required brand seed. */
  primary: ColorInput;
  /** Optional secondary brand color; derived by harmony if omitted. */
  secondary?: ColorInput;
  /** Optional tertiary brand color; derived (hue + 60°) if omitted. */
  tertiary?: ColorInput;
  /** 0..n extra brand hues for data-viz / decoration. */
  accents?: ColorInput[];
  /** Semantic overrides — synthesized from anchors + brand if omitted. */
  info?: ColorInput;
  success?: ColorInput;
  warning?: ColorInput;
  error?: ColorInput;
  /** Neutral control: a color, or `'auto'` to tint grey toward the primary hue. */
  neutral?: ColorInput | "auto";
  /** Chroma of the auto neutral (0 = pure grey). Default 0.008. */
  neutralChroma?: number;
  contrast?: ContrastTarget;
  gamut?: Gamut;
  /** Which appearances to generate. Default `['light', 'dark']`. */
  appearances?: Appearance[];
  harmony?: HarmonyOptions;
  /** Degrees of hue torsion across each ramp. Default 4. */
  hueTorsion?: number;
}

export interface ResolvedSeed {
  name: string;
  /** Whether the user supplied this color or Prism derived it. */
  source: "input" | "derived";
  hex: string;
  oklch: string;
}

export interface ContrastCheck {
  token: string;
  appearance: Appearance;
  foregroundHex: string;
  backgroundHex: string;
  /** Signed APCA Lc. */
  apcaLc: number;
  /** The APCA Lc this pair is expected to reach. */
  apcaTarget: number;
  /** WCAG 2.x contrast ratio. */
  wcag: number;
  /** APCA |Lc| >= apcaTarget. */
  passApca: boolean;
  /** WCAG ratio >= 4.5 (AA body text). */
  passWcagAA: boolean;
}

export interface ContrastReport {
  checks: ContrastCheck[];
  /** True when every check passes its APCA target. */
  passes: boolean;
}

export interface PrismTheme {
  /** The resolved seed colors (after harmony / derivation). */
  seeds: ResolvedSeed[];
  /** Generated scales, keyed by color name, each with light + dark. */
  scales: Record<string, { light: Scale; dark: Scale }>;
  /** Appearance-independent semantic token → scale-step references. */
  semantic: Record<string, SemanticRef>;
  appearances: Appearance[];
  gamut: Gamut;
  report: ContrastReport;
  meta: { generator: "prism"; version: string };
}
