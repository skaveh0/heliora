import type { VariantId } from '../data/variants';
import { parseBoundedInteger } from './numbers';
import { isVariantId } from './selection';

export const QUOTE_FIELDS = ['name', 'company', 'email', 'module', 'quantity', 'message'] as const;
export type QuoteField = (typeof QUOTE_FIELDS)[number];

export type QuoteInput = Readonly<Record<QuoteField, string>>;
export type QuoteErrors = Readonly<Partial<Record<QuoteField, string>>>;

export interface Quote {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly module: VariantId;
  readonly quantity: number;
  readonly message: string;
}

export type QuoteResult =
  | { readonly valid: true; readonly quote: Quote }
  | { readonly valid: false; readonly errors: QuoteErrors };

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 2000;
const QUANTITY_MIN = 1;
const QUANTITY_MAX = 1_000_000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateQuote(input: QuoteInput): QuoteResult {
  const name = input.name.trim();
  const company = input.company.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  const quantity = parseBoundedInteger(input.quantity, QUANTITY_MIN, QUANTITY_MAX);
  const module = input.module;

  const errors: Partial<Record<QuoteField, string>> = {};

  if (name === '') errors.name = 'Enter your name.';
  else if (name.length > NAME_MAX) errors.name = `Use ${NAME_MAX} characters or fewer.`;

  if (company === '') errors.company = 'Enter your company.';
  else if (company.length > NAME_MAX) errors.company = `Use ${NAME_MAX} characters or fewer.`;

  // The length check comes first so the pattern only ever runs on short strings.
  if (email === '') errors.email = 'Enter your email address.';
  else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter an email address like name@company.com.';
  }

  if (!isVariantId(module)) errors.module = 'Choose one of the listed modules.';

  if (quantity === null) {
    errors.quantity = `Enter a whole number from ${QUANTITY_MIN} to ${QUANTITY_MAX.toLocaleString('en-US')}.`;
  }

  if (message.length > MESSAGE_MAX) {
    errors.message = `Use ${MESSAGE_MAX.toLocaleString('en-US')} characters or fewer.`;
  }

  if (quantity === null || !isVariantId(module) || Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, quote: { name, company, email, module, quantity, message } };
}
