import { describe, expect, it } from "vitest";
import {
  deriveNeutral,
  deriveSecondary,
  deriveSemantics,
  deriveTertiary,
  parseColor,
} from "../src/index";

const primary = parseColor("#3b82f6"); // blue, hue ≈ 260

describe("harmony derivation", () => {
  it("split-complementary secondary rotates hue by 150°", () => {
    const sec = deriveSecondary(primary, "split-complementary");
    const expected = (primary.h + 150) % 360;
    expect(Math.abs(sec.h - expected)).toBeLessThan(0.5);
    expect(sec.l).toBeCloseTo(primary.l, 5);
  });

  it("tertiary uses the hue + 60° rule at reduced chroma", () => {
    const ter = deriveTertiary(primary);
    expect(Math.abs(ter.h - ((primary.h + 60) % 360))).toBeLessThan(0.5);
    expect(ter.c).toBeLessThan(primary.c);
  });

  it("auto neutral is a faint tint of the brand hue", () => {
    const n = deriveNeutral(primary);
    expect(n.h).toBeCloseTo(primary.h, 5);
    expect(n.c).toBeLessThan(0.02);
  });

  it("semantic colors land in their canonical hue ranges", () => {
    const s = deriveSemantics(primary);
    expect(s.error.h).toBeGreaterThanOrEqual(12);
    expect(s.error.h).toBeLessThanOrEqual(40);
    expect(s.warning.h).toBeGreaterThanOrEqual(60);
    expect(s.warning.h).toBeLessThanOrEqual(95);
    expect(s.success.h).toBeGreaterThanOrEqual(120);
    expect(s.success.h).toBeLessThanOrEqual(165);
    expect(s.info.h).toBeGreaterThanOrEqual(210);
    expect(s.info.h).toBeLessThanOrEqual(265);
  });

  it("respects explicit semantic overrides", () => {
    const s = deriveSemantics(primary, { error: "#dc2626" });
    const ref = parseColor("#dc2626");
    expect(s.error.h).toBeCloseTo(ref.h, 1);
  });
});
