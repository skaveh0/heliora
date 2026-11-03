import { SPECS } from '../data/spec-rows';
import { FINISH_LABELS, VARIANTS } from '../data/variants';
import { isFinishId, isVariantId, type Selection } from '../lib/selection';
import type { Store } from '../lib/store';
import { setTextOfAll } from './dom';

function render({ model, finish }: Selection): void {
  // The stylesheet reads these two attributes to pick the visible render and the frame colour.
  const root = document.documentElement;
  root.dataset.model = model;
  root.dataset.finish = finish;

  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="model"]')) {
    radio.checked = radio.value === model;
  }
  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="finish"]')) {
    radio.checked = radio.value === finish;
  }

  const variant = VARIANTS[model];
  setTextOfAll('[data-field="name"]', variant.name);
  setTextOfAll('[data-field="tagline"]', variant.tagline);
  setTextOfAll('[data-field="finish"]', `${FINISH_LABELS[finish]} frame`);
  setTextOfAll('[data-field="power"]', SPECS.power.value(variant));
  setTextOfAll('[data-field="efficiency"]', SPECS.efficiency.value(variant));
  setTextOfAll('[data-field="dimensions"]', SPECS.dimensions.value(variant));
  setTextOfAll('[data-field="weight"]', SPECS.weight.value(variant));
}

export function initSelection(store: Store<Selection>): void {
  store.subscribe(render);

  document.addEventListener('change', ({ target }) => {
    if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return;
    if (target.name === 'model' && isVariantId(target.value)) {
      store.set({ ...store.get(), model: target.value });
    } else if (target.name === 'finish' && isFinishId(target.value)) {
      store.set({ ...store.get(), finish: target.value });
    }
  });
}
