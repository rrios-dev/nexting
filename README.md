# Nexting

[![npm version](https://img.shields.io/npm/v/nexting.svg)](https://www.npmjs.com/package/nexting)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, type-safe full-stack library for TypeScript/JavaScript applications. Nexting provides server actions, API controllers, React hooks, error handling, and professional logging - all with complete type safety and inference.

## ✨ Features

- 🎯 **Type-Safe Server Actions** - Create server functions with automatic input/output validation
- 🔌 **API Controllers** - Build RESTful endpoints with structured error handling  
- ⚛️ **React Hooks Integration** - SWR-based hooks for seamless server action integration
- 🛡️ **Comprehensive Error Handling** - Structured error responses with user-friendly messages
- 📊 **Professional Logging System** - Multiple formatters, transports, and request tracking
- 🔍 **Full TypeScript Support** - Complete type inference and strict type checking
- 🌐 **Universal/Isomorphic** - Works in both server and client environments
- 📦 **Modular Exports** - Import only what you need with tree-shaking support
- ✅ **Production Ready** - Comprehensive test coverage and battle-tested

## 📦 Installation

```bash
npm install nexting
# or
yarn add nexting
# or
pnpm add nexting
```

**Peer Dependencies:**
```bash
npm install typescript zod swr
```

## 🚨 Environment-Specific Imports

**Critical**: To avoid runtime errors, use specific imports based on your environment:

### 🖥️ Server/Backend Usage
```typescript
// ✅ Server-safe imports
import { makeServerAction, makeApiController, createLogger } from 'nexting/server';
// or
import { makeServerAction, ServerError } from 'nexting'; // Main export is server-safe
```

### 🌐 Client/Frontend Usage  
```typescript
// ✅ Client-specific imports
import { makeServerActionImmutableHook, makeServerActionMutationHook } from 'nexting/client';
```

### 🔄 Universal Usage
```typescript
// ✅ Safe in both environments
import { ServerError, parseServerError, zod } from 'nexting';
```

## 🚀 Quick Start

### 1. Create a Type-Safe Server Action

```typescript
// actions/user-actions.ts
'use server';
import { makeServerAction, zod } from 'nexting/server';

export const createUserAction = makeServerAction(async ({ name, email }) => {
  // Fully typed parameters
  const user = await db.user.create({ 
    data: { name, email } 
  });
  
  return { 
    id: user.id, 
    name: user.name, 
    email: user.email 
  };
}, {
  validationSchema: zod.object({
    name: zod.string().min(3, 'Name must be at least 3 characters'),
    email: zod.string().email('Invalid email format'),
  }),
});

// Simple action without validation
export const getServerTimeAction = makeServerAction(async () => {
  return { 
    timestamp: new Date().toISOString(),
    message: 'Server is running!' 
  };
});
```

### 2. Use Server Actions in React Components

```typescript
// components/UserForm.tsx
'use client';
import { makeServerActionMutationHook } from 'nexting/client';
import { createUserAction } from '../actions/user-actions';

const useCreateUser = makeServerActionMutationHook({
  key: 'create-user',
  action: createUserAction,
});

export function UserForm() {
  const { trigger, isMutating, error } = useCreateUser.useAction({
    options: {
      onSuccess: (user) => {
        console.log('User created:', user);
        // user is fully typed!
      },
      onError: (error) => {
        console.error('Creation failed:', error);
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await trigger({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Your email" required />
      <button type="submit" disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create User'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### 3. Create API Controllers for RESTful Endpoints

```typescript
// api/users/route.ts
import { makeApiController, zod } from 'nexting/server';

// Query parameters are automatically parsed from the URL
const getUsersController = makeApiController(async ({ query }, { request }) => {
  const users = await db.user.findMany({
    where: query.search ? {
      OR: [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ],
    } : {},
    take: query.limit,
    skip: query.offset,
  });

  return {
    data: {
      users,
      total: users.length,
      page: Math.floor(query.offset / query.limit) + 1,
    }
  };
}, {
  querySchema: zod.object({
    search: zod.string().optional(),
    limit: zod.coerce.number().min(1).max(100).default(10),
    offset: zod.coerce.number().min(0).default(0),
  }),
});

// No need to manually parse query parameters
export async function GET(request: Request) {
  return getUsersController(request);
}
```

## 📖 Core Concepts

### 🎯 Server Actions

Server actions are type-safe functions that run on the server with automatic validation and error handling.

#### Basic Server Action
```typescript
import { makeServerAction } from 'nexting/server';

const getDataAction = makeServerAction(async () => {
  const data = await fetchData();
  return { data, timestamp: Date.now() };
});
```

#### Server Action with Validation
```typescript
import { makeServerAction, zod } from 'nexting/server';

const updateProfileAction = makeServerAction(async ({ userId, profile }) => {
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: profile,
  });
  
  return updatedUser;
}, {
  validationSchema: zod.object({
    userId: zod.string().uuid(),
    profile: zod.object({
      name: zod.string().min(1),
      bio: zod.string().max(500).optional(),
    }),
  }),
});
```

#### Error Handling in Server Actions
```typescript
import { makeServerAction, ServerError } from 'nexting/server';

const deleteUserAction = makeServerAction(async ({ userId }) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new ServerError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      status: 404,
      uiMessage: 'The user you are trying to delete does not exist.',
    });
  }
  
  await db.user.delete({ where: { id: userId } });
  return { success: true };
}, {
  validationSchema: zod.object({
    userId: zod.string().uuid(),
  }),
});
```

### 🔌 API Controllers

API controllers provide a structured way to create RESTful endpoints with automatic request/response handling and flexible validation for body, query parameters, and route parameters.

#### Body Validation Only
```typescript
import { makeApiController, zod } from 'nexting/server';

const createPostController = makeApiController(async ({ body }, { request }) => {
  const userId = request.headers.get('user-id');
  
  const post = await db.post.create({
    data: {
      ...body,
      authorId: userId,
    },
  });
  
  return {
    post,
    message: 'Post created successfully',
  };
}, {
  bodySchema: zod.object({
    title: zod.string().min(1).max(200),
    content: zod.string().min(1),
    tags: zod.array(zod.string()).optional(),
  }),
});

// Use in API route
export async function POST(request: Request) {
  return createPostController(request);
}
```

#### Query Parameters Validation
```typescript
const getUsersController = makeApiController(async ({ query }, { request }) => {
  const users = await db.user.findMany({
    where: query.search ? {
      OR: [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ],
    } : {},
    take: query.limit,
    skip: query.offset,
  });

  return {
    users,
    total: users.length,
    page: Math.floor(query.offset / query.limit) + 1,
  };
}, {
  querySchema: zod.object({
    search: zod.string().optional(),
    limit: zod.coerce.number().min(1).max(100).default(10),
    offset: zod.coerce.number().min(0).default(0),
  }),
});

export async function GET(request: Request) {
  return getUsersController(request);
}
```

#### Route Parameters Validation
```typescript
const getUserController = makeApiController(async ({ params }, { request }) => {
  const user = await db.user.findUnique({
    where: { id: params.userId },
  });

  if (!user) {
    throw new ServerError({
      message: 'User not found',
      status: 404,
      uiMessage: 'The requested user does not exist.',
    });
  }

  return { user };
}, {
  paramsSchema: zod.object({
    userId: zod.string().uuid(),
  }),
});

// app/api/users/[userId]/route.ts
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  return getUserController(request, params);
}
```

#### Combined Validation (Body + Query + Params)
```typescript
const updateUserController = makeApiController(async ({ body, query, params }, { request }) => {
  // Verify user permissions
  if (query.force !== 'true') {
    // Check if user has admin privileges
    const hasPermission = await checkUserPermissions(request);
    if (!hasPermission) {
      throw new ServerError({ message: 'Insufficient permissions', status: 403 });
    }
  }

  const updatedUser = await db.user.update({
    where: { id: params.userId },
    data: body,
  });

  return {
    user: updatedUser,
    message: 'User updated successfully',
  };
}, {
  bodySchema: zod.object({
    name: zod.string().min(1).optional(),
    email: zod.string().email().optional(),
    bio: zod.string().max(500).optional(),
  }),
  querySchema: zod.object({
    force: zod.enum(['true', 'false']).optional(),
  }),
  paramsSchema: zod.object({
    userId: zod.string().uuid(),
  }),
});

// app/api/users/[userId]/route.ts
export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  return updateUserController(request, params);
}
```

### ⚛️ React Hooks

Nexting provides two types of hooks for different use cases:

#### Mutation Hooks (for Create, Update, Delete operations)
```typescript
import { makeServerActionMutationHook } from 'nexting/client';

const useCreatePost = makeServerActionMutationHook({
  key: 'create-post',
  action: createPostAction,
});

function CreatePostForm() {
  const { trigger, isMutating, error, data } = useCreatePost.useAction({
    options: {
      onSuccess: (post) => {
        // Redirect or show success message
        router.push(`/posts/${post.id}`);
      },
      onError: (error) => {
        toast.error(error.uiMessage || error.message);
      },
    },
  });

  const handleSubmit = async (formData: PostFormData) => {
    await trigger(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

#### Immutable Hooks (for Read operations with caching)
```typescript
import { makeServerActionImmutableHook } from 'nexting/client';

const useUserProfile = makeServerActionImmutableHook({
  key: 'user-profile',
  action: getUserProfileAction,
});

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useUserProfile.useAction({
    context: { userId },
    options: {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### 🛡️ Error Handling

Nexting provides a comprehensive error handling system:

#### ServerError Class
```typescript
import { ServerError } from 'nexting';

// Create structured errors
const error = new ServerError({
  message: 'Database connection failed',
  code: 'DB_CONNECTION_ERROR',
  status: 500,
  uiMessage: 'Something went wrong. Please try again later.',
});

// Errors are automatically serialized
console.log(error.toJSON());
// {
//   message: 'Database connection failed',
//   code: 'DB_CONNECTION_ERROR', 
//   status: 500,
//   uiMessage: 'Something went wrong. Please try again later.'
// }
```

#### Error Parsing and Handling
```typescript
import { parseServerError } from 'nexting/server';

try {
  await riskyOperation();
} catch (error) {
  // Automatically converts any error to ServerError format
  const serverError = parseServerError(error);
  console.log(serverError.toJSON());
}
```

### 📊 Professional Logging System

Nexting includes a production-ready logging system with multiple formatters and transports.

#### Basic Logger Setup
```typescript
import { createLogger, LogLevel } from 'nexting/server';

const logger = createLogger({
  level: LogLevel.INFO,
  context: 'API',
});

await logger.info('Server started', { port: 3000 });
await logger.error('Database error', { error: 'Connection timeout' });
```

#### Advanced Logger Configuration
```typescript
import { 
  createLogger, 
  LogLevel,
  PrettyFormatter,
  JsonFormatter,
  ConsoleTransport,
  FileTransport 
} from 'nexting/server';

const logger = createLogger({
  level: LogLevel.DEBUG,
  context: 'APP',
  formatter: process.env.NODE_ENV === 'production' 
    ? new JsonFormatter() 
    : new PrettyFormatter(),
  transports: [
    new ConsoleTransport(),
    new FileTransport({ 
      filename: './logs/app.log',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10 
    }),
  ],
});
```

#### Request Logging
```typescript
import { createRequestLogger } from 'nexting/server';

const requestLogger = createRequestLogger();

export async function middleware(request: Request) {
  const requestId = await requestLogger.logRequest(request);
  const startTime = Date.now();
  
  try {
    const response = await next(request);
    const duration = Date.now() - startTime;
    
    await requestLogger.logResponse(requestId, response.status, duration);
    return response;
  } catch (error) {
    await requestLogger.logError(requestId, error);
    throw error;
  }
}
```

#### Child Loggers
```typescript
const mainLogger = createLogger({ context: 'APP' });
const authLogger = mainLogger.child('AUTH');
const dbLogger = mainLogger.child('DATABASE');

await authLogger.info('User logged in'); // [APP:AUTH] User logged in
await dbLogger.error('Connection lost'); // [APP:DATABASE] Connection lost
```

## 🔧 Advanced Usage

### Custom Error Handling
```typescript
import { makeServerAction, parseServerError } from 'nexting/server';

const customAction = makeServerAction(async (data) => {
  // Your logic here
  return result;
}, {
  validationSchema: schema,
  error: {
    fallbackMessage: 'Custom error occurred',
    includeStack: process.env.NODE_ENV === 'development',
  },
  logger: customLogger,
});
```

### Type Inference Utilities
```typescript
import type { 
  InferActionInput, 
  InferActionOutput, 
  InferActionError 
} from 'nexting/server';

// Extract types from your actions
type CreateUserInput = InferActionInput<typeof createUserAction>;
type CreateUserOutput = InferActionOutput<typeof createUserAction>;
type CreateUserError = InferActionError<typeof createUserAction>;
```

### Environment Configuration
```typescript
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = createLogger({
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  context: 'SERVER',
  formatter: isDevelopment ? new PrettyFormatter() : new JsonFormatter(),
  transports: isDevelopment 
    ? [new ConsoleTransport()]
    : [
        new ConsoleTransport(),
        new FileTransport({ filename: './logs/app.log' })
      ]
});
```

## 📚 API Reference

### Server Actions
```typescript
function makeServerAction<T, R>(
  handler: (input: T) => Promise<R>,
  options?: {
    validationSchema?: ZodSchema<T>;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (input: T) => Promise<AsyncState<R, ActionError>>;
```

### API Controllers

```typescript
// Body + Query + Params validation
function makeApiController<BodySchema, QuerySchema, ParamsSchema, R>(
  controller: (
    args: { 
      body: z.infer<BodySchema>; 
      query: z.infer<QuerySchema>; 
      params: z.infer<ParamsSchema> 
    },
    ctx: { request: NextRequest }
  ) => Promise<ApiMakerResponse<R>>,
  options: {
    bodySchema: BodySchema;
    querySchema: QuerySchema;
    paramsSchema: ParamsSchema;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Body only validation
function makeApiController<BodySchema, R>(
  controller: (
    args: { body: z.infer<BodySchema> },
    ctx: { request: NextRequest }
  ) => Promise<ApiMakerResponse<R>>,
  options: {
    bodySchema: BodySchema;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Query only validation
function makeApiController<QuerySchema, R>(
  controller: (
    args: { query: z.infer<QuerySchema> },
    ctx: { request: NextRequest }
  ) => Promise<ApiMakerResponse<R>>,
  options: {
    querySchema: QuerySchema;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// Params only validation
function makeApiController<ParamsSchema, R>(
  controller: (
    args: { params: z.infer<ParamsSchema> },
    ctx: { request: NextRequest }
  ) => Promise<ApiMakerResponse<R>>,
  options: {
    paramsSchema: ParamsSchema;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// No validation
function makeApiController<R>(
  controller: (ctx: { request: NextRequest }) => Promise<ApiMakerResponse<R>>,
  options?: {
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (request: NextRequest, params?: unknown) => Promise<Response>;

// ApiMakerResponse Type
interface ApiMakerResponse<T> {
  data: T;
  status?: StatusCodes;
}
```

### API Response Object (ApiMakerResponse)

All API controllers must return an `ApiMakerResponse<T>` object that provides control over both the response data and HTTP status code.

```typescript
import { makeApiController, ApiMakerResponse } from 'nexting/server';
import { StatusCodes } from 'http-status-codes';

// Basic response with default 200 OK status
const getHealthController = makeApiController(async (): Promise<ApiMakerResponse<{
  status: string;
  timestamp: string;
}>> => {
  return {
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }
    // status defaults to StatusCodes.OK (200)
  };
});

// Response with custom status code
const createUserController = makeApiController(async ({ body }): Promise<ApiMakerResponse<{
  success: boolean;
  user: User;
}>> => {
  const user = await createUser(body);
  
  return {
    data: {
      success: true,
      user,
    },
    status: StatusCodes.CREATED // 201
  };
}, {
  bodySchema: userSchema,
});

// Conditional response status based on logic
const processDataController = makeApiController(async ({ body }): Promise<ApiMakerResponse<{
  message: string;
  processed: boolean;
}>> => {
  if (body.shouldProcess) {
    // Process immediately
    await processData(body.data);
    return {
      data: {
        message: 'Data processed successfully',
        processed: true,
      },
      status: StatusCodes.OK // 200
    };
  } else {
    // Queue for later processing
    await queueData(body.data);
    return {
      data: {
        message: 'Data queued for processing',
        processed: false,
      },
      status: StatusCodes.ACCEPTED // 202
    };
  }
}, {
  bodySchema: dataSchema,
});

// Different status codes for different operations
const userController = makeApiController(async ({ body, params }): Promise<ApiMakerResponse<{
  message: string;
  user?: User;
}>> => {
  switch (body.operation) {
    case 'create':
      const user = await createUser(body.userData);
      return {
        data: { message: 'User created', user },
        status: StatusCodes.CREATED // 201
      };
    
    case 'update':
      const updatedUser = await updateUser(params.id, body.userData);
      return {
        data: { message: 'User updated', user: updatedUser },
        status: StatusCodes.OK // 200
      };
    
    case 'delete':
      await deleteUser(params.id);
      return {
        data: { message: 'User deleted' },
        status: StatusCodes.NO_CONTENT // 204
      };
    
    default:
      throw new ServerError({
        message: 'Invalid operation',
        code: 'INVALID_OPERATION',
        status: StatusCodes.BAD_REQUEST,
      });
  }
}, {
  bodySchema: operationSchema,
  paramsSchema: paramsSchema,
});
```

#### Available Status Codes

You can use any HTTP status code from the `http-status-codes` package:

```typescript
import { StatusCodes } from 'http-status-codes';

// Success responses
StatusCodes.OK              // 200 - Default for successful GET/PUT/PATCH
StatusCodes.CREATED         // 201 - Resource created (POST)
StatusCodes.ACCEPTED        // 202 - Request accepted for processing
StatusCodes.NO_CONTENT      // 204 - Successful DELETE

// Client error responses  
StatusCodes.BAD_REQUEST     // 400 - Invalid request
StatusCodes.UNAUTHORIZED    // 401 - Authentication required
StatusCodes.FORBIDDEN       // 403 - Access denied
StatusCodes.NOT_FOUND       // 404 - Resource not found
StatusCodes.CONFLICT        // 409 - Resource conflict

// Server error responses
StatusCodes.INTERNAL_SERVER_ERROR  // 500 - Server error
StatusCodes.BAD_GATEWAY           // 502 - Bad gateway
StatusCodes.SERVICE_UNAVAILABLE   // 503 - Service unavailable
```

### React Hooks
```typescript
function makeServerActionMutationHook<TAction>(options: {
  key: string;
  action: TAction;
}): {
  useAction: (options?: SWRMutationConfiguration) => SWRMutationResponse;
  makeKey: (context?: Record<string, unknown>) => object;
};

function makeServerActionImmutableHook<TAction>(options: {
  key: string;
  action: TAction;
}): {
  useAction: (options: {
    context: InferActionInput<TAction>;
    skip?: boolean;
    options?: SWRConfiguration;
  }) => SWRResponse;
  makeKey: (context?: InferActionInput<TAction>) => object;
};
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run docs development server
npm run test:docs
```

## 🏗️ Development Setup

```bash
# Clone the repository
git clone https://github.com/rrios-dev/nexting.git
cd nexting

# Install dependencies
npm install

# Build the library
npm run build

# Start development mode
npm run dev

# Run documentation site
npm run test:docs
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript for complete type safety
- Inspired by modern full-stack development patterns
- Powered by Zod for runtime validation
- Integrated with SWR for optimal data fetching
- Designed for scalable production applications

---

**Made with ❤️ by [Roberto Ríos](https://github.com/rrios-dev)**