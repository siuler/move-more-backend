import { ControllerError } from "../../controller/error/controller-error";

export class AuthenticationError extends ControllerError {
	public readonly error: string = 'AuthenticationError';
	public readonly statusCode: number = 401;

	constructor(public message: string) {
		super();
	}
}