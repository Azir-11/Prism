import { generateTheme } from "@simple-prism/core";
import { describe, expect, it } from "vitest";
import { presetPrism, toUnoTheme } from "../src/index";

const theme = generateTheme({ primary: "#3b82f6" });

describe("toUnoTheme", () => {
  const { colors } = toUnoTheme(theme);

  it("maps each scale to a DEFAULT and the numbered steps", () => {
    expect(colors.primary).toBeDefined();
    expect(colors["primary-50"]).toBeDefined();
    expect(colors["primary-500"]).toBeDefined();
    expect(colors["primary-950"]).toBeDefined();
  });

  it("uses rgb(var(--…) / <alpha-value>) so opacity modifiers work", () => {
    expect(colors["primary-500"]).toBe("rgb(var(--prism-primary-500-color) / <alpha-value>)");
    // DEFAULT (bare `bg-primary`) points at the 500 step.
    expect(colors.primary).toBe("rgb(var(--prism-primary-500-color) / <alpha-value>)");
  });

  it("honors prefix and suffix", () => {
    const { colors: c } = toUnoTheme(theme, { prefix: "", suffix: "color" });
    expect(c["primary-500"]).toBe("rgb(var(--primary-500-color) / <alpha-value>)");
  });
});

describe("presetPrism", () => {
  const preset = presetPrism({ primary: "#3b82f6" });

  it("returns a named, UnoCSS-compatible preset", () => {
    expect(preset.name).toBe("@simple-prism/unocss");
    expect(preset.preflights).toHaveLength(1);
    expect(preset.theme.colors).toBeDefined();
  });

  it("injects :root and .dark blocks with bare rgb channels", () => {
    const css = preset.preflights[0].getCSS();
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
    expect(css).toMatch(/--prism-primary-500-color: \d+ \d+ \d+;/);
    expect(css).not.toContain("oklch(");
  });

  it("keeps every theme color referenced in the injected preflight (names line up)", () => {
    const css = preset.preflights[0].getCSS();
    const ref = preset.theme.colors["primary-500"];
    const varName = ref.match(/var\((--[\w-]+)\)/)![1];
    expect(css).toContain(`${varName}:`);
  });

  it("accepts a pre-built PrismTheme and matches the input form", () => {
    const fromTheme = presetPrism(theme);
    expect(fromTheme.theme.colors).toEqual(preset.theme.colors);
    expect(fromTheme.preflights[0].getCSS()).toBe(preset.preflights[0].getCSS());
  });

  it("omits the semantic layer by default", () => {
    const css = preset.preflights[0].getCSS();
    expect(css).not.toContain("--background:");
  });
});
