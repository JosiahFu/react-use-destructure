import { Dispatch, SetStateAction, useMemo, useRef } from 'react';

type DestructuredState<T> = { [K in keyof T]: [T[K], Dispatch<SetStateAction<T[K]>>] };
type DestructuredOptionalState<T> = { [K in keyof Required<T>]: [T[K], Dispatch<SetStateAction<Required<T>[K]>>] };

type RequiredFieldsOnly<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
}

function mapToObject<T extends object>(keys: (keyof T)[], callback: <K extends keyof T>(key: K, index: number, array: (keyof T)[]) => T[K]) {
    const result = {} as T;
    keys.forEach((key, index, array) => {
        result[key] = callback(key, index, array);
    });
    return result;
}

/**
 * Destructures an object state into one state pair for each property.
 *
 * @param object The object state
 * @param setObject The setter for the object state
 * @param keys If the object may gain properties post-mount, you must specify all
 * the possible keys/property names to allow destructuring to work properly. If
 * the properties available do not change, you can omit this and it will be
 * created automatically.
 * @returns An object with a state pair for each property in the original
 * object. See the docs for example code.
 */
function useDestructure<T extends object>(
    object: T,
    setObject: (object: T) => void
): DestructuredState<RequiredFieldsOnly<T>>;
function useDestructure<T extends object>(
    object: T,
    setObject: (object: T) => void,
    keys: (keyof Required<T>)[]
): DestructuredOptionalState<T>;
function useDestructure<T extends object>(
    object: T,
    setObject: (object: T) => void,
    keys: (keyof Required<T>)[] = Object.keys(object) as unknown as (keyof T)[]
) {
    const closedKeys = useRef(keys).current;

    const states = useMemo(() => (
        mapToObject<DestructuredOptionalState<T>>(closedKeys, key => (
            [object[key], value => {
                const newValue = (typeof value === 'function') ? (value as Function)(object[key]) : value;
                setObject({ ...object, [key]: newValue });
            }]
        ))
    ), [closedKeys, object, setObject]);

    return states;
}

/**
 * Identical to {@link useDestructure} but is optimized with Refs so that the
 * setters never change. This causes some overhead, so only use if re-rendering
 * setters is expensive.
 */
function useOptimizedDestructure<T extends object>(
    object: T,
    setObject: (object: T) => void
): DestructuredState<RequiredFieldsOnly<T>>;
function useOptimizedDestructure<T extends object>(
    object: T,
    setObject: (object: T) => void,
    keys: (keyof Required<T>)[]
): DestructuredOptionalState<T>;
function useOptimizedDestructure<T extends object>(
    object: T,
    setObject: (object: T) => void,
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
        mapToObject<DestructuredOptionalState<T>>(closedKeys, key => (
            [object[key], setterWrappers.current[key as keyof typeof setterWrappers.current]]
        ))
    ), [closedKeys, object]);

    return states;
}

export { useDestructure, useOptimizedDestructure };
