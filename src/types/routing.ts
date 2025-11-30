import type { BunRequest, Server } from 'bun';

export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export type HandlerReturn = Response | Promise<Response> | Record<string, unknown> | Promise<Record<string, unknown>>;

export type RouteHandler = (req: BunRequest, server: Server<BunRequest>) => HandlerReturn;

export type MiddlewareResult = void | true | false | Response | Promise<void | true | false | Response>;

export type Middleware = (req: BunRequest, server: Server<BunRequest>) => MiddlewareResult;

export type MiddlewareMap = {
  [M in RouteMethod]?: Middleware | Middleware[];
};

export type Event = { [M in RouteMethod]?: RouteHandler };

export interface Route {
  middleware: Middleware[];

  on<M extends keyof Event>(event: M, listener: Event[M]): this;

  run<M extends keyof Event>(event: M, req: BunRequest, server: Server<BunRequest>): HandlerReturn;
}
