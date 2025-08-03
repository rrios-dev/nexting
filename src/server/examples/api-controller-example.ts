import { z } from 'zod';
import makeApiController from '../helpers/make-api-controller';
import { ServerError } from '../errors/server-error';
import { ApiMakerResponse } from '../types/response-types';
import { StatusCodes } from 'http-status-codes';

// Ejemplo 1: API Controller sin validación
const getHealthController = makeApiController(async ({ request }): Promise<ApiMakerResponse<{
  status: string;
  timestamp: string;
  url: string;
}>> => {
  return {
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      url: request.url,
    },
  };
});

// Ejemplo 2: API Controller con validación de body únicamente
const createUserController = makeApiController(
  async ({ body }, { request }): Promise<ApiMakerResponse<{
    success: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      age: number;
      createdAt: string;
      userAgent: string | null;
    };
  }>> => {
    // Simular creación de usuario
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    };

    return {
      data: {
        success: true,
        user,
      },
      status: StatusCodes.CREATED,
    };
  },
  {
    bodySchema: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email format'),
      age: z.number().min(18, 'Must be at least 18').max(100, 'Must be under 100'),
    }),
    error: {
      defaultMessage: 'Failed to create user',
      defaultCode: 'USER_CREATION_ERROR',
    },
  },
);

// Ejemplo 3: API Controller con validación de query parameters
const getUsersController = makeApiController(
  async ({ query }): Promise<ApiMakerResponse<{
    users: Array<{ id: string; name: string; email: string }>;
    total: number;
    pagination: {
      limit: number;
      offset: number;
      page: number;
    };
  }>> => {
    // Simular búsqueda de usuarios
    const allUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];
    
    const users = allUsers.filter((user) => 
      !query.search || 
      user.name.toLowerCase().includes(query.search.toLowerCase()) ||
      user.email.toLowerCase().includes(query.search.toLowerCase()),
    ).slice(query.offset, query.offset + query.limit);

    return {
      data: {
        users,
        total: users.length,
        pagination: {
          limit: query.limit,
          offset: query.offset,
          page: Math.floor(query.offset / query.limit) + 1,
        },
      },
    };
  },
  {
    querySchema: z.object({
      search: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
  },
);

// Ejemplo 4: API Controller con validación de params de ruta
const getUserByIdController = makeApiController(
  async ({ params }): Promise<ApiMakerResponse<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>> => {
    // Simular búsqueda de usuario por ID
    if (params.userId === 'notfound') {
      throw new ServerError({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        status: StatusCodes.NOT_FOUND,
        uiMessage: 'The requested user does not exist.',
      });
    }

    return {
      data: {
        user: {
          id: params.userId,
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    };
  },
  {
    paramsSchema: z.object({
      userId: z.string().uuid('Invalid user ID format'),
    }),
  },
);

// Ejemplo 5: API Controller con validación combinada (body + query + params)
const updateUserController = makeApiController(
  async ({ body, query, params }, { request }): Promise<ApiMakerResponse<{
    success: boolean;
    user: {
      id: string;
      name?: string;
      email?: string;
      bio?: string;
      updatedAt: string;
    };
    message: string;
    updatedFields: string[];
  }>> => {
    // Verificar permisos si force no está activado
    if (query.force !== 'true') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        throw new ServerError({
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
          status: StatusCodes.UNAUTHORIZED,
          uiMessage: 'Please log in to continue.',
        });
      }
    }

    // Simular actualización
    const updatedUser = {
      id: params.userId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: {
        success: true,
        user: updatedUser,
        message: 'User updated successfully',
        updatedFields: Object.keys(body),
      },
    };
  },
  {
    bodySchema: z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      bio: z.string().max(500).optional(),
    }),
    querySchema: z.object({
      force: z.enum(['true', 'false']).optional(),
      notify: z.boolean().default(true),
    }),
    paramsSchema: z.object({
      userId: z.string().uuid(),
    }),
  },
);

// Ejemplo 6: API Controller con body + query
const searchUsersController = makeApiController(
  async ({ body, query }): Promise<ApiMakerResponse<{
    results: any[];
    criteria: any;
    timestamp: string;
  }>> => {
    const searchCriteria = {
      ...body.filters,
      ...query,
    };

    return {
      data: {
        results: [],
        criteria: searchCriteria,
        timestamp: new Date().toISOString(),
      },
    };
  },
  {
    bodySchema: z.object({
      filters: z.object({
        department: z.string().optional(),
        role: z.string().optional(),
      }),
    }),
    querySchema: z.object({
      sort: z.enum(['name', 'email', 'created']).default('name'),
      order: z.enum(['asc', 'desc']).default('asc'),
    }),
  },
);

// Ejemplo 7: API Controller con diferentes códigos de status
const deleteUserController = makeApiController(
  async ({ params }): Promise<ApiMakerResponse<{
    success: boolean;
    message: string;
    deletedUserId: string;
  }>> => {
    // Simular eliminación
    return {
      data: {
        success: true,
        message: 'User deleted successfully',
        deletedUserId: params.userId,
      },
      status: StatusCodes.NO_CONTENT,
    };
  },
  {
    paramsSchema: z.object({
      userId: z.string().uuid(),
    }),
  },
);

// Ejemplo 8: API Controller que retorna diferentes status según la lógica
const conditionalStatusController = makeApiController(
  async ({ body }): Promise<ApiMakerResponse<{
    message: string;
    processed: boolean;
  }>> => {
    // Simular procesamiento condicional
    if (body.shouldProcess) {
      return {
        data: {
          message: 'Data processed successfully',
          processed: true,
        },
        status: StatusCodes.OK,
      };
    } else {
      return {
        data: {
          message: 'Data queued for processing',
          processed: false,
        },
        status: StatusCodes.ACCEPTED,
      };
    }
  },
  {
    bodySchema: z.object({
      shouldProcess: z.boolean(),
      data: z.any(),
    }),
  },
);

// Uso en API routes de Next.js:
/*
// app/api/health/route.ts
import { getHealthController } from './path/to/examples';

export async function GET(request: Request) {
  return getHealthController(request);
}

// app/api/users/route.ts  
import { getUsersController, createUserController } from './path/to/examples';

export async function GET(request: Request) {
  // Query parameters son parseados automáticamente
  return getUsersController(request);
}

export async function POST(request: Request) {
  // Body es parseado automáticamente
  return createUserController(request);
}

// app/api/users/[userId]/route.ts
import { getUserByIdController, updateUserController, deleteUserController } from './path/to/examples';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  // Params de ruta son validados automáticamente
  return getUserByIdController(request, params);
}

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  // Body, query y params son validados automáticamente
  return updateUserController(request, params);
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  // Retorna status 204 No Content
  return deleteUserController(request, params);
}

// app/api/users/search/route.ts
import { searchUsersController } from './path/to/examples';

export async function POST(request: Request) {
  // Body + query combinados
  return searchUsersController(request);
}

// app/api/process/route.ts
import { conditionalStatusController } from './path/to/examples';

export async function POST(request: Request) {
  // Retorna diferentes status codes según la lógica
  return conditionalStatusController(request);
}
*/

export {
  getHealthController,
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  searchUsersController,
  deleteUserController,
  conditionalStatusController,
};