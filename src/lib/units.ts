export const CM_PER_INCH = 2.54;
export const CM_PER_FOOT = 30.48;
export const LB_PER_KG = 2.20462;
export const KG_PER_LB = 0.453592;

/** Convert a height value (with optional inches) to centimetres. */
export function heightToCm(value: string, unit: "cm" | "ft", inches?: string): number {
  if (unit === "ft") {
    const feet = parseFloat(value) || 0;
    const ins = parseFloat(inches ?? "0") || 0;
    return feet * CM_PER_FOOT + ins * CM_PER_INCH;
  }
  return parseFloat(value) || 0;
}

/** Convert a weight value to kilograms. */
export function weightToKg(value: string, unit: "kg" | "lb"): number {
  if (unit === "lb") {
    return (parseFloat(value) || 0) * KG_PER_LB;
  }
  return parseFloat(value) || 0;
}
