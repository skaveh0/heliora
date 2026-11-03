import { describe, expect, it } from 'vitest';
import { isVariantId, parseSelection, serializeSelection } from './selection';

const DEFAULTS = { model: 'HL-550M', finish: 'silver' };

describe('parseSelection', () => {
  it('reads a valid model and finish', () => {
    expect(parseSelection('?model=HL-650B&finish=black')).toEqual({
      model: 'HL-650B',
      finish: 'black',
    });
  });

  it('falls back per parameter, keeping whichever one is valid', () => {
    expect(parseSelection('')).toEqual(DEFAULTS);
    expect(parseSelection('?model=HL-450M&finish=gold')).toEqual({
      model: 'HL-450M',
      finish: 'silver',
    });
    expect(parseSelection('?model=HL-9000&finish=black')).toEqual({
      model: 'HL-550M',
      finish: 'black',
    });
  });

  it('rejects script injection in the model parameter', () => {
    expect(parseSelection('?model=<script>alert(1)</script>')).toEqual(DEFAULTS);
    expect(parseSelection('?model=%3Cscript%3Ealert(1)%3C%2Fscript%3E')).toEqual(DEFAULTS);
  });

  it('rejects a javascript: URL in the finish parameter', () => {
    expect(parseSelection('?finish=javascript:alert(1)')).toEqual(DEFAULTS);
  });

  it('rejects object prototype keys that a plain key lookup would accept', () => {
    for (const key of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
      expect(parseSelection(`?model=${key}&finish=${key}`), key).toEqual(DEFAULTS);
    }
  });

  it('accepts exact ids only: no case folding, padding or partial matches', () => {
    for (const model of ['hl-550m', 'HL-650B%20', '%20HL-650B', 'HL-650', 'HL-650BX']) {
      expect(parseSelection(`?model=${model}`).model, model).toBe('HL-550M');
    }
  });

  it('uses the first of duplicated parameters, so a bad first value is not bypassed', () => {
    expect(parseSelection('?model=<script>&model=HL-650B').model).toBe('HL-550M');
  });
});

describe('isVariantId', () => {
  it('recognises known ids and rejects everything else, including non-strings', () => {
    expect(isVariantId('HL-450M')).toBe(true);
    for (const value of ['HL-999', '', null, undefined, 450, {}, ['HL-450M']]) {
      expect(isVariantId(value), String(value)).toBe(false);
    }
  });
});

describe('serializeSelection', () => {
  it('writes both parameters and round-trips through parseSelection', () => {
    const selection = { model: 'HL-450M', finish: 'black' } as const;
    const search = serializeSelection('', selection);
    expect(search).toBe('?model=HL-450M&finish=black');
    expect(parseSelection(search)).toEqual(selection);
  });

  it('leaves a clean URL clean when the selection is the default', () => {
    expect(serializeSelection('', { model: 'HL-550M', finish: 'silver' })).toBe('');
  });

  it('overwrites a rejected value so it does not stay in the address bar', () => {
    const search = serializeSelection('?model=<script>alert(1)</script>', {
      model: 'HL-550M',
      finish: 'silver',
    });
    expect(search).toBe('?model=HL-550M&finish=silver');
  });
});
