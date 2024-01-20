import { TRPCClientError, TRPCLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import type { TRPCChromeRequest, TRPCChromeResponse } from '../types';
import browser from 'webextension-polyfill';

export type ChromeLinkOptions = {
	port: browser.Runtime.Port;
	onDisconnect: () => void;
};

export const chromeLink = <TRouter extends AnyRouter>(opts: ChromeLinkOptions): TRPCLink<TRouter> => {
	return (runtime) => {
		const { port } = opts;

		return ({ op }) => {
			return observable((observer) => {
				const listeners: (() => void)[] = [];
				const { id, type, path } = op;

				try {
					const input = runtime.transformer.serialize(op.input);

					const onDisconnect = () => {
						opts.onDisconnect();
						observer.error(new TRPCClientError('Port disconnected prematurely'));
					};

					port.onDisconnect.addListener(onDisconnect);
					listeners.push(() => port.onDisconnect.removeListener(onDisconnect));

					const onMessage = (message: TRPCChromeResponse) => {
						if (!('trpc' in message)) return;
						const { trpc } = message;
						if (!trpc) return;
						if (!('id' in trpc) || trpc.id === null || trpc.id === undefined) return;
						if (id !== trpc.id) return;

						if ('error' in trpc) {
							const error = runtime.transformer.deserialize(trpc.error);

							console.log('Ello There', error);

							observer.error(TRPCClientError.from({ ...trpc, error }));

							console.log('After');
							return;
						}

						observer.next({
							result: {
								...trpc.result,
								...((!trpc.result.type || trpc.result.type === 'data') && {
									type: 'data',
									data: runtime.transformer.deserialize(trpc.result.data),
								}),
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
							} as any,
						});

						if (type !== 'subscription' || trpc.result.type === 'stopped') {
							observer.complete();
						}
					};

					port.onMessage.addListener(onMessage);
					listeners.push(() => port.onMessage.removeListener(onMessage));

					port.postMessage({
						trpc: {
							id,
							jsonrpc: undefined,
							method: type,
							params: { path, input },
						},
					} as TRPCChromeRequest);
				} catch (cause) {
					console.log('Second Location', cause instanceof Error ? cause.message : 'Unknown error');
					observer.error(new TRPCClientError(cause instanceof Error ? cause.message : 'Unknown error'));
				}

				return () => {
					listeners.forEach((unsub) => unsub());
					if (type === 'subscription') {
						port.postMessage({
							trpc: {
								id,
								jsonrpc: undefined,
								method: 'subscription.stop',
							},
						} as TRPCChromeRequest);
					}
				};
			});
		};
	};
};
