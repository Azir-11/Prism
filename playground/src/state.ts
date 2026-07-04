import type { Form } from "./types";
import { DEFAULT_FORM } from "./types";

const STORAGE_KEY = "prism.form.v1";

const STRING_KEYS = [
  "primary",
  "secondary",
  "tertiary",
  "info",
  "success",
  "warning",
  "error",
  "neutral",
] as const;
const BOOL_KEYS = ["useSecondary", "useTertiary", "overrideSemantics"] as const;
const NUMBER_KEYS = ["neutralChroma", "textLc", "textContrastLc", "hueTorsion"] as const;

/** Keep only known keys carrying the right primitive type — never trust decoded input. */
export function sanitizeForm(raw: unknown): Partial<Form> {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as Record<string, unknown>;
  const out: Partial<Form> = {};
  for (const k of STRING_KEYS) if (typeof src[k] === "string") out[k] = src[k] as string;
  for (const k of BOOL_KEYS) if (typeof src[k] === "boolean") out[k] = src[k] as boolean;
  for (const k of NUMBER_KEYS) {
    const v = src[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  if (src.neutralMode === "auto" || src.neutralMode === "custom") out.neutralMode = src.neutralMode;
  if (src.gamut === "srgb" || src.gamut === "p3") out.gamut = src.gamut;
  if (src.appearance === "light" || src.appearance === "dark") out.appearance = src.appearance;
  return out;
}

/** Overlay a partial form onto the canonical defaults, yielding a complete Form. */
export function mergeForm(partial: Partial<Form>): Form {
  return { ...DEFAULT_FORM, ...partial };
}

/** Encode a form into a compact, URL-safe hash payload. */
export function encodeForm(form: Form): string {
  return btoa(encodeURIComponent(JSON.stringify(form)));
}

/** Decode a hash payload back into a validated partial form ({} on any failure). */
export function decodeForm(encoded: string): Partial<Form> {
  if (!encoded) return {};
  try {
    return sanitizeForm(JSON.parse(decodeURIComponent(atob(encoded))));
  } catch {
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/*  Browser-side persistence (localStorage + location.hash)                    */
/* -------------------------------------------------------------------------- */

export function saveForm(form: Form): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {
    /* storage may be unavailable (private mode / quota) */
  }
}

function loadStoredForm(): Partial<Form> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeForm(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

/** The share link for a form: current URL with the encoded form in the hash. */
export function shareUrl(form: Form): string {
  const base = location.href.split("#")[0];
  return `${base}#${encodeForm(form)}`;
}

/** Resolve the initial form: URL hash wins, then localStorage, then defaults. */
export function readInitialForm(): Form {
  const hash = typeof location !== "undefined" ? location.hash.replace(/^#/, "") : "";
  if (hash) {
    const fromHash = decodeForm(hash);
    if (Object.keys(fromHash).length) return mergeForm(fromHash);
  }
  return mergeForm(loadStoredForm());
}
