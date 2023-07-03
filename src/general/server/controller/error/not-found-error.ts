import { ControllerError } from './controller-error';

export class NotFoundError extends ControllerError {
    public statusCode = 404;
    public error = 'NotFoundError';

    constructor(public message: string) {
        super();
    }
}
