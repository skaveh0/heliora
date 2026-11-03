import { MONTH_NAMES } from '../data/locations';
import { formatInteger } from './numbers';

// These match the fixed axis and gridlines drawn in index.html.
const PLOT_LEFT = 44;
const PLOT_TOP = 16;
const BASELINE = 224;
const SLOT_WIDTH = 49;
const BAR_WIDTH = 30;
const CORNER = 3;
const TICK_INTERVALS = 3;
const PEAK_LABEL_GAP = 8;

const NICE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10];

export interface ChartBar {
  readonly path: string;
  readonly title: string;
}

export interface ChartModel {
  readonly bars: readonly ChartBar[];
  /** Labels for the gridlines above zero, lowest first. */
  readonly tickLabels: readonly string[];
  readonly peak: { readonly label: string; readonly x: number; readonly y: number };
}

/** Smallest round step that lets three intervals reach `max`. */
export function niceStep(max: number): number {
  if (max <= 0) return 1;
  const target = max / TICK_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= target) ?? 10;
  return step * magnitude;
}

export function formatTick(value: number): string {
  return value >= 1000 ? `${Number((value / 1000).toFixed(1))}k` : formatInteger(value);
}

const round = (value: number): number => Number(value.toFixed(1));

function barPath(left: number, top: number): string {
  const flat = BAR_WIDTH - 2 * CORNER;
  return (
    `M${left} ${BASELINE}V${round(top + CORNER)}` +
    `q0-${CORNER} ${CORNER}-${CORNER}h${flat}q${CORNER} 0 ${CORNER} ${CORNER}V${BASELINE}z`
  );
}

export function buildChartModel(monthlyKwh: readonly number[]): ChartModel {
  const max = Math.max(0, ...monthlyKwh);
  const step = niceStep(max);
  const scale = (BASELINE - PLOT_TOP) / (step * TICK_INTERVALS);

  const bars = MONTH_NAMES.map((month, index) => {
    const kwh = monthlyKwh[index] ?? 0;
    const left = PLOT_LEFT + SLOT_WIDTH * index + (SLOT_WIDTH - BAR_WIDTH) / 2;
    return {
      path: barPath(left, BASELINE - kwh * scale),
      title: `${month}: ${formatInteger(kwh)} kWh`,
    };
  });

  const peakIndex = monthlyKwh.indexOf(max);
  return {
    bars,
    tickLabels: Array.from({ length: TICK_INTERVALS }, (_, i) => formatTick(step * (i + 1))),
    peak: {
      label: formatInteger(max),
      x: PLOT_LEFT + SLOT_WIDTH * Math.max(peakIndex, 0) + SLOT_WIDTH / 2,
      y: round(BASELINE - max * scale - PEAK_LABEL_GAP),
    },
  };
}
