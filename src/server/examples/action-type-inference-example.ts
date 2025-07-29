import { z } from 'zod';
import makeServerAction from '../helpers/make-server-action';
import {
  GenericAction,
  InferActionInput,
  InferActionOutput,
  InferActionError,
  ActionRequiresInput,
} from '../types/action-types';

// Ejemplo 1: Acción con validación de schema
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0),
});

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

const createUserAction = makeServerAction(
  async (props: z.infer<typeof createUserSchema>): Promise<User> => {
    // Simulación de creación de usuario
    return {
      id: '123',
      name: props.name,
      email: props.email,
      age: props.age,
      createdAt: new Date(),
    };
  },
  {
    validationSchema: createUserSchema,
  }
);

// Ejemplo 2: Acción sin parámetros
const getUsersAction = makeServerAction(async (): Promise<User[]> => {
  // Simulación de obtener usuarios
  return [];
});

// Inferencia de tipos para createUserAction
type CreateUserInput = InferActionInput<typeof createUserAction>;
// Resultado: { name: string; email: string; age: number; }

type CreateUserOutput = InferActionOutput<typeof createUserAction>;
// Resultado: User

type CreateUserError = InferActionError<typeof createUserAction>;
// Resultado: { message: string; code: string; status: StatusCodes; uiMessage: string | undefined; }

type CreateUserRequiresInput = ActionRequiresInput<typeof createUserAction>;
// Resultado: true

// Inferencia de tipos para getUsersAction
type GetUsersInput = InferActionInput<typeof getUsersAction>;
// Resultado: void

type GetUsersOutput = InferActionOutput<typeof getUsersAction>;
// Resultado: User[]

type GetUsersError = InferActionError<typeof getUsersAction>;
// Resultado: { message: string; code: string; status: StatusCodes; uiMessage: string | undefined; }

type GetUsersRequiresInput = ActionRequiresInput<typeof getUsersAction>;
// Resultado: false

// Función helper que demuestra el uso de los tipos inferidos
function createTypedActionHandler<TAction extends GenericAction>(action: TAction) {
  return {
    // Tipo de entrada inferido automáticamente
    input: {} as InferActionInput<TAction>,
    
    // Tipo de salida inferido automáticamente  
    output: {} as InferActionOutput<TAction>,
    
    // Tipo de error inferido automáticamente
    error: {} as InferActionError<TAction>,
    
    // Si requiere input
    requiresInput: {} as ActionRequiresInput<TAction>,
    
    // Wrapper para ejecutar la acción con tipos seguros
    execute: action,
  };
}

// Ejemplos de uso
const createUserHandler = createTypedActionHandler(createUserAction);
const getUsersHandler = createTypedActionHandler(getUsersAction);

export {
  createUserAction,
  getUsersAction,
  createUserHandler,
  getUsersHandler,
  CreateUserInput,
  CreateUserOutput,
  CreateUserError,
  GetUsersInput,
  GetUsersOutput,
  GetUsersError,
}; 