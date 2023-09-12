import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

export abstract class Mail {
    constructor(private templateUrl: fs.PathOrFileDescriptor, private subject: string, private viewModel: Record<string, string>) {}

    public getSubject() {
        return this.fillInViewModel(this.subject);
    }

    public async getContent() {
        const template = await this.readTemplate();
        const content = this.fillInViewModel(template);
        return content;
    }

    private async readTemplate(): Promise<string> {
        return (await readFile(this.templateUrl)).toString();
    }

    private fillInViewModel(template: string): string {
        for (const key of Object.keys(this.viewModel)) {
            template = template.split(`{{${key}}}`).join(this.viewModel[key]);
        }
        return template;
    }
}
