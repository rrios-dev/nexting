import { StatusCodes } from 'http-status-codes';
import ServerError from '../errors/server-error';
import { ZodError } from 'zod';

export interface ParseServerErrorOptions {
  defaultMessage?: string;
  defaultCode?: string;
  defaultStatus?: StatusCodes;
  defaultUiMessage?: string;
  parser?: (error: unknown) => ServerError | null;
}

export enum ParseServerErrorCode {
  ValidationError = 'VALIDATION_ERROR',
  GenericError = 'GENERIC_ERROR',
}

const defaultOptions = {
  defaultMessage: 'An unexpected error occurred',
  defaultCode: ParseServerErrorCode.GenericError,
  defaultStatus: StatusCodes.INTERNAL_SERVER_ERROR,
  defaultUiMessage: 'An unexpected error occurred',
} as const;

const parseServerError = (error: unknown, {
  defaultMessage = defaultOptions.defaultMessage,
  defaultCode = defaultOptions.defaultCode,
  defaultStatus = defaultOptions.defaultStatus,
  defaultUiMessage = defaultOptions.defaultUiMessage,
  parser,
}: ParseServerErrorOptions = defaultOptions): ServerError => {
  const customError = parser?.(error);
  if (customError instanceof ServerError) return customError;
  if (error instanceof ServerError) return error;

  if (error instanceof ZodError) {
    return new ServerError({
      message: error.message,
      code: ParseServerErrorCode.ValidationError,
      status: StatusCodes.BAD_REQUEST,
      uiMessage: defaultUiMessage,
    });
  }

  if (error instanceof Error) {
    return new ServerError({
      message: error.message,
      code: defaultCode,
      status: defaultStatus,
      uiMessage: defaultUiMessage,
    });
  }

  return new ServerError({
    message: defaultMessage,
    code: defaultCode,
    status: defaultStatus,
    uiMessage: defaultUiMessage,
  });
};

export default parseServerError;