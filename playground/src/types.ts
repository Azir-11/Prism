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
