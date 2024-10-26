import { useEffect } from "react";

export type UseInitialProps = () => Promise<any> | any;
export function useInitial(func: UseInitialProps) {
    return useEffect(() => {
        func();
    }, [])
}