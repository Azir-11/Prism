import { describe, expect, it } from "vitest";
import { apcaContrastRgb, apcaLc, wcagRatio, wcagRatioRgb } from "../src/index";
import { parseColor, pickOnSolid, solveForLc, solveOnSolid } from "../src/index";

const BLACK = { l: 0, c: 0, h: 0 };
const WHITE = { l: 1, c: 0, h: 0 };

describe("WCAG contrast", () => {
  it("black on white is 21:1", () => {
    expect(wcagRatioRgb([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
  });

  it("is symmetric", () => {
    const a = parseColor("#3b82f6");
    const b = parseColor("#ffffff");
    expect(wcagRatio(a, b)).toBeCloseTo(wcagRatio(b, a), 5);
  });
});

describe("APCA (SA98G)", () => {
  it("black text on white ≈ Lc 106", () => {
    expect(apcaContrastRgb([0, 0, 0], [255, 255, 255])).toBeCloseTo(106, 0);
  });

  it("white text on black ≈ Lc -108", () => {
    expect(apcaContrastRgb([255, 255, 255], [0, 0, 0])).toBeCloseTo(-108, 0);
  });

  it("signs polarity correctly via OKLCH", () => {
    expect(apcaLc(BLACK, WHITE)).toBeGreaterThan(100);
    expect(apcaLc(WHITE, BLACK)).toBeLessThan(-100);
  });

  it("returns ~0 for identical colors", () => {
    expect(Math.abs(apcaLc(WHITE, WHITE))).toBeLessThan(1);
  });
});

describe("solveOnSolid", () => {
  it("picks a light foreground on a dark solid and a dark one on a light solid", () => {
    expect(solveOnSolid(parseColor("#1e3a8a")).l).toBeGreaterThan(0.7);
    expect(solveOnSolid(parseColor("#fde68a")).l).toBeLessThan(0.5);
  });

  it("clears the on-solid audit target and never underperforms the naive pick", () => {
    for (const hex of ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"]) {
      const solid = parseColor(hex);
      const solved = Math.abs(apcaLc(solveOnSolid(solid), solid));
      const naive = Math.abs(apcaLc(pickOnSolid(solid), solid));
      expect(solved).toBeGreaterThanOrEqual(45);
      expect(solved).toBeGreaterThanOrEqual(naive - 0.5);
    }
  });
});

describe("solveForLc with a WCAG floor", () => {
  it("meets the requested WCAG ratio floor", () => {
    const bg = parseColor("#eff6ff");
    const fg = solveForLc({
      hue: 250,
      chromaAt: () => 0.1,
      bg,
      targetLc: 60,
      prefer: "dark",
      wcagFloor: 4.5,
    });
    expect(wcagRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
