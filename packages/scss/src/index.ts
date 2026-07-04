import type { ColorFormat, PrismTheme, Scale, SemanticRef, Swatch } from "@simple-prism/core";
import { formatIn, STEP_KEYS } from "@simple-prism/core";

/**
 * @simple-prism/scss — emit a Prism theme as Sass/SCSS.
 *
 * Produces flat `$prism-<scale>-<step>` variables for the light and dark
 * palettes (dark under a `-dark` suffix), one `$prism-<scale>` map per scale,
 * and shadcn-style semantic aliases (`$primary: $prism-primary-500;`). Values
 * default to hex so Sass color functions (`lighten`, `mix`, …) work; pass
 * `format: 'oklch' | 'rgb' | 'hsl'` for other notations.
 */

export interface ScssOptions {
  /** Variable name prefix. Default `prism`. */
  prefix?: string;
  /** Value format. Default `hex` (so Sass color math works). */
  format?: ColorFormat;
  /** Suffix appended to the dark-palette variables. Default `-dark`. */
  darkSuffix?: string;
  /** Emit the semantic alias layer. Default `true`. */
  semantic?: boolean;
}

function roleEntries(scale: Scale): [string, Swatch][] {
  return [
    ...STEP_KEYS.map((k) => [String(k), scale.steps[k]] as [string, Swatch]),
    ["text", scale.text],
    ["text-contrast", scale.textContrast],
    ["on-solid", scale.onSolid],
  ];
}

function stepName(step: SemanticRef["step"]): string {
  if (typeof step === "number") return String(step);
  if (step === "textContrast") return "text-contrast";
  if (step === "onSolid") return "on-solid";
  return "text";
}

/** Emit a Prism theme as SCSS variables, maps, and semantic aliases. */
export function toScss(theme: PrismTheme, options: ScssOptions = {}): string {
  const prefix = options.prefix ?? "prism";
  const format = options.format ?? "hex";
  const darkSuffix = options.darkSuffix ?? "-dark";
  const withSemantic = options.semantic ?? true;
  const val = (sw: Swatch): string => formatIn(sw.value, format);

  const lines: string[] = [];

  const emitVars = (suffix: string, pick: (pair: { light: Scale; dark: Scale }) => Scale): void => {
    for (const [name, pair] of Object.entries(theme.scales)) {
      lines.push(`// ${name}`);
      for (const [role, sw] of roleEntries(pick(pair))) {
        lines.push(`$${prefix}-${name}-${role}${suffix}: ${val(sw)};`);
      }
    }
  };

  lines.push("// Prism — light palette");
  emitVars("", (p) => p.light);
  lines.push("", "// Prism — dark palette");
  emitVars(darkSuffix, (p) => p.dark);

  lines.push("", "// Scale maps (light)");
  for (const [name, pair] of Object.entries(theme.scales)) {
    const entries = roleEntries(pair.light).map(
      ([role]) => `  "${role}": $${prefix}-${name}-${role}`,
    );
    lines.push(`$${prefix}-${name}: (\n${entries.join(",\n")},\n);`);
  }

  if (withSemantic) {
    lines.push("", "// Semantic aliases (light)");
    for (const [token, ref] of Object.entries(theme.semantic)) {
      lines.push(`$${token}: $${prefix}-${ref.scale}-${stepName(ref.step)};`);
    }
  }

  return `${lines.join("\n")}\n`;
}
