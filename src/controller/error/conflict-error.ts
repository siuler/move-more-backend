import { ControllerError } from './controller-error';

export class ConflictError extends ControllerError {
    public statusCode = 409;
    public error = 'ConflictError';

    constructor(public message: string) {
        super();
    }
}
