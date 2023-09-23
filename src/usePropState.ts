import { useCallback, useRef } from 'react';

function usePropState<T, K extends keyof T>(object: T, setObject: (value: T) => void, key: K) {

    type Prop = T extends { [Key in K]: infer U } ? U : never;

    const objectRef = useRef(object);
    objectRef.current = object;

    const setState = useCallback((value: Prop) => {
        setObject({ ...objectRef.current, [key]: value });
    }, [key, setObject]);

    return [object[key], setState] as [Prop, (value: Prop) => void];
}

export { usePropState };
