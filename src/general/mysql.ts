import { RowDataPacket } from 'mysql2';

export function toMySQLDate(date: Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

export interface DBRowCount extends RowDataPacket {
    row_count: number;
}
