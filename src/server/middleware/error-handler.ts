import { ControllerError } from "../../controller/error/controller-error";
import { FastifyReply, FastifyRequest } from "fastify";

export function fastifyErrorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
	if (error instanceof ControllerError || error.hasOwnProperty('statusCode')) {
		const statusCode = (error as any).statusCode;
		if (statusCode >= 500) {
			console.error(error);
		}
		return reply.status(statusCode).send(error);
	}
	console.error(error);
	reply.status(500).send({
		statusCode: 500,
		error: 'InternalServerError',
		message: 'something unexpected happened. Please try again later',
	});
}