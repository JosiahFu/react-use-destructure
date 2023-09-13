import { Dispatch, SetStateAction, useMemo, useRef } from 'react';

type DestructuredState<T> = { [K in keyof Required<T>]: [T[K], Dispatch<SetStateAction<Required<T>[K]>>] };

function mapToObject<T extends object>(keys: (keyof T)[], callback: <K extends keyof T>(key: K, index: number, array: (keyof T)[]) => T[K]) {
    const result = {} as T;
    keys.forEach((key, index, array) => {
        result[key] = callback(key, index, array);
    });
    return result;
}

function useDestructure<T extends object>(
    object: T,
    setObject: Dispatch<SetStateAction<T>>,
    keys: (keyof Required<T>)[] = Object.keys(object) as unknown as (keyof T)[]
) {
    const closedKeys = useRef(keys).current;

    const states = useMemo(() => (
        mapToObject<DestructuredState<T>>(closedKeys, key => (
            [object[key], value => {
                const newValue = (typeof value === 'function') ? (value as Function)(object[key]) : value;
                setObject({ ...object, [key]: newValue });
            }]
        ))
    ), [closedKeys, object, setObject]);

    return states;
}

function useOptimizedDestructure<T extends object>(
    object: T,
    setObject: Dispatch<SetStateAction<T>>,
    keys: (keyof Required<T>)[] = Object.keys(object) as unknown as (keyof T)[]
) {
    type PropertySetters<T> = { [K in keyof Required<T>]: Dispatch<SetStateAction<Required<T>[K]>> };

    // Make sure the keys stay the same
    const closedKeys = useRef(keys).current;

    // Create the setters
    const settersRef = useRef<PropertySetters<T>>();
    settersRef.current = mapToObject<PropertySetters<T>>(closedKeys, key => (
        value => {
            const newValue = (typeof value === 'function') ? (value as Function)(object[key]) : value;
            setObject({ ...object, [key]: newValue });
        }
    ));

    // Set the wrappers
    const setterWrappers = useRef(() => (
        mapToObject<PropertySetters<T>>(closedKeys, key => (
            value => settersRef.current![key](value)
        ))
    ));

    // Build the output
    const states = useMemo(() => (
        mapToObject<DestructuredState<T>>(closedKeys, key => (
            [object[key], setterWrappers.current[key as keyof typeof setterWrappers.current]]
        ))
    ), [closedKeys, object]);

    return states;
}

export { useDestructure, useOptimizedDestructure };
