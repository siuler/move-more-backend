import { createDatabaseScheme } from './mysql/create-database-scheme';

export async function install() {
    await createDatabaseScheme();
}
