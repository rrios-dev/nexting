import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import makeApiController from '../make-api-controller';
import ServerError from '../../errors/server-error';

const mockRequest = new Request('http://localhost/api/test');

describe('makeApiController', () => {
  describe('sin validación', () => {
    it('debería devolver respuesta exitosa', async () => {
      const controller = makeApiController(async () => {
        return { message: 'success', data: { id: 1 } };
      });

      const response = await controller(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.OK);
      expect(data).toEqual({
        message: 'success',
        data: { id: 1 },
      });
    });

    it('debería manejar errores generales', async () => {
      const controller = makeApiController(async () => {
        throw new Error('Test error');
      });

      const response = await controller(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(data).toEqual({
        message: 'Test error',
        code: 'GENERIC_ERROR',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        uiMessage: 'An unexpected error occurred',
      });
    });

    it('debería manejar ServerError correctamente', async () => {
      const controller = makeApiController(async () => {
        throw new ServerError({
          message: 'Custom error',
          code: 'CUSTOM_ERROR',
          status: StatusCodes.BAD_REQUEST,
          uiMessage: 'Something went wrong',
        });
      });

      const response = await controller(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(data).toEqual({
        message: 'Custom error',
        code: 'CUSTOM_ERROR',
        status: StatusCodes.BAD_REQUEST,
        uiMessage: 'Something went wrong',
      });
    });

    it('debería pasar el contexto de request', async () => {
      const controller = makeApiController(async ({ request }) => {
        return { url: request.url };
      });

      const response = await controller(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.OK);
      expect(data).toEqual({
        url: 'http://localhost/api/test',
      });
    });
  });

  describe('con validación', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it('debería validar input correctamente', async () => {
      const controller = makeApiController(
        async (props) => {
          return { greeting: `Hello ${props.name}, you are ${props.age}` };
        },
        { validationSchema: schema },
      );

      const input = { name: 'John', age: 30 };
      const response = await controller(mockRequest, input);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.OK);
      expect(data).toEqual({
        greeting: 'Hello John, you are 30',
      });
    });

    it('debería devolver error de validación para input inválido', async () => {
      const controller = makeApiController(
        async (props) => {
          return { greeting: `Hello ${props.name}` };
        },
        { validationSchema: schema },
      );

      const input = { name: 'John' }; // Falta age
      const response = await controller(mockRequest, input);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.message).toContain('Invalid input');
    });

    it('debería pasar tanto props como context', async () => {
      const controller = makeApiController(
        async (props, { request }) => {
          return { 
            name: props.name, 
            url: request.url,
          };
        },
        { validationSchema: schema },
      );

      const input = { name: 'John', age: 30 };
      const response = await controller(mockRequest, input);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.OK);
      expect(data).toEqual({
        name: 'John',
        url: 'http://localhost/api/test',
      });
    });

    it('debería manejar errores en controller con validación', async () => {
      const controller = makeApiController(
        async () => {
          throw new ServerError({
            message: 'Custom error',
            code: 'CUSTOM_ERROR',
            status: StatusCodes.NOT_FOUND,
          });
        },
        { validationSchema: schema },
      );

      const input = { name: 'John', age: 30 };
      const response = await controller(mockRequest, input);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(data).toEqual({
        message: 'Custom error',
        code: 'CUSTOM_ERROR',
        status: StatusCodes.NOT_FOUND,
        uiMessage: undefined,
      });
    });
  });

  describe('opciones de configuración', () => {
    it('debería usar logger personalizado', async () => {
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

      const controller = makeApiController(
        async () => {
          throw new Error('Test error');
        },
        { logger: mockLogger as any },
      );

      await controller(mockRequest);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Test error',
        expect.objectContaining({
          message: 'Test error',
          code: 'GENERIC_ERROR',
        }),
      );
    });

    it('debería usar opciones de error personalizadas', async () => {
      const controller = makeApiController(
        async () => {
          throw new Error('Test error');
        },
        {
          error: {
            defaultMessage: 'Custom default message',
            defaultCode: 'CUSTOM_DEFAULT_CODE',
            defaultStatus: StatusCodes.BAD_GATEWAY,
          },
        },
      );

      const response = await controller(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(StatusCodes.BAD_GATEWAY);
      expect(data.code).toBe('CUSTOM_DEFAULT_CODE');
    });
  });
}); 