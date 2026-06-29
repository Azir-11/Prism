import type { Appearance, PrismTheme, Scale } from "@prism/core";
import { resolveSemantic, STEP_KEYS } from "@prism/core";

export interface TailwindOptions {
  /** Selector used to redefine tokens for dark mode. Default `.dark`. */
  darkSelector?: string;
  /** Include the semantic single-color aliases (background, primary, …). Default `true`. */
  semantic?: boolean;
  /** Value format. Default `oklch`. */
  format?: "oklch" | "hex";
  indent?: string;
}

function val(scaleSwatch: { hex: string; oklch: string }, format: "oklch" | "hex"): string {
  return format === "hex" ? scaleSwatch.hex : scaleSwatch.oklch;
}

function scaleLines(scale: Scale, name: string, format: "oklch" | "hex", indent: string): string[] {
  return STEP_KEYS.map(
    (key) => `${indent}--color-${name}-${key}: ${val(scale.steps[key], format)};`,
  );
}

function semanticLines(
  theme: PrismTheme,
  appearance: Appearance,
  format: "oklch" | "hex",
  indent: string,
): string[] {
  return Object.keys(theme.semantic).map((token) => {
    const swatch = resolveSemantic(theme, appearance, token);
    return `${indent}--color-${token}: ${val(swatch, format)};`;
  });
}

/**
 * Emit a Prism theme as a Tailwind CSS v4 `@theme` block, with a `.dark`
 * override block redefining the same `--color-*` variables. Utilities like
 * `bg-primary-500`, `text-foreground`, and `border-border` work in both modes.
 */
export function toTailwindCss(theme: PrismTheme, options: TailwindOptions = {}): string {
  const darkSelector = options.darkSelector ?? ".dark";
  const withSemantic = options.semantic ?? true;
  const format = options.format ?? "oklch";
  const indent = options.indent ?? "  ";

  const themeLines: string[] = [];
  for (const [name, pair] of Object.entries(theme.scales)) {
    themeLines.push(`${indent}/* ${name} */`);
    themeLines.push(...scaleLines(pair.light, name, format, indent));
  }
  if (withSemantic) {
    themeLines.push("", `${indent}/* semantic */`);
    themeLines.push(...semanticLines(theme, "light", format, indent));
  }

  const blocks = [`@theme {\n${themeLines.join("\n")}\n}`];

  if (theme.appearances.includes("dark")) {
    const darkLines: string[] = [];
    for (const [name, pair] of Object.entries(theme.scales)) {
      darkLines.push(...scaleLines(pair.dark, name, format, indent));
    }
    if (withSemantic) darkLines.push(...semanticLines(theme, "dark", format, indent));
    blocks.push(`${darkSelector} {\n${darkLines.join("\n")}\n}`);
  }

  return `${blocks.join("\n\n")}\n`;
}

/**
 * Build a Tailwind color object (`{ primary: { 50: '#…', … }, … }`) for one
 * appearance — for `tailwind.config` consumers or any programmatic use.
 */
export function toTailwindColors(
  theme: PrismTheme,
  appearance: Appearance = "light",
  format: "oklch" | "hex" = "hex",
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [name, pair] of Object.entries(theme.scales)) {
    const scale = appearance === "dark" ? pair.dark : pair.light;
    const shades: Record<string, string> = {};
    for (const key of STEP_KEYS) shades[key] = val(scale.steps[key], format);
    shades.DEFAULT = val(scale.steps[500], format);
    out[name] = shades;
  }
  return out;
}
