import { z } from 'zod';
import { ar } from '../../locales/ar.js';

// Mirrors the backend rule of a message (the project guide 6.16): 1–2000 characters after trim.

export const MAX_MESSAGE_LENGTH = 2000;

const messages = ar.conversations.validation;

export const messageSchema = z.object({
  content: z.string().trim().min(1, messages.required).max(MAX_MESSAGE_LENGTH, messages.tooLong),
});
