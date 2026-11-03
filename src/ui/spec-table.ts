import { SPEC_ROWS } from '../data/spec-rows';
import { VARIANTS, VARIANT_IDS, type VariantId } from '../data/variants';
import type { Selection } from '../lib/selection';
import type { Store } from '../lib/store';
import { byId } from './dom';

function headerCell(text: string, selected: boolean): HTMLTableCellElement {
  const cell = document.createElement('th');
  cell.scope = 'col';
  cell.textContent = text;
  if (selected) {
    cell.classList.add('is-selected');
    const note = document.createElement('span');
    note.className = 'visually-hidden';
    note.textContent = ' (selected)';
    cell.append(note);
  }
  return cell;
}

function renderTable(table: HTMLTableElement, model: VariantId, compare: boolean): void {
  const columns = compare ? VARIANT_IDS : [model];
  const markSelected = (id: VariantId): boolean => compare && id === model;

  const caption = document.createElement('caption');
  caption.className = 'visually-hidden';
  caption.textContent = compare
    ? 'Side-by-side specification of all three modules'
    : `Full specification for ${VARIANTS[model].name}`;

  const headerRow = document.createElement('tr');
  headerRow.append(
    headerCell('Parameter', false),
    ...columns.map((id) => headerCell(VARIANTS[id].name, markSelected(id))),
  );
  const head = document.createElement('thead');
  head.append(headerRow);

  const body = document.createElement('tbody');
  for (const row of SPEC_ROWS) {
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = row.label;

    const tableRow = document.createElement('tr');
    tableRow.append(rowHeader);
    for (const id of columns) {
      const cell = document.createElement('td');
      cell.textContent = row.value(VARIANTS[id]);
      if (markSelected(id)) cell.classList.add('is-selected');
      tableRow.append(cell);
    }
    body.append(tableRow);
  }

  table.classList.toggle('spec-table--compare', compare);
  table.replaceChildren(caption, head, body);
}

export function initSpecTable(store: Store<Selection>): void {
  const table = byId('spec-table', HTMLTableElement);
  const toggle = byId('compare-toggle', HTMLInputElement);

  const render = (): void => renderTable(table, store.get().model, toggle.checked);
  store.subscribe(render);
  toggle.addEventListener('change', render);
}
