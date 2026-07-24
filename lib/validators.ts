import { z } from 'zod'

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a valid date')
  .or(z.literal(''))
  .nullable()
  .optional()

/** Zod schema for creating / editing an event. Only the name is required. */
export const eventSchema = z.object({
  // Optional in the form; defaults to today on submit (DB column is NOT NULL).
  event_date: optionalDate,
  event_name: z
    .string()
    .trim()
    .min(1, 'Event name is required')
    .max(200, 'Event name is too long'),
  // Optional; blank/empty coerces to 0.
  cost: z.coerce
    .number({ invalid_type_error: 'Cost must be a number' })
    .min(0, 'Cost cannot be negative')
    .max(1_000_000_000, 'Cost is unrealistically large')
    .optional(),
  previsit_date: optionalDate,
  production_date: optionalDate,
  setup_date: optionalDate,
  location: z.string().trim().max(200).nullable().optional(),
  activation_manager: z.string().trim().max(120).nullable().optional(),
  remarks: z.string().trim().max(2000).nullable().optional(),
})

export type EventFormValues = z.infer<typeof eventSchema>

/** Normalises empty strings to null for nullable DB columns. */
export function normalizeEventValues(values: EventFormValues) {
  const emptyToNull = (v: string | null | undefined) =>
    v === '' || v === undefined ? null : v
  return {
    // Nullable — when left blank the event shows as "Pending".
    event_date: emptyToNull(values.event_date),
    event_name: values.event_name,
    // cost is NOT NULL (default 0) — default blank to 0.
    cost: values.cost ?? 0,
    previsit_date: emptyToNull(values.previsit_date),
    production_date: emptyToNull(values.production_date),
    setup_date: emptyToNull(values.setup_date),
    location: emptyToNull(values.location),
    activation_manager: emptyToNull(values.activation_manager),
    remarks: emptyToNull(values.remarks),
  }
}

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional().default(false),
})

export type LoginValues = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const settingsSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  theme: z.enum(['light', 'dark', 'system']),
  primary_color: z.string().trim().min(1),
  accent_color: z.string().trim().min(1),
})

export type SettingsValues = z.infer<typeof settingsSchema>
