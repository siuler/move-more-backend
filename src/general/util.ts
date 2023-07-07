import { DateString } from '../domain/statistic/statistic';

const datePattern = /^20[0-9]{2}-(:?[0-9]|10|11|12)-[0-3][0-9]$/;

export function validateDate(date: string): date is DateString {
    return datePattern.test(date);
}
