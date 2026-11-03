import {
  DEFAULT_LOCATION_ID,
  LOCATIONS,
  LOCATION_IDS,
  MODULE_COUNT_MAX,
  MODULE_COUNT_MIN,
  MONTH_NAMES,
  type LocationId,
} from '../data/locations';
import { VARIANTS } from '../data/variants';
import { buildChartModel } from '../lib/chart';
import { formatInteger, parseBoundedInteger } from '../lib/numbers';
import type { Selection } from '../lib/selection';
import type { Store } from '../lib/store';
import { calculateYield, type YieldResult } from '../lib/yield';
import { byId, setText } from './dom';

const NO_VALUE = '—';

const isLocationId = (value: string): value is LocationId =>
  (LOCATION_IDS as readonly string[]).includes(value);

export function initYieldCalculator(store: Store<Selection>): void {
  const form = byId('yield-form', HTMLFormElement);
  const locationSelect = byId('yield-location', HTMLSelectElement);
  const modulesInput = byId('yield-modules', HTMLInputElement);
  const modulesError = byId('yield-modules-error', HTMLElement);
  const tiltCheckbox = byId('yield-tilt', HTMLInputElement);
  const annualOutput = byId('yield-annual', HTMLElement);
  const co2Output = byId('yield-co2', HTMLElement);
  const chart = byId('yield-chart', SVGSVGElement);
  const peakLabel = byId('yield-chart-peak', SVGTextElement);
  const tableBody = byId('yield-table-body', HTMLTableSectionElement);
  const bars = [...chart.querySelectorAll<SVGPathElement>('.chart__bar')];
  const ticks = [...chart.querySelectorAll<SVGTextElement>('[data-tick]')];

  const renderChart = (monthlyKwh: readonly number[]): void => {
    const model = buildChartModel(monthlyKwh);
    bars.forEach((bar, index) => {
      const data = model.bars[index];
      if (!data) return;
      bar.setAttribute('d', data.path);
      const title = bar.querySelector('title');
      if (title) title.textContent = data.title;
    });
    ticks.forEach((tick, index) => {
      tick.textContent = model.tickLabels[index] ?? '';
    });
    peakLabel.textContent = model.peak.label;
    peakLabel.setAttribute('x', String(model.peak.x));
    peakLabel.setAttribute('y', String(model.peak.y));
  };

  const renderTable = (monthlyKwh: readonly number[]): void => {
    tableBody.replaceChildren(
      ...MONTH_NAMES.map((month, index) => {
        const rowHeader = document.createElement('th');
        rowHeader.scope = 'row';
        rowHeader.textContent = month;
        const cell = document.createElement('td');
        cell.textContent = `${formatInteger(monthlyKwh[index] ?? 0)} kWh`;
        const row = document.createElement('tr');
        row.append(rowHeader, cell);
        return row;
      }),
    );
  };

  const renderResult = (result: YieldResult): void => {
    setText(annualOutput, formatInteger(result.annualKwh));
    setText(co2Output, result.co2Tonnes.toFixed(1));
    chart.classList.remove('chart__svg--stale');
    renderChart(result.monthlyKwh);
    renderTable(result.monthlyKwh);
  };

  const renderNoResult = (): void => {
    setText(annualOutput, NO_VALUE);
    setText(co2Output, NO_VALUE);
    chart.classList.add('chart__svg--stale');
    tableBody.replaceChildren();
  };

  const update = (): void => {
    const moduleCount = parseBoundedInteger(modulesInput.value, MODULE_COUNT_MIN, MODULE_COUNT_MAX);
    modulesError.hidden = moduleCount !== null;
    modulesError.textContent =
      moduleCount === null
        ? `Enter a whole number from ${MODULE_COUNT_MIN} to ${MODULE_COUNT_MAX}.`
        : '';
    if (moduleCount === null) {
      modulesInput.setAttribute('aria-invalid', 'true');
      renderNoResult();
      return;
    }
    modulesInput.removeAttribute('aria-invalid');

    const locationId = isLocationId(locationSelect.value) ? locationSelect.value : DEFAULT_LOCATION_ID;
    renderResult(
      calculateYield({
        variant: VARIANTS[store.get().model],
        location: LOCATIONS[locationId],
        moduleCount,
        tiltAdjust: tiltCheckbox.checked,
      }),
    );
  };

  store.subscribe(update);
  form.addEventListener('input', update);
  form.addEventListener('submit', (event) => event.preventDefault());
}
