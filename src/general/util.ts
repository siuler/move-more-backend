import { DateString } from '../domain/statistic/statistic';

const datePattern = /^20[0-9]{2}-(:?(:?0?[0-9])|10|11|12)-[0-3][0-9]$/;

export function validateDate(date: string): date is DateString {
    return datePattern.test(date);
}

export function parseJwt(token: string) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
