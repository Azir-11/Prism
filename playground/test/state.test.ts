import { describe, expect, it } from "vitest";
import { decodeForm, encodeForm, mergeForm, sanitizeForm } from "../src/state";
import { DEFAULT_FORM } from "../src/types";

describe("encodeForm / decodeForm", () => {
  it("round-trips a form through the URL-hash encoding", () => {
    const form = {
      ...DEFAULT_FORM,
      primary: "#ff8800",
      useSecondary: true,
      hueTorsion: 7,
      neutralChroma: 0.021,
      appearance: "dark" as const,
      gamut: "p3" as const,
    };
    expect(mergeForm(decodeForm(encodeForm(form)))).toEqual(form);
  });

  it("returns an empty partial for garbage input", () => {
    expect(decodeForm("$$$not-base64$$$")).toEqual({});
    expect(decodeForm("")).toEqual({});
  });
});

describe("sanitizeForm", () => {
  it("keeps known keys with the correct primitive type", () => {
    const clean = sanitizeForm({ primary: "#fff", hueTorsion: 3, gamut: "p3" });
    expect(clean.primary).toBe("#fff");
    expect(clean.hueTorsion).toBe(3);
    expect(clean.gamut).toBe("p3");
  });

  it("drops unknown keys and invalid enum/type values", () => {
    const clean = sanitizeForm({
      evil: "x",
      appearance: "sideways",
      hueTorsion: "not-a-number",
      useSecondary: 1,
    });
    expect("evil" in clean).toBe(false);
    expect("appearance" in clean).toBe(false);
    expect("hueTorsion" in clean).toBe(false);
    expect("useSecondary" in clean).toBe(false);
  });

  it("ignores non-object input", () => {
    expect(sanitizeForm(null)).toEqual({});
    expect(sanitizeForm("nope")).toEqual({});
  });
});

describe("mergeForm", () => {
  it("fills every default and overlays the partial", () => {
    const merged = mergeForm({ primary: "#123456" });
    expect(merged.primary).toBe("#123456");
    expect(merged.textLc).toBe(DEFAULT_FORM.textLc);
    expect(Object.keys(merged).toSorted()).toEqual(Object.keys(DEFAULT_FORM).toSorted());
  });
});
