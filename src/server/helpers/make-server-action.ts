'use server';
import {
  AsyncState,
  makeAsyncErrorState,
  makeAsyncSuccessState,
} from 'async-xtate';
import { z } from 'zod';
import ServerError from '../errors/server-error';
import {
  validateInput,
  handleError,
  CommonHandlerOptions,
  CommonHandlerOptionsWithSchema,
} from './common-handler';

// Overload con validationSchema - el tipo se infiere del schema
function makeServerAction<R, T extends z.ZodTypeAny>(
  actionFn: (props: z.infer<T>) => Promise<R>,
  options: CommonHandlerOptionsWithSchema<T>,
): (
  props: z.infer<T>,
) => Promise<AsyncState<R, ReturnType<ServerError['toJSON']>>>;

// Overload sin validationSchema
function makeServerAction<R>(
  actionFn: () => Promise<R>,
  options?: CommonHandlerOptions,
): () => Promise<AsyncState<R, ReturnType<ServerError['toJSON']>>>;

// Implementación
function makeServerAction<T extends z.ZodTypeAny, R>(
  actionFn: ((props: z.infer<T>) => Promise<R>) | (() => Promise<R>),
  options?: CommonHandlerOptionsWithSchema<T> | CommonHandlerOptions,
) {
  return async (
    props?: z.infer<T>,
  ): Promise<AsyncState<R, ReturnType<ServerError['toJSON']>>> => {
    try {
      // Validar input si hay schema
      if (options && 'validationSchema' in options && options.validationSchema) {
        const validation = validateInput(props, options.validationSchema);
        
        if (!validation.isValid) {
          return makeAsyncErrorState(validation.error!);
        }

        const result = await (actionFn as (props: z.infer<T>) => Promise<R>)(
          validation.data!,
        );
        return makeAsyncSuccessState(result);
      }

      // Sin validación
      const result = await (actionFn as () => Promise<R>)();
      return makeAsyncSuccessState(result);
    } catch (error) {
      const parsedError = handleError(error, options);
      return makeAsyncErrorState(parsedError);
    }
  };
}

export default makeServerAction;
