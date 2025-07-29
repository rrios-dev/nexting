import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import {
  validateInput,
  handleError,
  CommonHandlerOptions,
  CommonHandlerOptionsWithSchema,
} from './common-handler';

interface ApiControllerContext {
  request: Request;
}

// Overload con validationSchema - el tipo se infiere del schema
function makeApiController<R, T extends z.ZodTypeAny>(
  controllerFn: (props: z.infer<T>, context: ApiControllerContext) => Promise<R>,
  options: CommonHandlerOptionsWithSchema<T>
): (request: Request, input?: unknown) => Promise<Response>;

// Overload sin validationSchema
function makeApiController<R>(
  controllerFn: (context: ApiControllerContext) => Promise<R>,
  options?: CommonHandlerOptions
): (request: Request) => Promise<Response>;

// Implementación
function makeApiController<T extends z.ZodTypeAny, R>(
  controllerFn: 
    | ((props: z.infer<T>, context: ApiControllerContext) => Promise<R>)
    | ((context: ApiControllerContext) => Promise<R>),
  options?: CommonHandlerOptionsWithSchema<T> | CommonHandlerOptions,
) {
  return async (request: Request, input?: unknown): Promise<Response> => {
    try {
      const context: ApiControllerContext = { request };

      // Validar input si hay schema
      if (options && 'validationSchema' in options && options.validationSchema) {
        const validation = validateInput(input, options.validationSchema);
        
        if (!validation.isValid) {
          return Response.json(
            validation.error,
            { status: validation.error?.status || StatusCodes.BAD_REQUEST },
          );
        }

        const result = await (controllerFn as (
          props: z.infer<T>, 
          context: ApiControllerContext,
        ) => Promise<R>)(validation.data!, context);

        return Response.json(result, { status: StatusCodes.OK });
      }

      // Sin validación
      const result = await (controllerFn as (
        context: ApiControllerContext,
      ) => Promise<R>)(context);

      return Response.json(result, { status: StatusCodes.OK });
    } catch (error) {
      const parsedError = handleError(error, options);
      return Response.json(
        parsedError,
        { status: parsedError.status || StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }
  };
}

export default makeApiController;