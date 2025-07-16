import { z, ZodSchema } from 'zod';

export type ValidationMode = 'strict' | 'warn' | 'off';

export function validate<T>(schema: ZodSchema<T>, data: unknown, mode: ValidationMode): T {
  if (mode === 'off') {
    return data as T;
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    if (mode === 'strict') {
      throw result.error;
    } else {
      console.warn(result.error);
      return data as T;
    }
  }
  return result.data;
}
