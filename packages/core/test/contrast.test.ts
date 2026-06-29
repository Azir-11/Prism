import { describe, expect, it } from "vitest";
import { apcaContrastRgb, apcaLc, wcagRatio, wcagRatioRgb } from "../src/index";
import { parseColor } from "../src/index";

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
