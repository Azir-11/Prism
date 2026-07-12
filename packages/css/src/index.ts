import type {
  Appearance,
  ColorFormat,
  PrismTheme,
  Scale,
  SemanticRef,
  Swatch,
} from "@simple-prism/core";
import { formatHsl, formatRgb, formatRgbChannels, STEP_KEYS } from "@simple-prism/core";

export interface CssOptions {
  /** Variable name prefix for scale steps. Default `prism`. Empty string drops the prefix segment. */
  prefix?: string;
  /** Variable name suffix appended after the step (e.g. `color` → `--primary-500-color`). Default none. */
  suffix?: string;
  /** Selector for the light block. Default `:root`. */
  rootSelector?: string;
  /** Selector for the dark block. Default `.dark`. */
  darkSelector?: string;
  /** Emit the shadcn-style semantic token layer. Default `true`. */
  semantic?: boolean;
  /** Value format. Default `oklch`. `rgb-channels` emits bare `59 130 246` for `rgb(var() / α)`. */
  format?: ColorFormat;
  /** Indentation. Default two spaces. */
  indent?: string;
}

function value(swatch: Swatch, format: ColorFormat): string {
  switch (format) {
    case "hex":
      return swatch.hex;
    case "rgb":
      return formatRgb(swatch.value);
    case "rgb-channels":
      return formatRgbChannels(swatch.value);
    case "hsl":
      return formatHsl(swatch.value);
    default:
      return swatch.oklch;
  }
}

/** Join `--prefix-base-suffix`, dropping any empty segment so an empty prefix never yields `---`. */
function varName(prefix: string, base: string, suffix: string): string {
  return `--${[prefix, base, suffix].filter((s) => s !== "").join("-")}`;
}

function refToVar(prefix: string, suffix: string, ref: SemanticRef): string {
  const step =
    typeof ref.step === "number"
      ? String(ref.step)
      : ref.step === "textContrast"
        ? "text-contrast"
        : ref.step === "onSolid"
          ? "on-solid"
          : "text";
  return `var(${varName(prefix, `${ref.scale}-${step}`, suffix)})`;
}

function scaleLines(
  scale: Scale,
  prefix: string,
  suffix: string,
  name: string,
  format: ColorFormat,
  indent: string,
): string[] {
  const line = (base: string, sw: Swatch): string =>
    `${indent}${varName(prefix, base, suffix)}: ${value(sw, format)};`;
  const lines: string[] = [];
  for (const key of STEP_KEYS) lines.push(line(`${name}-${key}`, scale.steps[key]));
  lines.push(line(`${name}-text`, scale.text));
  lines.push(line(`${name}-text-contrast`, scale.textContrast));
  lines.push(line(`${name}-on-solid`, scale.onSolid));
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
  const suffix = options.suffix ?? "";
  const rootSelector = options.rootSelector ?? ":root";
  const darkSelector = options.darkSelector ?? ".dark";
  const format = options.format ?? "oklch";
  const withSemantic = options.semantic ?? true;
  const indent = options.indent ?? "  ";

  const lightLines: string[] = [];
  const darkLines: string[] = [];

  for (const [name, pair] of Object.entries(theme.scales)) {
    lightLines.push(`${indent}/* ${name} */`);
    lightLines.push(...scaleLines(pair.light, prefix, suffix, name, format, indent));
    darkLines.push(`${indent}/* ${name} */`);
    darkLines.push(...scaleLines(pair.dark, prefix, suffix, name, format, indent));
  }

  if (withSemantic) {
    lightLines.push("", `${indent}/* semantic */`);
    for (const [token, ref] of Object.entries(theme.semantic)) {
      lightLines.push(`${indent}--${token}: ${refToVar(prefix, suffix, ref)};`);
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
  const suffix = options.suffix ?? "";
  const format = options.format ?? "oklch";
  const out: Record<string, string> = {};
  for (const [name, pair] of Object.entries(theme.scales)) {
    const scale = appearance === "dark" ? pair.dark : pair.light;
    for (const key of STEP_KEYS)
      out[varName(prefix, `${name}-${key}`, suffix)] = value(scale.steps[key], format);
    out[varName(prefix, `${name}-text`, suffix)] = value(scale.text, format);
    out[varName(prefix, `${name}-text-contrast`, suffix)] = value(scale.textContrast, format);
    out[varName(prefix, `${name}-on-solid`, suffix)] = value(scale.onSolid, format);
  }
  if (options.semantic ?? true) {
    for (const [token, ref] of Object.entries(theme.semantic)) {
      out[`--${token}`] = refToVar(prefix, suffix, ref);
    }
  }
  return out;
}
