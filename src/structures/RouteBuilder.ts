import EventEmitter from '@3xpo/events';
import { z } from 'zod';

import type { Middleware, MiddlewareMap, RouteHandler, RouteMethod } from '@typings/routing';
import type { TypedRouteHandler, ValidationSchemas } from '@typings/schema';
import type { BunRequest, Server } from 'bun';

type RouteBuilderEvents<S extends Partial<Record<RouteMethod, ValidationSchemas>>> = {
  [M in RouteMethod]: TypedRouteHandler<S[M]>;
};

const toArray = <T>(value: T | T[] | undefined): readonly T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const validationParts = [
  {
    'key': 'body' as const,
    'name': 'Body',
    'getData': (req: BunRequest) =>
      req.json().catch(() => {
        throw new Error('Invalid JSON in request body');
      }),
  },
  {
    'key': 'query' as const,
    'name': 'Query',
    'getData': (req: BunRequest) => Object.fromEntries(new URL(req.url).searchParams),
  },
  {
    'key': 'headers' as const,
    'name': 'Headers',
    'getData': (req: BunRequest) => {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => (headers[key] = value));

      return headers;
    },
  },
  {
    'key': 'params' as const,
    'name': 'URL Parameters',
    'getData': (req: BunRequest) => req.params,
  },
];

export default class RouteBuilder<
  Schemas extends Partial<Record<RouteMethod, ValidationSchemas>> = {},
> extends EventEmitter<RouteBuilderEvents<Schemas>> {
  private readonly handlers = new Map<RouteMethod, (...args: any[]) => any>();
  private readonly schemas = new Map<RouteMethod, ValidationSchemas>();

  private readonly middlewarePerMethod: Record<RouteMethod, readonly Middleware[]> = {
    'get': [],
    'post': [],
    'put': [],
    'delete': [],
    'patch': [],
    'head': [],
    'options': [],
  };

  constructor(middlewareMap?: MiddlewareMap) {
    super();
    if (middlewareMap === undefined) return;

    (Object.keys(middlewareMap) as RouteMethod[]).forEach(method => {
      this.middlewarePerMethod[method] = toArray(middlewareMap[method]);
    });
  }

  public schema<M extends RouteMethod, S extends ValidationSchemas>(
    method: M,
    schemaCallback: (zod: typeof z) => S,
  ): RouteBuilder<Schemas & { [K in M]: S }> {
    if (this.schemas.has(method)) throw new Error(`Schemas for ${String(method).toUpperCase()} already defined.`);

    this.schemas.set(method, schemaCallback(z));

    const currentMiddleware = this.middlewarePerMethod[method as RouteMethod];
    this.middlewarePerMethod[method as RouteMethod] = [...currentMiddleware, this._validateSchema(method)];

    return this as unknown as RouteBuilder<Schemas & { [K in M]: S }>;
  }

  public override on<M extends RouteMethod>(method: M, listener: TypedRouteHandler<Schemas[M]>): this {
    if (this.handlers.has(method)) throw new Error(`Handler for ${String(method).toUpperCase()} already defined.`);

    this.handlers.set(method, listener);
    super.on(method, listener as RouteBuilderEvents<Schemas>[M]);

    return this;
  }

  private _validateSchema(method: RouteMethod): Middleware {
    return async (request: BunRequest) => {
      const schemas = this.schemas.get(method);
      if (schemas === undefined) return undefined;

      try {
        for (const part of validationParts) {
          const schema = schemas[part.key];
          if (schema === undefined) continue;

          const data = await part.getData(request);
          const result = schema.safeParse(data);

          if (result.success === false)
            return Response.json(
              { 'error': `${part.name} validation failed`, 'issues': result.error.issues },
              { 'status': 400 },
            );
          else (request as any)[part.key] = result.data;
        }
        return undefined;
      } catch (error) {
        if (error instanceof Error && error.message === 'Invalid JSON in request body')
          return Response.json({ 'error': error.message }, { 'status': 400 });

        return Response.json({ 'error': 'Schema validation error' }, { 'status': 500 });
      }
    };
  }

  public build(): { [K in Uppercase<string & keyof Schemas>]: RouteHandler } {
    const routeTable = {} as { [K in Uppercase<string & keyof Schemas>]: RouteHandler };

    for (const [method, handler] of this.handlers.entries()) {
      const upperCaseMethod = (method as string).toUpperCase();
      const middlewareSequence = this.middlewarePerMethod[method as RouteMethod];

      routeTable[upperCaseMethod as Uppercase<string & keyof Schemas>] = async (
        request: BunRequest,
        server: Server<BunRequest>,
      ) => {
        for (const middleware of middlewareSequence) {
          const result = await middleware(request, server);

          if (result instanceof Response) return result;
          if (result === false) return new Response(null, { 'status': 403 });
        }

        const handlerResult = await handler(request, server);
        return handlerResult instanceof Response ? handlerResult : Response.json(handlerResult);
      };
    }
    return routeTable;
  }
}
