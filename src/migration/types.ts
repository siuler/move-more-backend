import { RowDataPacket } from 'mysql2';

export const USER_ID_TYPE = 'MEDIUMINT UNSIGNED';
export const EXERCISE_ID_TYPE = 'TINYINT(255) UNSIGNED';

export interface DBMigrationVersionResult extends RowDataPacket {
    current_version: number;
}
