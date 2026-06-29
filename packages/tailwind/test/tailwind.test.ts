import { generateTheme } from "@prism/core";
import { describe, expect, it } from "vitest";
import { toTailwindColors, toTailwindCss } from "../src/index";

const theme = generateTheme({ primary: "#3b82f6" });

describe("toTailwindCss", () => {
  const css = toTailwindCss(theme);

  it("emits an @theme block", () => {
    expect(css).toContain("@theme {");
    expect(css).toContain("--color-primary-500:");
  });

  it("emits a dark override block and semantic aliases", () => {
    expect(css).toContain(".dark {");
    expect(css).toContain("--color-background:");
    expect(css).toContain("--color-primary-foreground:");
  });
});

describe("toTailwindColors", () => {
  it("builds a nested color object with a DEFAULT", () => {
    const colors = toTailwindColors(theme);
    expect(colors.primary[500]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(colors.primary.DEFAULT).toBe(colors.primary[500]);
  });

  it("differs between light and dark", () => {
    const light = toTailwindColors(theme, "light");
    const dark = toTailwindColors(theme, "dark");
    expect(light.primary[50]).not.toBe(dark.primary[50]);
  });
});
