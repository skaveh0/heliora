import { describe, expect, it } from 'vitest';
import { VARIANTS } from '../data/variants';
import { buildDatasheet, datasheetFilename } from './datasheet';

describe('datasheet', () => {
  it('lists the selected finish and every specification', () => {
    const text = buildDatasheet(VARIANTS['HL-650B'], 'black');
    expect(text).toContain('HELIORA HL-650B');
    expect(text).toMatch(/Frame finish\s+Black/);
    expect(text).toMatch(/Bifacial gain\s+up to 70 % rear-side/);
    expect(text).toMatch(/Performance warranty\s+30 years \(88\.9 %\)/);
  });

  it('says plainly that the brand and figures are fictional', () => {
    expect(buildDatasheet(VARIANTS['HL-450M'], 'silver')).toContain('fictional');
  });

  it('builds a safe filename from the allowlisted id', () => {
    expect(datasheetFilename(VARIANTS['HL-550M'])).toBe('heliora-hl-550m-datasheet.txt');
  });
});
