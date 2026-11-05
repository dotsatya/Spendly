import { z } from 'zod';

export const onboardingSchema = z.object({
  startingBalance: z.string().refine((value) => {
    const normalized = value.replace(/,/g, '').trim();

    // Empty input is allowed; it defaults to zero.
    if (normalized === '') return true;

    // Reject partially invalid numeric values.
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
      return false;
    }

    const parsed = Number(normalized);

    // Accept zero and positive numbers only.
    return Number.isFinite(parsed) && parsed >= 0;
  }, 'Please enter a valid starting balance.'),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
