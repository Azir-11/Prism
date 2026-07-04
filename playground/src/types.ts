export interface Form {
  primary: string;
  useSecondary: boolean;
  secondary: string;
  useTertiary: boolean;
  tertiary: string;
  overrideSemantics: boolean;
  info: string;
  success: string;
  warning: string;
  error: string;
  neutralMode: "auto" | "custom";
  neutral: string;
  neutralChroma: number;
  textLc: number;
  textContrastLc: number;
  gamut: "srgb" | "p3";
  hueTorsion: number;
  appearance: "light" | "dark";
}

/** The canonical initial form — also the target of the "reset" action. */
export const DEFAULT_FORM: Form = {
  primary: "#3b82f6",
  useSecondary: false,
  secondary: "#f43f5e",
  useTertiary: false,
  tertiary: "#14b8a6",
  overrideSemantics: false,
  info: "#0ea5e9",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  neutralMode: "auto",
  neutral: "#71717a",
  neutralChroma: 0.008,
  textLc: 60,
  textContrastLc: 90,
  gamut: "srgb",
  hueTorsion: 4,
  appearance: "light",
};

/** Format used when copying individual swatches / driving export output. */
export type CopyFormat = "hex" | "oklch" | "rgb" | "hsl";

export const PRESETS: { name: string; primary: string }[] = [
  { name: "经典蓝", primary: "#3b82f6" },
  { name: "靛青", primary: "#6366f1" },
  { name: "翡翠", primary: "#10b981" },
  { name: "玫瑰", primary: "#f43f5e" },
  { name: "琥珀", primary: "#f59e0b" },
  { name: "紫罗兰", primary: "#8b5cf6" },
  { name: "青色", primary: "#06b6d4" },
  { name: "石墨", primary: "#64748b" },
];
