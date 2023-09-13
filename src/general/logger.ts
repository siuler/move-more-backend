import pino from 'pino';

export class Logger {
    private static logger = pino();

    public static info(...logMessages: unknown[]) {
        this.logger.info(this.stringifyMessage(...logMessages));
    }

    public static warn(...logMessages: unknown[]) {
        this.logger.warn(this.stringifyMessage(...logMessages));
    }

    public static error(...logMessages: unknown[]) {
        this.logger.error(this.stringifyMessage(...logMessages));
    }

    private static stringifyMessage(...logMessages: unknown[]): string {
        return logMessages
            .map(message => {
                switch (typeof message) {
                    case 'string':
                    case 'number':
                    case 'bigint':
                    case 'boolean':
                    case 'symbol':
                        return message;
                    case 'object':
                        return JSON.stringify(message);
                    case 'function':
                    case 'undefined':
                    default:
                        return typeof message;
                }
            })
            .join(' ');
    }
}
