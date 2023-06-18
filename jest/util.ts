export function makeUniqueDummy<T>(): T {
    return {
        uniqueId: Math.random(),
    } as T;
}
