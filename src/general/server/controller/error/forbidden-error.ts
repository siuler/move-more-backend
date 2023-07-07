import { ControllerError } from './controller-error';

export class ForbiddenError extends ControllerError {
    public statusCode = 403;
    public error = 'FobiddenError';

    constructor(public message: string) {
        super();
    }
}
