import { RouteOptions } from "fastify";

export interface RouteTarget {
    getRoutes(): RouteOptions[];
}