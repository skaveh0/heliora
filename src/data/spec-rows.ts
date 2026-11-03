import type { Variant } from './variants';

const MINUS = '−';

const signedCelsius = (value: number): string =>
  value < 0 ? `${MINUS}${Math.abs(value)} °C` : `+${value} °C`;

export interface SpecRow {
  readonly label: string;
  readonly value: (variant: Variant) => string;
}

/** Labels and formatting for every specification. Key order is display order. */
export const SPECS = {
  power: { label: 'Rated power', value: (v) => `${v.ratedPowerW} W` },
  efficiency: { label: 'Module efficiency', value: (v) => `${v.efficiencyPct.toFixed(1)} %` },
  cellType: { label: 'Cell type', value: (v) => v.cellType },
  dimensions: {
    label: 'Dimensions',
    value: ({ dimensionsMm: d }) => `${d.length} × ${d.width} × ${d.depth} mm`,
  },
  weight: { label: 'Weight', value: (v) => `${v.weightKg.toFixed(1)} kg` },
  voc: { label: 'Voc', value: (v) => `${v.vocV.toFixed(1)} V` },
  imp: { label: 'Imp', value: (v) => `${v.impA.toFixed(1)} A` },
  maxVoltage: { label: 'Max system voltage', value: (v) => `${v.maxSystemVoltageVdc} V DC` },
  tempCoefficient: {
    label: 'Temp. coefficient (Pmax)',
    value: (v) => `${MINUS}${Math.abs(v.tempCoefficientPctPerC).toFixed(2)} %/°C`,
  },
  operatingTemp: {
    label: 'Operating temp.',
    value: ({ operatingTempC: t }) => `${signedCelsius(t.min)} to ${signedCelsius(t.max)}`,
  },
  frame: { label: 'Frame', value: (v) => `${v.frameMaterial}, ${v.dimensionsMm.depth} mm` },
  bifacialGain: {
    label: 'Bifacial gain',
    value: (v) => (v.bifacialGainPct === null ? '—' : `up to ${v.bifacialGainPct} % rear-side`),
  },
  productWarranty: { label: 'Product warranty', value: (v) => `${v.productWarrantyYears} years` },
  performanceWarranty: {
    label: 'Performance warranty',
    value: ({ performanceWarranty: w }) => `${w.years} years (${w.retainedPct.toFixed(1)} %)`,
  },
} as const satisfies Readonly<Record<string, SpecRow>>;

export const SPEC_ROWS: readonly SpecRow[] = Object.values(SPECS);
