import RouteBuilder from '@structures/RouteBuilder';
import getFiles from '@utils/getFiles';
import { logger } from '@utils/logger';
import 'dotenv/config';

import type { MethodHandlers, RegisteredRoute, RoutesMap } from '@typings/server';
import type { BunRequest, Server } from 'bun';

const routesDirectory = `${import.meta.dirname}/routes`;

const normalize = (path: string): string => path.replace(/\\/g, '/');

const getEndpoint = (filePath: string): string => {
  const relative = normalize(filePath)
    .replace(normalize(routesDirectory), '')
    .replace(/\.(ts|js)$/i, '')
    .replace(/_/g, ':')
    .replace(/^\/?/, '/');

  const cleaned = relative.replace(/\/?(index|root)$/i, '') || '/';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const buildRoutes = async (): Promise<RoutesMap> => {
  const routes: RoutesMap = {
    '/health': () => Response.json({ 'status': 'ok', 'ts': Date.now(), 'up': process.uptime() }),
    '/health/ready': () => Response.json({ 'status': 'ready', 'ts': Date.now() }),
  };

  const routeFiles = await getFiles(routesDirectory);

  await Promise.all(
    routeFiles.map(async filePath => {
      try {
        const { 'default': builder } = (await import(filePath)) as {
          default: RouteBuilder;
        };

        const endpoint = getEndpoint(filePath);
        routes[endpoint] = builder.build();

        const verbs =
          typeof routes[endpoint] === 'function' ? 'FN' : Object.keys(routes[endpoint] as MethodHandlers).join(', ');

        logger.info(`↪ [${verbs}] ${endpoint}`);
      } catch (error) {
        logger.error(`Failed to load ${filePath}: ${error}`);
      }
    }),
  );

  routes['*'] = () => Response.json({ 'error': 'Not found' }, { 'status': 404 });

  return routes;
};

const wrapRouteHandler = (handler: RegisteredRoute) => {
  return async (request: BunRequest, server: Server<BunRequest>): Promise<Response> => {
    if (typeof handler === 'function') {
      const result = await handler(request, server);
      return result as Response;
    }

    const methodHandler = handler[request.method.toUpperCase()];
    if (methodHandler === undefined) {
      return Response.json({ 'error': 'Method Not Allowed' }, { 'status': 405 });
    }

    const result = await methodHandler(request, server);
    return result as Response;
  };
};

export default async (): Promise<void> => {
  const routes = await buildRoutes();

  let server: any;

  server = Bun.serve({
    'port': Number(process.env.PORT) || 3001,
    'hostname': process.env.HOST || 'localhost',
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;

      logger.info(`→ ${request.method} ${path}`);

      const handler = routes[path];
      
      if (handler) {
        if (typeof handler === 'function') {
          const result = await handler(request as any, server as any);
          return result instanceof Response ? result : Response.json(result);
        }

        const methodHandler = handler[request.method.toUpperCase()];
        if (methodHandler) {
          const result = await methodHandler(request as any, server as any);
          return result instanceof Response ? result : Response.json(result);
        }

        return Response.json({ 'error': 'Method Not Allowed' }, { 'status': 405 });
      }

      const catchAll = routes['*'];
      if (typeof catchAll === 'function') {
        const result = await catchAll(request as any, server as any);
        return result instanceof Response ? result : Response.json(result);
      }

      return Response.json({ 'error': 'Not found' }, { 'status': 404 });
    },

    error(error: Error): Response {
      logger.error(error, 'Internal Server Error');

      return Response.json({ 'error': 'Internal Server Error' }, { 'status': 500 });
    },
  });

  logger.info(`🚀 http://${server.hostname}:${server.port}   (health → /health)`);

  const gracefulShutdown = (signal: string): void => {
    logger.info(`${signal} received - shutting down`);
    server.stop();
    process.exit(0);
  };

  ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => gracefulShutdown(signal)));
};
