import { describe, expect, it } from "vitest";
import { deltaEOK, formatHsl, formatRgb, parseColor, simulateCvd } from "../src/index";

describe("formatRgb", () => {
  it("formats a color as a modern space-separated sRGB rgb() string", () => {
    const rgb = formatRgb(parseColor("#3b82f6"));
    expect(rgb).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
    const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
    // #3b82f6 === rgb(59 130 246); allow ±1 for OKLCH round-trip rounding.
    expect(Math.abs(r - 59)).toBeLessThanOrEqual(1);
    expect(Math.abs(g - 130)).toBeLessThanOrEqual(1);
    expect(Math.abs(b - 246)).toBeLessThanOrEqual(1);
  });

  it("clamps out-of-sRGB colors into byte range", () => {
    const rgb = formatRgb({ l: 0.7, c: 0.37, h: 150 });
    const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
    for (const v of [r, g, b]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
  });

  it("includes an alpha channel when alpha < 1", () => {
    const rgb = formatRgb({ l: 0.6, c: 0.15, h: 250, alpha: 0.5 });
    expect(rgb).toMatch(/^rgb\(\d+ \d+ \d+ \/ 0\.5\)$/);
  });
});

describe("formatHsl", () => {
  it("formats a color as a modern hsl() string with percentages", () => {
    const hsl = formatHsl(parseColor("#3b82f6"));
    expect(hsl).toMatch(/^hsl\([\d.]+ [\d.]+% [\d.]+%\)$/);
    const [h, s, l] = hsl.match(/[\d.]+/g)!.map(Number);
    // #3b82f6 ≈ hsl(217 91% 60%)
    expect(Math.abs(h - 217)).toBeLessThanOrEqual(2);
    expect(Math.abs(s - 91)).toBeLessThanOrEqual(3);
    expect(Math.abs(l - 60)).toBeLessThanOrEqual(3);
  });

  it("includes an alpha channel when alpha < 1", () => {
    const hsl = formatHsl({ l: 0.6, c: 0.15, h: 250, alpha: 0.5 });
    expect(hsl).toMatch(/\/ 0\.5\)$/);
  });
});

describe("simulateCvd", () => {
  it("leaves a color essentially unchanged at severity 0", () => {
    const blue = parseColor("#3b82f6");
    expect(deltaEOK(blue, simulateCvd(blue, "deutan", 0))).toBeLessThan(0.02);
  });

  it("collapses red and green toward each other under deuteranopia", () => {
    const red = parseColor("#e5484d");
    const green = parseColor("#30a46c");
    const before = deltaEOK(red, green);
    const after = deltaEOK(simulateCvd(red, "deutan"), simulateCvd(green, "deutan"));
    expect(after).toBeLessThan(before);
  });

  it("handles all three deficiency types and stays in range", () => {
    for (const type of ["protan", "deutan", "tritan"] as const) {
      const sim = simulateCvd(parseColor("#8b5cf6"), type);
      expect(sim.l).toBeGreaterThanOrEqual(0);
      expect(sim.l).toBeLessThanOrEqual(1);
      expect(Number.isFinite(sim.h)).toBe(true);
    }
  });
});
