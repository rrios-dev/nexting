import { z } from 'zod';
import ServerError from '../errors/server-error';
import parseServerError, {
  ParseServerErrorOptions,
} from './parse-server-error';
import { defaultLogger, Logger } from './server-logger';

interface CommonHandlerOptions {
  error?: ParseServerErrorOptions;
  logger?: Logger;
}

interface CommonHandlerOptionsWithSchema<T extends z.ZodTypeAny>
  extends CommonHandlerOptions {
  validationSchema: T;
}

interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: ReturnType<ServerError['toJSON']>;
}

const validateInput = <T extends z.ZodTypeAny>(
  input: unknown,
  schema?: T,
): ValidationResult<z.infer<T>> => {
  if (!schema) {
    return { isValid: true, data: input as z.infer<T> };
  }

  try {
    const data = schema.parse(input);
    return { isValid: true, data };
  } catch (error) {
    const parsedError = parseServerError(error).toJSON();
    return { isValid: false, error: parsedError };
  }
};

const handleError = (
  error: unknown,
  options?: CommonHandlerOptions,
): ReturnType<ServerError['toJSON']> => {
  const parsedError = parseServerError(error, options?.error).toJSON();
  (options?.logger || defaultLogger).error(parsedError.message, parsedError);
  return parsedError;
};

export {
  validateInput,
  handleError,
  type CommonHandlerOptions,
  type CommonHandlerOptionsWithSchema,
  type ValidationResult,
}; 