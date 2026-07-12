import { generateTheme } from "@simple-prism/core";
import { describe, expect, it } from "vitest";
import { toCssVariableMap, toCssVariables } from "../src/index";

const theme = generateTheme({ primary: "#3b82f6" });

describe("toCssVariables", () => {
  const css = toCssVariables(theme);

  it("emits :root and .dark blocks", () => {
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("emits numbered scale steps and the semantic layer", () => {
    expect(css).toContain("--prism-primary-500: oklch(");
    expect(css).toContain("--prism-primary-on-solid:");
    expect(css).toContain("--background: var(--prism-neutral-50)");
    expect(css).toContain("--primary-foreground: var(--prism-primary-on-solid)");
  });

  it("supports hex output", () => {
    const hex = toCssVariables(theme, { format: "hex" });
    expect(hex).toMatch(/--prism-primary-500: #[0-9a-f]{6}/i);
  });

  it("supports rgb and hsl output", () => {
    expect(toCssVariables(theme, { format: "rgb" })).toMatch(/--prism-primary-500: rgb\(\d/);
    expect(toCssVariables(theme, { format: "hsl" })).toMatch(/--prism-primary-500: hsl\(\d/);
  });
});

describe("toCssVariableMap", () => {
  it("produces a flat map per appearance", () => {
    const light = toCssVariableMap(theme, "light");
    const dark = toCssVariableMap(theme, "dark");
    expect(light["--prism-primary-50"]).toMatch(/^oklch\(/);
    expect(light["--prism-primary-50"]).not.toBe(dark["--prism-primary-50"]);
  });

  it("honors suffix in map keys", () => {
    const light = toCssVariableMap(theme, "light", { suffix: "color" });
    expect(light["--prism-primary-50-color"]).toBeDefined();
  });
});

describe("toCssVariables naming + rgb-channels", () => {
  it("appends a suffix to every variable name", () => {
    const css = toCssVariables(theme, { suffix: "color" });
    expect(css).toContain("--prism-primary-500-color:");
    expect(css).toContain("--prism-primary-on-solid-color:");
  });

  it("omits the prefix segment cleanly when prefix is empty", () => {
    const css = toCssVariables(theme, { prefix: "" });
    expect(css).toContain("--primary-500:");
    expect(css).not.toContain("---");
  });

  it("emits gva-shaped bare-channel variables (prefix:'', suffix:'color', rgb-channels)", () => {
    const css = toCssVariables(theme, {
      format: "rgb-channels",
      prefix: "",
      suffix: "color",
      semantic: false,
    });
    expect(css).toMatch(/--primary-500-color: \d+ \d+ \d+;/);
    expect(css).not.toContain("oklch(");
    expect(css).not.toContain("---");
  });

  it("keeps semantic references consistent with prefix and suffix", () => {
    const css = toCssVariables(theme, { suffix: "color" });
    // Semantic token names stay canonical; the vars they reference carry the suffix.
    expect(css).toContain("--primary-foreground: var(--prism-primary-on-solid-color)");
    expect(css).toContain("--background: var(--prism-neutral-50-color)");
  });
});
