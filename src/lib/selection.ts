import {
  DEFAULT_FINISH_ID,
  DEFAULT_VARIANT_ID,
  FINISH_IDS,
  VARIANT_IDS,
  type FinishId,
  type VariantId,
} from '../data/variants';

export interface Selection {
  readonly model: VariantId;
  readonly finish: FinishId;
}

const MODEL_PARAM = 'model';
const FINISH_PARAM = 'finish';

// Array membership rather than `in VARIANTS`, which would accept "constructor" or "__proto__".
export const isVariantId = (value: unknown): value is VariantId =>
  (VARIANT_IDS as readonly unknown[]).includes(value);

export const isFinishId = (value: unknown): value is FinishId =>
  (FINISH_IDS as readonly unknown[]).includes(value);

/** Reads the selection from a query string. Anything not on the allowlist falls back to the default. */
export function parseSelection(search: string): Selection {
  const params = new URLSearchParams(search);
  const model = params.get(MODEL_PARAM);
  const finish = params.get(FINISH_PARAM);
  return {
    model: isVariantId(model) ? model : DEFAULT_VARIANT_ID,
    finish: isFinishId(finish) ? finish : DEFAULT_FINISH_ID,
  };
}

/**
 * Returns the query string for a selection. Rejected values are overwritten rather than left in the
 * address bar. A clean URL showing the defaults stays clean.
 */
export function serializeSelection(search: string, selection: Selection): string {
  const params = new URLSearchParams(search);
  const hasParams = params.has(MODEL_PARAM) || params.has(FINISH_PARAM);
  const isDefault =
    selection.model === DEFAULT_VARIANT_ID && selection.finish === DEFAULT_FINISH_ID;
  if (!hasParams && isDefault) return search;

  params.set(MODEL_PARAM, selection.model);
  params.set(FINISH_PARAM, selection.finish);
  return `?${params.toString()}`;
}
