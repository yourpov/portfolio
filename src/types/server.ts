import type { HandlerReturn } from '@typings/routing';
import type { BunRequest, Server } from 'bun';

export type SimpleRouteHandler = (request: BunRequest, server: Server<BunRequest>) => HandlerReturn;
export type MethodHandlers = Record<string, SimpleRouteHandler>;
export type RegisteredRoute = SimpleRouteHandler | MethodHandlers;
export type RoutesMap = Record<string, RegisteredRoute>;
