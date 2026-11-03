import { VARIANTS } from '../data/variants';
import type { Selection } from '../lib/selection';
import type { Store } from '../lib/store';
import {
  QUOTE_FIELDS,
  validateQuote,
  type QuoteErrors,
  type QuoteField,
  type QuoteInput,
} from '../lib/validation';
import { byId } from './dom';

export function initQuoteForm(store: Store<Selection>): void {
  const form = byId('quote-form', HTMLFormElement);
  const success = byId('quote-success', HTMLElement);
  const summary = byId('quote-success-summary', HTMLElement);
  const resetButton = byId('quote-reset', HTMLButtonElement);
  const moduleSelect = byId('quote-module', HTMLSelectElement);

  const controls: Readonly<Record<QuoteField, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>> = {
    name: byId('quote-name', HTMLInputElement),
    company: byId('quote-company', HTMLInputElement),
    email: byId('quote-email', HTMLInputElement),
    module: moduleSelect,
    quantity: byId('quote-quantity', HTMLInputElement),
    message: byId('quote-message', HTMLTextAreaElement),
  };

  const readInput = (): QuoteInput => ({
    name: controls.name.value,
    company: controls.company.value,
    email: controls.email.value,
    module: controls.module.value,
    quantity: controls.quantity.value,
    message: controls.message.value,
  });

  const currentErrors = (): QuoteErrors => {
    const result = validateQuote(readInput());
    return result.valid ? {} : result.errors;
  };

  const showError = (field: QuoteField, message: string | undefined): void => {
    const element = byId(`quote-${field}-error`, HTMLElement);
    element.textContent = message ?? '';
    element.hidden = message === undefined;
    if (message === undefined) controls[field].removeAttribute('aria-invalid');
    else controls[field].setAttribute('aria-invalid', 'true');
  };

  const fieldOf = (target: EventTarget | null): QuoteField | undefined =>
    QUOTE_FIELDS.find((field) => controls[field] === target);

  // A field with an error clears as soon as it is fixed.
  form.addEventListener('input', ({ target }) => {
    const field = fieldOf(target);
    if (field && controls[field].getAttribute('aria-invalid') === 'true') {
      showError(field, currentErrors()[field]);
    }
  });

  // Fields are checked on the way out, but tabbing past an empty one is not yet a mistake.
  form.addEventListener('focusout', ({ target }) => {
    const field = fieldOf(target);
    if (field && controls[field].value.trim() !== '') showError(field, currentErrors()[field]);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = validateQuote(readInput());

    if (!result.valid) {
      for (const field of QUOTE_FIELDS) showError(field, result.errors[field]);
      const firstInvalid = QUOTE_FIELDS.find((field) => result.errors[field] !== undefined);
      if (firstInvalid) controls[firstInvalid].focus();
      return;
    }

    const { quantity, module, company } = result.quote;
    summary.textContent = `${quantity.toLocaleString('en-US')} × ${VARIANTS[module].name} for ${company}.`;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  resetButton.addEventListener('click', () => {
    form.reset();
    for (const field of QUOTE_FIELDS) showError(field, undefined);
    moduleSelect.value = store.get().model;
    success.hidden = true;
    form.hidden = false;
    controls.name.focus();
  });

  // Only a change of model pre-fills, so a finish change keeps a module picked here by hand.
  let lastModel: Selection['model'] | undefined;
  store.subscribe(({ model }) => {
    if (model !== lastModel) moduleSelect.value = model;
    lastModel = model;
  });
}
