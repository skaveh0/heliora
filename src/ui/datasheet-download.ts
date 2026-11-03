import { VARIANTS } from '../data/variants';
import { buildDatasheet, datasheetFilename } from '../lib/datasheet';
import type { Selection } from '../lib/selection';
import type { Store } from '../lib/store';
import { byId } from './dom';

export function initDatasheetDownload(store: Store<Selection>): void {
  byId('datasheet-download', HTMLButtonElement).addEventListener('click', () => {
    const { model, finish } = store.get();
    const variant = VARIANTS[model];
    const blob = new Blob([buildDatasheet(variant, finish)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = datasheetFilename(variant);
    link.click();

    // Deferred so the browser has picked up the download before the URL goes away.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  });
}
