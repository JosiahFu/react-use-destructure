import { Dispatch, SetStateAction, useMemo } from 'react';

function useDestructure<T extends object>(object: T, setObject: Dispatch<SetStateAction<T>>) {
    const states = useMemo(() => {
        const result = {} as { [K in keyof T]: [T[K], Dispatch<SetStateAction<T[K]>>] };
        (Object.keys(object) as (keyof T)[]).forEach((key) => {
            result[key] = ([object[key], value => {
                const newValue = (typeof value === 'function') ? (value as Function)(object[key]) : value;
                setObject({ ...object, [key]: newValue });
            }])
        });
        return result;
    }, [object, setObject]);

    return states;
}

export { useDestructure };
