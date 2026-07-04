import { generateTheme } from "@simple-prism/core";
import { describe, expect, it } from "vitest";
import { toScss } from "../src/index";

const theme = generateTheme({ primary: "#3b82f6" });
const scss = toScss(theme);

describe("toScss", () => {
  it("emits hex scale variables by default", () => {
    expect(scss).toMatch(/\$prism-primary-500: #[0-9a-f]{6};/i);
  });

  it("emits a dark palette under the -dark suffix", () => {
    expect(scss).toMatch(/\$prism-primary-500-dark: #[0-9a-f]{6};/i);
  });

  it("emits per-scale maps including the role steps", () => {
    expect(scss).toContain("$prism-primary: (");
    expect(scss).toMatch(/"on-solid": \$prism-primary-on-solid/);
  });

  it("emits semantic aliases that reference scale variables", () => {
    expect(scss).toMatch(/\$primary: \$prism-primary-500;/);
    expect(scss).toMatch(/\$primary-foreground: \$prism-primary-on-solid;/);
    expect(scss).toMatch(/\$background: \$prism-neutral-50;/);
  });

  it("honors a non-hex format", () => {
    expect(toScss(theme, { format: "rgb" })).toMatch(/\$prism-primary-500: rgb\(/);
  });
});
