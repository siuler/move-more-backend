import { readFileSync } from 'fs';
import path from 'path';

export const JWT_PRIVATE_KEY = readFileSync(path.join(__dirname, 'jwt.pem'));
