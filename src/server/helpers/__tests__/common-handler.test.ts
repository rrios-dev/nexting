import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { validateInput, handleError } from '../common-handler';
import ServerError from '../../errors/server-error';

describe('common-handler', () => {
  describe('validateInput', () => {
    const testSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('debería validar input correcto sin schema', () => {
      const input = { test: 'data' };
      const result = validateInput(input);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.error).toBeUndefined();
    });

    it('debería validar input correcto con schema', () => {
      const input = { name: 'John', age: 30 };
      const result = validateInput(input, testSchema);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.error).toBeUndefined();
    });

    it('debería fallar validación con schema para input inválido', () => {
      const input = { name: 'John' }; // Falta age
      const result = validateInput(input, testSchema);

      expect(result.isValid).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('debería manejar tipos incorrectos', () => {
      const input = { name: 123, age: 'thirty' };
      const result = validateInput(input, testSchema);

      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('handleError', () => {
    it('debería manejar Error básico', () => {
      const error = new Error('Test error');
      const result = handleError(error);

      expect(result.message).toBe('Test error');
      expect(result.code).toBe('GENERIC_ERROR');
      expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.uiMessage).toBe('An unexpected error occurred');
    });

    it('debería manejar ServerError correctamente', () => {
      const error = new ServerError({
        message: 'Custom server error',
        code: 'CUSTOM_ERROR',
        status: StatusCodes.BAD_REQUEST,
        uiMessage: 'Custom UI message',
      });

      const result = handleError(error);

      expect(result.message).toBe('Custom server error');
      expect(result.code).toBe('CUSTOM_ERROR');
      expect(result.status).toBe(StatusCodes.BAD_REQUEST);
      expect(result.uiMessage).toBe('Custom UI message');
    });

    it('debería usar opciones personalizadas para errores genéricos', () => {
      const error = new Error('Test error');
      const options = {
        error: {
          defaultMessage: 'Custom default message',
          defaultCode: 'CUSTOM_CODE',
          defaultStatus: StatusCodes.BAD_GATEWAY,
          defaultUiMessage: 'Custom UI message',
        },
      };

      const result = handleError(error, options);

      expect(result.message).toBe('Test error'); // El mensaje del error original se mantiene
      expect(result.code).toBe('CUSTOM_CODE');
      expect(result.status).toBe(StatusCodes.BAD_GATEWAY);
      expect(result.uiMessage).toBe('Custom UI message');
    });

    it('debería usar logger personalizado', () => {
      const mockLogger = {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        child: jest.fn(),
        setLevel: jest.fn(),
        setFormatter: jest.fn(),
        addTransport: jest.fn(),
        config: {},
        shouldLog: jest.fn(),
        writeLog: jest.fn(),
      };

      const error = new Error('Test error');
      const options = { logger: mockLogger as any };

      const result = handleError(error, options);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Test error',
        expect.objectContaining({
          message: 'Test error',
          code: 'GENERIC_ERROR',
        }),
      );
      expect(result.message).toBe('Test error');
    });

    it('debería manejar valores no-Error', () => {
      const error = 'String error';
      const result = handleError(error);

      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('GENERIC_ERROR');
      expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('debería manejar null/undefined', () => {
      const result1 = handleError(null);
      const result2 = handleError(undefined);

      [result1, result2].forEach((result) => {
        expect(result.message).toBe('An unexpected error occurred');
        expect(result.code).toBe('GENERIC_ERROR');
        expect(result.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      });
    });
  });
}); 