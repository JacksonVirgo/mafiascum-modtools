import { z, ZodSchema } from 'zod';
import browser from 'webextension-polyfill';
import { getInstanceType, InstanceType } from '../lib/window';

/*
    The reason this file is split into multiple classes is that
    I wished to have a similar experience to tRPC which allows
    for typesafety all the way through without headaches and this
    is the most elegant way (on the consumers end) for me to do so.

    - JV
*/

export class BackgroundScript {
	private name: string;
	constructor(name: string) {
		this.name = name;
	}
	public input<Schema extends ZodSchema>(schema: Schema) {
		return new Inner<Schema>(this.name, schema);
	}
}

class Inner<Req extends ZodSchema> {
	private name: string;
	private schema: Req;
	constructor(name: string, schema: Req) {
		this.name = name;
		this.schema = schema;
	}
	public onQuery<R>(func: (data: z.infer<Req>) => Promise<R>) {
		if (getInstanceType() != InstanceType.Background)
			throw new Error('onQuery can only be set in background scripts');

		return new ScriptHandler<Req, R>(this.name, this.schema, func);
	}
}

class ScriptHandler<Req extends ZodSchema, Res> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static scripts: Map<string, ScriptHandler<any, any>> = new Map();

	private name: string;
	private schema: Req;
	private queryFunc: (data: z.infer<Req>) => Promise<Res>;

	constructor(
		name: string,
		schema: Req,
		queryFunc: (data: z.infer<Req>) => Promise<Res>,
	) {
		this.name = name;
		this.schema = schema;
		this.queryFunc = queryFunc;

		ScriptHandler.scripts.set(this.name, this);
		console.log(`[BG Script] Registered ${this.name}.`);
	}

	public async query(data: z.infer<Req>): Promise<Res | null> {
		const isContentScript =
			typeof browser !== 'undefined' &&
			browser.runtime &&
			browser.runtime.id;
		const isBackgroundScript = typeof window === 'undefined';

		if (isContentScript) return this.runAsContent(data);
		else if (isBackgroundScript) return this.runAsBackground(data);
		else throw new Error('Unknown environment');
	}

	private async runAsBackground(data: z.infer<Req>) {
		const fullResponse = await this.queryFunc(data);
		return fullResponse;
	}

	private async runAsContent(data: z.infer<Req>): Promise<Res | null> {
		try {
			const response: unknown = await browser.runtime.sendMessage(data);
			const parsed = this.schema.parse(response);
			return parsed;
		} catch (err) {
			console.log(err);
			return null;
		}
	}
}

export function loadScript(name: string) {
	const script = ScriptHandler.scripts.get(name);
	return script ?? null;
}
