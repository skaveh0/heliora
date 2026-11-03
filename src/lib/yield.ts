import {
  BIFACIAL_FACTOR,
  CO2_KG_PER_KWH,
  DAYS_IN_MONTH,
  SYSTEM_DERATE,
  TILT_ADJUST_FACTOR,
  type Location,
} from '../data/locations';
import type { Variant } from '../data/variants';

export interface YieldInput {
  readonly variant: Variant;
  readonly location: Location;
  readonly moduleCount: number;
  readonly tiltAdjust: boolean;
}

export interface YieldResult {
  /** January first. */
  readonly monthlyKwh: readonly number[];
  readonly annualKwh: number;
  readonly co2Tonnes: number;
}

export function calculateYield({ variant, location, moduleCount, tiltAdjust }: YieldInput): YieldResult {
  const systemKw = (variant.ratedPowerW * moduleCount) / 1000;
  const bifacial = variant.bifacialGainPct === null ? 1 : BIFACIAL_FACTOR;
  const tilt = tiltAdjust ? TILT_ADJUST_FACTOR : 1;

  const monthlyKwh = location.peakSunHours.map((hoursPerDay, month) => {
    const days = DAYS_IN_MONTH[month] ?? 0;
    return systemKw * hoursPerDay * days * SYSTEM_DERATE * bifacial * tilt;
  });
  const annualKwh = monthlyKwh.reduce((sum, kwh) => sum + kwh, 0);

  return { monthlyKwh, annualKwh, co2Tonnes: (annualKwh * CO2_KG_PER_KWH) / 1000 };
}
