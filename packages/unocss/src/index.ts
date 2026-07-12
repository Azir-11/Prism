/**
 * @simple-prism/unocss — first-class UnoCSS support for Prism themes.
 *
 * - `toUnoTheme(theme)` builds a UnoCSS `theme.colors` object whose values are
 *   `rgb(var(--…) / <alpha-value>)`, so `bg-primary` and `bg-primary/10` both work.
 * - `presetPrism(input)` returns a UnoCSS preset that *also* injects the matching
 *   bare-channel CSS variables (`:root` + `.dark`) via preflights, so a single
 *   `presets: [presetUno(), presetPrism({ primary: '#3b82f6' })]` needs no shim.
 *
 * Bare channels (`--primary-500-color: 59 130 246`) are what make the alpha
 * modifier work: UnoCSS re-serializes the color as `rgb(var(--…) / 0.1)`.
 */
import type { PrismInput, PrismTheme } from "@simple-prism/core";
import { generateTheme, STEP_KEYS } from "@simple-prism/core";
import { toCssVariables } from "@simple-prism/css";

/**
 * A minimal, structurally UnoCSS-compatible preset shape. Declared locally so
 * this package carries no hard `unocss` dependency; the returned object is
 * assignable to UnoCSS's `Preset` (only `name` is required there).
 */
export interface UnoPreset {
  name: string;
  preflights: { getCSS: () => string }[];
  theme: { colors: Record<string, string> };
}

export interface UnoThemeOptions {
  /** Variable-name prefix (must match the injected CSS vars). Default `prism`. Empty string drops it. */
  prefix?: string;
  /** Variable-name suffix. Default `color` → `--primary-500-color`. */
  suffix?: string;
  /** Alpha placeholder embedded in each color value. Default `<alpha-value>`. */
  alphaPlaceholder?: string;
}

export interface PresetPrismOptions extends UnoThemeOptions {
  /** Selector for the dark block. Default `.dark` (matches `dark: 'class'`). */
  darkSelector?: string;
  /** Also inject the shadcn-style semantic token layer into the CSS. Default `false`. */
  semantic?: boolean;
}

function varName(prefix: string, base: string, suffix: string): string {
  return `--${[prefix, base, suffix].filter((s) => s !== "").join("-")}`;
}

function colorRef(prefix: string, base: string, suffix: string, alpha: string): string {
  return `rgb(var(${varName(prefix, base, suffix)}) / ${alpha})`;
}

/**
 * Build a UnoCSS `theme.colors` object from a Prism theme. Every scale yields a
 * DEFAULT (`bg-primary`, pointing at the 500 step) plus numbered steps
 * (`bg-primary-500`). Values reference bare-channel CSS variables.
 */
export function toUnoTheme(
  theme: PrismTheme,
  options: UnoThemeOptions = {},
): { colors: Record<string, string> } {
  const prefix = options.prefix ?? "prism";
  const suffix = options.suffix ?? "color";
  const alpha = options.alphaPlaceholder ?? "<alpha-value>";
  const colors: Record<string, string> = {};
  for (const name of Object.keys(theme.scales)) {
    colors[name] = colorRef(prefix, `${name}-500`, suffix, alpha);
    for (const step of STEP_KEYS) {
      colors[`${name}-${step}`] = colorRef(prefix, `${name}-${step}`, suffix, alpha);
    }
  }
  return { colors };
}

function isPrismTheme(input: PrismInput | PrismTheme): input is PrismTheme {
  return (
    typeof (input as PrismTheme).scales === "object" &&
    typeof (input as PrismTheme).meta === "object"
  );
}

/**
 * Build a UnoCSS preset from either a `PrismInput` (generated on the spot) or a
 * pre-built `PrismTheme`. The preset injects `:root`/`.dark` bare-channel
 * variables via preflights and wires `theme.colors` to reference them.
 */
export function presetPrism(
  input: PrismInput | PrismTheme,
  options: PresetPrismOptions = {},
): UnoPreset {
  const theme = isPrismTheme(input) ? input : generateTheme(input);
  const prefix = options.prefix ?? "prism";
  const suffix = options.suffix ?? "color";
  const darkSelector = options.darkSelector ?? ".dark";
  const semantic = options.semantic ?? false;

  const css = toCssVariables(theme, {
    format: "rgb-channels",
    prefix,
    suffix,
    darkSelector,
    semantic,
  });

  return {
    name: "@simple-prism/unocss",
    preflights: [{ getCSS: () => css }],
    theme: toUnoTheme(theme, { prefix, suffix, alphaPlaceholder: options.alphaPlaceholder }),
  };
}
