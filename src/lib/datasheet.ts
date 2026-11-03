import { SPEC_ROWS } from '../data/spec-rows';
import { FINISH_LABELS, type FinishId, type Variant } from '../data/variants';

const LABEL_WIDTH = 28;

const line = (label: string, value: string): string => `${label.padEnd(LABEL_WIDTH)}${value}`;

export const datasheetFilename = (variant: Variant): string =>
  `heliora-${variant.id.toLowerCase()}-datasheet.txt`;

/** Built only from the data module and an allowlisted finish. No user input reaches this text. */
export function buildDatasheet(variant: Variant, finish: FinishId): string {
  return [
    variant.name.toUpperCase(),
    variant.tagline,
    '',
    line('Frame finish', FINISH_LABELS[finish]),
    ...SPEC_ROWS.map((row) => line(row.label, row.value(variant))),
    '',
    'Heliora is a fictional brand and this is a demo project.',
    'All specifications are fictional.',
    '',
  ].join('\n');
}
