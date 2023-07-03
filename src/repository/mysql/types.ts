import { ResultSetHeader } from 'mysql2';

export interface IUpdateResponse extends ResultSetHeader {
    affectedRows: number;
    changedRows: number;
    fieldCount: number;
    info: string;
    insertId: number;
    serverStatus: number;
    warningStatus: number;
}

export function isMySqlError(error: unknown): error is { code: string } {
    return error instanceof Object && error.hasOwnProperty('code');
}

export function asJavaScriptObject<T extends Record<string, unknown>, OutputType = JavaScriptObject<T>>(databaseObject: T): OutputType {
    const jsObject: Record<string, unknown> = {};
    for (const key of Object.keys(databaseObject)) {
        const camelCaseKey = key.replace(/_([a-z])/g, firstLetterOfWord => firstLetterOfWord[1].toUpperCase());
        jsObject[camelCaseKey] = databaseObject[key];
    }
    return jsObject as OutputType;
}

export function asDatabaseObject<T extends Record<string, unknown>, OutputType = DatabaseObject<T>>(databaseObject: T): OutputType {
    const jsObject: Record<string, unknown> = {};
    for (const key of Object.keys(databaseObject)) {
        const camelCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        jsObject[camelCaseKey] = databaseObject[key];
    }
    return jsObject as OutputType;
}

export type JavaScriptObject<T> = Omit<KeysToCamelCase<T>, 'constructor'>;
export type DatabaseObject<T> = KeysToSnakeCase<T>;

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: K extends 'constructor' ? never : T[K];
};

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
    : S;

export type KeysToSnakeCase<T> = {
    [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};
