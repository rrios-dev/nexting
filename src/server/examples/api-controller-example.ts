import { z } from 'zod';
import makeApiController from '../helpers/make-api-controller';

// Ejemplo 1: API Controller sin validación
const getHealthController = makeApiController(async ({ request }) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    url: request.url,
  };
});

// Ejemplo 2: API Controller con validación
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18).max(100),
});

const createUserController = makeApiController(
  async (userData, { request }) => {
    // Simular creación de usuario
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    };

    return {
      success: true,
      user,
    };
  },
  {
    validationSchema: userSchema,
    error: {
      defaultMessage: 'Failed to create user',
      defaultCode: 'USER_CREATION_ERROR',
    },
  },
);

// Ejemplo 3: API Controller con validación y logging personalizado
const updateUserController = makeApiController(
  async (updateData, { request }) => {
    // Simular actualización
    return {
      success: true,
      message: 'User updated successfully',
      updatedFields: Object.keys(updateData),
    };
  },
  {
    validationSchema: z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    }),
  },
);

// Uso en una API route de Next.js:
/*
// app/api/health/route.ts
import { getHealthController } from './path/to/examples';

export async function GET(request: Request) {
  return getHealthController(request);
}

// app/api/users/route.ts
import { createUserController } from './path/to/examples';

export async function POST(request: Request) {
  const body = await request.json();
  return createUserController(request, body);
}
*/

export {
  getHealthController,
  createUserController,
  updateUserController,
}; 