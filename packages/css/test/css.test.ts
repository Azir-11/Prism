import { generateTheme } from "@prism/core";
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
});

describe("toCssVariableMap", () => {
  it("produces a flat map per appearance", () => {
    const light = toCssVariableMap(theme, "light");
    const dark = toCssVariableMap(theme, "dark");
    expect(light["--prism-primary-50"]).toMatch(/^oklch\(/);
    expect(light["--prism-primary-50"]).not.toBe(dark["--prism-primary-50"]);
  });
});
