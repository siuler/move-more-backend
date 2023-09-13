import { Connection } from 'mysql2/promise';

export abstract class Migration {
    public abstract readonly migrationVersion: number;

    constructor(protected connection: Connection) {}

    protected abstract up(): Promise<void>;
}
