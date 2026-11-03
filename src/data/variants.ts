export const VARIANT_IDS = ['HL-450M', 'HL-550M', 'HL-650B'] as const;
export type VariantId = (typeof VARIANT_IDS)[number];

export const DEFAULT_VARIANT_ID: VariantId = 'HL-550M';

export const FINISH_IDS = ['silver', 'black'] as const;
export type FinishId = (typeof FINISH_IDS)[number];

export const DEFAULT_FINISH_ID: FinishId = 'silver';

export const FINISH_LABELS: Readonly<Record<FinishId, string>> = {
  silver: 'Silver',
  black: 'Black',
};

export interface Variant {
  readonly id: VariantId;
  readonly name: string;
  readonly tagline: string;
  readonly ratedPowerW: number;
  readonly efficiencyPct: number;
  readonly cellType: string;
  readonly dimensionsMm: { readonly length: number; readonly width: number; readonly depth: number };
  readonly weightKg: number;
  readonly vocV: number;
  readonly impA: number;
  readonly maxSystemVoltageVdc: number;
  readonly tempCoefficientPctPerC: number;
  readonly operatingTempC: { readonly min: number; readonly max: number };
  readonly frameMaterial: string;
  /** Rear-side gain in percent. Null for monofacial modules. */
  readonly bifacialGainPct: number | null;
  readonly productWarrantyYears: number;
  readonly performanceWarranty: { readonly years: number; readonly retainedPct: number };
}

export const VARIANTS: Readonly<Record<VariantId, Variant>> = {
  'HL-450M': {
    id: 'HL-450M',
    name: 'Heliora HL-450M',
    tagline: 'Compact commercial module',
    ratedPowerW: 450,
    efficiencyPct: 20.8,
    cellType: '144 half-cut monocrystalline',
    dimensionsMm: { length: 1903, width: 1134, depth: 30 },
    weightKg: 23.0,
    vocV: 49.6,
    impA: 10.8,
    maxSystemVoltageVdc: 1500,
    tempCoefficientPctPerC: -0.34,
    operatingTempC: { min: -40, max: 85 },
    frameMaterial: 'Anodised aluminium',
    bifacialGainPct: null,
    productWarrantyYears: 15,
    performanceWarranty: { years: 30, retainedPct: 87.4 },
  },
  'HL-550M': {
    id: 'HL-550M',
    name: 'Heliora HL-550M',
    tagline: 'Balanced utility workhorse',
    ratedPowerW: 550,
    efficiencyPct: 21.3,
    cellType: '144 half-cut monocrystalline',
    dimensionsMm: { length: 2279, width: 1134, depth: 35 },
    weightKg: 27.5,
    vocV: 49.9,
    impA: 13.2,
    maxSystemVoltageVdc: 1500,
    tempCoefficientPctPerC: -0.33,
    operatingTempC: { min: -40, max: 85 },
    frameMaterial: 'Anodised aluminium',
    bifacialGainPct: null,
    productWarrantyYears: 15,
    performanceWarranty: { years: 30, retainedPct: 87.4 },
  },
  'HL-650B': {
    id: 'HL-650B',
    name: 'Heliora HL-650B',
    tagline: 'High-output bifacial',
    ratedPowerW: 650,
    efficiencyPct: 20.9,
    cellType: '132 half-cut bifacial',
    dimensionsMm: { length: 2384, width: 1303, depth: 35 },
    weightKg: 34.4,
    vocV: 45.3,
    impA: 17.3,
    maxSystemVoltageVdc: 1500,
    tempCoefficientPctPerC: -0.3,
    operatingTempC: { min: -40, max: 85 },
    frameMaterial: 'Anodised aluminium',
    bifacialGainPct: 70,
    productWarrantyYears: 15,
    performanceWarranty: { years: 30, retainedPct: 88.9 },
  },
};
