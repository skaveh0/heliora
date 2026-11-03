import type { Variant } from './variants';

const MINUS = '−';

const signedCelsius = (value: number): string =>
  value < 0 ? `${MINUS}${Math.abs(value)} °C` : `+${value} °C`;

export interface SpecRow {
  readonly label: string;
  readonly value: (variant: Variant) => string;
}

/** Display order and formatting for the spec table and the datasheet. */
export const SPEC_ROWS: readonly SpecRow[] = [
  { label: 'Rated power', value: (v) => `${v.ratedPowerW} W` },
  { label: 'Module efficiency', value: (v) => `${v.efficiencyPct.toFixed(1)} %` },
  { label: 'Cell type', value: (v) => v.cellType },
  {
    label: 'Dimensions',
    value: ({ dimensionsMm: d }) => `${d.length} × ${d.width} × ${d.depth} mm`,
  },
  { label: 'Weight', value: (v) => `${v.weightKg.toFixed(1)} kg` },
  { label: 'Voc', value: (v) => `${v.vocV.toFixed(1)} V` },
  { label: 'Imp', value: (v) => `${v.impA.toFixed(1)} A` },
  { label: 'Max system voltage', value: (v) => `${v.maxSystemVoltageVdc} V DC` },
  {
    label: 'Temp. coefficient (Pmax)',
    value: (v) => `${MINUS}${Math.abs(v.tempCoefficientPctPerC).toFixed(2)} %/°C`,
  },
  {
    label: 'Operating temp.',
    value: ({ operatingTempC: t }) => `${signedCelsius(t.min)} to ${signedCelsius(t.max)}`,
  },
  { label: 'Frame', value: (v) => `${v.frameMaterial}, ${v.dimensionsMm.depth} mm` },
  {
    label: 'Bifacial gain',
    value: (v) => (v.bifacialGainPct === null ? '—' : `up to ${v.bifacialGainPct} % rear-side`),
  },
  { label: 'Product warranty', value: (v) => `${v.productWarrantyYears} years` },
  {
    label: 'Performance warranty',
    value: ({ performanceWarranty: w }) => `${w.years} years (${w.retainedPct.toFixed(1)} %)`,
  },
];
