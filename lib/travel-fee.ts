/**
 * Cutit Go travel fee calculation — deliberately isolated from lib/data.ts
 * so this specific rule (currently a flat base fee + a simple per-area
 * surcharge, no real distance/routing) can be swapped for a real
 * distance/traffic-based calculation later without touching booking or
 * address logic elsewhere.
 */

const BASE_FEE_EGP = 50

/** Flat surcharge by area, standing in for a real distance calculation. */
const AREA_SURCHARGE_EGP: Record<string, number> = {
  'New Cairo': 0,
  Zamalek: 20,
  Maadi: 20,
  Heliopolis: 30,
  'Sheikh Zayed': 50,
}

const DEFAULT_SURCHARGE_EGP = 40

export function calculateTravelFee(area: string): number {
  const surcharge = AREA_SURCHARGE_EGP[area] ?? DEFAULT_SURCHARGE_EGP
  return BASE_FEE_EGP + surcharge
}
