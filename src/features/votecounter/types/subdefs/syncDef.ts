import { z } from 'zod';
import { wrapZod } from '../../utils/zodWrapper';

// Thread OP-based sync
export const { schema: ThreadSyncSchema, validate: isThreadSync } = wrapZod(
	z.object({
		type: z.literal('thread'),
		opPostNum: z.number(),
	}),
);

// Server-based Sync
export const { schema: ServerSyncSchema, validate: isServerSync } = wrapZod(
	z.object({
		type: z.literal('server'),
		opPostNum: z.number(),
	}),
);

export const { schema: CachedDefinition, validate: isCachedDefinition } =
	wrapZod(ThreadSyncSchema.or(ServerSyncSchema));

export const SyncSchema = CachedDefinition;
export type Sync = z.infer<typeof SyncSchema>;
