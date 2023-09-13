import { Dispatch, SetStateAction, useMemo, useRef } from 'react';

type DestructuredState<T> = { [K in keyof Required<T>]: [T[K], Dispatch<SetStateAction<Required<T>[K]>>] };

function useDestructure<T extends object>(
    object: T,
    setObject: Dispatch<SetStateAction<T>>,
    keys: (keyof Required<T>)[] = Object.keys(object) as unknown as (keyof T)[]
) {
    const closedKeys = useRef(keys).current;

    const states = useMemo(() => {
        const result = {} as DestructuredState<T>
        closedKeys.forEach((key) => {
            result[key] = ([object[key], value => {
                const newValue = (typeof value === 'function') ? (value as Function)(object[key]) : value;
                setObject({ ...object, [key]: newValue });
            }])
        });
        return result;
    }, [closedKeys, object, setObject]);

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
    settersRef.current = {} as PropertySetters<T>;
    closedKeys.forEach(key => {
        settersRef.current![key] = value => {
            const newValue = (typeof value === 'function') ? (value as Function)(object[key]) : value;
            setObject({ ...object, [key]: newValue });
        }
    });

    // Set the wrappers
    const setterWrappers = useRef(() => {
        const result = {} as PropertySetters<T>;
        closedKeys.forEach(key => {
            result[key] = value => settersRef.current![key](value);
        });
        return result;
    });

    // Build the output
    const states = useMemo(() => {
        const result = {} as DestructuredState<T>;
        closedKeys.forEach(key => {
            states[key] = [object[key], setterWrappers.current[key as keyof typeof setterWrappers.current]];
        });
        return result;
    }, [closedKeys, object]);

    return states;
}

export { useDestructure, useOptimizedDestructure };
