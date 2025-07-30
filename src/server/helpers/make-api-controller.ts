/* eslint-disable @typescript-eslint/no-explicit-any */
import { z, ZodTypeAny } from 'zod';
import { StatusCodes } from 'http-status-codes';
import {
  validateInput,
  handleError,
  CommonHandlerOptions,
} from './common-handler';
import { NextRequest, NextResponse } from 'next/server';

interface ApiControllerContext {
  request: NextRequest;
}

export function makeApiController<
  BodySchema extends ZodTypeAny,
  QuerySchema extends ZodTypeAny,
  ParamsSchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { body: z.infer<BodySchema>; query: z.infer<QuerySchema>; params: z.infer<ParamsSchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & {
    bodySchema: BodySchema;
    querySchema: QuerySchema;
    paramsSchema: ParamsSchema;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Body + Query
export function makeApiController<
  BodySchema extends ZodTypeAny,
  QuerySchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { body: z.infer<BodySchema>; query: z.infer<QuerySchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & {
    bodySchema: BodySchema;
    querySchema: QuerySchema;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Body + Params
export function makeApiController<
  BodySchema extends ZodTypeAny,
  ParamsSchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { body: z.infer<BodySchema>; params: z.infer<ParamsSchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & {
    bodySchema: BodySchema;
    paramsSchema: ParamsSchema;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Query + Params
export function makeApiController<
  QuerySchema extends ZodTypeAny,
  ParamsSchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { query: z.infer<QuerySchema>; params: z.infer<ParamsSchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & {
    querySchema: QuerySchema;
    paramsSchema: ParamsSchema;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Only body
export function makeApiController<
  BodySchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { body: z.infer<BodySchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & { bodySchema: BodySchema }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Only query
export function makeApiController<
  QuerySchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { query: z.infer<QuerySchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & { querySchema: QuerySchema }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Only params
export function makeApiController<
  ParamsSchema extends ZodTypeAny,
  R
>(
  controller: (
    args: { params: z.infer<ParamsSchema> },
    ctx: ApiControllerContext
  ) => Promise<R>,
  options: CommonHandlerOptions & { paramsSchema: ParamsSchema }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// No schemas
export function makeApiController<R>(
  controller: (ctx: ApiControllerContext) => Promise<R>,
  options?: CommonHandlerOptions
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Implementation
export function makeApiController(
  controller: unknown,
  options?: unknown,
): (request: NextRequest, params?: unknown) => Promise<Response> {
  return async (request: NextRequest, paramsInput?: unknown): Promise<Response> => {
    try {
      const context: ApiControllerContext = { request };

      // Determine which schemas are present
      const hasBody = !!(
        options &&
        typeof options === 'object' &&
        'bodySchema' in options &&
        (options as any).bodySchema
      );
      const hasQuery = !!(
        options &&
        typeof options === 'object' &&
        'querySchema' in options &&
        (options as any).querySchema
      );
      const hasParams = !!(
        options &&
        typeof options === 'object' &&
        'paramsSchema' in options &&
        (options as any).paramsSchema
      );

      // Prepare args
      const args: Partial<{
        body: unknown;
        query: unknown;
        params: unknown;
      }> = {};

      // Validate query params
      if (hasQuery) {
        const url = new URL(request.url);
        const rawQuery: Record<string, string | string[]> = {};
        for (const [key, value] of url.searchParams.entries()) {
          if (rawQuery[key]) {
            rawQuery[key] = Array.isArray(rawQuery[key])
              ? [...(rawQuery[key] as string[]), value]
              : [rawQuery[key] as string, value];
          } else {
            rawQuery[key] = value;
          }
        }
        const validated = validateInput(
          rawQuery,
          (options as { querySchema: ZodTypeAny }).querySchema,
        );
        if (!validated.isValid) {
          return NextResponse.json(validated.error, {
            status: validated.error?.status || StatusCodes.BAD_REQUEST,
          });
        }
        args.query = validated.data;
      }

      // Validate body
      if (hasBody) {
        const rawBody = await request.json();
        const validated = validateInput(
          rawBody,
          (options as { bodySchema: ZodTypeAny }).bodySchema,
        );
        if (!validated.isValid) {
          return NextResponse.json(validated.error, {
            status: validated.error?.status || StatusCodes.BAD_REQUEST,
          });
        }
        args.body = validated.data;
      }

      // Validate dynamic route params (from paramsInput)
      if (hasParams) {
        // Next.js passes dynamic params as the second argument to handler
        const validated = validateInput(
          paramsInput ?? {},
          (options as { paramsSchema: ZodTypeAny }).paramsSchema,
        );
        if (!validated.isValid) {
          return NextResponse.json(validated.error, {
            status: validated.error?.status || StatusCodes.BAD_REQUEST,
          });
        }
        args.params = validated.data;
      }

      let result;
      if (hasBody || hasQuery || hasParams) {
        result = await (
          controller as (args: any, ctx: ApiControllerContext) => Promise<unknown>
        )(args, context);
      } else {
        result = await (
          controller as (ctx: ApiControllerContext) => Promise<unknown>
        )(context);
      }

      return NextResponse.json(result, { status: StatusCodes.OK });
    } catch (error) {
      const parsedError = handleError(error, options as any);
      return NextResponse.json(parsedError, {
        status: parsedError.status || StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };
}

export default makeApiController;