import { parseSelection } from './lib/selection';
import { createStore } from './lib/store';
import { initDatasheetDownload } from './ui/datasheet-download';
import { initQuoteForm } from './ui/quote-form';
import { initSelection } from './ui/selection';
import { initSpecTable } from './ui/spec-table';
import { initThemeToggle } from './ui/theme-toggle';
import { initUrlSync } from './ui/url-sync';
import { initYieldCalculator } from './ui/yield-calculator';

const store = createStore(parseSelection(window.location.search));

initThemeToggle();
initSelection(store);
initSpecTable(store);
initYieldCalculator(store);
initDatasheetDownload(store);
initQuoteForm(store);
initUrlSync(store);

store.set(store.get());

// Two frames, so the first render has been styled before transitions switch on.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.dataset.ready = '';
  });
});
