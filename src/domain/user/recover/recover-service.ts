import { MailClient } from '../../../general/mail/mail-client';
import { UserService } from '../user-service';
import { randomInt } from 'crypto';
import { RecoveryCodeRepository } from './recovery-code-repository';
import { RecoveryCode } from './recovery';
import { RecoveryCodeMail, RecoveryCodeViewModel } from './mail/recovery-code.email';
import { InvalidRecoveryCodeError } from './recovery-error';

export class RecoverAccountService {
    constructor(private mailClient: MailClient, private userService: UserService, private recoveryCodeRepository: RecoveryCodeRepository) {}

    public async sendRecoveryCode(emailOrUsername: string) {
        const user = await this.userService.findByEmailOrUsername(emailOrUsername);
        const recoveryCode = this.generateRecoveryCode();
        this.recoveryCodeRepository.persistRecoveryCode(user.id, recoveryCode);

        const mailViewModel: RecoveryCodeViewModel = {
            recoveryCode,
            username: user.username,
        };
        const recoveryMail = new RecoveryCodeMail(mailViewModel);

        await this.mailClient.send(recoveryMail, user.email);
    }

    public async validateRecoveryCode(emailOrUsername: string, recoveryCode: RecoveryCode) {
        const user = await this.userService.findByEmailOrUsername(emailOrUsername);
        return this.isRecoveryCodeValid(user.id, recoveryCode);
    }

    public async resetPassword(emailOrUsername: string, recoveryCode: RecoveryCode, newPassword: string) {
        const user = await this.userService.findByEmailOrUsername(emailOrUsername);
        if (!this.isRecoveryCodeValid(user.id, recoveryCode)) {
            throw new InvalidRecoveryCodeError();
        }
        await this.recoveryCodeRepository.deleteRecoveryCode(user.id);
        return this.userService.updatePassword(user.id, newPassword);
    }

    private generateRecoveryCode(): RecoveryCode {
        const code = randomInt(1, 999999);
        return code.toString().padStart(6, '0') as RecoveryCode;
    }

    private isRecoveryCodeValid(userId: number, recoveryCode: RecoveryCode) {
        return this.recoveryCodeRepository.isRecoveryCodeValid(userId, recoveryCode);
    }
}
