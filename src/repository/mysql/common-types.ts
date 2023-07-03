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
