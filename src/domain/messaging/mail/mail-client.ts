import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import * as applicationConfig from '../../../config/config.json';
import { Mail } from './mail';

export class MailClient {
    private client = new SESClient({ region: applicationConfig.mail.region });

    public async send(mail: Mail, receiver: string) {
        const sendEmailCommand = new SendEmailCommand({
            Destination: {
                ToAddresses: [receiver],
            },
            Message: {
                Body: {
                    Html: {
                        Data: await mail.getContent(),
                        Charset: 'UTF-8',
                    },
                },
                Subject: {
                    Data: mail.getSubject(),
                    Charset: 'UTF-8',
                },
            },
            Source: applicationConfig.mail.noreplyAddress,
        });

        await this.client.send(sendEmailCommand);
    }
}
