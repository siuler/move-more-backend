import { ControllerError } from "./controller-error";

export class BadRequestError extends ControllerError {
	public statusCode = 400;
	public error = 'BadRequestError';

	constructor(public message: string) {
		super();
	}
}