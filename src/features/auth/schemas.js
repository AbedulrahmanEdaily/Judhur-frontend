import { z } from 'zod';
import { toLatinDigits } from '../../lib/digits.js';
import { ar } from '../../locales/ar.js';

// Mirrors the backend validators for /api/Identity/Account. The server stays the authority.

const messages = ar.auth.validation;

/** Palestinian/Israeli mobile formats, same regex as the backend. */
export const PHONE_REGEX = /^(?:\+?(?:970|972)\d{9}|05\d{8})$/;

/** The backend password rules, in the order the chips show them. */
export const PASSWORD_RULES = [
  { key: 'minLength', test: (value) => value.length >= 8 },
  { key: 'uppercase', test: (value) => /[A-Z]/.test(value) },
  { key: 'lowercase', test: (value) => /[a-z]/.test(value) },
  { key: 'digit', test: (value) => /\d/.test(value) },
];

function passesAllPasswordRules(value) {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value)) return false;
  }
  return true;
}

const email = z
  .string()
  .trim()
  .min(1, messages.required)
  .max(256, messages.maxLength(256))
  .pipe(z.email(messages.email));

// Not trimmed: spaces are part of a password.
const newPassword = z
  .string()
  .min(1, messages.required)
  .refine(passesAllPasswordRules, messages.password);

// Accepts Arabic-Indic digits, spaces and dashes ("٠٥٩٩ ١٢٣ ٤٥٦"), sends "0599123456".
const phoneNumber = z
  .string()
  .transform((value) => toLatinDigits(value).replace(/[\s-]/g, ''))
  .pipe(z.string().min(1, messages.required).regex(PHONE_REGEX, messages.phone));

const resetCode = z
  .string()
  .transform((value) => toLatinDigits(value).trim())
  .pipe(z.string().regex(/^\d{6}$/, messages.code));

export const loginSchema = z.object({
  email,
  // Login only checks that a password was typed; the rules apply when one is set.
  password: z.string().min(1, messages.required),
  remember: z.boolean(),
});

const city = z.string().trim().min(1, messages.required).max(100, messages.maxLength(100));

// The design has no user-name field; the page sends the email as userName.
export const registerSchema = z.object({
  fullName: z.string().trim().min(1, messages.required).max(150, messages.maxLength(150)),
  email,
  phoneNumber,
  city,
  password: newPassword,
  acceptTerms: z.boolean().refine((value) => value === true, messages.terms),
});

/** The first-time Google step: the same phone and city rules as register. */
export const googleProfileSchema = z.object({ phoneNumber, city });

export const emailSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  email,
  code: resetCode,
  password: newPassword,
});
