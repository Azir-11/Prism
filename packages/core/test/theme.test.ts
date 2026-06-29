import { describe, expect, it } from "vitest";
import { generateTheme, resolveSemantic, toJSON, verifyContrast } from "../src/index";

describe("generateTheme", () => {
  const theme = generateTheme({ primary: "#3b82f6" });

  it("generates every named scale in both appearances", () => {
    for (const name of [
      "primary",
      "secondary",
      "tertiary",
      "info",
      "success",
      "warning",
      "error",
      "neutral",
    ]) {
      expect(theme.scales[name]).toBeDefined();
      expect(theme.scales[name].light).toBeDefined();
      expect(theme.scales[name].dark).toBeDefined();
    }
  });

  it("exposes shadcn-style semantic tokens", () => {
    for (const token of [
      "background",
      "foreground",
      "primary",
      "primary-foreground",
      "muted",
      "border",
      "ring",
      "destructive",
    ]) {
      expect(theme.semantic[token]).toBeDefined();
      expect(resolveSemantic(theme, "light", token).hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(resolveSemantic(theme, "dark", token).hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("light background is light and dark background is dark", () => {
    expect(resolveSemantic(theme, "light", "background").value.l).toBeGreaterThan(0.9);
    expect(resolveSemantic(theme, "dark", "background").value.l).toBeLessThan(0.25);
  });

  it("marks derived vs input seeds", () => {
    const primary = theme.seeds.find((s) => s.name === "primary");
    const secondary = theme.seeds.find((s) => s.name === "secondary");
    expect(primary?.source).toBe("input");
    expect(secondary?.source).toBe("derived");
  });

  it("passes its own contrast audit", () => {
    const report = verifyContrast(theme);
    const failures = report.checks.filter((c) => !c.passApca);
    expect(failures, JSON.stringify(failures, null, 2)).toHaveLength(0);
    expect(report.passes).toBe(true);
  });

  it("serializes to JSON without throwing", () => {
    const json = toJSON(theme);
    expect(() => JSON.stringify(json)).not.toThrow();
    expect((json.tokens as Record<string, unknown>).light).toBeDefined();
  });

  it("honors explicit overrides and accents", () => {
    const custom = generateTheme({
      primary: "#9333ea",
      secondary: "#f43f5e",
      error: "#dc2626",
      accents: ["#14b8a6"],
    });
    expect(custom.seeds.find((s) => s.name === "secondary")?.source).toBe("input");
    expect(custom.scales["accent-1"]).toBeDefined();
  });
});
