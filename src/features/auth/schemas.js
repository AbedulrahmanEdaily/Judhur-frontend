import { z } from 'zod';
import { toLatinDigits } from '../../lib/digits.js';
import { ar } from '../../locales/ar.js';

// Mirrors the backend validators for /api/Identity/Account. The server stays the authority.

const t = ar.auth.validation;

/** Palestinian/Israeli mobile formats, same regex as the backend. */
export const PHONE_REGEX = /^(?:\+?(?:970|972)\d{9}|05\d{8})$/;

/** Password rules, in the order the checklist shows them. */
export const PASSWORD_RULES = /** @type {const} */ ([
  { key: 'minLength', test: (value) => value.length >= 8 },
  { key: 'uppercase', test: (value) => /[A-Z]/.test(value) },
  { key: 'lowercase', test: (value) => /[a-z]/.test(value) },
  { key: 'digit', test: (value) => /\d/.test(value) },
]);

/** @param {number} max */
const requiredText = (max) => z.string().trim().min(1, t.required).max(max, t.maxLength(max));

const email = z
  .string()
  .trim()
  .min(1, t.required)
  .max(256, t.maxLength(256))
  .pipe(z.email(t.email));

/** New password (register / reset): the four rules. Not trimmed — spaces are characters. */
const newPassword = z
  .string()
  .min(1, t.required)
  .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), t.password);

const phoneNumber = z
  .string()
  .transform((value) => toLatinDigits(value).replace(/[\s-]/g, ''))
  .pipe(z.string().min(1, t.required).regex(PHONE_REGEX, t.phone));

const resetCode = z
  .string()
  .transform((value) => toLatinDigits(value).trim())
  .pipe(z.string().regex(/^\d{6}$/, t.code));

export const loginSchema = z.object({
  email,
  // Login checks only presence; the rules apply when a password is set.
  password: z.string().min(1, t.required),
});

export const registerSchema = z.object({
  userName: requiredText(256),
  fullName: requiredText(150),
  email,
  phoneNumber,
  city: requiredText(100),
  password: newPassword,
});

export const emailSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  email,
  code: resetCode,
  password: newPassword,
});
