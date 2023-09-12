import { RowDataPacket } from 'mysql2';

export const RECOVERY_CODE_PATTERN = /^[0-9]{6}$/;

export function isRecoveryCode(maybeCode: string): maybeCode is RecoveryCode {
    return maybeCode.length == 6 && RECOVERY_CODE_PATTERN.test(maybeCode);
}

export type RecoveryCode = `[0-9]{6}`;
export interface DBRecoveryCodeIsValid extends RowDataPacket {
    code_is_valid: number;
}
