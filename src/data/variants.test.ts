import { describe, expect, it } from 'vitest';
import { SPEC_ROWS } from './spec-rows';
import { VARIANTS, VARIANT_IDS, type VariantId } from './variants';

const rows = (id: VariantId) =>
  Object.fromEntries(SPEC_ROWS.map((row) => [row.label, row.value(VARIANTS[id])]));

describe('variant data', () => {
  it.each(VARIANT_IDS)('%s efficiency agrees with its power and area', (id) => {
    const { ratedPowerW, dimensionsMm, efficiencyPct } = VARIANTS[id];
    const areaM2 = (dimensionsMm.length * dimensionsMm.width) / 1e6;
    const derivedPct = ratedPowerW / areaM2 / 10;
    expect(Math.abs(derivedPct - efficiencyPct)).toBeLessThan(0.1);
  });

  it('formats specification rows the way the published table shows them', () => {
    expect(rows('HL-650B')).toEqual({
      'Rated power': '650 W',
      'Module efficiency': '20.9 %',
      'Cell type': '132 half-cut bifacial',
      Dimensions: '2384 × 1303 × 35 mm',
      Weight: '34.4 kg',
      Voc: '45.3 V',
      Imp: '17.3 A',
      'Max system voltage': '1500 V DC',
      'Temp. coefficient (Pmax)': '−0.30 %/°C',
      'Operating temp.': '−40 °C to +85 °C',
      Frame: 'Anodised aluminium, 35 mm',
      'Bifacial gain': 'up to 70 % rear-side',
      'Product warranty': '15 years',
      'Performance warranty': '30 years (88.9 %)',
    });
  });

  it('shows a dash for bifacial gain on monofacial modules', () => {
    expect(rows('HL-450M')['Bifacial gain']).toBe('—');
  });
});
