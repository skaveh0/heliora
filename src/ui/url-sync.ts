import { parseSelection, serializeSelection, type Selection } from '../lib/selection';
import type { Store } from '../lib/store';

function writeUrl(selection: Selection): void {
  const url = new URL(window.location.href);
  url.search = serializeSelection(url.search, selection);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}

/** Keeps the query string and the store in step in both directions. */
export function initUrlSync(store: Store<Selection>): void {
  store.subscribe(writeUrl);

  const readUrl = (): void => store.set(parseSelection(window.location.search));
  window.addEventListener('popstate', readUrl);
  // Also covers back/forward cache restores and form values the browser refilled after a reload.
  window.addEventListener('pageshow', readUrl);
}
