import { Pool } from 'mysql2/promise';
import { UserId } from '../user';
import { DBRecoveryCodeIsValid, RecoveryCode } from './recovery';

const STMT_INSERT_RECOVERY_CODE = `INSERT INTO recovery_code(user_id,code) VALUES(?,?) ON DUPLICATE KEY UPDATE code = VALUES(code),timestamp = NOW()`;
const STMT_DELETE_RECOVERY_CODE = `DELETE FROM recovery_code WHERE user_id=?`;

const QUERY_IS_RECOVERY_CODE_VALID = `SELECT COUNT(*) > 0 as code_is_valid FROM recovery_code WHERE user_id=? AND code=? AND timestamp + INTERVAL 15 MINUTE > NOW()`;

export class RecoveryCodeRepository {
    constructor(private connectionPool: Pool) {}

    public async persistRecoveryCode(userId: UserId, recoveryCode: RecoveryCode) {
        await this.connectionPool.execute(STMT_INSERT_RECOVERY_CODE, [userId, recoveryCode]);
    }

    public async isRecoveryCodeValid(userId: UserId, recoveryCode: RecoveryCode) {
        const [codeIsValid] = await this.connectionPool.query<DBRecoveryCodeIsValid[]>(QUERY_IS_RECOVERY_CODE_VALID, [
            userId,
            recoveryCode,
        ]);
        return codeIsValid[0].code_is_valid == 1;
    }

    public async deleteRecoveryCode(userId: UserId) {
        await this.connectionPool.execute(STMT_DELETE_RECOVERY_CODE, [userId]);
    }
}
