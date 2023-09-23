import { useCallback, useRef } from 'react';

function usePropState<T extends object, K extends keyof T>(object: T, setObject: (value: T) => void, key: K): [T[K], (value: T[K]) => void] {
    type P = T[K];
    const objectRef = useRef(object);
    objectRef.current = object;

    const setState = useCallback((value: P) => {
        setObject({ ...objectRef.current, [key]: value });
    }, [key, setObject]);

    return [object[key], setState];
}

export { usePropState };
