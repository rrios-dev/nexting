import { z } from 'zod';
import makeServerAction from '../../helpers/make-server-action';
import {
  InferActionInput,
  InferActionOutput,
  InferActionError,
  ActionRequiresInput,
} from '../action-types';

describe('Action Type Inference', () => {
  // Setup: Crear acciones de ejemplo
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });

  interface User {
    id: string;
    name: string;
    email: string;
  }

  const createUserAction = makeServerAction(
    async (props: z.infer<typeof userSchema>): Promise<User> => ({
      id: '1',
      name: props.name,
      email: props.email,
    }),
    { validationSchema: userSchema }
  );

  const getUsersAction = makeServerAction(async (): Promise<User[]> => []);

  describe('InferActionInput', () => {
    it('should infer input type for action with parameters', () => {
      type Input = InferActionInput<typeof createUserAction>;
      
      // Verificación de tipo en tiempo de compilación
      const input: Input = {
        name: 'John',
        email: 'john@example.com',
      };

      expect(input.name).toBe('John');
      expect(input.email).toBe('john@example.com');
    });

    it('should infer void for action without parameters', () => {
      type Input = InferActionInput<typeof getUsersAction>;
      
      // Verificación de tipo en tiempo de compilación
      const input: Input = undefined;

      expect(input).toBeUndefined();
    });
  });

  describe('InferActionOutput', () => {
    it('should infer output type for single user action', () => {
      type Output = InferActionOutput<typeof createUserAction>;
      
      // Verificación de tipo en tiempo de compilación
      const output: Output = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
      };

      expect(output.id).toBe('1');
      expect(output.name).toBe('John');
      expect(output.email).toBe('john@example.com');
    });

    it('should infer output type for users array action', () => {
      type Output = InferActionOutput<typeof getUsersAction>;
      
      // Verificación de tipo en tiempo de compilación
      const output: Output = [];

      expect(Array.isArray(output)).toBe(true);
    });
  });

  describe('InferActionError', () => {
    it('should infer error type for any action', () => {
      type Error = InferActionError<typeof createUserAction>;
      
      // Verificación de tipo en tiempo de compilación
      const error: Error = {
        message: 'Test error',
        code: 'TEST_ERROR',
        status: 400,
        uiMessage: 'User friendly message',
      };

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(400);
      expect(error.uiMessage).toBe('User friendly message');
    });
  });

  describe('ActionRequiresInput', () => {
    it('should return true for action that requires input', () => {
      type RequiresInput = ActionRequiresInput<typeof createUserAction>;
      
      // Verificación de tipo en tiempo de compilación
      const requiresInput: RequiresInput = true;

      expect(requiresInput).toBe(true);
    });

    it('should return false for action that does not require input', () => {
      type RequiresInput = ActionRequiresInput<typeof getUsersAction>;
      
      // Verificación de tipo en tiempo de compilación
      const requiresInput: RequiresInput = false;

      expect(requiresInput).toBe(false);
    });
  });

  describe('Real usage scenarios', () => {
    it('should work with actual action execution', async () => {
      // Ejecutar acción con parámetros
      const createResult = await createUserAction({
        name: 'John Doe',
        email: 'john@example.com',
      });

      if (createResult.status === 'success') {
        expect(createResult.data.name).toBe('John Doe');
        expect(createResult.data.email).toBe('john@example.com');
      } else {
        fail('Expected success result');
      }

      // Ejecutar acción sin parámetros
      const getUsersResult = await getUsersAction();

      if (getUsersResult.status === 'success') {
        expect(Array.isArray(getUsersResult.data)).toBe(true);
      } else {
        fail('Expected success result');
      }
    });
  });
}); 