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
	public output<Schema extends ZodSchema>(schema: Schema) {
		return new NextInner<Req, Schema>(this.name, this.schema, schema);
	}
}

class NextInner<Req extends ZodSchema, Res extends ZodSchema> {
	private name: string;
	private inputSchema: Req;
	private outputSchema: Res;
	constructor(name: string, inputSchema: Req, outputSchema: Res) {
		this.name = name;
		this.inputSchema = inputSchema;
		this.outputSchema = outputSchema;
	}
	public onQuery(func: (data: z.infer<Req>) => Promise<z.infer<Res>>) {
		return new ScriptHandler<Req, Res>(
			this.name,
			this.inputSchema,
			this.outputSchema,
			func,
		);
	}
}

class ScriptHandler<Req extends ZodSchema, Res extends ZodSchema> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static scripts: Map<string, ScriptHandler<any, any>> = new Map();

	private name: string;
	private inputSchema: Req;
	private outputSchema: Res;
	private queryFunc: (data: z.infer<Req>) => Promise<Res>;

	constructor(
		name: string,
		inputSchema: Req,
		outputSchema: Res,
		queryFunc: (data: z.infer<Req>) => Promise<Res>,
	) {
		this.name = name;
		this.inputSchema = inputSchema;
		this.outputSchema = outputSchema;
		this.queryFunc = queryFunc;

		ScriptHandler.scripts.set(this.name, this);
		console.log(`[BG Script] Registered ${this.name}.`);
	}

	public ensureLoaded() {
		return this;
	}

	public async query(data: z.infer<Req>): Promise<z.infer<Res> | null> {
		const instanceType = getInstanceType();
		console.log('Instance Type: ', instanceType);
		if (instanceType == InstanceType.Content)
			return this.runAsContent(data);
		else if (instanceType == InstanceType.Background)
			return this.runAsBackground(data);
		else throw new Error('Unknown environment');
	}

	private async runAsBackground(data: z.infer<Req>) {
		const fullResponse = await this.queryFunc(data);
		return fullResponse;
	}

	private async runAsContent(
		data: z.infer<Req>,
	): Promise<z.infer<Res> | null> {
		try {
			const response: unknown = await browser.runtime.sendMessage({
				mafiaEngineAction: this.name,
				...data,
			});
			const parsed = this.outputSchema.parse(response);
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
