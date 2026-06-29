/** Small numeric helpers shared across the core. */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function round(value: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Normalize a hue angle into the [0, 360) range. */
export function mod360(h: number): number {
  return ((h % 360) + 360) % 360;
}

/** Signed shortest angular distance from `a` to `b`, in degrees, range (-180, 180]. */
export function hueDelta(a: number, b: number): number {
  let d = mod360(b - a);
  if (d > 180) d -= 360;
  return d;
}
