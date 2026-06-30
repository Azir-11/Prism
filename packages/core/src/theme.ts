import type {
  Appearance,
  ContrastCheck,
  ContrastReport,
  Oklch,
  PrismInput,
  PrismTheme,
  ResolvedSeed,
  Scale,
  ScaleOptions,
  SemanticRef,
  Swatch,
} from "./types";
import { formatOklch, parseColor, toHex } from "./color";
import { apcaLc, wcagRatio } from "./contrast";
import { generateScale } from "./scale";
import { deriveNeutral, deriveSecondary, deriveSemantics, deriveTertiary } from "./harmony";

export const VERSION = "0.1.0";

type Scales = PrismTheme["scales"];

/** Resolve a semantic reference to its concrete swatch in a given appearance. */
export function resolveRef(scales: Scales, appearance: Appearance, ref: SemanticRef): Swatch {
  const scale = scales[ref.scale]?.[appearance];
  if (!scale) throw new Error(`Prism: unknown scale "${ref.scale}" in semantic reference`);
  switch (ref.step) {
    case "text":
      return scale.text;
    case "textContrast":
      return scale.textContrast;
    case "onSolid":
      return scale.onSolid;
    default:
      return scale.steps[ref.step];
  }
}

/** Resolve a named semantic token (e.g. `primary-foreground`) to a swatch. */
export function resolveSemantic(theme: PrismTheme, appearance: Appearance, token: string): Swatch {
  const ref = theme.semantic[token];
  if (!ref) throw new Error(`Prism: unknown semantic token "${token}"`);
  return resolveRef(theme.scales, appearance, ref);
}

/** The shadcn-flavored semantic token layer, expressed as scale-step references. */
function buildSemanticRefs(seedMap: Record<string, Oklch>): Record<string, SemanticRef> {
  const has = (name: string) => name in seedMap;
  const refs: Record<string, SemanticRef> = {
    background: { scale: "neutral", step: 50 },
    foreground: { scale: "neutral", step: "textContrast" },
    card: { scale: "neutral", step: 50 },
    "card-foreground": { scale: "neutral", step: "textContrast" },
    popover: { scale: "neutral", step: 50 },
    "popover-foreground": { scale: "neutral", step: "textContrast" },
    muted: { scale: "neutral", step: 100 },
    "muted-foreground": { scale: "neutral", step: "text" },
    border: { scale: "neutral", step: 200 },
    input: { scale: "neutral", step: 200 },
    ring: { scale: "primary", step: 500 },
    primary: { scale: "primary", step: 500 },
    "primary-foreground": { scale: "primary", step: "onSolid" },
  };
  if (has("secondary")) {
    refs.secondary = { scale: "secondary", step: 500 };
    refs["secondary-foreground"] = { scale: "secondary", step: "onSolid" };
  }
  if (has("tertiary")) {
    refs.accent = { scale: "tertiary", step: 500 };
    refs["accent-foreground"] = { scale: "tertiary", step: "onSolid" };
  }
  for (const [token, scale] of [
    ["info", "info"],
    ["success", "success"],
    ["warning", "warning"],
    ["destructive", "error"],
  ] as const) {
    if (has(scale)) {
      refs[token] = { scale, step: 500 };
      refs[`${token}-foreground`] = { scale, step: "onSolid" };
    }
  }
  return refs;
}

/** Foreground/background pairs that should be audited, each with an APCA target. */
const AUDIT_PAIRS: { fg: string; bg: string; target: number }[] = [
  { fg: "foreground", bg: "background", target: 75 },
  { fg: "muted-foreground", bg: "muted", target: 55 },
  { fg: "primary-foreground", bg: "primary", target: 45 },
  { fg: "secondary-foreground", bg: "secondary", target: 45 },
  { fg: "accent-foreground", bg: "accent", target: 45 },
  { fg: "info-foreground", bg: "info", target: 45 },
  { fg: "success-foreground", bg: "success", target: 45 },
  { fg: "warning-foreground", bg: "warning", target: 45 },
  { fg: "destructive-foreground", bg: "destructive", target: 45 },
];

function buildReport(
  scales: Scales,
  semantic: Record<string, SemanticRef>,
  appearances: Appearance[],
): ContrastReport {
  const checks: ContrastCheck[] = [];
  for (const appearance of appearances) {
    for (const pair of AUDIT_PAIRS) {
      const fgRef = semantic[pair.fg];
      const bgRef = semantic[pair.bg];
      if (!fgRef || !bgRef) continue;
      const fg = resolveRef(scales, appearance, fgRef);
      const bg = resolveRef(scales, appearance, bgRef);
      const lc = apcaLc(fg.value, bg.value);
      const wcag = wcagRatio(fg.value, bg.value);
      checks.push({
        token: `${pair.fg} on ${pair.bg}`,
        appearance,
        foregroundHex: fg.hex,
        backgroundHex: bg.hex,
        apcaLc: Math.round(lc * 10) / 10,
        apcaTarget: pair.target,
        wcag: Math.round(wcag * 100) / 100,
        passApca: Math.abs(lc) >= pair.target,
        passWcagAA: wcag >= 4.5,
      });
    }
  }
  return { checks, passes: checks.every((c) => c.passApca) };
}

/** Re-run the contrast audit on an existing theme. */
export function verifyContrast(theme: PrismTheme): ContrastReport {
  return buildReport(theme.scales, theme.semantic, theme.appearances);
}

/** Generate a complete, contrast-aware theme from one or a few seed colors. */
export function generateTheme(input: PrismInput): PrismTheme {
  const gamut = input.gamut ?? "srgb";
  const appearances = input.appearances ?? ["light", "dark"];
  const torsion = input.hueTorsion;
  const nudge = input.harmony?.semanticNudge ?? 15;

  const primary = parseColor(input.primary);
  const secondary = input.secondary
    ? parseColor(input.secondary)
    : deriveSecondary(primary, input.harmony?.secondary);
  const tertiary = input.tertiary ? parseColor(input.tertiary) : deriveTertiary(primary);
  const neutral =
    input.neutral == null || input.neutral === "auto"
      ? deriveNeutral(primary, input.neutralChroma)
      : parseColor(input.neutral);
  const semantics = deriveSemantics(
    primary,
    { info: input.info, success: input.success, warning: input.warning, error: input.error },
    nudge,
  );
  const accents = (input.accents ?? []).map((a) => parseColor(a));

  const sources: Record<string, "input" | "derived"> = {
    primary: "input",
    secondary: input.secondary ? "input" : "derived",
    tertiary: input.tertiary ? "input" : "derived",
    neutral: input.neutral && input.neutral !== "auto" ? "input" : "derived",
    info: input.info ? "input" : "derived",
    success: input.success ? "input" : "derived",
    warning: input.warning ? "input" : "derived",
    error: input.error ? "input" : "derived",
  };

  const seedMap: Record<string, Oklch> = {
    primary,
    secondary,
    tertiary,
    info: semantics.info,
    success: semantics.success,
    warning: semantics.warning,
    error: semantics.error,
    neutral,
  };
  accents.forEach((a, i) => {
    seedMap[`accent-${i + 1}`] = a;
    sources[`accent-${i + 1}`] = "input";
  });

  const scales: Scales = {};
  for (const [name, seed] of Object.entries(seedMap)) {
    const base: ScaleOptions = {
      name,
      gamut,
      contrast: input.contrast,
      hueTorsion: name === "neutral" ? 0 : torsion,
    };
    scales[name] = {
      light: generateScale(seed, { ...base, appearance: "light" }),
      dark: generateScale(seed, { ...base, appearance: "dark" }),
    };
  }

  const semantic = buildSemanticRefs(seedMap);
  const report = buildReport(scales, semantic, appearances);
  const seeds: ResolvedSeed[] = Object.entries(seedMap).map(([name, o]) => ({
    name,
    source: sources[name] ?? "derived",
    hex: toHex(o),
    oklch: formatOklch(o),
  }));

  return {
    seeds,
    scales,
    semantic,
    appearances,
    gamut,
    report,
    meta: { generator: "prism", version: VERSION },
  };
}

/** Flatten one appearance into a `token → oklch string` map. */
export function flattenTokens(theme: PrismTheme, appearance: Appearance): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [token] of Object.entries(theme.semantic)) {
    out[token] = resolveSemantic(theme, appearance, token).oklch;
  }
  return out;
}

function dumpScale(scale: Scale): Record<string, unknown> {
  return {
    seedStep: scale.seedStep,
    steps: Object.fromEntries(
      Object.entries(scale.steps).map(([k, s]) => [k, { hex: s.hex, oklch: s.oklch }]),
    ),
    text: { hex: scale.text.hex, oklch: scale.text.oklch },
    textContrast: { hex: scale.textContrast.hex, oklch: scale.textContrast.oklch },
    onSolid: { hex: scale.onSolid.hex, oklch: scale.onSolid.oklch },
  };
}

/** A clean, fully-serializable JSON view of the theme (for design-token pipelines). */
export function toJSON(theme: PrismTheme): Record<string, unknown> {
  const scales: Record<string, unknown> = {};
  for (const [name, pair] of Object.entries(theme.scales)) {
    scales[name] = { light: dumpScale(pair.light), dark: dumpScale(pair.dark) };
  }
  return {
    meta: theme.meta,
    seeds: theme.seeds,
    gamut: theme.gamut,
    appearances: theme.appearances,
    semantic: theme.semantic,
    tokens: Object.fromEntries(theme.appearances.map((a) => [a, flattenTokens(theme, a)])),
    scales,
    report: theme.report,
  };
}
