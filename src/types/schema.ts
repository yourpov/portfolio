import type { BunRequest, Server } from 'bun';
import type { z } from 'zod';

export interface ValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
  headers?: z.ZodSchema;
}

export type ValidatedRequest<S extends ValidationSchemas> = BunRequest & ValidatedData<S>;

export type TypedRouteHandler<S extends ValidationSchemas | undefined> = S extends ValidationSchemas
  ? (request: ValidatedRequest<S>, server: Server<BunRequest>) => any
  : (request: BunRequest, server: Server<BunRequest>) => any;

type InferValidation<S> = S extends z.ZodTypeAny ? z.infer<S> : never;

type ValidatedData<S extends ValidationSchemas> = {
  body: InferValidation<S['body']>;
  query: InferValidation<S['query']>;
  headers: InferValidation<S['headers']>;
  params: InferValidation<S['params']>;
};
