import { describe, expect, it } from 'vitest';
import { validateQuote, type QuoteInput } from './validation';

const VALID: QuoteInput = {
  name: 'Ada Lovelace',
  company: 'Example Energy',
  email: 'ada@example.com',
  module: 'HL-550M',
  quantity: '250',
  message: '',
};

const errorsFor = (overrides: Partial<QuoteInput>) => {
  const result = validateQuote({ ...VALID, ...overrides });
  return result.valid ? {} : result.errors;
};

describe('validateQuote', () => {
  it('accepts a complete request and returns trimmed, typed values', () => {
    const result = validateQuote({ ...VALID, name: '  Ada  ', quantity: ' 250 ' });
    expect(result).toEqual({
      valid: true,
      quote: { ...VALID, name: 'Ada', quantity: 250 },
    });
  });

  it('requires name, company, email and quantity but not message', () => {
    const errors = errorsFor({ name: '   ', company: '', email: '', quantity: '' });
    expect(Object.keys(errors).sort()).toEqual(['company', 'email', 'name', 'quantity']);
  });

  it('rejects malformed email addresses', () => {
    for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'a b@example.com', 'a@b@c.com']) {
      expect(errorsFor({ email }).email, email).toBeDefined();
    }
    expect(errorsFor({ email: `${'a'.repeat(250)}@example.com` }).email).toBeDefined();
  });

  it('rejects malicious quantities', () => {
    for (const quantity of ['-1', '1e308', 'abc', '0', '1.5', '1000001', 'Infinity']) {
      expect(errorsFor({ quantity }).quantity, quantity).toBeDefined();
    }
  });

  it('only accepts modules on the allowlist', () => {
    for (const module of ['HL-999', '__proto__', '<script>alert(1)</script>', '']) {
      expect(errorsFor({ module }).module, module).toBeDefined();
    }
  });

  it('enforces length limits on free text', () => {
    expect(errorsFor({ name: 'a'.repeat(101) }).name).toBeDefined();
    expect(errorsFor({ company: 'a'.repeat(101) }).company).toBeDefined();
    expect(errorsFor({ message: 'a'.repeat(2001) }).message).toBeDefined();
    expect(errorsFor({ message: 'a'.repeat(2000) }).message).toBeUndefined();
  });

  it('never echoes submitted input in an error message', () => {
    const payload = '<img src=x onerror=alert(1)>';
    const errors = errorsFor({ email: payload, quantity: payload, module: payload });
    expect(Object.keys(errors)).toHaveLength(3);
    for (const message of Object.values(errors)) expect(message).not.toContain('<');
  });
});
