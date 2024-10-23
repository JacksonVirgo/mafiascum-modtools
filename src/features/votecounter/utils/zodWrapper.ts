import { z } from 'zod';

export function wrapZod<T>(schema: z.ZodSchema<T>) {
	return {
		schema,
		validate: (data: unknown) => validateSchema(schema, data),
	};
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown) {
	try {
		const parsed = schema.parse(data);
		if (parsed) return true;
		return false;
	} catch (err) {
		return false;
	}
}
