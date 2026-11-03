import { describe, expect, it } from 'vitest';
import { LOCATIONS } from '../data/locations';
import { VARIANTS } from '../data/variants';
import { calculateYield, type YieldInput } from './yield';

const input = (overrides: Partial<YieldInput> = {}): YieldInput => ({
  variant: VARIANTS['HL-550M'],
  location: LOCATIONS.tehran,
  moduleCount: 1,
  tiltAdjust: false,
  ...overrides,
});

describe('calculateYield', () => {
  it('multiplies power, sun hours, days in the month and the 0.80 derate', () => {
    const { monthlyKwh } = calculateYield(input());
    // January: 0.55 kW × 3.6 h × 31 days × 0.80. February has 28 days: 0.55 × 4.4 × 28 × 0.80.
    expect(monthlyKwh[0]).toBeCloseTo(49.104, 6);
    expect(monthlyKwh[1]).toBeCloseTo(54.208, 6);
    expect(monthlyKwh).toHaveLength(12);
  });

  it('totals the twelve months into the annual figure', () => {
    // 2021.6 peak sun hours a year in Tehran × 55 kW × 0.80.
    expect(calculateYield(input({ moduleCount: 100 })).annualKwh).toBeCloseTo(88950.4, 6);
  });

  it('applies the ×1.08 bifacial gain on top of the derate', () => {
    // 65 kW × 2021.6 h × 0.80 × 1.08.
    const { annualKwh } = calculateYield(input({ variant: VARIANTS['HL-650B'], moduleCount: 100 }));
    expect(annualKwh).toBeCloseTo(113533.056, 6);
  });

  it('applies bifacial gain only to the bifacial module', () => {
    const bifacial = VARIANTS['HL-650B'];
    const sameModuleMonofacial = { ...bifacial, bifacialGainPct: null };
    const ratio =
      calculateYield(input({ variant: bifacial })).annualKwh /
      calculateYield(input({ variant: sameModuleMonofacial })).annualKwh;
    expect(ratio).toBeCloseTo(1.08, 10);
  });

  it('applies the tilt adjustment only when it is switched on', () => {
    const flat = calculateYield(input()).annualKwh;
    const tilted = calculateYield(input({ tiltAdjust: true })).annualKwh;
    expect(tilted / flat).toBeCloseTo(1.05, 10);
  });

  it('estimates CO₂ in tonnes at 0.5 kg per kWh', () => {
    const { annualKwh, co2Tonnes } = calculateYield(input({ moduleCount: 100 }));
    expect(co2Tonnes).toBeCloseTo((annualKwh * 0.5) / 1000, 10);
    expect(co2Tonnes).toBeCloseTo(44.475, 3);
  });
});
