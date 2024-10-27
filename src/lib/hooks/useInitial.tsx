import { useEffect } from 'react';

export type UseInitialProps = () => Promise<unknown> | unknown;
export function useInitial(func: UseInitialProps) {
	return useEffect(() => {
		func();
	}, []);
}
