import type { Appearance, PrismTheme, Scale, SemanticRef, Swatch } from "@prism/core";
import { STEP_KEYS } from "@prism/core";

export interface CssOptions {
  /** Variable name prefix for scale steps. Default `prism`. */
  prefix?: string;
  /** Selector for the light block. Default `:root`. */
  rootSelector?: string;
  /** Selector for the dark block. Default `.dark`. */
  darkSelector?: string;
  /** Emit the shadcn-style semantic token layer. Default `true`. */
  semantic?: boolean;
  /** Value format. Default `oklch`. */
  format?: "oklch" | "hex";
  /** Indentation. Default two spaces. */
  indent?: string;
}

function value(swatch: Swatch, format: "oklch" | "hex"): string {
  return format === "hex" ? swatch.hex : swatch.oklch;
}

function refToVar(prefix: string, ref: SemanticRef): string {
  const step =
    typeof ref.step === "number"
      ? String(ref.step)
      : ref.step === "textContrast"
        ? "text-contrast"
        : ref.step === "onSolid"
          ? "on-solid"
          : "text";
  return `var(--${prefix}-${ref.scale}-${step})`;
}

function scaleLines(
  scale: Scale,
  prefix: string,
  name: string,
  format: "oklch" | "hex",
  indent: string,
): string[] {
  const lines: string[] = [];
  for (const key of STEP_KEYS) {
    lines.push(`${indent}--${prefix}-${name}-${key}: ${value(scale.steps[key], format)};`);
  }
  lines.push(`${indent}--${prefix}-${name}-text: ${value(scale.text, format)};`);
  lines.push(`${indent}--${prefix}-${name}-text-contrast: ${value(scale.textContrast, format)};`);
  lines.push(`${indent}--${prefix}-${name}-on-solid: ${value(scale.onSolid, format)};`);
  return lines;
}

/**
 * Emit a Prism theme as CSS custom properties.
 *
 * Scale steps are written per appearance; the semantic layer is written once in
 * the light block as `var()` references, so the `.dark` block only needs to
 * redefine the underlying scale variables for the whole theme to flip.
 */
export function toCssVariables(theme: PrismTheme, options: CssOptions = {}): string {
  const prefix = options.prefix ?? "prism";
  const rootSelector = options.rootSelector ?? ":root";
  const darkSelector = options.darkSelector ?? ".dark";
  const format = options.format ?? "oklch";
  const withSemantic = options.semantic ?? true;
  const indent = options.indent ?? "  ";

  const lightLines: string[] = [];
  const darkLines: string[] = [];

  for (const [name, pair] of Object.entries(theme.scales)) {
    lightLines.push(`${indent}/* ${name} */`);
    lightLines.push(...scaleLines(pair.light, prefix, name, format, indent));
    darkLines.push(`${indent}/* ${name} */`);
    darkLines.push(...scaleLines(pair.dark, prefix, name, format, indent));
  }

  if (withSemantic) {
    lightLines.push("", `${indent}/* semantic */`);
    for (const [token, ref] of Object.entries(theme.semantic)) {
      lightLines.push(`${indent}--${token}: ${refToVar(prefix, ref)};`);
    }
  }

  const blocks = [`${rootSelector} {\n${lightLines.join("\n")}\n}`];
  if (theme.appearances.includes("dark")) {
    blocks.push(`${darkSelector} {\n${darkLines.join("\n")}\n}`);
  }
  return `${blocks.join("\n\n")}\n`;
}

/** Build a flat `{ '--var': value }` map for one appearance (e.g. to inject inline). */
export function toCssVariableMap(
  theme: PrismTheme,
  appearance: Appearance,
  options: CssOptions = {},
): Record<string, string> {
  const prefix = options.prefix ?? "prism";
  const format = options.format ?? "oklch";
  const out: Record<string, string> = {};
  for (const [name, pair] of Object.entries(theme.scales)) {
    const scale = appearance === "dark" ? pair.dark : pair.light;
    for (const key of STEP_KEYS)
      out[`--${prefix}-${name}-${key}`] = value(scale.steps[key], format);
    out[`--${prefix}-${name}-text`] = value(scale.text, format);
    out[`--${prefix}-${name}-text-contrast`] = value(scale.textContrast, format);
    out[`--${prefix}-${name}-on-solid`] = value(scale.onSolid, format);
  }
  if (options.semantic ?? true) {
    for (const [token, ref] of Object.entries(theme.semantic)) {
      out[`--${token}`] = refToVar(prefix, ref);
    }
  }
  return out;
}
