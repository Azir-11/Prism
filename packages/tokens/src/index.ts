import type { Appearance, PrismTheme, Scale, SemanticRef, Swatch } from "@simple-prism/core";
import { STEP_KEYS } from "@simple-prism/core";

/**
 * @simple-prism/tokens — emit a Prism theme as W3C/DTCG design tokens.
 *
 * The output nests scale steps under `color.<appearance>.<scale>.<step>` and the
 * shadcn-style semantic layer under `semantic.<appearance>.<token>`, where each
 * semantic token is a DTCG alias (`{color.light.primary.on-solid}`) into the
 * scale — so Style Dictionary / Tokens Studio resolve references natively.
 * Values are hex (broadest tool support); the source `oklch()` rides along in
 * `$extensions` so nothing perceptual is lost.
 */

/** A single DTCG color token. */
export interface DtcgToken {
  $type: "color";
  $value: string;
  $extensions?: Record<string, unknown>;
}

/** A DTCG group: nested tokens/groups, plus optional `$`-prefixed metadata. */
export type DtcgNode = DtcgToken | { [key: string]: DtcgNode | string | undefined };

export interface TokensOptions {
  /** Top-level `$description`. */
  description?: string;
}

function colorToken(swatch: Swatch): DtcgToken {
  return {
    $type: "color",
    $value: swatch.hex,
    $extensions: { "com.prism.oklch": swatch.oklch },
  };
}

function stepName(step: SemanticRef["step"]): string {
  if (typeof step === "number") return String(step);
  if (step === "textContrast") return "text-contrast";
  if (step === "onSolid") return "on-solid";
  return "text";
}

function scaleGroup(scale: Scale): Record<string, DtcgToken> {
  const group: Record<string, DtcgToken> = {};
  for (const key of STEP_KEYS) group[key] = colorToken(scale.steps[key]);
  group.text = colorToken(scale.text);
  group["text-contrast"] = colorToken(scale.textContrast);
  group["on-solid"] = colorToken(scale.onSolid);
  return group;
}

function aliasFor(appearance: Appearance, ref: SemanticRef): string {
  return `{color.${appearance}.${ref.scale}.${stepName(ref.step)}}`;
}

/** Build a DTCG design-token tree for a Prism theme. */
export function toDesignTokens(
  theme: PrismTheme,
  options: TokensOptions = {},
): Record<string, unknown> {
  const color: Record<string, unknown> = {};
  const semantic: Record<string, unknown> = {};

  for (const appearance of theme.appearances) {
    const scaleSet: Record<string, unknown> = {};
    for (const [name, pair] of Object.entries(theme.scales)) {
      scaleSet[name] = scaleGroup(appearance === "dark" ? pair.dark : pair.light);
    }
    color[appearance] = scaleSet;

    const semanticSet: Record<string, DtcgToken | string> = {};
    for (const [token, ref] of Object.entries(theme.semantic)) {
      semanticSet[token] = { $type: "color", $value: aliasFor(appearance, ref) };
    }
    semantic[appearance] = semanticSet;
  }

  return {
    $description: options.description ?? `Prism design tokens (generator v${theme.meta.version})`,
    color,
    semantic,
  };
}

/** DTCG tokens as a pretty-printed JSON string. */
export function toDesignTokensJson(theme: PrismTheme, options?: TokensOptions): string {
  return JSON.stringify(toDesignTokens(theme, options), null, 2);
}
