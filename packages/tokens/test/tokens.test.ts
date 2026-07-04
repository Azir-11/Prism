import { generateTheme } from "@simple-prism/core";
import { describe, expect, it } from "vitest";
import { toDesignTokens, toDesignTokensJson } from "../src/index";

const theme = generateTheme({ primary: "#3b82f6" });
// biome-ignore lint: test reaches into the loosely-typed DTCG tree
const tokens = toDesignTokens(theme) as any;

describe("toDesignTokens", () => {
  it("emits DTCG color tokens with $type/$value in hex", () => {
    const t = tokens.color.light.primary["500"];
    expect(t.$type).toBe("color");
    expect(t.$value).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("keeps the source oklch in $extensions", () => {
    expect(tokens.color.light.primary["500"].$extensions["com.prism.oklch"]).toMatch(/^oklch\(/);
  });

  it("expresses semantic tokens as DTCG aliases into the scale", () => {
    expect(tokens.semantic.light.background.$value).toBe("{color.light.neutral.50}");
    expect(tokens.semantic.light["primary-foreground"].$value).toBe(
      "{color.light.primary.on-solid}",
    );
  });

  it("includes both light and dark token sets", () => {
    expect(tokens.color.dark.primary["500"].$value).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.semantic.dark.background).toBeDefined();
  });

  it("names the role steps (text / text-contrast / on-solid)", () => {
    expect(tokens.color.light.primary.text.$type).toBe("color");
    expect(tokens.color.light.primary["text-contrast"].$type).toBe("color");
    expect(tokens.color.light.primary["on-solid"].$type).toBe("color");
  });
});

describe("toDesignTokensJson", () => {
  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(toDesignTokensJson(theme))).not.toThrow();
  });
});
