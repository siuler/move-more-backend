import path from 'path';
import { Mail } from '../../../messaging/mail/mail';

export type RecoveryCodeViewModel = {
    recoveryCode: string;
    username: string;
};

export class RecoveryCodeMail extends Mail {
    constructor(viewModel: RecoveryCodeViewModel) {
        super(path.join(__dirname, 'recovery-code.email.html'), 'Recovery-Code for your MoveMore-Account', viewModel);
    }
}
