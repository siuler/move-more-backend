import { makeUniqueDummy } from "./util";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function makeMockFastifyInstance(): FastifyInstance {
  return {
    listen: jest.fn(),
    route: jest.fn(),
    close: jest.fn(),
    setErrorHandler: jest.fn(),
    addHook: jest.fn(),
  } as unknown as FastifyInstance;
}

export function make200ResponseHandler() {
  return (request: FastifyRequest, reply: FastifyReply) =>
    reply.code(200).send();
}

export function makeMockRequest(): FastifyRequest {
  return makeUniqueDummy<FastifyRequest>();
}

export function makeMockReply(): FastifyReply {
  const mockReply = makeUniqueDummy<FastifyReply>();

  mockReply.send = jest.fn(() => mockReply);
  mockReply.code = jest.fn(() => mockReply);
  mockReply.type = jest.fn(() => mockReply);

  return mockReply;
}
