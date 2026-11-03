import { describe, expect, it } from 'vitest';
import { buildChartModel, formatTick, niceStep } from './chart';

describe('chart axis', () => {
  it('picks the smallest round step that lets three intervals reach the peak', () => {
    expect(niceStep(10094)).toBe(4000);
    expect(niceStep(137536)).toBe(50000);
    expect(niceStep(90)).toBe(30);
  });

  it('never lets the tallest bar pass the top gridline', () => {
    for (const peak of [31, 99, 1000, 3001, 9999, 12000, 137536]) {
      expect(niceStep(peak) * 3, String(peak)).toBeGreaterThanOrEqual(peak);
    }
  });

  it('shortens tick labels from a thousand upwards', () => {
    expect(formatTick(40)).toBe('40');
    expect(formatTick(1500)).toBe('1.5k');
    expect(formatTick(12000)).toBe('12k');
  });
});

describe('buildChartModel', () => {
  const monthly = [1, 2, 3, 4, 5, 6, 90, 8, 9, 10, 11, 12];

  it('labels the tallest month, whichever month it is', () => {
    const { peak } = buildChartModel(monthly);
    expect(peak.label).toBe('90');
    // July is index 6: plot left 44 + 6 slots of 49 + half a slot.
    expect(peak.x).toBe(362.5);
  });

  it('draws one bar per month, each titled with its value', () => {
    const { bars } = buildChartModel(monthly);
    expect(bars).toHaveLength(12);
    expect(bars[6]?.title).toBe('Jul: 90 kWh');
  });
});
