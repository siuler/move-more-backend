import { ControllerError } from '../../controller/error/controller-error';
import { FastifyReply, FastifyRequest } from 'fastify';

export function fastifyErrorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
    if (isControllerError(error)) {
        const statusCode = error.statusCode;
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

function isControllerError(error: Error): error is Error & { statusCode: number } {
    return error instanceof ControllerError || error.hasOwnProperty('statusCode');
}
