import { z, ZodType } from "zod/v4";

export type ValidationMode = "strict" | "warn" | "off";

export function validate<T>(
  schema: ZodType<T>,
  data: unknown,
  mode: ValidationMode,
): T {
  if (mode === "off") {
    return data as T;
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  switch (mode) {
    case "strict":
      throw result.error;
    case "warn":
      console.warn(`Validation warning: ${result.error.message}`);
      return data as T;
    default:
      throw new Error(`Unknown validation mode: ${mode}`);
  }
}
