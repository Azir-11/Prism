import { describe, expect, it } from "vitest";
import {
  chromaEnvelope,
  coefficientOfVariation,
  contrast,
  hueDrift,
  lightnessEvenness,
  onSolid,
} from "./compareMetrics";

describe("coefficientOfVariation", () => {
  it("为 0（全相等）", () => {
    expect(coefficientOfVariation([2, 2, 2])).toBe(0);
  });
  it("等于 std/mean", () => {
    // [1,3] → mean 2, var 1, std 1 → cv 0.5
    expect(coefficientOfVariation([1, 3])).toBeCloseTo(0.5, 10);
  });
  it("空数组为 0", () => {
    expect(coefficientOfVariation([])).toBe(0);
  });
});

describe("lightnessEvenness", () => {
  it("均匀阶低于扎堆阶", () => {
    const even = lightnessEvenness(["#000000", "#404040", "#808080", "#bfbfbf", "#ffffff"]);
    const clumped = lightnessEvenness(["#000000", "#0a0a0a", "#141414", "#e0e0e0", "#ffffff"]);
    expect(even).toBeLessThan(clumped);
  });
  it("惩罚重复台阶（零间隔）", () => {
    const withDup = lightnessEvenness(["#ffffff", "#ffffff", "#808080", "#000000"]);
    const distinct = lightnessEvenness(["#ffffff", "#c0c0c0", "#808080", "#000000"]);
    expect(withDup).toBeGreaterThan(distinct);
  });
});

describe("hueDrift", () => {
  it("单色相为 0", () => {
    expect(hueDrift(["#3b82f6"])).toBe(0);
  });
  it("忽略近中性台阶", () => {
    expect(hueDrift(["#808080", "#7f7f80"])).toBe(0);
  });
  it("多色相为正跨度", () => {
    expect(hueDrift(["#ff0000", "#00ff00", "#0000ff"])).toBeGreaterThan(0);
  });
});

describe("chromaEnvelope", () => {
  it("峰值 ≥ 两端彩度", () => {
    const env = chromaEnvelope(["#f0f3ff", "#646cff", "#0f0940"]);
    expect(env.peak).toBeGreaterThanOrEqual(env.light);
    expect(env.peak).toBeGreaterThanOrEqual(env.dark);
  });
});

describe("contrast", () => {
  it("黑压白为最大", () => {
    const c = contrast("#000000", "#ffffff");
    expect(c.wcag).toBeCloseTo(21, 0);
    expect(c.apca).toBeGreaterThan(100);
  });
});

describe("onSolid", () => {
  it("浅色实底选深色前景", () => {
    expect(onSolid("#f0f8ff").fg).toBe("dark");
  });
  it("深色实底选浅色前景", () => {
    expect(onSolid("#00152e").fg).toBe("light");
  });
});
