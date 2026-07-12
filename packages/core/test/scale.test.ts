import { describe, expect, it } from "vitest";
import { apcaLc, deltaEOK, generateScale, parseColor } from "../src/index";
import { STEP_KEYS } from "../src/index";

const SEEDS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4"];

describe("generateScale", () => {
  it("produces all 11 steps", () => {
    const scale = generateScale("#3b82f6");
    for (const key of STEP_KEYS) {
      expect(scale.steps[key]).toBeDefined();
      expect(scale.steps[key].hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(scale.steps[key].oklch).toMatch(/^oklch\(/);
    }
  });

  it("lightness descends monotonically in light mode", () => {
    const scale = generateScale("#3b82f6", { appearance: "light" });
    const ls = STEP_KEYS.map((k) => scale.steps[k].value.l);
    for (let i = 1; i < ls.length; i++) {
      expect(ls[i]).toBeLessThan(ls[i - 1]);
    }
  });

  it("lightness ascends monotonically in dark mode", () => {
    const scale = generateScale("#3b82f6", { appearance: "dark" });
    const ls = STEP_KEYS.map((k) => scale.steps[k].value.l);
    for (let i = 1; i < ls.length; i++) {
      expect(ls[i]).toBeGreaterThan(ls[i - 1]);
    }
  });

  it("pins the seed verbatim at its nearest step", () => {
    const seed = parseColor("#3b82f6");
    const scale = generateScale("#3b82f6");
    expect(deltaEOK(scale.steps[scale.seedStep].value, seed)).toBeLessThan(0.01);
  });

  it("guarantees text contrast for every hue (the cross-hue promise)", () => {
    for (const seed of SEEDS) {
      const scale = generateScale(seed);
      const bg = scale.steps[100].value;
      expect(Math.abs(apcaLc(scale.textContrast.value, bg))).toBeGreaterThanOrEqual(85);
      expect(Math.abs(apcaLc(scale.text.value, bg))).toBeGreaterThanOrEqual(55);
    }
  });

  it("keeps chroma highest in the mid-tones", () => {
    const scale = generateScale("#3b82f6");
    const c500 = scale.steps[500].value.c;
    expect(c500).toBeGreaterThan(scale.steps[50].value.c);
    expect(c500).toBeGreaterThan(scale.steps[950].value.c);
  });

  it("holds hue constant across the ramp when torsion is 0", () => {
    const scale = generateScale("#3b82f6", { hueTorsion: 0 });
    const ref = scale.steps[500].value.h;
    for (const k of STEP_KEYS) {
      expect(Math.abs(scale.steps[k].value.h - ref)).toBeLessThan(1);
    }
  });

  it("torsions hue so the dark and light ends of the ramp diverge", () => {
    const scale = generateScale("#3b82f6", { hueTorsion: 10, appearance: "light" });
    const hLight = scale.steps[50].value.h; // highest lightness
    const hDark = scale.steps[950].value.h; // lowest lightness
    // Positive torsion pushes the dark end's hue above the light end's.
    expect(hDark).toBeGreaterThan(hLight + 2);
  });
});

describe("seed placement", () => {
  // A dark-ish brand blue whose lightness (L≈0.55) previously pinned it to step 600.
  const DARK_BLUE = "#2264f2";
  // Seeds spanning a wide lightness range — the contract must hold for all of them.
  const SPREAD = ["#2264f2", "#3b82f6", "#111827", "#f59e0b", "#a5f3fc", "#7c3aed"];

  it("puts the exact brand seed on step 500 (the '500 = brand' contract)", () => {
    const scale = generateScale(DARK_BLUE, { appearance: "light" });
    expect(scale.seedStep).toBe(500);
    expect(scale.steps[500].hex).toBe(DARK_BLUE);
  });

  it("anchors any seed on step 500 regardless of its lightness", () => {
    for (const seed of SPREAD) {
      for (const appearance of ["light", "dark"] as const) {
        const scale = generateScale(seed, { appearance });
        const parsed = parseColor(seed);
        expect(scale.seedStep, `${seed} ${appearance}`).toBe(500);
        expect(deltaEOK(scale.steps[500].value, parsed), `${seed} ${appearance}`).toBeLessThan(
          0.01,
        );
      }
    }
  });

  it("keeps the ramp strictly monotonic after re-anchoring a dark seed", () => {
    const light = generateScale(DARK_BLUE, { appearance: "light" });
    const lsLight = STEP_KEYS.map((k) => light.steps[k].value.l);
    for (let i = 1; i < lsLight.length; i++) expect(lsLight[i]).toBeLessThan(lsLight[i - 1]);

    const dark = generateScale(DARK_BLUE, { appearance: "dark" });
    const lsDark = STEP_KEYS.map((k) => dark.steps[k].value.l);
    for (let i = 1; i < lsDark.length; i++) expect(lsDark[i]).toBeGreaterThan(lsDark[i - 1]);
  });

  it("keeps the legacy 'nearest' placement available (seed floats by lightness)", () => {
    const scale = generateScale(DARK_BLUE, { appearance: "light", seedPlacement: "nearest" });
    // With the fixed ramp, L≈0.553 lands on step 600, not 500.
    expect(scale.seedStep).toBe(600);
    expect(scale.steps[600].hex).toBe(DARK_BLUE);
    expect(scale.steps[500].hex).not.toBe(DARK_BLUE);
  });
});
